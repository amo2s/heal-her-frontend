use crate::{
    api::handlers::{
        login::login_handler,
        logout::logout_handler,
        password_reset::{confirm_reset_handler, request_otp_handler, verify_otp_handler},
        refresh::refresh_handler,
        signup::handle_signup,
        terminate::terminate_session_handler,
    },
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
        // Authentication routes: Login
        .route("/api/v1/auth/login", post(login_handler))
        .route("/api/auth/login", post(login_handler))
        .route("/login", post(login_handler))
        // Authentication routes: Registration
        .route("/api/v1/auth/signup", post(handle_signup))
        .route("/api/auth/signup", post(handle_signup))
        .route("/signup", post(handle_signup))
        // Authentication routes: Stateful Refresh Token Rotation (RTR)
        .route("/api/v1/auth/refresh", post(refresh_handler))
        .route("/api/auth/refresh", post(refresh_handler))
        .route("/refresh", post(refresh_handler))
        // Authentication routes: Dual-Mode Session Termination (Logout)
        .route("/api/v1/auth/logout", post(logout_handler))
        .route("/api/auth/logout", post(logout_handler))
        .route("/logout", post(logout_handler))
        // Legal Consent Kill-Switch: Nuclear Session Termination
        .route("/api/v1/auth/terminate-session", post(terminate_session_handler))
        .route("/api/auth/terminate-session", post(terminate_session_handler))
        .route("/terminate-session", post(terminate_session_handler))
        // Password Reset routes: Ghost Protocol OTP Request & Verification
        .route("/api/v1/auth/password-reset/request", post(request_otp_handler))
        .route("/api/auth/password-reset/request", post(request_otp_handler))
        .route("/password-reset/request", post(request_otp_handler))
        .route("/api/v1/auth/password-reset/verify", post(verify_otp_handler))
        .route("/api/auth/password-reset/verify", post(verify_otp_handler))
        .route("/password-reset/verify", post(verify_otp_handler))
        // Password Reset routes: Final Confirmation & Nuclear Kill-Switch
        .route("/api/v1/auth/password-reset/confirm", post(confirm_reset_handler))
        .route("/api/auth/password-reset/confirm", post(confirm_reset_handler))
        .route("/password-reset/confirm", post(confirm_reset_handler))
        // Health check endpoint
        .route("/health", get(health_check))
        // Layer order: executed outside-in on request, inside-out on response
        // 1. Permissive CORS layer neutralizing browser preflight restrictions for local development
        .layer(CorsLayer::permissive())
        // 2. Request body limit (strict 2KB boundary preventing memory exhaustion)
        .layer(RequestBodyLimitLayer::new(2048))
        // 3. Timeout enforcement to terminate hanging connections after 10s
        .layer(TimeoutLayer::with_status_code(
            StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(10),
        ))
        // 4. Request lifecycle telemetry & tracing
        .layer(TraceLayer::new_for_http())
        // Inject shared application state
        .with_state(state)
}
