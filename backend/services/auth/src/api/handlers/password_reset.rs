use crate::{
    api::middleware::governance::{extract_client_ip, verify_handshake},
    domain::password_reset::{
        ConfirmResetInput, ConfirmResetResponse, ManagementConfirmResetInput,
        ManagementRequestOtpInput, ManagementVerifyOtpInput, PasswordResetScope,
        RequestOtpInput, VerifyOtpInput, VerifyOtpResponse,
    },
    error::ApiError,
    service::password_reset_service,
    state::AppState,
};
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;

// ============================================================================
// PUBLIC END-USER RECOVERY HANDLERS (PasswordResetScope::EndUser)
// ============================================================================

/// Handles public end-user password reset OTP requests.
/// Implements constant-time Ghost Protocol response masking to prevent account enumeration.
pub async fn request_otp_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<RequestOtpInput>,
) -> impl IntoResponse {
    let client_ip = extract_client_ip(&headers);
    let _ = password_reset_service::process_otp_request(
        &state,
        &payload.email,
        client_ip.as_deref(),
        PasswordResetScope::EndUser,
    )
    .await;

    (
        StatusCode::OK,
        Json(json!({
            "status": "success",
            "message": "If the provided credentials match an active account, a secure authorization code has been dispatched."
        })),
    )
}

/// Handles public end-user password reset OTP verification.
/// Verifies OTP with constant-time equality, enforces 3-strike lockout,
/// and atomically mints a high-entropy 32-byte reset token.
pub async fn verify_otp_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<VerifyOtpInput>,
) -> Result<Json<VerifyOtpResponse>, ApiError> {
    let response = password_reset_service::verify_reset_otp(
        &state,
        &payload.email,
        &payload.otp_code,
        PasswordResetScope::EndUser,
    )
    .await?;
    Ok(Json(response))
}

/// Handles public end-user final password reset confirmation.
/// Enforces password complexity, atomically consumes the reset token,
/// updates PostgreSQL, and fires the nuclear global session kill-switch.
pub async fn confirm_reset_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<ConfirmResetInput>,
) -> Result<Json<ConfirmResetResponse>, ApiError> {
    let client_ip = extract_client_ip(&headers);
    let response = password_reset_service::confirm_password_reset(
        &state,
        &payload.reset_token,
        &payload.new_password,
        &payload.confirm_password,
        client_ip.as_deref(),
        PasswordResetScope::EndUser,
    )
    .await?;
    Ok(Json(response))
}

// ============================================================================
// DEDICATED MANAGEMENT RECOVERY HANDLERS (PasswordResetScope::Management)
// ============================================================================

/// Handles management password reset OTP requests.
/// Handshake-guarded, dual-key rate-limited, strictly approved-only lifecycle gated.
pub async fn management_request_otp_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<ManagementRequestOtpInput>,
) -> Result<impl IntoResponse, ApiError> {
    verify_handshake(&headers, &state.frontend_handshake_secret)?;
    let client_ip = extract_client_ip(&headers);

    let _ = password_reset_service::process_otp_request(
        &state,
        &payload.email,
        client_ip.as_deref(),
        PasswordResetScope::Management,
    )
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "status": "success",
            "message": "If an eligible account exists for this email, a verification code has been sent."
        })),
    ))
}

/// Handles management password reset OTP verification.
/// Handshake-guarded, namespaced to mgmt: scope, enforces 3-strike lockout,
/// and atomically mints a high-entropy 32-byte management reset token.
pub async fn management_verify_otp_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<ManagementVerifyOtpInput>,
) -> Result<Json<VerifyOtpResponse>, ApiError> {
    verify_handshake(&headers, &state.frontend_handshake_secret)?;

    let response = password_reset_service::verify_reset_otp(
        &state,
        &payload.email,
        &payload.otp_code,
        PasswordResetScope::Management,
    )
    .await?;

    Ok(Json(response))
}

/// Handles management final password reset confirmation.
/// Handshake-guarded, re-verifies invariants inside FOR UPDATE transaction,
/// updates password, logs MANAGEMENT_PASSWORD_RESET to governance_audit_logs,
/// and executes the nuclear session kill-switch across PostgreSQL and L1 cache.
pub async fn management_confirm_reset_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<ManagementConfirmResetInput>,
) -> Result<Json<ConfirmResetResponse>, ApiError> {
    verify_handshake(&headers, &state.frontend_handshake_secret)?;
    let client_ip = extract_client_ip(&headers);

    let response = password_reset_service::confirm_password_reset(
        &state,
        &payload.reset_token,
        &payload.new_password,
        &payload.confirm_password,
        client_ip.as_deref(),
        PasswordResetScope::Management,
    )
    .await?;

    Ok(Json(response))
}
