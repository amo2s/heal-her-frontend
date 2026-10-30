use async_trait::async_trait;
use pingora_core::upstreams::peer::HttpPeer;
use pingora_core::Result;
use pingora_http::{RequestHeader, ResponseHeader};
use pingora_proxy::{ProxyHttp, Session};
use std::time::Duration;
use tracing::{debug, warn};

use crate::rate_limiter::check_rate_limit;
use crate::upstreams::{AUTH_CLUSTER, DASHBOARD_CLUSTER};

pub struct GatewayProxy;

#[async_trait]
impl ProxyHttp for GatewayProxy {
    type CTX = ();

    fn new_ctx(&self) -> Self::CTX {}

    async fn early_request_filter(
        &self,
        session: &mut Session,
        _ctx: &mut Self::CTX,
    ) -> Result<bool> {
        let path = session.req_header().uri.path();
        let is_auth_route = path.starts_with("/api/v1/auth/")
            || path.starts_with("/api/auth/")
            || path == "/login"
            || path == "/signup";

        if is_auth_route {
            if let Some(content_length_header) = session.req_header().headers.get("content-length")
            {
                if let Ok(cl_str) = content_length_header.to_str() {
                    if let Ok(content_length) = cl_str.trim().parse::<usize>() {
                        if content_length > 2048 {
                            warn!(
                                path = path,
                                content_length = content_length,
                                "Edge Guardrail: Rejection of oversize auth payload (>2048 bytes)"
                            );
                            let mut resp = ResponseHeader::build(413, Some(3))?;
                            resp.insert_header("Content-Type", "application/json")?;
                            resp.insert_header("Connection", "close")?;
                            let body = r#"{"error":"Payload Too Large","message":"Request payload exceeds maximum allowed size of 2048 bytes"}"#;
                            session.write_response_header(Box::new(resp), false).await?;
                            session.write_response_body(Some(body.into()), true).await?;
                            return Ok(true);
                        }
                    }
                }
            }
        }

        Ok(false)
    }

    async fn request_filter(&self, session: &mut Session, _ctx: &mut Self::CTX) -> Result<bool> {
        // Step A: Rate Limiting Enforcement
        let client_ip = if let Some(addr) = session.client_addr() {
            match addr {
                std::net::SocketAddr::V4(v4) => v4.ip().to_string(),
                std::net::SocketAddr::V6(v6) => v6.ip().to_string(),
            }
        } else {
            "127.0.0.1".to_string()
        };

        if !check_rate_limit(&client_ip) {
            warn!(
                client_ip = %client_ip,
                "Perimeter Rate Limit Exceeded: Request throttled (50 req/s threshold breached)"
            );
            let mut resp = ResponseHeader::build(429, Some(2))?;
            resp.insert_header("Content-Type", "application/json")?;
            resp.insert_header("Connection", "close")?;
            let body = r#"{"error":"Too Many Requests","message":"Rate limit exceeded. Maximum 50 requests per second permitted."}"#;
            session.write_response_header(Box::new(resp), false).await?;
            session.write_response_body(Some(body.into()), true).await?;
            return Ok(true);
        }

        // Step B: CORS OPTIONS Short-Circuiting
        if session.req_header().method == http::Method::OPTIONS {
            debug!(
                path = session.req_header().uri.path(),
                "Edge Guardrail: CORS preflight OPTIONS request short-circuited at edge"
            );
            let mut resp = ResponseHeader::build(204, Some(4))?;
            resp.insert_header("Access-Control-Allow-Origin", "*")?;
            resp.insert_header(
                "Access-Control-Allow-Methods",
                "POST, GET, OPTIONS, PUT, DELETE",
            )?;
            resp.insert_header(
                "Access-Control-Allow-Headers",
                "Authorization, Content-Type, Accept, X-Requested-With",
            )?;
            resp.insert_header("Access-Control-Max-Age", "86400")?;
            session.write_response_header(Box::new(resp), true).await?;
            return Ok(true);
        }

        Ok(false)
    }

    async fn upstream_peer(
        &self,
        session: &mut Session,
        _ctx: &mut Self::CTX,
    ) -> Result<Box<HttpPeer>> {
        let path = session.req_header().uri.path();

        if path.starts_with("/api/v1/auth/")
            || path.starts_with("/api/auth/")
            || path == "/login"
            || path == "/signup"
        {
            let upstream = AUTH_CLUSTER.select(b"", 256).ok_or_else(|| {
                pingora_core::Error::explain(
                    pingora_core::ErrorType::HTTPStatus(503),
                    "No healthy upstream in AUTH_CLUSTER",
                )
            })?;

            debug!(path = path, target = ?upstream, "Routing request to AUTH_CLUSTER");
            let mut peer = Box::new(HttpPeer::new(upstream, false, "".to_string()));
            peer.options.connection_timeout = Some(Duration::from_secs(2));
            return Ok(peer);
        }

        if path.starts_with("/api/v1/dashboard/") {
            let upstream = DASHBOARD_CLUSTER.select(b"", 256).ok_or_else(|| {
                pingora_core::Error::explain(
                    pingora_core::ErrorType::HTTPStatus(503),
                    "No healthy upstream in DASHBOARD_CLUSTER",
                )
            })?;

            debug!(path = path, target = ?upstream, "Routing request to DASHBOARD_CLUSTER");
            let mut peer = Box::new(HttpPeer::new(upstream, false, "".to_string()));
            peer.options.connection_timeout = Some(Duration::from_secs(2));
            return Ok(peer);
        }

        // Unknown route: reject with 404
        warn!(path = path, "Routing rejection: Unknown route path");
        Err(pingora_core::Error::explain(
            pingora_core::ErrorType::HTTPStatus(404),
            "Route Not Found",
        ))
    }

    async fn upstream_request_filter(
        &self,
        session: &mut Session,
        upstream_request: &mut RequestHeader,
        _ctx: &mut Self::CTX,
    ) -> Result<()> {
        if let Some(client_addr) = session.client_addr() {
            let client_ip = match client_addr {
                std::net::SocketAddr::V4(v4) => v4.ip().to_string(),
                std::net::SocketAddr::V6(v6) => v6.ip().to_string(),
            };

            upstream_request.insert_header("X-Real-IP", &client_ip)?;

            if let Some(existing_xff) = upstream_request.headers.get("x-forwarded-for") {
                if let Ok(existing_str) = existing_xff.to_str() {
                    let combined = format!("{}, {}", existing_str, client_ip);
                    upstream_request.insert_header("X-Forwarded-For", &combined)?;
                } else {
                    upstream_request.insert_header("X-Forwarded-For", &client_ip)?;
                }
            } else {
                upstream_request.insert_header("X-Forwarded-For", &client_ip)?;
            }
        }

        Ok(())
    }

    async fn response_filter(
        &self,
        _session: &mut Session,
        upstream_response: &mut ResponseHeader,
        _ctx: &mut Self::CTX,
    ) -> Result<()> {
        upstream_response.insert_header("Access-Control-Allow-Origin", "*")?;
        upstream_response.insert_header(
            "Access-Control-Allow-Methods",
            "POST, GET, OPTIONS, PUT, DELETE",
        )?;
        upstream_response.insert_header(
            "Access-Control-Allow-Headers",
            "Authorization, Content-Type, Accept, X-Requested-With",
        )?;
        Ok(())
    }
}
