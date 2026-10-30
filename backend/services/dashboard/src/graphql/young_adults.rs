use crate::graphql::User;
use async_graphql::{Context, Object, Result};

/// Isolated QueryRoot strictly for the Young Adults demographic data graph.
pub struct YoungAdultsQueryRoot;

#[Object]
impl YoungAdultsQueryRoot {
    /// Resolves the authenticated young adult's profile with L1 Moka caching and PostgreSQL fallback.
    async fn me(&self, ctx: &Context<'_>) -> Result<User> {
        let state = ctx.data_unchecked::<crate::state::AppState>();
        let auth_user = ctx.data_unchecked::<crate::middleware::auth::AuthenticatedUser>();

        // 1. L1 Moka Cache Shield Check (0 DB operations on hit)
        if let Some(cached_name) = state.profile_cache.get(&auth_user.claims.sub).await {
            let first_name = cached_name
                .split_whitespace()
                .next()
                .unwrap_or("")
                .to_string();

            return Ok(User {
                full_name: cached_name,
                first_name,
            });
        }

        // 2. Database Fallback (Indexed lookup by primary key)
        let fetched_name: String = sqlx::query_scalar(
            r#"
            SELECT full_name
            FROM users
            WHERE id = $1
            "#,
        )
        .bind(auth_user.claims.sub)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| async_graphql::Error::new(format!("User record not found: {e}")))?;

        // 3. Populate L1 Cache with 15-minute TTL
        state
            .profile_cache
            .insert(auth_user.claims.sub, fetched_name.clone())
            .await;

        // 4. Compute first_name
        let first_name = fetched_name
            .split_whitespace()
            .next()
            .unwrap_or("")
            .to_string();

        Ok(User {
            full_name: fetched_name,
            first_name,
        })
    }
}
