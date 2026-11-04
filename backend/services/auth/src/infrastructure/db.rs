use crate::{config::Config, error::InternalAuthError};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::Duration;

pub async fn create_pool(config: &Config) -> Result<PgPool, InternalAuthError> {
    tracing::info!(
        max_connections = config.max_connections,
        acquire_timeout_secs = config.acquire_timeout_secs,
        idle_timeout_secs = config.idle_timeout_secs,
        "Initializing Postgres connection pool..."
    );

    let pool = PgPoolOptions::new()
        .max_connections(config.max_connections)
        .acquire_timeout(Duration::from_secs(config.acquire_timeout_secs))
        .idle_timeout(Duration::from_secs(config.idle_timeout_secs))
        .connect(&config.database_url)
        .await
        .map_err(|err| {
            tracing::error!(error = ?err, "Failed to connect to PostgreSQL database");
            InternalAuthError::DatabaseError(err)
        })?;

    tracing::info!("PostgreSQL connection pool established successfully.");
    Ok(pool)
}

/// Atomically upgrades the user's legal consent status (`tos_cleared = TRUE`) directly in PostgreSQL.
/// Executes a parameterized query matching either user UUID string or registered email.
/// Rejects with `InternalAuthError::UserNotFound` if no rows were affected to prevent ghost upgrades.
pub async fn upgrade_user_tos_status(
    pool: &PgPool,
    user_id: &str,
) -> Result<(), InternalAuthError> {
    let result = sqlx::query(
        "UPDATE users SET tos_cleared = TRUE, updated_at = NOW() WHERE email = $1 OR id::text = $1",
    )
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(InternalAuthError::DatabaseError)?;

    if result.rows_affected() == 0 {
        return Err(InternalAuthError::UserNotFound);
    }

    Ok(())
}
