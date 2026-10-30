mod api;
mod cache;
mod config;
mod db;
mod error;
mod graphql;
mod middleware;
mod state;

use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::{
    api::router::create_router, cache::init_profile_cache, config::Config, db::init_pool,
    state::AppState,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Initialize structured logging & tracing telemetry
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "dashboard=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting HEAL-HER Zero-Trust Multi-Schema Dashboard GraphQL Microservice...");

    // 2. Load environment configuration via dotenvy
    let config = Config::from_env();
    tracing::info!(
        host = %config.host,
        port = config.port,
        "Configuration loaded successfully"
    );

    // 3. Initialize PostgreSQL pool and L1 Moka profile cache shield
    let pool = init_pool(&config.database_url).await;
    let cache = init_profile_cache();

    // 4. Construct immutable application state
    let state = AppState::new(pool, config.jwt_secret_key, cache);

    // 5. Build Axum router with Multi-Schema routing guillotine
    let app = create_router(state);

    // 6. Bind TCP listener to 0.0.0.0:{PORT}
    let addr_str = format!("{}:{}", config.host, config.port);
    let addr: SocketAddr = addr_str.parse()?;
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tracing::info!(
        "Dashboard Multi-Schema GraphQL service listening on http://{}",
        addr
    );

    // 7. Serve Axum HTTP server
    axum::serve(listener, app).await?;

    Ok(())
}
