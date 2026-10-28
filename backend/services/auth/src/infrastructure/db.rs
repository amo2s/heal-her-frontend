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
