use axum::{
    extract::{FromRef, FromRequestParts},
    http::{header, request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

use crate::state::AppState;

/// Standard Zero-Trust JWT Claims payload expected from the Auth microservice.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub exp: i64,
    pub token_type: String,
}

/// Extractor representing a verified, authenticated caller.
#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub user_id: Uuid,
}

#[derive(Debug)]
pub enum AuthError {
    MissingToken,
    InvalidToken(String),
    WrongTokenType,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AuthError::MissingToken => (
                StatusCode::UNAUTHORIZED,
                "Missing or invalid Authorization header",
            ),
            AuthError::InvalidToken(err) => {
                tracing::warn!(target: "dashboard::auth", error = %err, "JWT validation failed");
                (StatusCode::UNAUTHORIZED, "Invalid or expired token")
            }
            AuthError::WrongTokenType => (
                StatusCode::UNAUTHORIZED,
                "Invalid token type: expected access token",
            ),
        };

        let body = Json(json!({
            "error": error_message,
            "status": "unauthorized"
        }));

        (status, body).into_response()
    }
}

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    AppState: axum::extract::FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AuthError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = AppState::from_ref(state);

        // Step A: Extract token from Authorization header or Cookie fallback
        let token = extract_token_from_parts(parts).ok_or(AuthError::MissingToken)?;

        // Step B: Decode with Algorithm::HS256 and shared secret
        let decoding_key = DecodingKey::from_secret(app_state.jwt_secret.as_bytes());
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_aud = false;

        let token_data = decode::<Claims>(&token, &decoding_key, &validation)
            .map_err(|e| AuthError::InvalidToken(e.to_string()))?;

        // Step C: Validate token_type == "access"
        if token_data.claims.token_type != "access" {
            return Err(AuthError::WrongTokenType);
        }

        // Step D: Return AuthenticatedUser
        Ok(AuthenticatedUser {
            user_id: token_data.claims.sub,
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
            exp: now + 600,
            token_type: "access".to_string(),
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
        assert_eq!(decoded.claims.token_type, "access");
    }

    #[test]
    fn test_jwt_rejects_wrong_token_type() {
        let secret = "super_secure_jwt_secret_key_32_bytes_test";
        let user_id = Uuid::new_v4();
        let now = chrono::Utc::now().timestamp();

        let claims = Claims {
            sub: user_id,
            exp: now + 600,
            token_type: "refresh".to_string(),
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
}
