use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

/// InternalAuthError represents the internal, raw truth of system failures.
/// Intended strictly for internal telemetry, diagnostics, and secure logging.
/// This error must NEVER be leaked directly to the client/attacker.
#[derive(thiserror::Error, Debug)]
pub enum InternalAuthError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Cryptographic hashing error: {0}")]
    HashingError(String),

    #[error("User not found in PostgreSQL")]
    UserNotFoundInPostgres,

    #[error("Argon2id password hash verification mismatch")]
    Argon2HashMismatch,

    #[error("Account is suspended")]
    AccountSuspended,

    #[error("JWT signing error: {0}")]
    JwtSigningError(String),

    #[error("Token has been revoked")]
    TokenRevoked,

    #[error("Token replay/theft detected")]
    TokenReuseDetected,

    #[error("Invalid token type")]
    InvalidTokenType,

    #[error("Session has expired")]
    SessionExpired,

    #[error("Invalid or expired token: {0}")]
    InvalidToken(String),
}

/// ApiError represents the sanitized HTTP response.
/// Intended for the client/attacker, completely stripping internal backend telemetry.
#[derive(thiserror::Error, Debug, PartialEq, Eq)]
pub enum ApiError {
    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Internal server error: {0}")]
    InternalServerError(String),
}

/// Backward compatibility alias for existing modules
#[allow(dead_code)]
pub type AppError = ApiError;

/// The Translation Matrix: Automatically downcasts InternalAuthError into ApiError.
/// CRITICAL SECURITY LOGIC: Inside this From implementation, before returning the ApiError,
/// we MUST use tracing::error! to log the exact InternalAuthError to the console.
impl From<InternalAuthError> for ApiError {
    fn from(err: InternalAuthError) -> Self {
        tracing::error!(
            target: "auth::sentinel",
            internal_error = ?err,
            "InternalAuthError intercepted by Universal Error Sentinel"
        );

        match err {
            InternalAuthError::DatabaseError(_) => {
                ApiError::InternalServerError("An unexpected system error occurred.".to_string())
            }
            InternalAuthError::HashingError(_) => {
                ApiError::InternalServerError("An unexpected system error occurred.".to_string())
            }
            InternalAuthError::JwtSigningError(_) => {
                ApiError::InternalServerError("An unexpected system error occurred.".to_string())
            }
            InternalAuthError::UserNotFoundInPostgres => {
                ApiError::Unauthorized("Invalid credentials".to_string())
            }
            InternalAuthError::Argon2HashMismatch => {
                ApiError::Unauthorized("Invalid credentials".to_string())
            }
            InternalAuthError::AccountSuspended => {
                ApiError::Forbidden("This account has been suspended.".to_string())
            }
            InternalAuthError::TokenRevoked => {
                ApiError::Unauthorized("Token has been revoked".to_string())
            }
            InternalAuthError::TokenReuseDetected => {
                ApiError::Unauthorized("Invalid or expired session".to_string())
            }
            InternalAuthError::InvalidTokenType => {
                ApiError::Unauthorized("Invalid token type".to_string())
            }
            InternalAuthError::SessionExpired => {
                ApiError::Unauthorized("Session has expired".to_string())
            }
            InternalAuthError::InvalidToken(msg) => {
                ApiError::Unauthorized(format!("Invalid or expired token: {msg}"))
            }
        }
    }
}

/// Enables seamless ? operator conversions from raw sqlx::Error to ApiError
/// while ensuring every database error is intercepted, logged, and masked.
impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        InternalAuthError::DatabaseError(err).into()
    }
}

/// Axum Response Mapping: Implemented ONLY for ApiError.
/// Maps domain errors to exact HTTP status codes and uniform JSON error payloads:
/// { "status": "error", "message": "<the sanitized message>" }
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            ApiError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
            ApiError::Forbidden(msg) => (StatusCode::FORBIDDEN, msg),
            ApiError::Conflict(msg) => (StatusCode::CONFLICT, msg),
            ApiError::InternalServerError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        (
            status,
            Json(json!({
                "status": "error",
                "message": message
            })),
        )
            .into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_internal_to_api_error_translation_matrix() {
        let user_not_found = InternalAuthError::UserNotFoundInPostgres;
        let api_err: ApiError = user_not_found.into();
        assert_eq!(api_err, ApiError::Unauthorized("Invalid credentials".to_string()));

        let hash_mismatch = InternalAuthError::Argon2HashMismatch;
        let api_err: ApiError = hash_mismatch.into();
        assert_eq!(api_err, ApiError::Unauthorized("Invalid credentials".to_string()));

        let suspended = InternalAuthError::AccountSuspended;
        let api_err: ApiError = suspended.into();
        assert_eq!(api_err, ApiError::Forbidden("This account has been suspended.".to_string()));

        let hashing_err = InternalAuthError::HashingError("CPU cost exceeded".to_string());
        let api_err: ApiError = hashing_err.into();
        assert_eq!(api_err, ApiError::InternalServerError("An unexpected system error occurred.".to_string()));

        let jwt_err = InternalAuthError::JwtSigningError("Invalid private key".to_string());
        let api_err: ApiError = jwt_err.into();
        assert_eq!(api_err, ApiError::InternalServerError("An unexpected system error occurred.".to_string()));

        let revoked = InternalAuthError::TokenRevoked;
        let api_err: ApiError = revoked.into();
        assert_eq!(api_err, ApiError::Unauthorized("Token has been revoked".to_string()));

        let reuse = InternalAuthError::TokenReuseDetected;
        let api_err: ApiError = reuse.into();
        assert_eq!(api_err, ApiError::Unauthorized("Invalid or expired session".to_string()));
    }
}
