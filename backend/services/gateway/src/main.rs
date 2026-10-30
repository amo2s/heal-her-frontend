mod gateway;
mod upstreams;

use gateway::GatewayProxy;
use pingora_core::server::Server;
use pingora_load_balancing::prelude::*;
use tracing::info;
use upstreams::{AUTH_CLUSTER, DASHBOARD_CLUSTER};

fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info,api_gateway=debug")),
        )
        .init();

    info!("Initializing HEAL-HER Pingora API Gateway...");

    let mut server = Server::new(None).expect("Failed to initialize Pingora Server");
    server.bootstrap();

    // Configure foreground non-daemon execution
    server.configuration.daemon = false;

    // HTTP Proxy Service bound to 0.0.0.0:8000
    let mut proxy_service = pingora_proxy::http_proxy_service(&server.configuration, GatewayProxy);
    proxy_service.add_tcp("0.0.0.0:8000");
    info!("Gateway HTTP proxy service configured on 0.0.0.0:8000");

    // Dynamic background health checking services for upstream clusters
    let auth_health = background_service("auth_cluster_health", &AUTH_CLUSTER);
    let dashboard_health = background_service("dashboard_cluster_health", &DASHBOARD_CLUSTER);

    server.add_service(proxy_service);
    server.add_service(auth_health);
    server.add_service(dashboard_health);

    info!("Starting Pingora Gateway engine (run_forever)...");
    server.run_forever();
}
