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
    pub tos_execution_public_key: String,
    pub frontend_handshake_secret: String,
}

impl AppState {
    pub fn new(pool: PgPool, jwt_secret: String, reset_cache: Arc<PasswordResetCache>) -> Self {
        let jit_ed25519_private_key = std::env::var("JIT_ED25519_PRIVATE_KEY")
            .map(|k| k.replace("\\n", "\n"))
            .unwrap_or_default();
        let tos_execution_public_key = std::env::var("TOS_EXECUTION_PUBLIC_KEY")
            .map(|k| k.replace("\\n", "\n"))
            .unwrap_or_default();
        let frontend_handshake_secret = std::env::var("FRONTEND_HANDSHAKE_SECRET").unwrap_or_default();
        if frontend_handshake_secret.is_empty() {
            tracing::warn!("FRONTEND_HANDSHAKE_SECRET is unset; management handshake verification is bypassed");
        }

        Self {
            pool,
            jwt_secret,
            cache: RevocationCache::new(),
            reset_cache,
            jit_cache: Arc::new(TosJitCache::new()),
            jit_ed25519_private_key,
            tos_execution_public_key,
            frontend_handshake_secret,
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

    pub fn with_execution_key(
        mut self,
        tos_execution_public_key: String,
    ) -> Self {
        self.tos_execution_public_key = tos_execution_public_key.replace("\\n", "\n");
        self
    }
}

impl axum::extract::FromRef<AppState> for Arc<AppState> {
    fn from_ref(state: &AppState) -> Self {
        Arc::new(state.clone())
    }
}
