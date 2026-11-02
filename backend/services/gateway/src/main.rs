mod gateway;
mod rate_limiter;
mod upstreams;

use async_trait::async_trait;
use gateway::GatewayProxy;
use pingora::services::background::{background_service, BackgroundService};
use pingora_core::server::{Server, ShutdownWatch};
use pingora_core::services::ServiceReadyNotifier;
use pingora_load_balancing::selection::RoundRobin;
use pingora_load_balancing::LoadBalancer;
use std::sync::Arc;
use tracing::info;
use upstreams::{AUTH_CLUSTER, DASHBOARD_CLUSTER, TOS_CLUSTER};

pub struct LoadBalancerHealthCheck(pub Arc<LoadBalancer<RoundRobin>>);

#[async_trait]
impl BackgroundService for LoadBalancerHealthCheck {
    async fn start_with_ready_notifier(
        &self,
        shutdown: ShutdownWatch,
        ready: ServiceReadyNotifier,
    ) {
        self.0.run(shutdown, Some(ready)).await;
    }

    async fn start(&self, shutdown: ShutdownWatch) {
        self.0.run(shutdown, None).await;
    }
}

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

    // HTTP Proxy Service bound to 0.0.0.0:8000
    let mut proxy_service = pingora_proxy::http_proxy_service(&server.configuration, GatewayProxy);
    proxy_service.add_tcp("0.0.0.0:8000");
    info!("Gateway HTTP proxy service configured on 0.0.0.0:8000");

    // Dynamic background health checking services for upstream clusters
    let auth_health = background_service(
        "auth_cluster_health",
        LoadBalancerHealthCheck(AUTH_CLUSTER.clone()),
    );
    let dashboard_health = background_service(
        "dashboard_cluster_health",
        LoadBalancerHealthCheck(DASHBOARD_CLUSTER.clone()),
    );
    let tos_health = background_service(
        "tos_cluster_health",
        LoadBalancerHealthCheck(TOS_CLUSTER.clone()),
    );

    server.add_service(proxy_service);
    server.add_service(auth_health);
    server.add_service(dashboard_health);
    server.add_service(tos_health);

    info!("Starting Pingora Gateway engine (run_forever)...");
    server.run_forever();
}
