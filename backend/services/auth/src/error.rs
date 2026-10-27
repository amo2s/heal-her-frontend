use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error("Validation failed: {0}")]
    ValidationError(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Database error occurred")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Cryptographic hashing error: {0}")]
    HashingError(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Internal server error")]
    InternalServerError,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::ValidationError(details) => {
                tracing::warn!(target: "auth::validation", "Validation failure: {}", details);
                (
                    StatusCode::BAD_REQUEST,
                    Json(json!({
                        "status": "fail",
                        "error": "validation_error",
                        "message": details
                    })),
                )
                    .into_response()
            }
            AppError::Conflict(message) => {
                tracing::warn!(target: "auth::conflict", "Conflict detected: {}", message);
                (
                    StatusCode::CONFLICT,
                    Json(json!({
                        "status": "fail",
                        "error": "conflict",
                        "message": message
                    })),
                )
                    .into_response()
            }
            AppError::DatabaseError(err) => {
                // Critical Security Constraint: Never leak raw database error details to client
                tracing::error!(target: "auth::database", error = ?err, "Internal database error encountered");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({
                        "status": "error",
                        "error": "internal_server_error",
                        "message": "An internal error occurred. Please try again later."
                    })),
                )
                    .into_response()
            }
            AppError::HashingError(err_detail) => {
                // Critical Security Constraint: Never leak crypto/hashing internals to client
                tracing::error!(target: "auth::crypto", error = %err_detail, "Cryptographic operation failed");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({
                        "status": "error",
                        "error": "internal_server_error",
                        "message": "An internal error occurred. Please try again later."
                    })),
                )
                    .into_response()
            }
            AppError::ConfigError(err) => {
                tracing::error!(target: "auth::config", error = %err, "Configuration failure");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({
                        "status": "error",
                        "error": "internal_server_error",
                        "message": "Service configuration error"
                    })),
                )
                    .into_response()
            }
            AppError::InternalServerError => {
                tracing::error!(target: "auth::internal", "Internal server error triggered");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({
                        "status": "error",
                        "error": "internal_server_error",
                        "message": "An internal error occurred. Please try again later."
                    })),
                )
                    .into_response()
            }
        }
    }
}
