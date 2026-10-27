use crate::error::AppError;
use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub host: String,
    pub port: u16,
    pub max_connections: u32,
    pub acquire_timeout_secs: u64,
    pub idle_timeout_secs: u64,
}

impl Config {
    pub fn from_env() -> Result<Self, AppError> {
        // Silently attempt to load .env if present
        dotenvy::dotenv().ok();

        let database_url = match env::var("DATABASE_URL") {
            Ok(val) if !val.trim().is_empty() => {
                // If the URL was configured with Python SQLAlchemy dialect scheme (postgresql+asyncpg://),
                // normalize it to standard postgres:// for SQLx
                if val.starts_with("postgresql+asyncpg://") {
                    val.replacen("postgresql+asyncpg://", "postgres://", 1)
                } else {
                    val
                }
            }
            _ => {
                return Err(AppError::ConfigError(
                    "DATABASE_URL environment variable is missing or empty".to_string(),
                ));
            }
        };

        let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());

        let port = match env::var("PORT") {
            Ok(p) => match p.parse::<u16>() {
                Ok(parsed) => parsed,
                Err(_) => {
                    return Err(AppError::ConfigError(
                        "PORT environment variable must be a valid 16-bit unsigned integer".to_string(),
                    ));
                }
            },
            Err(_) => 8080,
        };

        let max_connections = match env::var("DB_MAX_CONNECTIONS") {
            Ok(c) => match c.parse::<u32>() {
                Ok(parsed) => parsed.max(50),
                Err(_) => 50,
            },
            Err(_) => 50,
        };

        let acquire_timeout_secs = match env::var("DB_ACQUIRE_TIMEOUT_SECS") {
            Ok(t) => match t.parse::<u64>() {
                Ok(parsed) => parsed,
                Err(_) => 3,
            },
            Err(_) => 3,
        };

        let idle_timeout_secs = match env::var("DB_IDLE_TIMEOUT_SECS") {
            Ok(t) => match t.parse::<u64>() {
                Ok(parsed) => parsed,
                Err(_) => 600,
            },
            Err(_) => 600,
        };

        Ok(Self {
            database_url,
            host,
            port,
            max_connections,
            acquire_timeout_secs,
            idle_timeout_secs,
        })
    }
}
