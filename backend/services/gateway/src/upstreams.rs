use lazy_static::lazy_static;
use pingora_load_balancing::health_check::TcpHealthCheck;
use pingora_load_balancing::selection::RoundRobin;
use pingora_load_balancing::LoadBalancer;
use std::sync::Arc;
use std::time::Duration;

lazy_static! {
    /// Upstream load-balanced cluster routing to the Authentication microservice (Port 8080).
    pub static ref AUTH_CLUSTER: Arc<LoadBalancer<RoundRobin>> = {
        let mut lb = LoadBalancer::try_from_iter(["127.0.0.1:8080"])
            .expect("Failed to initialize AUTH_CLUSTER upstream load balancer");
        let mut hc = TcpHealthCheck::new();
        hc.peer_template.options.connection_timeout = Some(Duration::from_secs(1));
        lb.set_health_check(Box::new(hc));
        lb.health_check_frequency = Some(Duration::from_secs(1));
        Arc::new(lb)
    };

    /// Upstream load-balanced cluster routing to the Dashboard microservice (Port 8081).
    pub static ref DASHBOARD_CLUSTER: Arc<LoadBalancer<RoundRobin>> = {
        let mut lb = LoadBalancer::try_from_iter(["127.0.0.1:8081"])
            .expect("Failed to initialize DASHBOARD_CLUSTER upstream load balancer");
        let mut hc = TcpHealthCheck::new();
        hc.peer_template.options.connection_timeout = Some(Duration::from_secs(1));
        lb.set_health_check(Box::new(hc));
        lb.health_check_frequency = Some(Duration::from_secs(1));
        Arc::new(lb)
    };
}
