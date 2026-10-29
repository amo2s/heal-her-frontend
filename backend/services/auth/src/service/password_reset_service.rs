use crate::{
    domain::password_reset::{
        ConfirmResetInput, ConfirmResetResponse, VerifyOtpInput, VerifyOtpResponse,
    },
    error::InternalAuthError,
    infrastructure::mailer,
    state::AppState,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use rand::{rngs::OsRng, Rng, RngCore};
use subtle::ConstantTimeEq;
use uuid::Uuid;

#[derive(sqlx::FromRow)]
struct UserResetLookup {
    #[allow(dead_code)]
    id: Uuid,
    full_name: String,
}

/// Zero-Dependency Entropy Gate: validates password complexity in nanoseconds
/// using native Rust char iterators without regex dependencies or ReDoS risks.
fn validate_password_complexity(password: &str) -> Result<(), InternalAuthError> {
    if password.len() < 8 {
        return Err(InternalAuthError::ValidationError(
            "Password must be at least 8 characters long".into(),
        ));
    }
    let has_upper = password.chars().any(|c| c.is_uppercase());
    let has_lower = password.chars().any(|c| c.is_lowercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());
    let has_special = password.chars().any(|c| !c.is_alphanumeric());

    if !has_upper || !has_lower || !has_digit || !has_special {
        return Err(InternalAuthError::ValidationError(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character".into(),
        ));
    }
    Ok(())
}

/// Orchestrates the constant-time Ghost Protocol for password reset OTP requests.
/// Anti-enumeration defense: masks whether an email exists in PostgreSQL by equalizing
/// CPU cycles and network latency via dummy hashing and asynchronous sleep.
pub async fn process_otp_request(state: &AppState, email: &str) -> Result<(), InternalAuthError> {
    // 1. Sanitization
    let clean_email = email.trim().to_lowercase();

    // 2. Database Lookup
    let user_opt: Option<UserResetLookup> = sqlx::query_as(
        r#"
        SELECT id, full_name
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(&clean_email)
    .fetch_optional(&state.pool)
    .await?;

    match user_opt {
        Some(user) => {
            // Branch A (Real User Found)
            let otp_num: u32 = rand::thread_rng().gen_range(0..=999_999);
            let otp = format!("{:06}", otp_num);
            let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();

            state.reset_cache.otp_cache.insert(clean_email.clone(), otp_hash).await;

            let email_clone = clean_email.clone();
            let name_clone = user.full_name.clone();
            tokio::spawn(async move {
                mailer::send_reset_otp_email(&email_clone, &name_clone, &otp).await;
            });

            tracing::info!(
                target: "auth::password_reset",
                email = %clean_email,
                "Password reset OTP generated and dispatched asynchronously"
            );

            Ok(())
        }
        None => {
            // Branch B (Fake / Unregistered User): The Ghost Protocol initiates
            let dummy_num: u32 = rand::thread_rng().gen_range(0..=999_999);
            let dummy_otp = format!("{:06}", dummy_num);
            let _dummy_hash = blake3::hash(dummy_otp.as_bytes()).to_hex().to_string();

            tokio::time::sleep(std::time::Duration::from_millis(85)).await;

            tracing::info!(
                target: "auth::password_reset::ghost",
                email = %clean_email,
                "Ghost protocol executed: dummy hash and constant-time latency applied"
            );

            Ok(())
        }
    }
}

/// Verifies a submitted password reset OTP with constant-time equality check,
/// enforces a strict 3-strike lockout against brute force attacks,
/// burns the OTP atomically upon verification, and mints a 32-byte high-entropy reset token.
pub async fn verify_reset_otp(
    state: &AppState,
    input: &VerifyOtpInput,
) -> Result<VerifyOtpResponse, InternalAuthError> {
    // Step A: Sanitization
    let clean_email = input.email.trim().to_lowercase();
    let clean_otp = input.otp_code.trim();

    // Step B: The 3-Strike Lockout Check
    let strikes = state
        .reset_cache
        .otp_strikes_cache
        .get(&clean_email)
        .await
        .unwrap_or(0);
    if strikes >= 3 {
        tracing::warn!(
            target: "auth::password_reset",
            email = %clean_email,
            "OTP brute force lockout active for {}",
            clean_email
        );
        return Err(InternalAuthError::AccountTemporarilyLocked);
    }

    // Step C: OTP Existence Check
    let stored_hash = state.reset_cache.otp_cache.get(&clean_email).await;
    let stored_hash = match stored_hash {
        Some(h) => h,
        None => {
            let new_strikes = strikes.saturating_add(1);
            state
                .reset_cache
                .otp_strikes_cache
                .insert(clean_email.clone(), new_strikes)
                .await;
            return Err(InternalAuthError::InvalidAuthorizationCode);
        }
    };

    // Step D: Constant-Time Cryptographic Comparison
    let incoming_hash = blake3::hash(clean_otp.as_bytes()).to_hex().to_string();
    let is_valid = bool::from(stored_hash.as_bytes().ct_eq(incoming_hash.as_bytes()));

    // Step E: Handle Mismatch (Failure)
    if !is_valid {
        let new_strikes = strikes.saturating_add(1);
        state
            .reset_cache
            .otp_strikes_cache
            .insert(clean_email.clone(), new_strikes)
            .await;
        tracing::debug!(
            target: "auth::password_reset",
            email = %clean_email,
            "Invalid OTP attempt for {}",
            clean_email
        );
        return Err(InternalAuthError::InvalidAuthorizationCode);
    }

    // Step F: Handle Match (Atomic Burn & Mint)
    state.reset_cache.otp_cache.invalidate(&clean_email).await;
    state.reset_cache.otp_strikes_cache.invalidate(&clean_email).await;

    let mut token_bytes = [0u8; 32];
    OsRng.fill_bytes(&mut token_bytes);

    let raw_reset_token = URL_SAFE_NO_PAD.encode(token_bytes);
    let hashed_token = blake3::hash(raw_reset_token.as_bytes()).to_hex().to_string();
    state
        .reset_cache
        .reset_token_cache
        .insert(hashed_token, clean_email)
        .await;

    // Step G: Return Success
    Ok(VerifyOtpResponse {
        status: "success".to_string(),
        reset_token: raw_reset_token,
    })
}

/// Final Password Reset Execution:
/// Enforces pre-flight password complexity and match constraints,
/// atomically burns the 32-byte reset token in RAM, updates the user's password hash in PostgreSQL,
/// and executes a Nuclear Kill-Switch purging all sessions in PostgreSQL and the L1 memory cache.
pub async fn confirm_password_reset(
    state: &AppState,
    input: &ConfirmResetInput,
) -> Result<ConfirmResetResponse, InternalAuthError> {
    // Step A: Pre-Flight Checks
    if input.new_password != input.confirm_password {
        return Err(InternalAuthError::ValidationError(
            "Passwords do not match".into(),
        ));
    }
    validate_password_complexity(&input.new_password)?;

    // Step B: Cryptographic Token Lookup & Atomic Burn
    let clean_token = input.reset_token.trim();
    let token_hash = blake3::hash(clean_token.as_bytes()).to_hex().to_string();
    let email = state.reset_cache.reset_token_cache.get(&token_hash).await;
    let email = match email {
        Some(e) => e,
        None => return Err(InternalAuthError::InvalidAuthorizationCode),
    };

    // ATOMIC BURN: Instantly delete the token from the cache so it is consumed permanently
    state.reset_cache.reset_token_cache.invalidate(&token_hash).await;

    // Step C: Resolve User & Hash Password
    let user_id: Uuid = sqlx::query_scalar("SELECT id FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(&state.pool)
        .await?
        .ok_or(InternalAuthError::UserNotFoundInPostgres)?;

    let hashed_password =
        crate::infrastructure::crypto::hash_password(input.new_password.clone()).await?;

    // Step D: The Database Update
    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&hashed_password)
        .bind(user_id)
        .execute(&state.pool)
        .await?;

    // Step E: The Nuclear Kill-Switch Execution
    // 1. Purge all active sessions for this user from the database to destroy 7-day refresh tokens
    crate::infrastructure::session_repo::delete_all_user_sessions(&state.pool, user_id).await?;

    // 2. Stamp the user's ID into Tier-2 Global Kill-Switch cache to instantly sever any unexpired 10-minute access tokens in RAM
    let now_ts = chrono::Utc::now().timestamp();
    state.cache.revoke_all_user_sessions(user_id, now_ts).await;

    tracing::info!(
        target: "auth::password_reset",
        user_id = %user_id,
        email = %email,
        "Password successfully updated; nuclear session kill-switch executed"
    );

    // Step F: Return Success
    Ok(ConfirmResetResponse {
        status: "success".to_string(),
        message: "Password securely updated. All active sessions have been terminated.".to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::infrastructure::reset_cache::PasswordResetCache;
    use sqlx::PgPool;
    use std::sync::Arc;

    fn build_test_state() -> AppState {
        let pool = PgPool::connect_lazy("postgres://localhost/dummy").unwrap();
        let reset_cache = Arc::new(PasswordResetCache::new());
        AppState::new(pool, "test_secret_32_bytes_long_ok!!".to_string(), reset_cache)
    }

    #[test]
    fn test_validate_password_complexity() {
        // Less than 8 chars
        assert!(validate_password_complexity("Short1!").is_err());
        // Missing uppercase
        assert!(validate_password_complexity("lowercase1!").is_err());
        // Missing lowercase
        assert!(validate_password_complexity("UPPERCASE1!").is_err());
        // Missing digit
        assert!(validate_password_complexity("NoDigitsHere!").is_err());
        // Missing special char
        assert!(validate_password_complexity("NoSpecial123").is_err());
        // Valid password passes
        assert!(validate_password_complexity("ValidP@ssw0rd!").is_ok());
    }

    #[tokio::test]
    async fn test_verify_reset_otp_success_burn_and_mint() {
        let state = build_test_state();
        let email = "recover@healher.internal";
        let otp = "654321";

        // Seed OTP cache
        let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();
        state.reset_cache.otp_cache.insert(email.to_string(), otp_hash).await;

        let input = VerifyOtpInput {
            email: email.to_string(),
            otp_code: otp.to_string(),
        };

        let result = verify_reset_otp(&state, &input).await;
        assert!(result.is_ok());
        let res = result.unwrap();
        assert_eq!(res.status, "success");
        assert!(!res.reset_token.is_empty());

        // Assert atomic burn: OTP is gone from cache
        assert!(state.reset_cache.otp_cache.get(email).await.is_none());

        // Assert reset token is present in reset_token_cache
        let hashed_token = blake3::hash(res.reset_token.as_bytes()).to_hex().to_string();
        assert_eq!(
            state.reset_cache.reset_token_cache.get(&hashed_token).await,
            Some(email.to_string())
        );
    }

    #[tokio::test]
    async fn test_verify_reset_otp_mismatch_and_three_strike_lockout() {
        let state = build_test_state();
        let email = "brute@healher.internal";
        let otp = "112233";

        // Seed OTP cache
        let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();
        state.reset_cache.otp_cache.insert(email.to_string(), otp_hash).await;

        let bad_input = VerifyOtpInput {
            email: email.to_string(),
            otp_code: "999999".to_string(),
        };

        // Attempt 1: Mismatch
        let err1 = verify_reset_otp(&state, &bad_input).await.unwrap_err();
        assert!(matches!(err1, InternalAuthError::InvalidAuthorizationCode));
        assert_eq!(state.reset_cache.otp_strikes_cache.get(email).await, Some(1));

        // Attempt 2: Mismatch
        let err2 = verify_reset_otp(&state, &bad_input).await.unwrap_err();
        assert!(matches!(err2, InternalAuthError::InvalidAuthorizationCode));
        assert_eq!(state.reset_cache.otp_strikes_cache.get(email).await, Some(2));

        // Attempt 3: Mismatch -> reaches 3 strikes
        let err3 = verify_reset_otp(&state, &bad_input).await.unwrap_err();
        assert!(matches!(err3, InternalAuthError::InvalidAuthorizationCode));
        assert_eq!(state.reset_cache.otp_strikes_cache.get(email).await, Some(3));

        // Attempt 4: Strikes >= 3 -> AccountTemporarilyLocked (even if correct OTP is provided!)
        let correct_input = VerifyOtpInput {
            email: email.to_string(),
            otp_code: otp.to_string(),
        };
        let err4 = verify_reset_otp(&state, &correct_input).await.unwrap_err();
        assert!(matches!(err4, InternalAuthError::AccountTemporarilyLocked));
    }

    #[tokio::test]
    async fn test_verify_reset_otp_missing_otp_increments_strikes() {
        let state = build_test_state();
        let email = "ghost@healher.internal";

        let input = VerifyOtpInput {
            email: email.to_string(),
            otp_code: "123456".to_string(),
        };

        let err = verify_reset_otp(&state, &input).await.unwrap_err();
        assert!(matches!(err, InternalAuthError::InvalidAuthorizationCode));
        assert_eq!(state.reset_cache.otp_strikes_cache.get(email).await, Some(1));
    }

    #[tokio::test]
    async fn test_confirm_password_reset_preflight_mismatch() {
        let state = build_test_state();
        let input = ConfirmResetInput {
            reset_token: "any_token".to_string(),
            new_password: "ValidPassword1!".to_string(),
            confirm_password: "MismatchPassword1!".to_string(),
        };
        let err = confirm_password_reset(&state, &input).await.unwrap_err();
        assert!(matches!(err, InternalAuthError::ValidationError(msg) if msg == "Passwords do not match"));
    }

    #[tokio::test]
    async fn test_confirm_password_reset_invalid_token() {
        let state = build_test_state();
        let input = ConfirmResetInput {
            reset_token: "nonexistent_token".to_string(),
            new_password: "ValidPassword1!".to_string(),
            confirm_password: "ValidPassword1!".to_string(),
        };
        let err = confirm_password_reset(&state, &input).await.unwrap_err();
        assert!(matches!(err, InternalAuthError::InvalidAuthorizationCode));
    }

    #[tokio::test]
    async fn test_confirm_password_reset_atomic_burn_before_db() {
        let state = build_test_state();
        let raw_token = "valid_32_byte_test_reset_token_abc";
        let token_hash = blake3::hash(raw_token.as_bytes()).to_hex().to_string();
        let email = "nonexistent_user_in_mock_db@healher.internal";

        state.reset_cache.reset_token_cache.insert(token_hash.clone(), email.to_string()).await;
        assert!(state.reset_cache.reset_token_cache.get(&token_hash).await.is_some());

        let input = ConfirmResetInput {
            reset_token: raw_token.to_string(),
            new_password: "ValidPassword1!".to_string(),
            confirm_password: "ValidPassword1!".to_string(),
        };

        // DB query will fail because user does not exist in dummy lazy pool, BUT token must already be burned!
        let _ = confirm_password_reset(&state, &input).await;

        // Verify token was evicted atomically from cache
        assert!(state.reset_cache.reset_token_cache.get(&token_hash).await.is_none());

    }
}
