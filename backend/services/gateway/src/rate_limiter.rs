use dashmap::DashMap;
use governor::{
    clock::DefaultClock, state::direct::NotKeyed, state::InMemoryState, Quota, RateLimiter,
};
use lazy_static::lazy_static;
use std::num::NonZeroU32;

/// Type alias for an in-memory direct token bucket rate limiter.
pub type IpBucket = RateLimiter<NotKeyed, InMemoryState, DefaultClock>;

lazy_static! {
    /// Global thread-safe map tracking per-IP token bucket rate limiters.
    pub static ref RATE_LIMITERS: DashMap<String, IpBucket> = DashMap::new();
}

/// Evaluates whether a client IP is allowed to proceed under the token bucket algorithm.
/// Enforces 50 requests/second with burst tolerance up to 100 requests.
pub fn check_rate_limit(ip: &str) -> bool {
    if let Some(bucket) = RATE_LIMITERS.get(ip) {
        return bucket.check().is_ok();
    }

    let quota =
        Quota::per_second(NonZeroU32::new(50).unwrap()).allow_burst(NonZeroU32::new(100).unwrap());
    let bucket = RateLimiter::direct(quota);
    let allowed = bucket.check().is_ok();
    RATE_LIMITERS.insert(ip.to_string(), bucket);
    allowed
}
