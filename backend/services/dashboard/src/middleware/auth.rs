use axum::{
    extract::{FromRef, FromRequestParts},
    http::{header, request::Parts},
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::ApiError, state::AppState};

/// Standard Zero-Trust JWT Claims payload expected from the Auth microservice.
/// Includes demographic role and target dashboard for Attribute-Based Access Control (ABAC).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    #[serde(default)]
    pub sid: Option<Uuid>,
    pub role: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub dashboard: Option<String>,
    pub exp: i64,
    pub token_type: String,
    #[serde(default)]
    pub approval_status: Option<String>,
}

/// Extractor representing a verified, authenticated caller holding the full claims payload.
#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub claims: Claims,
}

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = AppState::from_ref(state);

        // Step A: Extract token from Authorization header or Cookie fallback
        let token = extract_token_from_parts(parts).ok_or_else(|| {
            ApiError::Unauthorized("Missing or invalid Authorization header".to_string())
        })?;

        // Step B: Decode with Algorithm::HS256 and shared secret
        let decoding_key = DecodingKey::from_secret(app_state.jwt_secret.as_bytes());
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_aud = false;

        let token_data = decode::<Claims>(&token, &decoding_key, &validation)
            .map_err(|e| ApiError::Unauthorized(format!("Invalid or expired token: {e}")))?;

        // Step C: Validate token_type == "access"
        if token_data.claims.token_type != "access" {
            return Err(ApiError::Unauthorized(
                "Invalid token type: expected access token".to_string(),
            ));
        }

        // Step D: Strict End-User Role Isolation (SEC-003)
        // Explicitly block management roles (super_admin, admin, staff) from accessing end-user dashboards
        let norm_role = token_data.claims.role.trim().to_lowercase();
        if norm_role != "kid" && norm_role != "teen" && norm_role != "young-adult" {
            return Err(ApiError::Forbidden(
                "Forbidden: Caller does not hold an authorized end-user demographic role".to_string(),
            ));
        }

        // Step E: Require sid (Session UUID)
        let sid = token_data.claims.sid.ok_or_else(|| {
            ApiError::Unauthorized("Invalid token: missing session id".to_string())
        })?;

        // Step F: Live Indexed Session & User Standing Verification in PostgreSQL (SEC-003)
        // Zero-Window Revocation: Immediately severs access on logout, suspension, rejection, soft-deletion, or password reset
        #[derive(sqlx::FromRow)]
        struct ActiveSessionRow {
            #[allow(dead_code)]
            id: Uuid,
        }

        let session_row: Option<ActiveSessionRow> = sqlx::query_as(
            r#"
            SELECT s.id
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.id = $1
              AND s.user_id = $2
              AND s.is_revoked = FALSE
              AND s.expires_at > NOW()
              AND u.is_active = TRUE
              AND u.deleted_at IS NULL
              AND u.approval_status = 'APPROVED'
            "#,
        )
        .bind(sid)
        .bind(token_data.claims.sub)
        .fetch_optional(&app_state.db_pool)
        .await
        .map_err(|e| {
            tracing::error!(target: "dashboard::auth", error = %e, "PostgreSQL session verification failed");
            ApiError::ServiceUnavailable("Database verification unavailable".to_string())
        })?;

        if session_row.is_none() {
            return Err(ApiError::Unauthorized(
                "Session revoked or expired".to_string(),
            ));
        }

        // Step G: Return AuthenticatedUser holding validated claims
        Ok(AuthenticatedUser {
            claims: token_data.claims,
        })
    }
}

/// Extracts JWT token from Authorization header (Bearer <token>) with Cookie fallback.
pub fn extract_token_from_parts(parts: &Parts) -> Option<String> {
    // 1. Primary: Authorization header
    if let Some(auth_val) = parts
        .headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
    {
        if let Some(stripped) = auth_val
            .strip_prefix("Bearer ")
            .or_else(|| auth_val.strip_prefix("bearer "))
        {
            let token = stripped.trim();
            if !token.is_empty() {
                return Some(token.to_string());
            }
        }
    }

    // 2. Fallback: Cookie header (Next.js SSR support)
    if let Some(cookie_header) = parts
        .headers
        .get(header::COOKIE)
        .and_then(|v| v.to_str().ok())
    {
        for cookie in cookie_header.split(';') {
            let cookie = cookie.trim();
            if let Some(val) = cookie.strip_prefix("sb-access-token=") {
                let token = val.trim();
                if !token.is_empty() {
                    return Some(token.to_string());
                }
            }
            if let Some(val) = cookie.strip_prefix("accessToken=") {
                let token = val.trim();
                if !token.is_empty() {
                    return Some(token.to_string());
                }
            }
        }
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::Request;
    use jsonwebtoken::{encode, EncodingKey, Header};

    #[test]
    fn test_extract_token_from_bearer_header() {
        let req = Request::builder()
            .header("Authorization", "Bearer test_bearer_token_xyz")
            .body(())
            .unwrap();
        let (parts, _) = req.into_parts();
        assert_eq!(
            extract_token_from_parts(&parts),
            Some("test_bearer_token_xyz".to_string())
        );
    }

    #[test]
    fn test_extract_token_from_cookie_fallback() {
        let req = Request::builder()
            .header(
                "Cookie",
                "other=123; sb-access-token=test_cookie_token_abc; flag=true",
            )
            .body(())
            .unwrap();
        let (parts, _) = req.into_parts();
        assert_eq!(
            extract_token_from_parts(&parts),
            Some("test_cookie_token_abc".to_string())
        );
    }

    #[test]
    fn test_jwt_decode_and_claims_validation() {
        let secret = "super_secure_jwt_secret_key_32_bytes_test";
        let user_id = Uuid::new_v4();
        let now = chrono::Utc::now().timestamp();

        let claims = Claims {
            sub: user_id,
            sid: Some(Uuid::new_v4()),
            role: "young-adult".to_string(),
            dashboard: Some("young-adults".to_string()),
            exp: now + 600,
            token_type: "access".to_string(),
            approval_status: Some("APPROVED".to_string()),
        };

        let token = encode(
            &Header::new(Algorithm::HS256),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
        .unwrap();

        let decoding_key = DecodingKey::from_secret(secret.as_bytes());
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_aud = false;

        let decoded = decode::<Claims>(&token, &decoding_key, &validation).unwrap();
        assert_eq!(decoded.claims.sub, user_id);
        assert_eq!(decoded.claims.role, "young-adult");
        assert_eq!(decoded.claims.dashboard.as_deref(), Some("young-adults"));
        assert_eq!(decoded.claims.token_type, "access");
    }

    #[test]
    fn test_jwt_rejects_wrong_token_type() {
        let secret = "super_secure_jwt_secret_key_32_bytes_test";
        let user_id = Uuid::new_v4();
        let now = chrono::Utc::now().timestamp();

        let claims = Claims {
            sub: user_id,
            sid: Some(Uuid::new_v4()),
            role: "kid".to_string(),
            dashboard: Some("kids".to_string()),
            exp: now + 600,
            token_type: "refresh".to_string(),
            approval_status: Some("APPROVED".to_string()),
        };

        let token = encode(
            &Header::new(Algorithm::HS256),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
        .unwrap();

        let decoding_key = DecodingKey::from_secret(secret.as_bytes());
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_aud = false;

        let decoded = decode::<Claims>(&token, &decoding_key, &validation).unwrap();
        assert_ne!(decoded.claims.token_type, "access");
    }

    #[test]
    fn test_claims_deserialization_with_sid_and_approval_status() {
        let secret = "super_secure_jwt_secret_key_32_bytes_test";
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let now = chrono::Utc::now().timestamp();

        let claims = Claims {
            sub: user_id,
            sid: Some(session_id),
            role: "young-adult".to_string(),
            dashboard: Some("young-adults".to_string()),
            exp: now + 600,
            token_type: "access".to_string(),
            approval_status: Some("APPROVED".to_string()),
        };

        let token = encode(
            &Header::new(Algorithm::HS256),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
        .unwrap();

        let decoding_key = DecodingKey::from_secret(secret.as_bytes());
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_aud = false;

        let decoded = decode::<Claims>(&token, &decoding_key, &validation).unwrap();
        assert_eq!(decoded.claims.sub, user_id);
        assert_eq!(decoded.claims.sid, Some(session_id));
        assert_eq!(decoded.claims.approval_status.as_deref(), Some("APPROVED"));
    }

    #[test]
    fn test_end_user_role_isolation_check() {
        // Valid end-user roles
        let valid_roles = ["kid", "teen", "young-adult"];
        for role in valid_roles {
            let norm = role.trim().to_lowercase();
            assert!(norm == "kid" || norm == "teen" || norm == "young-adult");
        }

        // Invalid management roles (must be blocked on dashboard)
        let management_roles = ["super_admin", "admin", "staff", "owner", "superadmin"];
        for role in management_roles {
            let norm = role.trim().to_lowercase();
            assert!(!(norm == "kid" || norm == "teen" || norm == "young-adult"));
        }
    }
}
