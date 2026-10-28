use crate::{
    api::handlers::{login::login_handler, signup::handle_signup},
    state::AppState,
};
use axum::{
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
        Method, StatusCode,
    },
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use std::time::Duration;
use tower_http::{
    cors::{Any, CorsLayer},
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
    // Explicit CORS configuration for seamless local development and Next.js preflight resolution
    let cors = CorsLayer::new()
        // Allow any origin during local development (can be locked down in prod)
        .allow_origin(Any)
        // Explicitly allow the methods the frontend uses, including OPTIONS for preflight
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        // Explicitly allow the headers the frontend sends
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE]);

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
        // 1. Explicit CORS header and preflight handler
        .layer(cors)
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
