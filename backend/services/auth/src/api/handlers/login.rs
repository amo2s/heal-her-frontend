use crate::{
    domain::auth::{LoginRequest, LoginResponse},
    error::ApiError,
    state::AppState,
};
use axum::{extract::State, Json};
use validator::Validate;

/// Thin API handler for user authentication.
/// Enforces perimeter zero-trust validation, detects honeypot bot traps,
/// and delegates orchestration to the secure authentication service layer.
pub async fn login_handler(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, ApiError> {
    // 1. Zero-trust payload validation
    if let Err(validation_errors) = payload.validate() {
        let mut messages = Vec::new();
        for (field, errs) in validation_errors.field_errors() {
            for err in errs {
                let msg = err
                    .message
                    .as_ref()
                    .map(|m| m.to_string())
                    .unwrap_or_else(|| format!("Invalid input for {field}"));
                messages.push(format!("{field}: {msg}"));
            }
        }
        let combined = if messages.is_empty() {
            "Payload failed validation constraints".to_string()
        } else {
            messages.join("; ")
        };
        return Err(ApiError::BadRequest(combined));
    }

    // 2. Honeypot Trigger (Bot Defense)
    // If bot_trap is populated with any text, silently reject with 401 Unauthorized
    if let Some(ref trap) = payload.bot_trap {
        if !trap.trim().is_empty() {
            tracing::warn!(
                target: "auth::honeypot",
                "Login honeypot triggered; silently rejecting bot authentication attempt"
            );
            return Err(ApiError::Unauthorized("Invalid credentials".to_string()));
        }
    }

    // 3. Delegate to Service Orchestrator (Automatic downcasting via Universal Error Sentinel)
    let response = crate::service::auth_service::authenticate_user(
        &state.pool,
        &state.jwt_secret,
        &payload,
    )
    .await?;

    Ok(Json(response))
}
