use crate::{
    domain::auth::{LoginRequest, LoginResponse, UserType},
    error::InternalAuthError,
    infrastructure::{crypto::{execute_dummy_hash, verify_password}, jwt::forge_token_pair},
};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(sqlx::FromRow)]
struct UserAuthRecord {
    id: Uuid,
    full_name: String,
    password_hash: String,
    role: String,
    is_active: bool,
}

/// Orchestrates the authentication lifecycle with strict timing-attack immunity,
/// credential verification on dedicated blocking threads, and JWT token forging.
pub async fn authenticate_user(
    pool: &PgPool,
    secret: &str,
    req: &LoginRequest,
) -> Result<LoginResponse, InternalAuthError> {
    // 1. Data Normalization
    let normalized_email = req.email.trim().to_lowercase();

    // 2. Query user credentials and state from PostgreSQL
    let user_opt: Option<UserAuthRecord> = sqlx::query_as(
        r#"
        SELECT id, full_name, password_hash, role, is_active
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(&normalized_email)
    .fetch_optional(pool)
    .await?;

    // 3. User Existence Check & Timing Attack Shield
    let record = match user_opt {
        Some(u) => u,
        None => {
            tracing::warn!(
                target: "auth::service",
                email = %normalized_email,
                "Authentication failed: user not found; executing dummy hash to equalize latency"
            );
            // Execute dummy Argon2id hash on blocking pool to absorb ~600ms and equalize response timing
            execute_dummy_hash().await?;
            return Err(InternalAuthError::UserNotFoundInPostgres);
        }
    };

    // 4. Verify password against stored Argon2id hash on Tokio blocking pool
    verify_password(record.password_hash, req.password.clone()).await?;

    // 5. Account Suspension Guard
    if !record.is_active {
        tracing::warn!(
            target: "auth::service",
            user_id = %record.id,
            "Authentication failed: account is suspended"
        );
        return Err(InternalAuthError::AccountSuspended);
    }

    // 6. Algorithmic Demographic Dashboard Routing
    let dashboard = match record.role.as_str() {
        "kid" => "kids",
        "teen" => "teens",
        "young-adult" => "young-adults",
        other => other,
    }
    .to_string();

    // 7. Forge asymmetric access (10 min) & refresh (7 day) token pair
    let (access_token, refresh_token) =
        forge_token_pair(&record.id.to_string(), &record.role, &dashboard, secret)?;

    tracing::info!(
        target: "auth::service",
        user_id = %record.id,
        role = %record.role,
        dashboard = %dashboard,
        "User authenticated successfully"
    );

    // 8. Construct sanitized response payload
    Ok(LoginResponse {
        status: "success".to_string(),
        message: "Login successful".to_string(),
        access_token,
        refresh_token,
        user: UserType {
            id: record.id.to_string(),
            email: normalized_email,
            full_name: record.full_name,
            is_active: record.is_active,
            dashboard,
        },
    })
}
