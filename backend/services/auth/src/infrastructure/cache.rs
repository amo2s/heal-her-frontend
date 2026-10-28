use ahash::RandomState;
use moka::future::Cache;
use std::time::Duration;
use uuid::Uuid;

/// Dual-Tier L1 In-Memory Revocation Cache (moka + ahash)
/// Designed for 10,000 concurrent RPS with sub-microsecond in-memory lookups.
#[allow(dead_code)]
#[derive(Clone, Debug)]
pub struct RevocationCache {
    pub revoked_jtis: Cache<Uuid, bool, RandomState>,
    pub global_user_revocations: Cache<Uuid, i64, RandomState>,
}

impl Default for RevocationCache {
    fn default() -> Self {
        Self::new()
    }
}

#[allow(dead_code)]
impl RevocationCache {
    pub fn new() -> Self {
        let revoked_jtis = Cache::builder()
            .max_capacity(500_000)
            .time_to_live(Duration::from_secs(600))
            .build_with_hasher(RandomState::default());

        let global_user_revocations = Cache::builder()
            .max_capacity(100_000)
            .time_to_live(Duration::from_secs(600))
            .build_with_hasher(RandomState::default());

        Self {
            revoked_jtis,
            global_user_revocations,
        }
    }

    /// Tier 1: Single-Device JTI Blacklist
    /// Revokes a specific access token's JTI for 10 minutes.
    pub async fn revoke_jti(&self, jti: Uuid) {
        self.revoked_jtis.insert(jti, true).await;
    }

    /// Tier 2: Global User Kill-Switch
    /// Revokes all active sessions for a user issued at or before the given timestamp.
    pub async fn revoke_all_user_sessions(&self, user_id: Uuid, timestamp: i64) {
        self.global_user_revocations.insert(user_id, timestamp).await;
    }

    /// Synchronous, lock-free evaluation of token revocation status.
    /// Returns true if either the individual token JTI is blacklisted
    /// or a global revocation event occurred at or after the token's issued-at timestamp.
    pub fn is_token_revoked(&self, jti: &Uuid, user_id: &Uuid, token_iat: i64) -> bool {
        pollster::block_on(async {
            self.is_token_revoked_async(jti, user_id, token_iat).await
        })
    }

    /// Asynchronous variant of is_token_revoked for native async execution pipelines.
    pub async fn is_token_revoked_async(&self, jti: &Uuid, user_id: &Uuid, token_iat: i64) -> bool {
        if self.revoked_jtis.get(jti).await.is_some() {
            return true;
        }

        if let Some(revoked_at) = self.global_user_revocations.get(user_id).await {
            return token_iat <= revoked_at;
        }

        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_jti_revocation() {
        let cache = RevocationCache::new();
        let jti = Uuid::new_v4();
        let user_id = Uuid::new_v4();
        let now = 1000i64;

        assert!(!cache.is_token_revoked(&jti, &user_id, now));

        cache.revoke_jti(jti).await;
        assert!(cache.is_token_revoked(&jti, &user_id, now));
    }

    #[tokio::test]
    async fn test_global_user_revocation() {
        let cache = RevocationCache::new();
        let jti = Uuid::new_v4();
        let user_id = Uuid::new_v4();
        let token_iat = 1000i64;

        assert!(!cache.is_token_revoked(&jti, &user_id, token_iat));

        // Revoke all sessions at timestamp 1050 (after token issued)
        cache.revoke_all_user_sessions(user_id, 1050).await;

        // Token issued at 1000 <= 1050 -> revoked
        assert!(cache.is_token_revoked(&jti, &user_id, token_iat));

        // Token issued at 1100 > 1050 -> not revoked
        assert!(!cache.is_token_revoked(&jti, &user_id, 1100));
    }
}
