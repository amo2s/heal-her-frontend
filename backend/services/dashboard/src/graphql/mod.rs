pub mod kids;
pub mod teens;
pub mod young_adults;

use crate::state::AppState;
use async_graphql::{EmptyMutation, EmptySubscription, Schema, SimpleObject};

/// Shared GraphQL User representation returned by all demographic schemas.
#[derive(SimpleObject, Clone, Debug)]
pub struct User {
    pub full_name: String,
    pub first_name: String,
}

/// Type aliases for the three compiler-segregated demographic schemas.
pub type KidsSchema = Schema<kids::KidsQueryRoot, EmptyMutation, EmptySubscription>;
pub type TeensSchema = Schema<teens::TeensQueryRoot, EmptyMutation, EmptySubscription>;
pub type YoungAdultsSchema =
    Schema<young_adults::YoungAdultsQueryRoot, EmptyMutation, EmptySubscription>;

/// Constructs the Kids demographic schema armed with defensive AST constraints.
pub fn build_kids_schema(state: AppState) -> KidsSchema {
    Schema::build(kids::KidsQueryRoot, EmptyMutation, EmptySubscription)
        .limit_depth(3)
        .limit_complexity(15)
        .data(state)
        .finish()
}

/// Constructs the Teens demographic schema armed with defensive AST constraints.
pub fn build_teens_schema(state: AppState) -> TeensSchema {
    Schema::build(teens::TeensQueryRoot, EmptyMutation, EmptySubscription)
        .limit_depth(3)
        .limit_complexity(15)
        .data(state)
        .finish()
}

/// Constructs the Young Adults demographic schema armed with defensive AST constraints.
pub fn build_young_adults_schema(state: AppState) -> YoungAdultsSchema {
    Schema::build(
        young_adults::YoungAdultsQueryRoot,
        EmptyMutation,
        EmptySubscription,
    )
    .limit_depth(3)
    .limit_complexity(15)
    .data(state)
    .finish()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::middleware::auth::{AuthenticatedUser, Claims};
    use async_graphql::Request;
    use sqlx::PgPool;
    use uuid::Uuid;

    #[tokio::test]
    async fn test_kids_schema_cached_resolution() {
        let pool = PgPool::connect_lazy("postgres://localhost:5432/dummy").unwrap();
        let cache = moka::future::Cache::new(100);
        let user_id = Uuid::new_v4();

        cache.insert(user_id, "Little Jimmy".to_string()).await;

        let state = AppState::new(pool, "test_secret".to_string(), cache);
        let schema = build_kids_schema(state);

        let claims = Claims {
            sub: user_id,
            role: "kid".to_string(),
            dashboard: Some("kids".to_string()),
            exp: 9999999999,
            token_type: "access".to_string(),
        };

        let req = Request::new("{ me { fullName firstName } }").data(AuthenticatedUser { claims });
        let resp = schema.execute(req).await;
        assert!(resp.is_ok());

        let data = resp.data.into_json().unwrap();
        assert_eq!(data["me"]["fullName"], "Little Jimmy");
        assert_eq!(data["me"]["firstName"], "Little");
    }

    #[tokio::test]
    async fn test_young_adults_schema_cached_resolution() {
        let pool = PgPool::connect_lazy("postgres://localhost:5432/dummy").unwrap();
        let cache = moka::future::Cache::new(100);
        let user_id = Uuid::new_v4();

        cache.insert(user_id, "Amos Chika Nwaka".to_string()).await;

        let state = AppState::new(pool, "test_secret".to_string(), cache);
        let schema = build_young_adults_schema(state);

        let claims = Claims {
            sub: user_id,
            role: "young-adult".to_string(),
            dashboard: Some("young-adults".to_string()),
            exp: 9999999999,
            token_type: "access".to_string(),
        };

        let req = Request::new("{ me { fullName firstName } }").data(AuthenticatedUser { claims });
        let resp = schema.execute(req).await;
        assert!(resp.is_ok());

        let data = resp.data.into_json().unwrap();
        assert_eq!(data["me"]["fullName"], "Amos Chika Nwaka");
        assert_eq!(data["me"]["firstName"], "Amos");
    }
}
