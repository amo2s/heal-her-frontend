use crate::{
    domain::auth::{LoginRequest, LoginResponse},
    error::ApiError,
    state::AppState,
};
use axum::{
    extract::State,
    http::HeaderMap,
    Json,
};
use validator::Validate;

/// Thin API handler for user authentication.
/// Enforces perimeter zero-trust validation, detects honeypot bot traps,
/// extracts client fingerprint headers, and delegates orchestration to the secure authentication service layer.
pub async fn login_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
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

    // 3. Extract client metadata for audit & session fingerprinting
    let user_agent = headers
        .get("user-agent")
        .and_then(|v| v.to_str().ok());

    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.split(',').next())
        .map(|s| s.trim())
        .or_else(|| {
            headers
                .get("x-real-ip")
                .and_then(|v| v.to_str().ok())
        });

    // 4. Delegate to Service Orchestrator (Automatic downcasting via Universal Error Sentinel)
    let response = crate::service::auth_service::authenticate_user(
        &state.pool,
        &state.jwt_secret,
        &state.cache,
        &payload,
        user_agent,
        ip_address,
    )
    .await?;

    Ok(Json(response))
}
