use crate::infrastructure::{cache::RevocationCache, reset_cache::PasswordResetCache};
use sqlx::PgPool;
use std::sync::Arc;

/// Immutable Application State passed to all Axum request handlers via dependency injection.
/// Internal connection pooling is managed safely across concurrent tasks via SQLx's internal Arc.
/// L1 in-memory cache provides lock-free, sub-microsecond token revocation checks.
#[derive(Clone, Debug)]
pub struct AppState {
    pub pool: PgPool,
    pub jwt_secret: String,
    pub cache: RevocationCache,
    pub reset_cache: Arc<PasswordResetCache>,
}

impl AppState {
    pub fn new(pool: PgPool, jwt_secret: String, reset_cache: Arc<PasswordResetCache>) -> Self {
        Self {
            pool,
            jwt_secret,
            cache: RevocationCache::new(),
            reset_cache,
        }
    }
}

impl axum::extract::FromRef<AppState> for Arc<AppState> {
    fn from_ref(state: &AppState) -> Self {
        Arc::new(state.clone())
    }
}
