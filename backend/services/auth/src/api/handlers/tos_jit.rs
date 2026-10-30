use crate::{
    api::middleware::auth::AuthenticatedUser,
    error::ApiError,
    infrastructure::{jwt::mint_jit_consent_receipt, mailer},
    state::AppState,
};
use axum::{extract::State, Json};
use rand::Rng;
use serde::{Deserialize, Serialize};
use subtle::ConstantTimeEq;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct TosJitOtpRequest {
    #[serde(default)]
    pub document_version: Option<String>,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
pub struct TosJitOtpResponse {
    pub status: &'static str,
    pub message: &'static str,
    pub expires_in: u32,
}

#[derive(Debug, Deserialize)]
pub struct TosJitVerifyRequest {
    pub code: String,
    pub active_version: String,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
pub struct TosJitVerifyResponse {
    pub status: &'static str,
    pub jit_receipt: String,
    pub expires_in: u32,
}

/// Request Just-in-Time Legal Consent OTP: POST /api/v1/auth/tos-jit/request
///
/// Authenticated via Bearer token (AuthenticatedUser).
/// Generates a cryptographically random 6-digit OTP, stores its BLAKE3 hash in the L1 in-memory
/// grid (TosJitCache) with a 300s TTL, and dispatches the code asynchronously to the user's email.
pub async fn request_tos_jit_otp_handler(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    payload: Option<Json<TosJitOtpRequest>>,
) -> Result<Json<TosJitOtpResponse>, ApiError> {
    let version = payload
        .and_then(|p| p.document_version.clone())
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| "1.0".to_string());

    // 1. Fetch user identity from PostgreSQL
    let user_row: Option<(String, String)> = sqlx::query_as(
        r#"
        SELECT email, full_name
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(user.claims.sub)
    .fetch_optional(&state.pool)
    .await?;

    let (email, full_name) = match user_row {
        Some(row) => row,
        None => return Err(ApiError::Unauthorized("User account not found".into())),
    };

    // 2. Cryptographic 6-digit OTP generation
    let otp_num: u32 = rand::thread_rng().gen_range(0..=999_999);
    let otp = format!("{:06}", otp_num);
    let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();

    // 3. Atomically store OTP hash & document version in L1 Moka cache (keyed by User UUID)
    let user_key = user.claims.sub.to_string();
    state
        .jit_cache
        .cache
        .insert(user_key, (otp_hash, version.clone(), 0))
        .await;

    // 4. Asynchronously dispatch OTP email via non-blocking worker thread
    let email_clone = email.clone();
    let name_clone = full_name.clone();
    let version_clone = version.clone();
    let otp_clone = otp.clone();
    tokio::spawn(async move {
        mailer::send_tos_jit_otp_email(&email_clone, &name_clone, &version_clone, &otp_clone).await;
    });

    tracing::info!(
        target: "auth::tos_jit",
        user_id = %user.claims.sub,
        version = %version,
        "JIT Legal Consent OTP generated and dispatched via email"
    );

    Ok(Json(TosJitOtpResponse {
        status: "success",
        message: "Verification code dispatched to your registered email",
        expires_in: 300,
    }))
}

/// Verify Just-in-Time Legal Consent OTP: POST /api/v1/auth/tos-jit/verify
///
/// Verifies the presented OTP in constant-time against the L1 cache.
/// Enforces max 3 strike attempts before invalidation.
/// On successful verification, mints a tamper-proof Ed25519 (EdDSA) JIT Consent Receipt
/// cryptographically bound to the user ID (sub), document version (ctx), and unique Nonce (jti)
/// with a strict 60-second TTL.
pub async fn verify_tos_jit_otp_handler(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Json(req): Json<TosJitVerifyRequest>,
) -> Result<Json<TosJitVerifyResponse>, ApiError> {
    let user_key = user.claims.sub.to_string();

    // 1. Retrieve cached handshake state from L1 grid
    let entry = match state.jit_cache.cache.get(&user_key).await {
        Some(e) => e,
        None => {
            return Err(ApiError::BadRequest(
                "Verification code expired or not requested. Please request a new code.".into(),
            ))
        }
    };

    let (stored_hash, target_version, strikes) = entry;

    // 2. Enforce strike limit (maximum 3 failed attempts)
    if strikes >= 3 {
        state.jit_cache.cache.invalidate(&user_key).await;
        return Err(ApiError::TooManyRequests(
            "Too many failed verification attempts. Code invalidated. Please request a new code."
                .into(),
        ));
    }

    // 3. Constant-time cryptographic verification
    let incoming_hash = blake3::hash(req.code.trim().as_bytes())
        .to_hex()
        .to_string();
    let is_code_valid = bool::from(stored_hash.as_bytes().ct_eq(incoming_hash.as_bytes()));
    let is_version_valid = target_version == req.active_version.trim();

    if !is_code_valid || !is_version_valid {
        let new_strikes = strikes + 1;
        if new_strikes >= 3 {
            state.jit_cache.cache.invalidate(&user_key).await;
            return Err(ApiError::BadRequest(
                "Too many failed verification attempts. Code invalidated. Please request a new code.".into(),
            ));
        } else {
            state
                .jit_cache
                .cache
                .insert(user_key, (stored_hash, target_version, new_strikes))
                .await;
            return Err(ApiError::BadRequest(format!(
                "Invalid verification code. {} attempt(s) remaining.",
                3 - new_strikes
            )));
        }
    }

    // 4. Verification successful: invalidate cached OTP to prevent reuse
    state.jit_cache.cache.invalidate(&user_key).await;

    // 5. Mint asymmetric Ed25519 JIT consent receipt (strict 60s TTL)
    let jti = Uuid::new_v4();
    let jit_receipt = mint_jit_consent_receipt(
        user.claims.sub,
        &req.active_version,
        jti,
        &state.jit_ed25519_private_key,
    )?;

    tracing::info!(
        target: "auth::tos_jit",
        user_id = %user.claims.sub,
        version = %req.active_version,
        jti = %jti,
        "JIT Legal Consent verified. Asymmetric Ed25519 receipt minted."
    );

    Ok(Json(TosJitVerifyResponse {
        status: "success",
        jit_receipt,
        expires_in: 60,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tos_jit_serialization() {
        let resp = TosJitOtpResponse {
            status: "success",
            message: "Verification code dispatched to your registered email",
            expires_in: 300,
        };
        let val = serde_json::to_value(&resp).unwrap();
        assert_eq!(val["status"], "success");
        assert_eq!(val["expires_in"], 300);

        let vresp = TosJitVerifyResponse {
            status: "success",
            jit_receipt: "test_receipt".into(),
            expires_in: 60,
        };
        let vval = serde_json::to_value(&vresp).unwrap();
        assert_eq!(vval["status"], "success");
        assert_eq!(vval["expires_in"], 60);
    }
}
