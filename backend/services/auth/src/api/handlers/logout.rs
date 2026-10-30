use crate::{
    api::middleware::auth::AuthenticatedUser,
    domain::auth::{LogoutRequest, LogoutResponse},
    error::ApiError,
    state::AppState,
};
use axum::{extract::State, Json};

/// Logout Handler: POST /api/v1/auth/logout
/// Protected by AuthenticatedUser extractor (verifies access token signature and L1 cache).
/// Supports single-device or global multi-device session termination.
pub async fn logout_handler(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    payload: Option<Json<LogoutRequest>>,
) -> Result<Json<LogoutResponse>, ApiError> {
    let req = payload.map(|Json(p)| p).unwrap_or_default();

    let response = crate::service::auth_service::logout_user_session(
        &state.pool,
        &state.cache,
        &user.claims,
        req.all_devices,
        req.refresh_token.as_deref(),
    )
    .await?;

    Ok(Json(response))
}
