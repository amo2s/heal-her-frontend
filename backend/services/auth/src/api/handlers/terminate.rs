use crate::{
    api::middleware::auth::AuthenticatedUser, error::ApiError,
    infrastructure::session_repo::delete_all_user_sessions, state::AppState,
};
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};

/// Response payload for legal consent session kill-switch termination.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TerminateSessionResponse {
    pub status: &'static str,
    pub message: &'static str,
}

/// Terminate Session Handler: POST /api/v1/auth/terminate-session
///
/// Protected by the AuthenticatedUser extractor (verifies access token signature and L1 cache).
/// Executes the Nuclear Option when a user declines the mandatory legal terms:
/// 1. L1 Cache Invalidation: Immediately blacklists calling access token's JTI in moka L1 cache.
/// 2. Global User Revocation: Stamps user ID into Tier-2 Global User Kill-Switch cache (10-minute TTL)
///    to reject any existing access tokens issued prior to or at this timestamp.
/// 3. PostgreSQL Session Purge: Executes hard SQL DELETE on all refresh sessions for this user in PostgreSQL.
pub async fn terminate_session_handler(
    State(state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<Json<TerminateSessionResponse>, ApiError> {
    let now_ts = chrono::Utc::now().timestamp();

    // 1. L1 Cache Invalidation: Immediately blacklist current Access Token JTI
    state.cache.revoke_jti(user.claims.jti).await;

    // 2. Global User Revocation: Stamp user ID into Tier-2 Global User Kill-Switch cache
    state
        .cache
        .revoke_all_user_sessions(user.claims.sub, now_ts)
        .await;

    // 3. PostgreSQL Session Purge: Hard delete all active sessions for this user in PostgreSQL
    let deleted_count = delete_all_user_sessions(&state.pool, user.claims.sub).await?;

    tracing::warn!(
        target: "auth::kill_switch",
        user_id = %user.claims.sub,
        purged_sessions = deleted_count,
        "Legal consent declined: nuclear kill-switch executed. All active sessions purged and tokens blacklisted."
    );

    Ok(Json(TerminateSessionResponse {
        status: "success",
        message: "Session cryptographically terminated and revoked.",
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_terminate_session_response_serialization() {
        let resp = TerminateSessionResponse {
            status: "success",
            message: "Session cryptographically terminated and revoked.",
        };
        let json_val = serde_json::to_value(&resp).unwrap();
        assert_eq!(json_val["status"], "success");
        assert_eq!(
            json_val["message"],
            "Session cryptographically terminated and revoked."
        );
    }
}
