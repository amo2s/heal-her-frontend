use crate::infrastructure::{
    cache::RevocationCache,
    reset_cache::{PasswordResetCache, TosJitCache},
};
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
    pub jit_cache: Arc<TosJitCache>,
    pub jit_ed25519_private_key: String,
}

impl AppState {
    pub fn new(pool: PgPool, jwt_secret: String, reset_cache: Arc<PasswordResetCache>) -> Self {
        let jit_ed25519_private_key = std::env::var("JIT_ED25519_PRIVATE_KEY").unwrap_or_else(|_| {
            "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIFto8G+u9sEIJnNcxT9/HQ3xIVN/szR1dRsTkRQFM2Xf\n-----END PRIVATE KEY-----".to_string()
        });

        Self {
            pool,
            jwt_secret,
            cache: RevocationCache::new(),
            reset_cache,
            jit_cache: Arc::new(TosJitCache::new()),
            jit_ed25519_private_key,
        }
    }

    pub fn with_jit(
        mut self,
        jit_cache: Arc<TosJitCache>,
        jit_ed25519_private_key: String,
    ) -> Self {
        self.jit_cache = jit_cache;
        self.jit_ed25519_private_key = jit_ed25519_private_key;
        self
    }
}

impl axum::extract::FromRef<AppState> for Arc<AppState> {
    fn from_ref(state: &AppState) -> Self {
        Arc::new(state.clone())
    }
}
