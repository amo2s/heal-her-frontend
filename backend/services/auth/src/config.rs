use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret_key: String,
    pub host: String,
    pub port: u16,
    pub max_connections: u32,
    pub acquire_timeout_secs: u64,
    pub idle_timeout_secs: u64,
}

impl Config {
    pub fn from_env() -> Self {
        // Silently attempt to load environment variables from .env if present
        dotenvy::dotenv().ok();

        let database_url_raw = env::var("DATABASE_URL")
            .expect("FATAL: DATABASE_URL environment variable must be set");

        // If the URL was configured with Python SQLAlchemy dialect scheme (postgresql+asyncpg://),
        // normalize it to standard postgres:// for SQLx
        let database_url = if database_url_raw.starts_with("postgresql+asyncpg://") {
            database_url_raw.replacen("postgresql+asyncpg://", "postgres://", 1)
        } else {
            database_url_raw
        };

        let jwt_secret_key = env::var("JWT_SECRET_KEY")
            .expect("FATAL: JWT_SECRET_KEY environment variable must be set");

        let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());

        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(8080);

        let max_connections = env::var("DB_MAX_CONNECTIONS")
            .ok()
            .and_then(|c| c.parse::<u32>().ok())
            .map(|c| c.max(50))
            .unwrap_or(50);

        let acquire_timeout_secs = env::var("DB_ACQUIRE_TIMEOUT_SECS")
            .ok()
            .and_then(|t| t.parse::<u64>().ok())
            .unwrap_or(3);

        let idle_timeout_secs = env::var("DB_IDLE_TIMEOUT_SECS")
            .ok()
            .and_then(|t| t.parse::<u64>().ok())
            .unwrap_or(600);

        Self {
            database_url,
            jwt_secret_key,
            host,
            port,
            max_connections,
            acquire_timeout_secs,
            idle_timeout_secs,
        }
    }
}
