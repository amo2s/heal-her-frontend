use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret_key: String,
    pub host: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        // Attempt to load .env from current directory or parent directories
        let _ = dotenvy::dotenv()
            .or_else(|_| dotenvy::from_filename(".env"))
            .or_else(|_| dotenvy::from_filename("../.env"))
            .or_else(|_| dotenvy::from_filename("../../.env"));

        let database_url_raw =
            env::var("DATABASE_URL").expect("FATAL: DATABASE_URL environment variable must be set");

        // Normalize python asyncpg or standard scheme to postgres:// for SQLx
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
            .unwrap_or(8081);

        Self {
            database_url,
            jwt_secret_key,
            host,
            port,
        }
    }
}
