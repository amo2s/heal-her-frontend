use sqlx::PgPool;

/// Immutable Application State passed to all Axum request handlers via dependency injection.
/// Internal connection pooling is managed safely across concurrent tasks via SQLx's internal Arc.
#[derive(Clone, Debug)]
pub struct AppState {
    pub pool: PgPool,
    #[allow(dead_code)]
    pub jwt_secret: String,
}

impl AppState {
    pub fn new(pool: PgPool, jwt_secret: String) -> Self {
        Self { pool, jwt_secret }
    }
}
