use crate::{graphql::schema::AppSchema, middleware::auth::AuthenticatedUser, state::AppState};
use async_graphql::http::GraphiQLSource;
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{
    extract::Extension,
    http::StatusCode,
    response::{Html, IntoResponse},
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

/// Authenticated GraphQL execution handler.
/// Extracts AuthenticatedUser via Axum FromRequestParts, injects it into
/// the GraphQL request context, and executes against the depth/complexity-limited schema.
async fn graphql_handler(
    auth_user: AuthenticatedUser,
    Extension(schema): Extension<AppSchema>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    let mut req = req.into_inner();
    req = req.data(auth_user); // Inject caller context for the QueryRoot resolver
    schema.execute(req).await.into()
}

/// Interactive GraphiQL IDE endpoint for developer inspection.
async fn graphiql_handler() -> Html<String> {
    Html(
        GraphiQLSource::build()
            .endpoint("/api/v1/dashboard/graphql")
            .finish(),
    )
}

/// Liveness probe endpoint.
async fn health_check() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "status": "healthy",
            "service": "heal-her-dashboard-graphql",
            "version": env!("CARGO_PKG_VERSION")
        })),
    )
}

/// Assembles the complete Axum router with security, CORS armor, tracing, and GraphQL routes.
pub fn create_router(state: AppState, schema: AppSchema) -> Router {
    Router::new()
        .route(
            "/api/v1/dashboard/graphql",
            post(graphql_handler).get(graphiql_handler),
        )
        .route("/graphql", post(graphql_handler).get(graphiql_handler))
        .route("/health", get(health_check))
        .layer(Extension(schema))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
