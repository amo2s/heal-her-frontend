use crate::{
    domain::auth::{LoginResponse, RefreshRequest},
    error::ApiError,
    state::AppState,
};
use axum::{
    extract::State,
    http::{header, HeaderMap},
    Json,
};

/// Refresh Token Rotation Handler: POST /api/v1/auth/refresh
/// Accepts a JSON payload containing `refreshToken`, or extracts from cookie fallback.
pub async fn refresh_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    payload: Option<Json<RefreshRequest>>,
) -> Result<Json<LoginResponse>, ApiError> {
    // 1. Extract raw refresh token from body or cookie
    let raw_token = payload
        .and_then(|Json(p)| p.refresh_token)
        .or_else(|| extract_refresh_token_from_cookies(&headers))
        .ok_or_else(|| ApiError::BadRequest("Missing refresh token in request body or cookies".to_string()))?;

    let raw_token = raw_token.trim();
    if raw_token.is_empty() {
        return Err(ApiError::BadRequest("Refresh token cannot be empty".to_string()));
    }

    // 2. Extract client telemetry
    let user_agent = headers.get("user-agent").and_then(|v| v.to_str().ok());
    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.split(',').next())
        .map(|s| s.trim())
        .or_else(|| headers.get("x-real-ip").and_then(|v| v.to_str().ok()));

    // 3. Delegate to service layer
    let response = crate::service::auth_service::refresh_user_session(
        &state.pool,
        &state.jwt_secret,
        &state.cache,
        raw_token,
        user_agent,
        ip_address,
    )
    .await?;

    Ok(Json(response))
}

fn extract_refresh_token_from_cookies(headers: &HeaderMap) -> Option<String> {
    if let Some(cookie_header) = headers.get(header::COOKIE).and_then(|v| v.to_str().ok()) {
        for cookie in cookie_header.split(';') {
            let cookie = cookie.trim();
            if let Some(val) = cookie.strip_prefix("sb-refresh-token=") {
                let token = val.trim();
                if !token.is_empty() {
                    return Some(token.to_string());
                }
            }
            if let Some(val) = cookie.strip_prefix("refreshToken=") {
                let token = val.trim();
                if !token.is_empty() {
                    return Some(token.to_string());
                }
            }
        }
    }
    None
}

