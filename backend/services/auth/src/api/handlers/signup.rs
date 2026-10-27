use crate::{
    domain::user::{SignupRequest, UserRole},
    error::AppError,
    infrastructure::crypto::{execute_dummy_hash, hash_password},
};
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

/// Asynchronous Signup Handler
/// Implements zero-trust validation, bot honeypot filtering, transactional integrity,
/// timing-attack equalization, dynamic demographic role routing, and v7 UUID indexing.
pub async fn handle_signup(
    State(pool): State<PgPool>,
    Json(payload): Json<SignupRequest>,
) -> Result<Response, AppError> {
    // 1. Validation Enforcement
    if let Err(validation_errors) = payload.validate() {
        let mut field_messages = Vec::new();
        for (field, errs) in validation_errors.field_errors() {
            for err in errs {
                let msg = err
                    .message
                    .as_ref()
                    .map(|m| m.to_string())
                    .unwrap_or_else(|| format!("Invalid input for {field}"));
                field_messages.push(format!("{field}: {msg}"));
            }
        }

        let combined_msg = if field_messages.is_empty() {
            "Payload failed validation constraints".to_string()
        } else {
            field_messages.join("; ")
        };

        return Err(AppError::ValidationError(combined_msg));
    }

    // 2. Honeypot Trigger (Bot Defense)
    // If bot_trap contains any text, return fake success without database interaction
    if let Some(ref trap) = payload.bot_trap {
        if !trap.trim().is_empty() {
            tracing::warn!(
                target: "auth::honeypot",
                "Honeypot trap triggered; silently dropping bot registration request"
            );
            return Ok((
                StatusCode::OK,
                Json(json!({
                    "status": "success",
                    "message": "Welcome to HEAL-HER. Your account has been registered.",
                    "user_id": Uuid::now_v7()
                })),
            )
                .into_response());
        }
    }

    // 3. Data Normalization
    let normalized_email = payload.email.trim().to_lowercase();

    // 4. Database Transaction
    let mut tx = pool.begin().await.map_err(AppError::DatabaseError)?;

    // 5. Existence Check & CPU Equalization (Timing-Attack Immunity)
    let existing_count: i64 = sqlx::query_scalar(
        r#"SELECT COUNT(*) FROM users WHERE email = $1"#
    )
    .bind(&normalized_email)
    .fetch_one(&mut *tx)
    .await
    .map_err(AppError::DatabaseError)?;

    if existing_count > 0 {
        tracing::info!(
            target: "auth::signup",
            "User already exists; executing dummy Argon2id hash to equalize CPU latency"
        );
        // Equalize latency to prevent email enumeration via timing side-channels
        execute_dummy_hash()?;
        let _ = tx.rollback().await;
        return Err(AppError::Conflict(
            "A user with this email address already exists".to_string(),
        ));
    }

    // 6. Algorithmic Demographic Routing
    let role = UserRole::from_age(payload.age);

    // 7. Cryptographic Hashing (Argon2id)
    let password_hash = hash_password(&payload.password)?;

    // 8. Primary Key Generation (UUIDv7 for time-ordered B-Tree optimization)
    let user_id = Uuid::now_v7();

    // 9. Atomic Insertion
    sqlx::query(
        r#"
        INSERT INTO users (
            id, full_name, email, age, role, password_hash, is_active, is_verified, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        "#
    )
    .bind(user_id)
    .bind(&payload.full_name)
    .bind(&normalized_email)
    .bind(payload.age)
    .bind(role.as_str())
    .bind(&password_hash)
    .bind(true)
    .bind(false)
    .execute(&mut *tx)
    .await
    .map_err(AppError::DatabaseError)?;

    // 10. Commit & Respond
    tx.commit().await.map_err(AppError::DatabaseError)?;

    tracing::info!(
        target: "auth::signup",
        user_id = %user_id,
        role = role.as_str(),
        "User successfully registered"
    );

    Ok((
        StatusCode::CREATED,
        Json(crate::domain::user::SignupResponse {
            status: "success",
            message: "Welcome to HEAL-HER. Your account has been registered successfully.",
            user_id,
        }),
    )
        .into_response())
}
