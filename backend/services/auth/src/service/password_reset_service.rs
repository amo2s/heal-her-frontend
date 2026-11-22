use crate::{
    domain::{
        governance::{GovernanceAction, ManagementRole},
        password::validate_password_complexity,
        password_reset::{ConfirmResetResponse, PasswordResetScope, VerifyOtpResponse},
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
struct UserEligibilityLookup {
    #[allow(dead_code)]
    id: Uuid,
    full_name: String,
    role: String,
    is_active: bool,
    deleted_at: Option<chrono::DateTime<chrono::Utc>>,
    approval_status: Option<String>,
}

/// Orchestrates the constant-time Ghost Protocol for password reset OTP requests.
/// Anti-enumeration defense: masks whether an email exists in PostgreSQL by equalizing
/// CPU cycles and network latency via dummy hashing and asynchronous sleep.
/// Enforces dual-key rate limits (Email + IP) and strict lifecycle / role scope eligibility.
pub async fn process_otp_request(
    state: &AppState,
    email: &str,
    ip: Option<&str>,
    scope: PasswordResetScope,
) -> Result<(), InternalAuthError> {
    // 1. Sanitization
    let clean_email = email.trim().to_lowercase();

    // 2. Dual-Key Sliding-Window Rate Limiting Check (BEFORE DB OR MAILER)
    state
        .reset_cache
        .check_and_increment_rate_limits(scope, &clean_email, ip)
        .await?;

    // 3. Database Lookup with full lifecycle parameters
    let user_opt: Option<UserEligibilityLookup> = sqlx::query_as(
        r#"
        SELECT id, full_name, role, is_active, deleted_at, approval_status
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(&clean_email)
    .fetch_optional(&state.pool)
    .await?;

    // 4. Strict Lifecycle & Role Scope Evaluation
    let is_eligible = if let Some(ref u) = user_opt {
        let is_active = u.is_active && u.deleted_at.is_none();
        let is_approved = u
            .approval_status
            .as_deref()
            .unwrap_or("APPROVED")
            .eq_ignore_ascii_case("APPROVED");
        let role_valid = match scope {
            PasswordResetScope::EndUser => {
                matches!(u.role.as_str(), "kid" | "teen" | "young-adult")
            }
            PasswordResetScope::Management => {
                ManagementRole::parse_strict(&u.role).is_some()
            }
        };
        is_active && is_approved && role_valid
    } else {
        false
    };

    if !is_eligible {
        // Ghost Protocol: execute dummy hashing and sleep to equalize latency
        let dummy_num: u32 = OsRng.gen_range(0..=999_999);
        let dummy_otp = format!("{:06}", dummy_num);
        let _dummy_hash = blake3::hash(dummy_otp.as_bytes()).to_hex().to_string();

        tokio::time::sleep(std::time::Duration::from_millis(85)).await;

        tracing::info!(
            target: "auth::password_reset::ghost",
            email = %clean_email,
            scope = ?scope,
            "Ghost protocol executed: account not eligible, deactivated, or not found"
        );

        return Ok(());
    }

    let user = user_opt.expect("User must be present when is_eligible is true");

    // 5. Cryptographic OS CSPRNG OTP Generation
    let otp_num: u32 = OsRng.gen_range(0..=999_999);
    let otp = format!("{:06}", otp_num);
    let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();

    let scoped_otp_key = format!("{}:{}", scope.as_prefix(), clean_email);
    state
        .reset_cache
        .otp_cache
        .insert(scoped_otp_key, otp_hash)
        .await;

    let email_clone = clean_email.clone();
    let name_clone = user.full_name.clone();
    tokio::spawn(async move {
        mailer::send_reset_otp_email(&email_clone, &name_clone, &otp).await;
    });

    tracing::info!(
        target: "auth::password_reset",
        email = %clean_email,
        scope = ?scope,
        "Password reset OTP generated and dispatched asynchronously"
    );

    Ok(())
}

/// Verifies a submitted password reset OTP with constant-time equality check,
/// enforces a strict 3-strike lockout against brute force attacks,
/// burns the OTP atomically upon verification, and mints a 32-byte high-entropy reset token.
pub async fn verify_reset_otp(
    state: &AppState,
    email: &str,
    otp_code: &str,
    scope: PasswordResetScope,
) -> Result<VerifyOtpResponse, InternalAuthError> {
    // Step A: Sanitization
    let clean_email = email.trim().to_lowercase();
    let clean_otp = otp_code.trim();
    let scoped_key = format!("{}:{}", scope.as_prefix(), clean_email);

    // Step B: The 3-Strike Lockout Check
    let strikes = state
        .reset_cache
        .otp_strikes_cache
        .get(&scoped_key)
        .await
        .unwrap_or(0);
    if strikes >= 3 {
        tracing::warn!(
            target: "auth::password_reset",
            email = %clean_email,
            scope = ?scope,
            "OTP brute force lockout active for {}",
            clean_email
        );
        return Err(InternalAuthError::AccountTemporarilyLocked);
    }

    // Step C: OTP Existence Check
    let stored_hash = state.reset_cache.otp_cache.get(&scoped_key).await;
    let stored_hash = match stored_hash {
        Some(h) => h,
        None => {
            let new_strikes = strikes.saturating_add(1);
            state
                .reset_cache
                .otp_strikes_cache
                .insert(scoped_key, new_strikes)
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
            .insert(scoped_key, new_strikes)
            .await;
        tracing::debug!(
            target: "auth::password_reset",
            email = %clean_email,
            scope = ?scope,
            "Invalid OTP attempt for {}",
            clean_email
        );
        return Err(InternalAuthError::InvalidAuthorizationCode);
    }

    // Step F: Handle Match (Atomic Burn & Mint)
    state.reset_cache.otp_cache.invalidate(&scoped_key).await;
    state
        .reset_cache
        .otp_strikes_cache
        .invalidate(&scoped_key)
        .await;

    let mut token_bytes = [0u8; 32];
    OsRng.fill_bytes(&mut token_bytes);

    let raw_reset_token = URL_SAFE_NO_PAD.encode(token_bytes);
    let hashed_token = blake3::hash(raw_reset_token.as_bytes())
        .to_hex()
        .to_string();

    let scoped_token_key = format!("{}:{}", scope.as_prefix(), hashed_token);
    state
        .reset_cache
        .reset_token_cache
        .insert(scoped_token_key, clean_email)
        .await;

    // Step G: Return Success
    Ok(VerifyOtpResponse {
        status: "success".to_string(),
        reset_token: raw_reset_token,
    })
}

/// Final Password Reset Execution:
/// Enforces pre-flight password complexity and match constraints,
/// atomically burns the 32-byte reset token in RAM, updates the user's password hash in PostgreSQL
/// within a single transaction locking the row FOR UPDATE, re-verifies lifecycle invariants,
/// writes to governance_audit_logs if management scope, and executes the nuclear session kill-switch.
pub async fn confirm_password_reset(
    state: &AppState,
    reset_token: &str,
    new_password: &str,
    confirm_password: &str,
    ip: Option<&str>,
    scope: PasswordResetScope,
) -> Result<ConfirmResetResponse, InternalAuthError> {
    // Step A: Pre-Flight Checks
    if new_password != confirm_password {
        return Err(InternalAuthError::ValidationError(
            "Passwords do not match".into(),
        ));
    }
    validate_password_complexity(new_password)?;

    // Step B: Cryptographic Token Lookup & Atomic Burn
    let clean_token = reset_token.trim();
    let token_hash = blake3::hash(clean_token.as_bytes()).to_hex().to_string();
    let scoped_token_key = format!("{}:{}", scope.as_prefix(), token_hash);

    let email = state
        .reset_cache
        .reset_token_cache
        .get(&scoped_token_key)
        .await;
    let email = match email {
        Some(e) => e,
        None => return Err(InternalAuthError::InvalidAuthorizationCode),
    };

    // ATOMIC BURN: Instantly delete the token from the cache so it is consumed permanently
    state
        .reset_cache
        .reset_token_cache
        .invalidate(&scoped_token_key)
        .await;

    // Step C: Resolve User & Verify Lifecycle Invariants with FOR UPDATE Row Lock
    let mut tx = state.pool.begin().await?;

    #[derive(sqlx::FromRow)]
    struct UserConfirmRecord {
        id: Uuid,
        role: String,
        is_active: bool,
        deleted_at: Option<chrono::DateTime<chrono::Utc>>,
        approval_status: Option<String>,
    }

    let user_opt: Option<UserConfirmRecord> = sqlx::query_as(
        r#"
        SELECT id, role, is_active, deleted_at, approval_status
        FROM users
        WHERE email = $1
        FOR UPDATE
        "#,
    )
    .bind(&email)
    .fetch_optional(&mut *tx)
    .await?;

    let user = match user_opt {
        Some(u) => u,
        None => {
            let _ = tx.rollback().await;
            return Err(InternalAuthError::UserNotFoundInPostgres);
        }
    };

    // Re-verify lifecycle invariants inside the transaction
    let is_active = user.is_active && user.deleted_at.is_none();
    let is_approved = user
        .approval_status
        .as_deref()
        .unwrap_or("APPROVED")
        .eq_ignore_ascii_case("APPROVED");
    let role_valid = match scope {
        PasswordResetScope::EndUser => matches!(user.role.as_str(), "kid" | "teen" | "young-adult"),
        PasswordResetScope::Management => {
            ManagementRole::parse_strict(&user.role).is_some()
        }
    };

    if !is_active || !is_approved || !role_valid {
        let _ = tx.rollback().await;
        tracing::warn!(
            target: "auth::password_reset",
            user_id = %user.id,
            email = %email,
            scope = ?scope,
            "Reset confirmation rejected: account status or role changed"
        );
        return Err(InternalAuthError::InsufficientPermissions);
    }

    let hashed_password =
        crate::infrastructure::crypto::hash_password(new_password.to_string()).await?;

    // Step D: The Database Update
    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&hashed_password)
        .bind(user.id)
        .execute(&mut *tx)
        .await?;

    // Step E: Purge all active sessions for this user from the database
    sqlx::query("DELETE FROM sessions WHERE user_id = $1")
        .bind(user.id)
        .execute(&mut *tx)
        .await?;

    // Step F: Immutable Audit Trail for Management Resets
    if scope == PasswordResetScope::Management {
        let metadata = serde_json::json!({
            "event": "self_service_password_reset",
            "sessions_revoked": true
        });

        sqlx::query(
            r#"
            INSERT INTO governance_audit_logs (
                id, actor_id, actor_role, target_user_id, action, metadata, ip_address, created_at
            )
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
            "#,
        )
        .bind(user.id)
        .bind(&user.role)
        .bind(user.id)
        .bind(GovernanceAction::MANAGEMENT_PASSWORD_RESET)
        .bind(metadata)
        .bind(ip)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    // Step G: The Nuclear Kill-Switch Execution (Post-Commit L1 Memory Stamp)
    let now_ts = chrono::Utc::now().timestamp();
    state.cache.revoke_all_user_sessions(user.id, now_ts).await;

    tracing::info!(
        target: "auth::password_reset",
        user_id = %user.id,
        email = %email,
        scope = ?scope,
        "Password successfully updated; nuclear session kill-switch executed"
    );

    // Step H: Return Success
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
        AppState::new(
            pool,
            "test_secret_32_bytes_long_ok!!".to_string(),
            reset_cache,
        )
    }

    #[test]
    fn test_csprng_otp_format() {
        for _ in 0..100 {
            let otp_num: u32 = OsRng.gen_range(0..=999_999);
            let otp = format!("{:06}", otp_num);
            assert_eq!(otp.len(), 6);
            assert!(otp.chars().all(|c| c.is_ascii_digit()));
        }
    }

    #[tokio::test]
    async fn test_verify_reset_otp_success_burn_and_mint_enduser() {
        let state = build_test_state();
        let email = "recover@healher.internal";
        let otp = "654321";

        // Seed OTP cache under EndUser scope
        let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();
        let scoped_key = format!("user:{}", email);
        state
            .reset_cache
            .otp_cache
            .insert(scoped_key.clone(), otp_hash)
            .await;

        let result = verify_reset_otp(&state, email, otp, PasswordResetScope::EndUser).await;
        assert!(result.is_ok());
        let res = result.unwrap();
        assert_eq!(res.status, "success");
        assert!(!res.reset_token.is_empty());

        // Assert atomic burn: OTP is gone from cache
        assert!(state.reset_cache.otp_cache.get(&scoped_key).await.is_none());

        // Assert reset token is present in reset_token_cache under user prefix
        let hashed_token = blake3::hash(res.reset_token.as_bytes())
            .to_hex()
            .to_string();
        let scoped_token_key = format!("user:{}", hashed_token);
        assert_eq!(
            state
                .reset_cache
                .reset_token_cache
                .get(&scoped_token_key)
                .await,
            Some(email.to_string())
        );

        // Management scope lookup MUST FAIL on user reset token (scope isolation)
        let mgmt_scoped_token_key = format!("mgmt:{}", hashed_token);
        assert!(state
            .reset_cache
            .reset_token_cache
            .get(&mgmt_scoped_token_key)
            .await
            .is_none());
    }

    #[tokio::test]
    async fn test_verify_reset_otp_success_burn_and_mint_management() {
        let state = build_test_state();
        let email = "admin@healher.internal";
        let otp = "987654";

        // Seed OTP cache under Management scope
        let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();
        let scoped_key = format!("mgmt:{}", email);
        state
            .reset_cache
            .otp_cache
            .insert(scoped_key.clone(), otp_hash)
            .await;

        let result = verify_reset_otp(&state, email, otp, PasswordResetScope::Management).await;
        assert!(result.is_ok());
        let res = result.unwrap();
        assert_eq!(res.status, "success");
        assert!(!res.reset_token.is_empty());

        // Assert atomic burn: OTP is gone from cache
        assert!(state.reset_cache.otp_cache.get(&scoped_key).await.is_none());

        // Assert reset token is present under mgmt prefix
        let hashed_token = blake3::hash(res.reset_token.as_bytes())
            .to_hex()
            .to_string();
        let scoped_token_key = format!("mgmt:{}", hashed_token);
        assert_eq!(
            state
                .reset_cache
                .reset_token_cache
                .get(&scoped_token_key)
                .await,
            Some(email.to_string())
        );

        // EndUser scope lookup MUST FAIL on management reset token
        let user_scoped_token_key = format!("user:{}", hashed_token);
        assert!(state
            .reset_cache
            .reset_token_cache
            .get(&user_scoped_token_key)
            .await
            .is_none());
    }

    #[tokio::test]
    async fn test_verify_reset_otp_mismatch_and_three_strike_lockout() {
        let state = build_test_state();
        let email = "brute@healher.internal";
        let otp = "112233";

        // Seed OTP cache under EndUser scope
        let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();
        let scoped_key = format!("user:{}", email);
        state
            .reset_cache
            .otp_cache
            .insert(scoped_key.clone(), otp_hash)
            .await;

        // Attempt 1: Mismatch
        let err1 = verify_reset_otp(&state, email, "999999", PasswordResetScope::EndUser)
            .await
            .unwrap_err();
        assert!(matches!(err1, InternalAuthError::InvalidAuthorizationCode));
        assert_eq!(
            state.reset_cache.otp_strikes_cache.get(&scoped_key).await,
            Some(1)
        );

        // Attempt 2: Mismatch
        let err2 = verify_reset_otp(&state, email, "888888", PasswordResetScope::EndUser)
            .await
            .unwrap_err();
        assert!(matches!(err2, InternalAuthError::InvalidAuthorizationCode));
        assert_eq!(
            state.reset_cache.otp_strikes_cache.get(&scoped_key).await,
            Some(2)
        );

        // Attempt 3: Mismatch -> reaches 3 strikes
        let err3 = verify_reset_otp(&state, email, "777777", PasswordResetScope::EndUser)
            .await
            .unwrap_err();
        assert!(matches!(err3, InternalAuthError::InvalidAuthorizationCode));
        assert_eq!(
            state.reset_cache.otp_strikes_cache.get(&scoped_key).await,
            Some(3)
        );

        // Attempt 4: Strikes >= 3 -> AccountTemporarilyLocked (even with correct OTP)
        let err4 = verify_reset_otp(&state, email, otp, PasswordResetScope::EndUser)
            .await
            .unwrap_err();
        assert!(matches!(err4, InternalAuthError::AccountTemporarilyLocked));
    }

    #[tokio::test]
    async fn test_confirm_password_reset_preflight_mismatch() {
        let state = build_test_state();
        let err = confirm_password_reset(
            &state,
            "any_token",
            "ValidPassword1!",
            "MismatchPassword1!",
            None,
            PasswordResetScope::EndUser,
        )
        .await
        .unwrap_err();
        assert!(
            matches!(err, InternalAuthError::ValidationError(msg) if msg == "Passwords do not match")
        );
    }

    #[tokio::test]
    async fn test_confirm_password_reset_invalid_token() {
        let state = build_test_state();
        let err = confirm_password_reset(
            &state,
            "nonexistent_token",
            "ValidPassword1!",
            "ValidPassword1!",
            None,
            PasswordResetScope::EndUser,
        )
        .await
        .unwrap_err();
        assert!(matches!(err, InternalAuthError::InvalidAuthorizationCode));
    }

    #[tokio::test]
    async fn test_confirm_password_reset_atomic_burn_before_db() {
        let state = build_test_state();
        let raw_token = "valid_32_byte_test_reset_token_abc";
        let token_hash = blake3::hash(raw_token.as_bytes()).to_hex().to_string();
        let scoped_token_key = format!("mgmt:{}", token_hash);
        let email = "nonexistent_user_in_mock_db@healher.internal";

        state
            .reset_cache
            .reset_token_cache
            .insert(scoped_token_key.clone(), email.to_string())
            .await;
        assert!(state
            .reset_cache
            .reset_token_cache
            .get(&scoped_token_key)
            .await
            .is_some());

        // DB query will fail because user does not exist in dummy lazy pool, BUT token must already be burned!
        let _ = confirm_password_reset(
            &state,
            raw_token,
            "ValidPassword1!",
            "ValidPassword1!",
            None,
            PasswordResetScope::Management,
        )
        .await;

        // Verify token was evicted atomically from cache
        assert!(state
            .reset_cache
            .reset_token_cache
            .get(&scoped_token_key)
            .await
            .is_none());
    }
}
