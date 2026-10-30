use ahash::RandomState;
use moka::future::Cache;
use std::time::Duration;

/// Dedicated L1 In-Memory Grid for transient password reset state.
/// Eliminates database bloat and external Redis dependencies, sustaining 10k RPS.
#[derive(Clone, Debug)]
pub struct PasswordResetCache {
    /// Maps IP addresses to request counts to prevent volumetric spam.
    /// max_capacity(100_000), time_to_live(60s)
    pub rate_limiter_cache: Cache<String, u8, RandomState>,

    /// Maps a sanitized email to the blake3 hash of the generated 6-digit OTP.
    /// max_capacity(50_000), time_to_live(600s / 10 min)
    pub otp_cache: Cache<String, String, RandomState>,

    /// Maps an email to the number of failed OTP guesses.
    /// max_capacity(50_000), time_to_live(900s / 15 min)
    pub otp_strikes_cache: Cache<String, u8, RandomState>,

    /// Maps the blake3 hash of the 32-byte reset token back to the sanitized email.
    /// max_capacity(50_000), time_to_live(300s / 5 min)
    pub reset_token_cache: Cache<String, String, RandomState>,
}

impl Default for PasswordResetCache {
    fn default() -> Self {
        Self::new()
    }
}

impl PasswordResetCache {
    pub fn new() -> Self {
        let rate_limiter_cache = Cache::builder()
            .max_capacity(100_000)
            .time_to_live(Duration::from_secs(60))
            .build_with_hasher(RandomState::default());

        let otp_cache = Cache::builder()
            .max_capacity(50_000)
            .time_to_live(Duration::from_secs(600))
            .build_with_hasher(RandomState::default());

        let otp_strikes_cache = Cache::builder()
            .max_capacity(50_000)
            .time_to_live(Duration::from_secs(900))
            .build_with_hasher(RandomState::default());

        let reset_token_cache = Cache::builder()
            .max_capacity(50_000)
            .time_to_live(Duration::from_secs(300))
            .build_with_hasher(RandomState::default());

        Self {
            rate_limiter_cache,
            otp_cache,
            otp_strikes_cache,
            reset_token_cache,
        }
    }
}

/// Dedicated L1 In-Memory Grid for Just-in-Time (JIT) Legal Consent Handshake.
/// Holds transient 6-digit OTPs, target document versions, and strike counts with a 300-second (5 minute) TTL.
/// Sustains 10,000+ RPS without database bottlenecks or write amplification.
#[derive(Clone, Debug)]
pub struct TosJitCache {
    /// Maps User ID (or email) to (blake3_hash, active_version, strikes).
    /// max_capacity(50_000), time_to_live(300s / 5 min)
    pub cache: Cache<String, (String, String, u8), RandomState>,
}

impl Default for TosJitCache {
    fn default() -> Self {
        Self::new()
    }
}

impl TosJitCache {
    pub fn new() -> Self {
        let cache = Cache::builder()
            .max_capacity(50_000)
            .time_to_live(Duration::from_secs(300))
            .build_with_hasher(RandomState::default());

        Self { cache }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_password_reset_cache_initialization_and_operations() {
        let cache = PasswordResetCache::new();

        // 1. Rate limiter cache
        cache
            .rate_limiter_cache
            .insert("127.0.0.1".to_string(), 1)
            .await;
        assert_eq!(cache.rate_limiter_cache.get("127.0.0.1").await, Some(1));

        // 2. OTP cache
        let email = "user@healher.internal".to_string();
        let otp_hash = blake3::hash(b"123456").to_hex().to_string();
        cache
            .otp_cache
            .insert(email.clone(), otp_hash.clone())
            .await;
        assert_eq!(cache.otp_cache.get(&email).await, Some(otp_hash));

        // 3. OTP strikes cache
        cache.otp_strikes_cache.insert(email.clone(), 2).await;
        assert_eq!(cache.otp_strikes_cache.get(&email).await, Some(2));

        // 4. Reset token cache
        let token_hash = blake3::hash(b"32-byte-token").to_hex().to_string();
        cache
            .reset_token_cache
            .insert(token_hash.clone(), email.clone())
            .await;
        assert_eq!(cache.reset_token_cache.get(&token_hash).await, Some(email));
    }

    #[tokio::test]
    async fn test_tos_jit_cache_operations() {
        let jit_cache = TosJitCache::new();
        let user_id = "test-user-uuid".to_string();
        let otp_hash = blake3::hash(b"654321").to_hex().to_string();
        let version = "1.0".to_string();

        // Insert
        jit_cache
            .cache
            .insert(user_id.clone(), (otp_hash.clone(), version.clone(), 0))
            .await;

        let entry = jit_cache
            .cache
            .get(&user_id)
            .await
            .expect("Entry must exist");
        assert_eq!(entry.0, otp_hash);
        assert_eq!(entry.1, version);
        assert_eq!(entry.2, 0);

        // Invalidate
        jit_cache.cache.invalidate(&user_id).await;
        assert!(jit_cache.cache.get(&user_id).await.is_none());
    }
}
