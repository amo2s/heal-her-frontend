use crate::{middleware::auth::AuthenticatedUser, state::AppState};
use async_graphql::{
    Context, EmptyMutation, EmptySubscription, Error, Object, Result, Schema, SimpleObject,
};

/// GraphQL User representation matching the dashboard greeting requirement.
#[derive(SimpleObject)]
pub struct User {
    pub full_name: String,
    pub first_name: String, // Computed from full_name
}

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    /// Resolves the authenticated user's profile with L1 Moka caching and PostgreSQL fallback.
    async fn me(&self, ctx: &Context<'_>) -> Result<User> {
        // Step A (Context Extraction): Extract AppState and AuthenticatedUser
        let app_state = ctx.data_unchecked::<AppState>();
        let auth_user = match ctx.data_opt::<AuthenticatedUser>() {
            Some(u) => u,
            None => {
                return Err(Error::new(
                    "Unauthorized: AuthenticatedUser context missing",
                ))
            }
        };

        // Step B (L1 Cache Check): Zero-database reads if present in RAM cache
        if let Some(cached_full_name) = app_state.profile_cache.get(&auth_user.user_id).await {
            let first_name = cached_full_name
                .split_whitespace()
                .next()
                .unwrap_or("")
                .to_string();

            return Ok(User {
                full_name: cached_full_name,
                first_name,
            });
        }

        // Step C (Database Fallback & Cache Write): Single indexed lookup
        let row: Option<(String,)> = sqlx::query_as(
            r#"
            SELECT full_name
            FROM users
            WHERE id = $1
            "#,
        )
        .bind(auth_user.user_id)
        .fetch_optional(&app_state.db_pool)
        .await
        .map_err(|e| Error::new(format!("Database error: {e}")))?;

        let full_name = match row {
            Some((name,)) => name,
            None => return Err(Error::new("User record not found")),
        };

        // Populate L1 cache with 15-minute TTL
        app_state
            .profile_cache
            .insert(auth_user.user_id, full_name.clone())
            .await;

        // Step D (Response Formatting): Compute first_name by splitting on whitespace
        let first_name = full_name
            .split_whitespace()
            .next()
            .unwrap_or("")
            .to_string();

        Ok(User {
            full_name,
            first_name,
        })
    }
}

pub type AppSchema = Schema<QueryRoot, EmptyMutation, EmptySubscription>;

/// Constructs the async-graphql Schema armed with defensive AST constraints:
/// - limit_depth(3): Prevents recursive depth query exhaustion
/// - limit_complexity(15): Limits CPU overhead of multi-field queries
/// - data(state): Injects global AppState for resolver dependency access
pub fn build_schema(state: AppState) -> AppSchema {
    Schema::build(QueryRoot, EmptyMutation, EmptySubscription)
        .limit_depth(3)
        .limit_complexity(15)
        .data(state)
        .finish()
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_graphql::Request;
    use sqlx::PgPool;
    use uuid::Uuid;

    #[tokio::test]
    async fn test_graphql_me_cached_resolution_zero_db() {
        let pool = PgPool::connect_lazy("postgres://localhost:5432/dummy").unwrap();
        let cache = moka::future::Cache::new(100);
        let user_id = Uuid::new_v4();

        // Prime cache with full name
        cache
            .insert(user_id, "Sarah Connor Jenkins".to_string())
            .await;

        let state = AppState::new(pool, "secret".to_string(), cache);
        let schema = build_schema(state);

        let query = "{ me { fullName firstName } }";
        let req = Request::new(query).data(AuthenticatedUser { user_id });

        let resp = schema.execute(req).await;
        assert!(resp.is_ok());

        let data = resp.data.into_json().unwrap();
        assert_eq!(data["me"]["fullName"], "Sarah Connor Jenkins");
        assert_eq!(data["me"]["firstName"], "Sarah");
    }
}
