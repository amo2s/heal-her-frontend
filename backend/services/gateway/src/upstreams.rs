use lazy_static::lazy_static;
use pingora_load_balancing::health_check::TcpHealthCheck;
use pingora_load_balancing::selection::RoundRobin;
use pingora_load_balancing::LoadBalancer;
use std::sync::Arc;
use std::time::Duration;

fn clean_upstream_host(raw: &str, default: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return default.to_string();
    }
    let sanitized = trimmed
        .trim_start_matches("http://")
        .trim_start_matches("https://")
        .trim_end_matches('/');
    if sanitized.is_empty() {
        default.to_string()
    } else {
        sanitized.to_string()
    }
}

lazy_static! {
    /// Upstream load-balanced cluster routing to the Authentication microservice.
    /// Dynamically resolves AUTH_UPSTREAM_HOST from the environment with 127.0.0.1:8080 fallback.
    pub static ref AUTH_CLUSTER: Arc<LoadBalancer<RoundRobin>> = {
        let raw = std::env::var("AUTH_UPSTREAM_HOST").unwrap_or_default();
        let host = clean_upstream_host(&raw, "127.0.0.1:8080");
        let mut lb = LoadBalancer::try_from_iter([host.as_str()])
            .expect("Failed to initialize AUTH_CLUSTER upstream load balancer");
        let mut hc = TcpHealthCheck::new();
        hc.peer_template.options.connection_timeout = Some(Duration::from_secs(1));
        lb.set_health_check(hc);
        lb.health_check_frequency = Some(Duration::from_secs(1));
        Arc::new(lb)
    };

    /// Upstream load-balanced cluster routing to the Dashboard microservice.
    /// Dynamically resolves DASHBOARD_UPSTREAM_HOST from the environment with 127.0.0.1:8081 fallback.
    pub static ref DASHBOARD_CLUSTER: Arc<LoadBalancer<RoundRobin>> = {
        let raw = std::env::var("DASHBOARD_UPSTREAM_HOST").unwrap_or_default();
        let host = clean_upstream_host(&raw, "127.0.0.1:8081");
        let mut lb = LoadBalancer::try_from_iter([host.as_str()])
            .expect("Failed to initialize DASHBOARD_CLUSTER upstream load balancer");
        let mut hc = TcpHealthCheck::new();
        hc.peer_template.options.connection_timeout = Some(Duration::from_secs(1));
        lb.set_health_check(hc);
        lb.health_check_frequency = Some(Duration::from_secs(1));
        Arc::new(lb)
    };

    /// Upstream load-balanced cluster routing to the Python Terms of Service (TOS) microservice.
    /// Dynamically resolves TOS_UPSTREAM_HOST from the environment with 127.0.0.1:8082 fallback.
    pub static ref TOS_CLUSTER: Arc<LoadBalancer<RoundRobin>> = {
        let raw = std::env::var("TOS_UPSTREAM_HOST").unwrap_or_default();
        let host = clean_upstream_host(&raw, "127.0.0.1:8082");
        let mut lb = LoadBalancer::try_from_iter([host.as_str()])
            .expect("Failed to initialize TOS_CLUSTER upstream load balancer");
        let mut hc = TcpHealthCheck::new();
        hc.peer_template.options.connection_timeout = Some(Duration::from_secs(1));
        lb.set_health_check(hc);
        lb.health_check_frequency = Some(Duration::from_secs(1));
        Arc::new(lb)
    };
}
