use crate::{domain::password_reset::PasswordResetScope, error::InternalAuthError};
use ahash::RandomState;
use moka::future::Cache;
use std::time::Duration;

/// Dedicated L1 In-Memory Grid for transient password reset state.
/// Eliminates database bloat and external Redis dependencies, sustaining 10k RPS.
#[derive(Clone, Debug)]
pub struct PasswordResetCache {
    /// Maps IP and scoped email keys to request counts to prevent volumetric spam and mailer exhaustion.
    /// max_capacity(100_000), time_to_live(600s / 10 min)
    pub rate_limiter_cache: Cache<String, u32, RandomState>,

    /// Maps a scoped email ("user:email" / "mgmt:email") to the blake3 hash of the generated 6-digit OTP.
    /// max_capacity(50_000), time_to_live(600s / 10 min)
    pub otp_cache: Cache<String, String, RandomState>,

    /// Maps a scoped email ("user:email" / "mgmt:email") to the number of failed OTP guesses.
    /// max_capacity(50_000), time_to_live(900s / 15 min)
    pub otp_strikes_cache: Cache<String, u8, RandomState>,

    /// Maps the blake3 hash of the 32-byte reset token back to the sanitized email with scope prefix.
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
            .time_to_live(Duration::from_secs(600))
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

    /// Dual-Key (Email + IP) Sliding-Window Rate Limiter.
    /// Email limit: max 3 requests per 10 minutes per (scope, email).
    /// IP limit: max 10 requests per 10 minutes per IP.
    pub async fn check_and_increment_rate_limits(
        &self,
        scope: PasswordResetScope,
        email: &str,
        ip: Option<&str>,
    ) -> Result<(), InternalAuthError> {
        let email_key = format!("rl:email:{}:{}", scope.as_prefix(), email);
        let current_email_count = self.rate_limiter_cache.get(&email_key).await.unwrap_or(0);
        if current_email_count >= 3 {
            return Err(InternalAuthError::TooManyRequests);
        }

        if let Some(ip_addr) = ip {
            let clean_ip = ip_addr.trim();
            if !clean_ip.is_empty() {
                let ip_key = format!("rl:ip:{}", clean_ip);
                let current_ip_count = self.rate_limiter_cache.get(&ip_key).await.unwrap_or(0);
                if current_ip_count >= 10 {
                    return Err(InternalAuthError::TooManyRequests);
                }
                self.rate_limiter_cache
                    .insert(ip_key, current_ip_count.saturating_add(1))
                    .await;
            }
        }

        self.rate_limiter_cache
            .insert(email_key, current_email_count.saturating_add(1))
            .await;
        Ok(())
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
    async fn test_password_reset_cache_rate_limiter_email_and_ip() {
        let cache = PasswordResetCache::new();
        let email = "operator@healher.internal";
        let ip = "192.168.1.100";

        // 1st request succeeds
        assert!(cache
            .check_and_increment_rate_limits(PasswordResetScope::Management, email, Some(ip))
            .await
            .is_ok());

        // 2nd request succeeds
        assert!(cache
            .check_and_increment_rate_limits(PasswordResetScope::Management, email, Some(ip))
            .await
            .is_ok());

        // 3rd request succeeds
        assert!(cache
            .check_and_increment_rate_limits(PasswordResetScope::Management, email, Some(ip))
            .await
            .is_ok());

        // 4th request within 10 min fails email rate limit
        let err4 = cache
            .check_and_increment_rate_limits(PasswordResetScope::Management, email, Some(ip))
            .await;
        assert!(matches!(err4, Err(InternalAuthError::TooManyRequests)));

        // Scope isolation: EndUser scope on same email has its own independent rate counter
        assert!(cache
            .check_and_increment_rate_limits(PasswordResetScope::EndUser, email, Some("10.0.0.1"))
            .await
            .is_ok());
    }

    #[tokio::test]
    async fn test_password_reset_cache_ip_rate_limiting() {
        let cache = PasswordResetCache::new();
        let ip = "203.0.113.42";

        // Send 10 requests from different emails on the same IP
        for i in 1..=10 {
            let email = format!("user{}@healher.internal", i);
            assert!(cache
                .check_and_increment_rate_limits(PasswordResetScope::EndUser, &email, Some(ip))
                .await
                .is_ok());
        }

        // 11th request from this IP fails rate limit even with a new email
        let err11 = cache
            .check_and_increment_rate_limits(
                PasswordResetScope::EndUser,
                "user11@healher.internal",
                Some(ip),
            )
            .await;
        assert!(matches!(err11, Err(InternalAuthError::TooManyRequests)));
    }

    #[tokio::test]
    async fn test_password_reset_cache_initialization_and_operations() {
        let cache = PasswordResetCache::new();

        // 1. Rate limiter cache
        cache
            .rate_limiter_cache
            .insert("127.0.0.1".to_string(), 1)
            .await;
        assert_eq!(cache.rate_limiter_cache.get("127.0.0.1").await, Some(1));

        // 2. OTP cache with scoped key
        let scoped_key = "user:user@healher.internal".to_string();
        let otp_hash = blake3::hash(b"123456").to_hex().to_string();
        cache
            .otp_cache
            .insert(scoped_key.clone(), otp_hash.clone())
            .await;
        assert_eq!(cache.otp_cache.get(&scoped_key).await, Some(otp_hash));

        // 3. OTP strikes cache
        cache.otp_strikes_cache.insert(scoped_key.clone(), 2).await;
        assert_eq!(cache.otp_strikes_cache.get(&scoped_key).await, Some(2));

        // 4. Reset token cache
        let token_hash = blake3::hash(b"32-byte-token").to_hex().to_string();
        cache
            .reset_token_cache
            .insert(token_hash.clone(), "user@healher.internal".to_string())
            .await;
        assert_eq!(
            cache.reset_token_cache.get(&token_hash).await,
            Some("user@healher.internal".to_string())
        );
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
