use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::extract::Extension;

use crate::{
    error::ApiError,
    graphql::{KidsSchema, TeensSchema, YoungAdultsSchema},
    middleware::auth::AuthenticatedUser,
};

/// Network-Layer Routing Guillotine for the Kids demographic endpoint.
/// Strictly asserts that claims.dashboard == Some("kids").
/// If mismatched, drops connection with HTTP 403 Forbidden before GraphQL parsing.
pub async fn kids_graphql_handler(
    auth_user: AuthenticatedUser,
    Extension(schema): Extension<KidsSchema>,
    req: GraphQLRequest,
) -> Result<GraphQLResponse, ApiError> {
    if auth_user.claims.dashboard.as_deref() != Some("kids") {
        return Err(ApiError::Forbidden(
            "Access denied. Token invalid for kids dashboard.".into(),
        ));
    }

    let mut req = req.into_inner();
    req = req.data(auth_user);
    Ok(schema.execute(req).await.into())
}

/// Network-Layer Routing Guillotine for the Teens demographic endpoint.
/// Strictly asserts that claims.dashboard == Some("teens").
/// If mismatched, drops connection with HTTP 403 Forbidden before GraphQL parsing.
pub async fn teens_graphql_handler(
    auth_user: AuthenticatedUser,
    Extension(schema): Extension<TeensSchema>,
    req: GraphQLRequest,
) -> Result<GraphQLResponse, ApiError> {
    if auth_user.claims.dashboard.as_deref() != Some("teens") {
        return Err(ApiError::Forbidden(
            "Access denied. Token invalid for teens dashboard.".into(),
        ));
    }

    let mut req = req.into_inner();
    req = req.data(auth_user);
    Ok(schema.execute(req).await.into())
}

/// Network-Layer Routing Guillotine for the Young Adults demographic endpoint.
/// Strictly asserts that claims.dashboard == Some("young-adults").
/// If mismatched, drops connection with HTTP 403 Forbidden before GraphQL parsing.
pub async fn young_adults_graphql_handler(
    auth_user: AuthenticatedUser,
    Extension(schema): Extension<YoungAdultsSchema>,
    req: GraphQLRequest,
) -> Result<GraphQLResponse, ApiError> {
    if auth_user.claims.dashboard.as_deref() != Some("young-adults") {
        return Err(ApiError::Forbidden(
            "Access denied. Token invalid for young-adults dashboard.".into(),
        ));
    }

    let mut req = req.into_inner();
    req = req.data(auth_user);
    Ok(schema.execute(req).await.into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        graphql::{build_kids_schema, build_teens_schema, build_young_adults_schema},
        middleware::auth::Claims,
        state::AppState,
    };
    use axum::extract::FromRequest;
    use sqlx::PgPool;
    use uuid::Uuid;

    fn make_dummy_state() -> AppState {
        let pool = PgPool::connect_lazy("postgres://localhost:5432/dummy").unwrap();
        let cache = moka::future::Cache::new(100);
        AppState::new(pool, "test_secret".to_string(), cache)
    }

    #[tokio::test]
    async fn test_kids_routing_guillotine_rejects_adult_token() {
        let state = make_dummy_state();
        let schema = build_kids_schema(state);

        let adult_claims = Claims {
            sub: Uuid::new_v4(),
            role: "young-adult".to_string(),
            dashboard: Some("young-adults".to_string()),
            exp: 9999999999,
            token_type: "access".to_string(),
        };

        let axum_req = axum::extract::Request::builder()
            .method("POST")
            .header("content-type", "application/json")
            .body(axum::body::Body::from(r#"{"query":"{ me { fullName } }"}"#))
            .unwrap();
        let req = match GraphQLRequest::from_request(axum_req, &()).await {
            Ok(r) => r,
            Err(_) => panic!("Failed to extract GraphQLRequest"),
        };

        let result = kids_graphql_handler(
            AuthenticatedUser {
                claims: adult_claims,
            },
            Extension(schema),
            req,
        )
        .await;

        match result {
            Err(ApiError::Forbidden(msg)) => {
                assert!(msg.contains("Access denied. Token invalid for kids dashboard."));
            }
            _ => panic!("Expected ApiError::Forbidden for demographic mismatch"),
        }
    }

    #[tokio::test]
    async fn test_teens_routing_guillotine_rejects_kids_token() {
        let state = make_dummy_state();
        let schema = build_teens_schema(state);

        let kid_claims = Claims {
            sub: Uuid::new_v4(),
            role: "kid".to_string(),
            dashboard: Some("kids".to_string()),
            exp: 9999999999,
            token_type: "access".to_string(),
        };

        let axum_req = axum::extract::Request::builder()
            .method("POST")
            .header("content-type", "application/json")
            .body(axum::body::Body::from(r#"{"query":"{ me { fullName } }"}"#))
            .unwrap();
        let req = match GraphQLRequest::from_request(axum_req, &()).await {
            Ok(r) => r,
            Err(_) => panic!("Failed to extract GraphQLRequest"),
        };

        let result = teens_graphql_handler(
            AuthenticatedUser { claims: kid_claims },
            Extension(schema),
            req,
        )
        .await;

        match result {
            Err(ApiError::Forbidden(msg)) => {
                assert!(msg.contains("Access denied. Token invalid for teens dashboard."));
            }
            _ => panic!("Expected ApiError::Forbidden for demographic mismatch"),
        }
    }

    #[tokio::test]
    async fn test_young_adults_routing_guillotine_allows_matching_token() {
        let state = make_dummy_state();
        let user_id = Uuid::new_v4();
        state
            .profile_cache
            .insert(user_id, "Sarah Connor".to_string())
            .await;

        let schema = build_young_adults_schema(state);

        let ya_claims = Claims {
            sub: user_id,
            role: "young-adult".to_string(),
            dashboard: Some("young-adults".to_string()),
            exp: 9999999999,
            token_type: "access".to_string(),
        };

        let axum_req = axum::extract::Request::builder()
            .method("POST")
            .header("content-type", "application/json")
            .body(axum::body::Body::from(
                r#"{"query":"{ me { fullName firstName } }"}"#,
            ))
            .unwrap();
        let req = match GraphQLRequest::from_request(axum_req, &()).await {
            Ok(r) => r,
            Err(_) => panic!("Failed to extract GraphQLRequest"),
        };

        let result = young_adults_graphql_handler(
            AuthenticatedUser { claims: ya_claims },
            Extension(schema),
            req,
        )
        .await;

        assert!(result.is_ok());
    }
}
