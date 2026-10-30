use moka::future::Cache;
use std::time::Duration;
use uuid::Uuid;

/// Initializes the L1 in-memory data shield using Moka.
/// Capacity: 50,000 entries.
/// TTL: 15 minutes (900 seconds).
/// Drastically reduces database reads by caching user names.
pub fn init_profile_cache() -> Cache<Uuid, String> {
    tracing::info!("Initializing L1 Moka profile cache (capacity: 50k, TTL: 15m)...");

    Cache::builder()
        .max_capacity(50_000)
        .time_to_live(Duration::from_secs(900))
        .build()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_profile_cache_operations() {
        let cache = init_profile_cache();
        let user_id = Uuid::new_v4();
        let name = "Sarah Connor".to_string();

        cache.insert(user_id, name.clone()).await;

        let cached = cache.get(&user_id).await;
        assert_eq!(cached, Some(name));

        cache.invalidate(&user_id).await;
        assert_eq!(cache.get(&user_id).await, None);
    }
}
