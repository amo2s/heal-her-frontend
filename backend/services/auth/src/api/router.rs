use crate::{
    api::handlers::{login::login_handler, signup::handle_signup},
    state::AppState,
};
use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use std::time::Duration;
use tower_http::{
    cors::CorsLayer,
    limit::RequestBodyLimitLayer,
    timeout::TimeoutLayer,
    trace::TraceLayer,
};

async fn health_check() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "status": "healthy",
            "service": "heal-her-auth-microservice",
            "version": env!("CARGO_PKG_VERSION")
        })),
    )
}

pub fn create_router(state: AppState) -> Router {
    Router::new()
        // API routes for internal microservice communication and gateway forwarding
        .route("/api/v1/auth/login", post(login_handler))
        .route("/api/auth/login", post(login_handler))
        .route("/login", post(login_handler))
        .route("/api/v1/auth/signup", post(handle_signup))
        .route("/api/auth/signup", post(handle_signup))
        .route("/signup", post(handle_signup))
        .route("/health", get(health_check))
        // Layer order: executed outside-in on request, inside-out on response
        // 1. CORS header injection
        .layer(CorsLayer::permissive())
        // 2. Timeout enforcement to terminate hanging connections after 10s
        .layer(TimeoutLayer::with_status_code(
            StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(10),
        ))
        // 3. Request body limit (strict 2KB boundary preventing memory exhaustion)
        .layer(RequestBodyLimitLayer::new(2048))
        // 4. Request lifecycle telemetry & tracing
        .layer(TraceLayer::new_for_http())
        // Inject shared application state
        .with_state(state)
}
