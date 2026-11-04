use crate::{
    api::middleware::auth::AuthenticatedUser,
    error::ApiError,
    infrastructure::{db::upgrade_user_tos_status, jwt::verify_execution_receipt},
    state::AppState,
};
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct UpgradeSessionRequest {
    pub execution_receipt: String,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
pub struct UpgradeSessionResponse {
    pub success: bool,
    pub message: String,
}

/// Zero-Trust Session Upgrade Endpoint: POST /api/v1/auth/session/upgrade
///
/// Authenticated via Bearer token (AuthenticatedUser).
/// Verifies the Ed25519 Execution Receipt minted by the Python Legal service.
/// Cross-references receipt `sub` against the caller's session ID / Email.
/// Atomically upgrades the user's `tos_cleared` status in PostgreSQL.
pub async fn upgrade_session_handler(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Json(payload): Json<UpgradeSessionRequest>,
) -> Result<Json<UpgradeSessionResponse>, ApiError> {
    // Step 1 (Crypto Check): Verify Ed25519 signature & claims with 0 leeway
    let claims = verify_execution_receipt(
        &payload.execution_receipt,
        &state.tos_execution_public_key,
    )?;

    // Step 2 (The Zero-Trust Anchor): Cross-reference claims.sub against the authenticated session
    let user_id_str = user.claims.sub.to_string();
    let is_direct_match = claims.sub == user_id_str;

    if !is_direct_match {
        // Query user's registered email to cross-reference if receipt was issued with email as subject
        let user_email: Option<String> = sqlx::query_scalar(
            "SELECT email FROM users WHERE id = $1"
        )
        .bind(user.claims.sub)
        .fetch_optional(&state.pool)
        .await
        .map_err(ApiError::from)?;

        let is_email_match = user_email.as_deref() == Some(&claims.sub);

        if !is_email_match {
            tracing::warn!(
                target: "auth::security",
                session_user_id = %user.claims.sub,
                receipt_sub = %claims.sub,
                "Unauthorized session upgrade attempt: receipt subject mismatch"
            );
            return Err(ApiError::Forbidden(
                "Execution receipt subject does not match authenticated user".into(),
            ));
        }
    }

    // Step 3 (Postgres Mutation): Atomically update tos_cleared in PostgreSQL
    upgrade_user_tos_status(&state.pool, &claims.sub).await?;

    // Step 4 (Audit Log): Emit an immutable structured log
    tracing::info!(
        target: "auth::security",
        user_id = %claims.sub,
        jti = %claims.jti,
        "Zero-Trust session upgraded successfully via PostgreSQL direct mutation."
    );

    // Step 5: Return 200 OK
    Ok(Json(UpgradeSessionResponse {
        success: true,
        message: "Session successfully upgraded".into(),
    }))
}

