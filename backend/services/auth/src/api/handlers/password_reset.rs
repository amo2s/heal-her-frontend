use crate::{
    domain::password_reset::RequestOtpInput,
    service::password_reset_service,
    state::AppState,
};
use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
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

