use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::Duration;

/// Initializes the PostgreSQL connection pool using SQLx.
/// Configures a maximum limit of 20 connections to shield PostgreSQL / Supabase,
/// with a 10s acquire timeout and a 10m (600s) idle connection timeout.
pub async fn init_pool(db_url: &str) -> PgPool {
    tracing::info!("Initializing SQLx PostgreSQL connection pool (max_connections: 20)...");

    PgPoolOptions::new()
        .max_connections(20)
        .acquire_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(600))
        .connect(db_url)
        .await
        .expect("FATAL: Failed to establish PostgreSQL connection pool")
}
