use moka::future::Cache;
use sqlx::PgPool;
use uuid::Uuid;

/// Thread-safe, globally shared application state injected into
/// Axum middleware extractors and the async-graphql execution context.
#[derive(Clone)]
pub struct AppState {
    pub db_pool: PgPool,
    pub jwt_secret: String,
    pub profile_cache: Cache<Uuid, String>,
}

impl AppState {
    pub fn new(db_pool: PgPool, jwt_secret: String, profile_cache: Cache<Uuid, String>) -> Self {
        Self {
            db_pool,
            jwt_secret,
            profile_cache,
        }
    }
}
