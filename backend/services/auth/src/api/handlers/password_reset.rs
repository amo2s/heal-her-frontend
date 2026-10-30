use crate::{
    domain::password_reset::{
        ConfirmResetInput, ConfirmResetResponse, RequestOtpInput, VerifyOtpInput, VerifyOtpResponse,
    },
    error::ApiError,
    service::password_reset_service,
    state::AppState,
};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use std::sync::Arc;

/// Handles password reset OTP requests.
/// Implements constant-time response masking to prevent account enumeration.
pub async fn request_otp_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RequestOtpInput>,
) -> impl IntoResponse {
    let _ = password_reset_service::process_otp_request(&state, &payload.email).await;

    (
        StatusCode::OK,
        Json(json!({
            "status": "success",
            "message": "If the provided credentials match an active account, a secure authorization code has been dispatched."
        })),
    )
}

/// Handles password reset OTP verification.
/// Verifies OTP with constant-time equality, enforces 3-strike lockout,
/// and atomically mints a high-entropy 32-byte reset token.
pub async fn verify_otp_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<VerifyOtpInput>,
) -> Result<Json<VerifyOtpResponse>, ApiError> {
    let response = password_reset_service::verify_reset_otp(&state, &payload).await?;
    Ok(Json(response))
}

/// Handles final password reset confirmation.
/// Enforces password complexity, atomically consumes the reset token,
/// updates PostgreSQL, and fires the nuclear global session kill-switch.
pub async fn confirm_reset_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ConfirmResetInput>,
) -> Result<Json<ConfirmResetResponse>, ApiError> {
    let response = password_reset_service::confirm_password_reset(&state, &payload).await?;
    Ok(Json(response))
}
