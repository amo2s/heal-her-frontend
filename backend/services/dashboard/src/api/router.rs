use axum::{
    extract::Extension,
    http::{header, Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};

use crate::{
    api::handlers::{kids_graphql_handler, teens_graphql_handler, young_adults_graphql_handler},
    graphql::{build_kids_schema, build_teens_schema, build_young_adults_schema},
    state::AppState,
};

/// Liveness probe endpoint for orchestrator monitoring.
async fn health_check() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "status": "healthy",
            "service": "heal-her-dashboard-graphql",
            "architecture": "zero-trust-multi-schema",
            "version": env!("CARGO_PKG_VERSION")
        })),
    )
}

/// Assembles the Multi-Schema demographic Axum router.
/// Builds and injects the 3 compiler-isolated schemas into Axum extensions
/// and wires the demographic ABAC routing guillotine handlers.
pub fn create_router(state: AppState) -> Router {
    // 1. Compile the 3 isolated demographic schemas with defensive AST armor
    let kids_schema = build_kids_schema(state.clone());
    let teens_schema = build_teens_schema(state.clone());
    let young_adults_schema = build_young_adults_schema(state.clone());

    // 2. Configure Cross-Origin Resource Sharing (CORS) armor
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE, header::ACCEPT]);

    // 3. Assemble routes with typed schema extensions
    Router::new()
        // Demographic Route 1: Kids GraphQL
        .route("/api/v1/dashboard/kids/graphql", post(kids_graphql_handler))
        .route("/kids/dashboard/graphql", post(kids_graphql_handler))
        // Demographic Route 2: Teens GraphQL
        .route(
            "/api/v1/dashboard/teens/graphql",
            post(teens_graphql_handler),
        )
        .route("/teens/dashboard/graphql", post(teens_graphql_handler))
        // Demographic Route 3: Young Adults GraphQL
        .route(
            "/api/v1/dashboard/young-adults/graphql",
            post(young_adults_graphql_handler),
        )
        .route(
            "/young_adult/dashboard/graphql",
            post(young_adults_graphql_handler),
        )
        // Health check route
        .route("/health", get(health_check))
        // Layer order: Extensions, CORS, Tracing, State
        .layer(Extension(kids_schema))
        .layer(Extension(teens_schema))
        .layer(Extension(young_adults_schema))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
