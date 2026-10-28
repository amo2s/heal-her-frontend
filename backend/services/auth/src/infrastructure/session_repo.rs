use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;
use crate::error::InternalAuthError;

/// Inserts a new stateful session into the PostgreSQL sessions table.
/// Enforces BLAKE3 hashed refresh token storage, session family linkage, and explicit expiration.
pub async fn create_session(
    pool: &PgPool,
    session_id: Uuid,
    user_id: Uuid,
    family_id: Uuid,
    refresh_token_hash: &str,
    user_agent: Option<&str>,
    ip_address: Option<&str>,
    expires_at: DateTime<Utc>,
) -> Result<(), InternalAuthError> {
    sqlx::query(
        r#"
        INSERT INTO sessions (
            id, user_id, family_id, refresh_token_hash, is_revoked, user_agent, ip_address, created_at, expires_at
        )
        VALUES ($1, $2, $3, $4, FALSE, $5, $6, NOW(), $7)
        "#,
    )
    .bind(session_id)
    .bind(user_id)
    .bind(family_id)
    .bind(refresh_token_hash)
    .bind(user_agent)
    .bind(ip_address)
    .bind(expires_at)
    .execute(pool)
    .await?;

    Ok(())
}

