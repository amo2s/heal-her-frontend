use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts},
};
use crate::{
    error::ApiError,
    infrastructure::jwt::{verify_token, Claims},
    state::AppState,
};

/// Extractor that verifies JWT validity, enforces token_type == "access",
/// and checks the L1 moka+ahash in-memory revocation cache in ~20 nanoseconds.
#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub claims: Claims,
}

impl FromRequestParts<AppState> for AuthenticatedUser {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        // 1. Extract Bearer token from Authorization header or Cookie fallback
        let token = extract_token_from_parts(parts)
            .ok_or_else(|| ApiError::Unauthorized("Missing or invalid authorization header".to_string()))?;

        // 2. Validate cryptographic signature and expiration
        let claims = verify_token(&token, &state.jwt_secret)
            .map_err(|e| ApiError::Unauthorized(format!("Invalid token: {e}")))?;

        // 3. Strict token type separation: ONLY "access" tokens permitted on protected endpoints
        if claims.token_type != "access" {
            return Err(ApiError::Unauthorized("Invalid token type: expected access token".to_string()));
        }

        // 4. Nanosecond L1 Cache Revocation Check
        if state.cache.is_token_revoked(&claims.jti, &claims.sub, claims.iat) {
            return Err(ApiError::Unauthorized("Token has been revoked".to_string()));
        }

        Ok(AuthenticatedUser { claims })
    }
}

/// Helper function to extract authentication token from request headers or cookies.
pub fn extract_token_from_parts(parts: &Parts) -> Option<String> {
    // 1. Try Authorization header: Bearer <token>
    if let Some(auth_val) = parts.headers.get(header::AUTHORIZATION).and_then(|v| v.to_str().ok()) {
        if let Some(stripped) = auth_val.strip_prefix("Bearer ").or_else(|| auth_val.strip_prefix("bearer ")) {
            let token = stripped.trim();
            if !token.is_empty() {
                return Some(token.to_string());
            }
        }
    }

    // 2. Fallback to Cookie header: sb-access-token or accessToken
    if let Some(cookie_header) = parts.headers.get(header::COOKIE).and_then(|v| v.to_str().ok()) {
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
    use sqlx::PgPool;
    use uuid::Uuid;
    use crate::infrastructure::jwt::generate_token_pair;

    #[tokio::test]
    async fn test_extractor_accepts_valid_access_token() {
        let pool = PgPool::connect_lazy("postgres://localhost/dummy").unwrap();
        let secret = "test_super_secret_key_32_bytes_long_ok";
        let state = AppState::new(pool, secret.to_string(), std::sync::Arc::new(crate::infrastructure::reset_cache::PasswordResetCache::new()));

        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let family_id = Uuid::new_v4();

        let pair = generate_token_pair(user_id, "young-adult", Some("young-adults"), session_id, family_id, secret).unwrap();

        let req = Request::builder()
            .header("Authorization", format!("Bearer {}", pair.access_token))
            .body(())
            .unwrap();
        let (mut parts, _) = req.into_parts();

        let extracted = AuthenticatedUser::from_request_parts(&mut parts, &state).await;
        assert!(extracted.is_ok());
        let auth_user = extracted.unwrap();
        assert_eq!(auth_user.claims.sub, user_id);
        assert_eq!(auth_user.claims.token_type, "access");
    }

    #[tokio::test]
    async fn test_extractor_rejects_refresh_token() {
        let pool = PgPool::connect_lazy("postgres://localhost/dummy").unwrap();
        let secret = "test_super_secret_key_32_bytes_long_ok";
        let state = AppState::new(pool, secret.to_string(), std::sync::Arc::new(crate::infrastructure::reset_cache::PasswordResetCache::new()));

        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let family_id = Uuid::new_v4();

        let pair = generate_token_pair(user_id, "young-adult", Some("young-adults"), session_id, family_id, secret).unwrap();

        let req = Request::builder()
            .header("Authorization", format!("Bearer {}", pair.refresh_token))
            .body(())
            .unwrap();
        let (mut parts, _) = req.into_parts();

        let extracted = AuthenticatedUser::from_request_parts(&mut parts, &state).await;
        assert!(matches!(extracted, Err(ApiError::Unauthorized(_))));
    }

    #[tokio::test]
    async fn test_extractor_rejects_revoked_jti() {
        let pool = PgPool::connect_lazy("postgres://localhost/dummy").unwrap();
        let secret = "test_super_secret_key_32_bytes_long_ok";
        let state = AppState::new(pool, secret.to_string(), std::sync::Arc::new(crate::infrastructure::reset_cache::PasswordResetCache::new()));

        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let family_id = Uuid::new_v4();

        let pair = generate_token_pair(user_id, "young-adult", Some("young-adults"), session_id, family_id, secret).unwrap();

        // Verify token to get its JTI
        let claims = verify_token(&pair.access_token, secret).unwrap();
        state.cache.revoke_jti(claims.jti).await;

        let req = Request::builder()
            .header("Authorization", format!("Bearer {}", pair.access_token))
            .body(())
            .unwrap();
        let (mut parts, _) = req.into_parts();

        let extracted = AuthenticatedUser::from_request_parts(&mut parts, &state).await;
        assert!(matches!(extracted, Err(ApiError::Unauthorized(_))));
    }

    #[tokio::test]
    async fn test_extractor_rejects_global_user_revocation() {
        let pool = PgPool::connect_lazy("postgres://localhost/dummy").unwrap();
        let secret = "test_super_secret_key_32_bytes_long_ok";
        let state = AppState::new(pool, secret.to_string(), std::sync::Arc::new(crate::infrastructure::reset_cache::PasswordResetCache::new()));

        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let family_id = Uuid::new_v4();

        let pair = generate_token_pair(user_id, "young-adult", Some("young-adults"), session_id, family_id, secret).unwrap();

        // Global kill-switch: revoke all sessions at timestamp >= iat
        let now = chrono::Utc::now().timestamp() + 10;
        state.cache.revoke_all_user_sessions(user_id, now).await;

        let req = Request::builder()
            .header("Authorization", format!("Bearer {}", pair.access_token))
            .body(())
            .unwrap();
        let (mut parts, _) = req.into_parts();

        let extracted = AuthenticatedUser::from_request_parts(&mut parts, &state).await;
        assert!(matches!(extracted, Err(ApiError::Unauthorized(_))));
    }

    #[tokio::test]
    async fn test_extractor_cookie_fallback() {
        let pool = PgPool::connect_lazy("postgres://localhost/dummy").unwrap();
        let secret = "test_super_secret_key_32_bytes_long_ok";
        let state = AppState::new(pool, secret.to_string(), std::sync::Arc::new(crate::infrastructure::reset_cache::PasswordResetCache::new()));

        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let family_id = Uuid::new_v4();

        let pair = generate_token_pair(user_id, "young-adult", Some("young-adults"), session_id, family_id, secret).unwrap();

        let req = Request::builder()
            .header("Cookie", format!("sb-access-token={}", pair.access_token))
            .body(())
            .unwrap();
        let (mut parts, _) = req.into_parts();

        let extracted = AuthenticatedUser::from_request_parts(&mut parts, &state).await;
        assert!(extracted.is_ok());
    }
}

