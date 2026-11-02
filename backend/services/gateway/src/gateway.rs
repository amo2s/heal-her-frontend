use async_trait::async_trait;
use lazy_static::lazy_static;
use pingora::http::{RequestHeader, ResponseHeader};
use pingora_core::upstreams::peer::HttpPeer;
use pingora_core::Result;
use pingora_proxy::{ProxyHttp, Session};
use std::time::Duration;
use tracing::{debug, warn};

use crate::rate_limiter::check_rate_limit;
use crate::upstreams::{AUTH_CLUSTER, DASHBOARD_CLUSTER, TOS_CLUSTER};

lazy_static! {
    /// Whitelist of origins permitted to communicate with the Gateway.
    /// Supports dynamic expansion via ALLOWED_ORIGINS and FRONTEND_URL environment variables.
    static ref ALLOWED_ORIGINS: Vec<String> = {
        let mut origins = vec![
            "https://healher.vercel.app".to_string(),
            "http://localhost:3000".to_string(),
            "http://127.0.0.1:3000".to_string(),
        ];
        if let Ok(val) = std::env::var("ALLOWED_ORIGINS") {
            for item in val.split(',') {
                let trimmed = item.trim();
                if !trimmed.is_empty() && !origins.iter().any(|o| o.eq_ignore_ascii_case(trimmed)) {
                    origins.push(trimmed.to_string());
                }
            }
        }
        if let Ok(val) = std::env::var("FRONTEND_URL") {
            for item in val.split(',') {
                let trimmed = item.trim();
                if !trimmed.is_empty() && !origins.iter().any(|o| o.eq_ignore_ascii_case(trimmed)) {
                    origins.push(trimmed.to_string());
                }
            }
        }
        origins
    };
}

/// Resolves the incoming request origin against the configured whitelist.
/// Echoes back the matching origin to support credentials (cookies, authorization headers).
fn resolve_allowed_origin(req_header: &RequestHeader) -> String {
    if let Some(origin_val) = req_header.headers.get("origin") {
        if let Ok(origin_str) = origin_val.to_str() {
            let trimmed = origin_str.trim();
            if ALLOWED_ORIGINS.iter().any(|o| o.eq_ignore_ascii_case(trimmed)) {
                return trimmed.to_string();
            }
        }
    }
    // Default to the production Vercel frontend origin
    "https://healher.vercel.app".to_string()
}

pub struct GatewayProxy;

#[async_trait]
impl ProxyHttp for GatewayProxy {
    type CTX = ();

    fn new_ctx(&self) -> Self::CTX {}

    async fn early_request_filter(
        &self,
        session: &mut Session,
        _ctx: &mut Self::CTX,
    ) -> Result<()> {
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
                            return Ok(());
                        }
                    }
                }
            }
        }

        Ok(())
    }

    async fn request_filter(&self, session: &mut Session, _ctx: &mut Self::CTX) -> Result<bool> {
        let path = session.req_header().uri.path();

        // Step A0: Gateway Liveness & Health Probe
        if path == "/health" || path == "/api/health" {
            let mut resp = ResponseHeader::build(200, Some(2))?;
            resp.insert_header("Content-Type", "application/json")?;
            let body = r#"{"status":"healthy","service":"heal-her-gateway"}"#;
            session.write_response_header(Box::new(resp), false).await?;
            session.write_response_body(Some(body.into()), true).await?;
            return Ok(true);
        }

        // Step A: Rate Limiting Enforcement
        let client_ip = if let Some(addr) = session.client_addr() {
            if let Some(inet) = addr.as_inet() {
                inet.ip().to_string()
            } else {
                "127.0.0.1".to_string()
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

        // Step B: CORS OPTIONS Short-Circuiting (Preflight requests answered without JWT requirements)
        if session.req_header().method == http::Method::OPTIONS {
            debug!(
                path = session.req_header().uri.path(),
                "Edge Guardrail: CORS preflight OPTIONS request short-circuited at edge"
            );
            let origin = resolve_allowed_origin(session.req_header());
            let mut resp = ResponseHeader::build(204, Some(5))?;
            resp.insert_header("Access-Control-Allow-Origin", &origin)?;
            resp.insert_header("Access-Control-Allow-Credentials", "true")?;
            resp.insert_header("Vary", "Origin")?;
            resp.insert_header(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            )?;
            resp.insert_header(
                "Access-Control-Allow-Headers",
                "Authorization, Content-Type, Accept, X-Requested-With, x-healher-handshake, x-healher-verified-ip",
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

        if path.starts_with("/api/v1/tos") || path.starts_with("/api/v1/render") {
            let upstream = TOS_CLUSTER.select(b"", 256).ok_or_else(|| {
                pingora_core::Error::explain(
                    pingora_core::ErrorType::HTTPStatus(503),
                    "No healthy upstream in TOS_CLUSTER",
                )
            })?;

            debug!(path = path, target = ?upstream, "Routing request to TOS_CLUSTER");
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
            let client_ip = if let Some(inet) = client_addr.as_inet() {
                inet.ip().to_string()
            } else {
                "127.0.0.1".to_string()
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
        session: &mut Session,
        upstream_response: &mut ResponseHeader,
        _ctx: &mut Self::CTX,
    ) -> Result<()> {
        let origin = resolve_allowed_origin(session.req_header());
        upstream_response.insert_header("Access-Control-Allow-Origin", &origin)?;
        upstream_response.insert_header("Access-Control-Allow-Credentials", "true")?;
        upstream_response.insert_header("Vary", "Origin")?;
        upstream_response.insert_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        )?;
        upstream_response.insert_header(
            "Access-Control-Allow-Headers",
            "Authorization, Content-Type, Accept, X-Requested-With, x-healher-handshake, x-healher-verified-ip",
        )?;
        Ok(())
    }
}
