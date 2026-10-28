mod api;
mod config;
mod domain;
mod error;
mod infrastructure;
mod service;
mod state;

use crate::{
    api::router::create_router,
    config::Config,
    error::ApiError,
    infrastructure::{db::create_pool, telemetry::init_telemetry},
    state::AppState,
};
use sqlx::PgPool;
use std::net::SocketAddr;

async fn shutdown_signal(pool: PgPool) {
    let ctrl_c = async {
        if let Err(err) = tokio::signal::ctrl_c().await {
            tracing::error!(error = %err, "Failed to install CTRL+C signal handler");
        }
    };

    #[cfg(unix)]
    let terminate = async {
        use tokio::signal::unix::{signal, SignalKind};
        match signal(SignalKind::terminate()) {
            Ok(mut sig) => {
                sig.recv().await;
            }
            Err(err) => {
                tracing::error!(error = %err, "Failed to install SIGTERM signal handler");
            }
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received CTRL+C termination signal");
        },
        _ = terminate => {
            tracing::info!("Received SIGTERM termination signal");
        },
    }

    tracing::info!("Draining in-flight requests and shutting down connection pool...");
    pool.close().await;
    tracing::info!("PostgreSQL connection pool cleanly closed.");
}

#[tokio::main]
async fn main() -> Result<(), ApiError> {
    // 1. Initialize structured observability telemetry
    init_telemetry();
    tracing::info!("Starting HEAL-HER Zero-Trust Auth Microservice...");

    // 2. Load and validate environment configuration (panics on missing DATABASE_URL or JWT_SECRET_KEY)
    let config = Config::from_env();
    tracing::info!(
        host = %config.host,
        port = config.port,
        "Environment configuration parsed successfully"
    );

    // 3. Establish PostgreSQL connection pool with resilience timeouts
    let pool = create_pool(&config).await?;

    // 4. Construct immutable application state
    let app_state = AppState::new(pool.clone(), config.jwt_secret_key);

    // 5. Compose Axum router with Tower security middleware armor and application state
    let app = create_router(app_state);

    // 6. Bind TCP socket listener
    let addr_str = format!("{}:{}", config.host, config.port);
    let addr: SocketAddr = match addr_str.parse() {
        Ok(parsed) => parsed,
        Err(err) => {
            tracing::error!(error = %err, addr = %addr_str, "Invalid socket address format");
            return Err(ApiError::InternalServerError(format!("Invalid socket address {addr_str}: {err}")));
        }
    };

    let listener = match tokio::net::TcpListener::bind(&addr).await {
        Ok(l) => l,
        Err(err) => {
            tracing::error!(error = ?err, "Failed to bind TCP listener to {}", addr);
            return Err(ApiError::InternalServerError(format!("Failed to bind TCP listener to {addr}: {err}")));
        }
    };

    tracing::info!("🚀 Auth microservice bound to http://{}", addr);

    // 7. Launch Tokio async server with graceful shutdown lifecycle
    if let Err(err) = axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal(pool))
        .await
    {
        tracing::error!(error = ?err, "Axum HTTP server terminated unexpectedly");
        return Err(ApiError::InternalServerError("Server terminated unexpectedly".to_string()));
    }

    tracing::info!("HEAL-HER Auth Microservice stopped gracefully.");
    Ok(())
}
