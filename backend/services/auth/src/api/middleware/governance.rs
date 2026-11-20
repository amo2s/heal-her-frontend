use crate::{
    api::middleware::auth::extract_token_from_parts,
    domain::governance::ManagementRole,
    error::ApiError,
    infrastructure::jwt::{verify_token, Claims},
    state::AppState,
};
use axum::{
    extract::FromRequestParts,
    http::{request::Parts, HeaderMap},
};
use subtle::ConstantTimeEq;
use uuid::Uuid;

/// Verifies internal frontend handshake signature if configured.
pub fn verify_handshake(headers: &HeaderMap, secret: &str) -> Result<(), ApiError> {
    if secret.is_empty() {
        return Ok(());
    }
    let incoming = headers
        .get("x-healher-handshake")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if incoming.is_empty() || !bool::from(incoming.as_bytes().ct_eq(secret.as_bytes())) {
        return Err(ApiError::Forbidden(
            "Forbidden: invalid or missing frontend handshake signature".to_string(),
        ));
    }
    Ok(())
}

/// Safely extracts client IP address from headers.
pub fn extract_client_ip(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-real-ip")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.trim().to_string())
        .or_else(|| {
            headers
                .get("x-forwarded-for")
                .and_then(|v| v.to_str().ok())
                .and_then(|s| s.split(',').next())
                .map(|s| s.trim().to_string())
        })
}

/// Extractor for read-only self identity (GET /api/v1/auth/management/me).
/// Requires a valid, non-revoked JWT whose role parses as a ManagementRole.
/// Explicitly permits both PENDING and APPROVED accounts.
#[derive(Debug, Clone)]
pub struct ManagementIdentity {
    pub user_id: Uuid,
    #[allow(dead_code)]
    pub role: ManagementRole,
    pub claims: Claims,
}

impl FromRequestParts<AppState> for ManagementIdentity {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        // 1. Handshake verification (if configured)
        verify_handshake(&parts.headers, &state.frontend_handshake_secret)?;

        // 2. Extract Bearer token from Authorization header or Cookie fallback
        let token = extract_token_from_parts(parts).ok_or_else(|| {
            ApiError::Unauthorized("Missing or invalid authorization header".to_string())
        })?;

        // 3. Validate cryptographic signature and expiration
        let claims = verify_token(&token, &state.jwt_secret)
            .map_err(|e| ApiError::Unauthorized(format!("Invalid token: {e}")))?;

        // 4. Strict token type separation: ONLY "access" tokens permitted
        if claims.token_type != "access" {
            return Err(ApiError::Unauthorized(
                "Invalid token type: expected access token".to_string(),
            ));
        }

        // 5. L1 Cache Revocation Check
        if state
            .cache
            .is_token_revoked(&claims.jti, &claims.sub, claims.iat)
        {
            return Err(ApiError::Unauthorized("Token has been revoked".to_string()));
        }

        // 6. Role validation: Must parse as canonical ManagementRole
        let role = ManagementRole::parse_strict(&claims.role).ok_or_else(|| {
            ApiError::Forbidden(
                "INSUFFICIENT_PERMISSIONS: Caller does not hold a management role".to_string(),
            )
        })?;

        Ok(ManagementIdentity {
            user_id: claims.sub,
            role,
            claims,
        })
    }
}

/// Extractor for operational governance endpoints.
/// Requires a valid, non-revoked JWT whose role parses as a ManagementRole,
/// AND strictly enforces that approval_status == "APPROVED".
#[derive(Debug, Clone)]
pub struct ApprovedManagementActor {
    pub user_id: Uuid,
    pub role: ManagementRole,
    #[allow(dead_code)]
    pub claims: Claims,
}

impl FromRequestParts<AppState> for ApprovedManagementActor {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        // 1. Handshake verification (if configured)
        verify_handshake(&parts.headers, &state.frontend_handshake_secret)?;

        // 2. Extract Bearer token from Authorization header or Cookie fallback
        let token = extract_token_from_parts(parts).ok_or_else(|| {
            ApiError::Unauthorized("Missing or invalid authorization header".to_string())
        })?;

        // 3. Validate cryptographic signature and expiration
        let claims = verify_token(&token, &state.jwt_secret)
            .map_err(|e| ApiError::Unauthorized(format!("Invalid token: {e}")))?;

        // 4. Strict token type separation: ONLY "access" tokens permitted
        if claims.token_type != "access" {
            return Err(ApiError::Unauthorized(
                "Invalid token type: expected access token".to_string(),
            ));
        }

        // 5. L1 Cache Revocation Check
        if state
            .cache
            .is_token_revoked(&claims.jti, &claims.sub, claims.iat)
        {
            return Err(ApiError::Unauthorized("Token has been revoked".to_string()));
        }

        // 6. Role validation: Must parse as canonical ManagementRole
        let role = ManagementRole::parse_strict(&claims.role).ok_or_else(|| {
            ApiError::Forbidden(
                "INSUFFICIENT_PERMISSIONS: Caller does not hold a management role".to_string(),
            )
        })?;

        // 7. Fail-Closed Approval Check: claims.approval_status MUST equal "APPROVED"
        let is_approved = claims
            .approval_status
            .as_deref()
            .map(|s| s.eq_ignore_ascii_case("APPROVED"))
            .unwrap_or(false);

        if !is_approved {
            return Err(ApiError::Forbidden(
                "ACCOUNT_PENDING_APPROVAL: Account approval required to access management governance"
                    .to_string(),
            ));
        }

        Ok(ApprovedManagementActor {
            user_id: claims.sub,
            role,
            claims,
        })
    }
}
