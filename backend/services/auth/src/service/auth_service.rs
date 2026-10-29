use crate::{
    domain::auth::{LoginRequest, LoginResponse, LogoutResponse, UserType},
    error::InternalAuthError,
    infrastructure::{
        cache::RevocationCache,
        crypto::{execute_dummy_hash, verify_password},
        jwt::{generate_token_pair, hash_refresh_token, verify_token, Claims},
        session_repo::{
            create_session, delete_all_user_sessions, delete_session_by_hash,
            delete_session_family, rotate_session_atomic, NewSessionParams, RotationOutcome,
        },
    },
};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(sqlx::FromRow)]
struct UserAuthRecord {
    id: Uuid,
    email: String,
    full_name: String,
    password_hash: String,
    role: String,
    is_active: bool,
}

/// Orchestrates the authentication lifecycle with strict timing-attack immunity,
/// credential verification on dedicated blocking threads, stateful session initialization,
/// BLAKE3 refresh token hashing, and JWT token pair generation.
pub async fn authenticate_user(
    pool: &PgPool,
    secret: &str,
    cache: &RevocationCache,
    req: &LoginRequest,
    user_agent: Option<&str>,
    ip_address: Option<&str>,
) -> Result<LoginResponse, InternalAuthError> {
    // 1. Data Normalization & Brute Force Defense Check
    let normalized_email = req.email.trim().to_lowercase();
    cache.check_brute_force(&normalized_email).await?;

    // 2. Query user credentials and state from PostgreSQL
    let user_opt: Option<UserAuthRecord> = sqlx::query_as(
        r#"
        SELECT id, email, full_name, password_hash, role, is_active
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
    if let Err(err) = verify_password(record.password_hash, req.password.clone()).await {
        cache.record_failed_login(&normalized_email).await;
        return Err(err);
    }

    // 5. Account Suspension Guard
    if !record.is_active {
        tracing::warn!(
            target: "auth::service",
            user_id = %record.id,
            "Authentication failed: account is suspended"
        );
        return Err(InternalAuthError::AccountSuspended);
    }

    // 6. Password verified and account active: clear login attempts before minting token pair
    cache.clear_login_attempts(&normalized_email).await;

    // 7. Algorithmic Demographic Dashboard Routing
    let dashboard = match record.role.as_str() {
        "kid" => "kids",
        "teen" => "teens",
        "young-adult" => "young-adults",
        other => other,
    }
    .to_string();

    // 8. Initialize Stateful Session Identifiers (UUIDv4)
    let session_id = Uuid::new_v4();
    let family_id = Uuid::new_v4();

    // 9. Forge asymmetric access (10 min) & refresh (7 day) token pair with BLAKE3 hashing
    let token_pair = generate_token_pair(
        record.id,
        &record.role,
        Some(&dashboard),
        session_id,
        family_id,
        secret,
    )?;

    // 10. Persist stateful session ledger row in PostgreSQL
    create_session(
        pool,
        session_id,
        record.id,
        family_id,
        &token_pair.refresh_token_hash,
        user_agent,
        ip_address,
        token_pair.refresh_expires_at,
    )
    .await?;

    tracing::info!(
        target: "auth::service",
        user_id = %record.id,
        session_id = %session_id,
        family_id = %family_id,
        role = %record.role,
        dashboard = %dashboard,
        "User authenticated and stateful session created successfully"
    );

    // 11. Construct sanitized response payload (100% backward-compatible with Next.js)
    Ok(LoginResponse {
        status: "success".to_string(),
        message: "Login successful".to_string(),
        access_token: token_pair.access_token,
        refresh_token: token_pair.refresh_token,
        user: UserType {
            id: record.id.to_string(),
            email: record.email,
            full_name: record.full_name,
            is_active: record.is_active,
            dashboard,
        },
    })
}

/// Executes Refresh Token Rotation (RTR) with atomic transaction locking,
/// race-condition mitigation, and automatic replay/theft detection.
pub async fn refresh_user_session(
    pool: &PgPool,
    secret: &str,
    cache: &RevocationCache,
    raw_refresh_token: &str,
    user_agent: Option<&str>,
    ip_address: Option<&str>,
) -> Result<LoginResponse, InternalAuthError> {
    // 1. Cryptographically decode and verify refresh token signature & expiration
    let claims = verify_token(raw_refresh_token, secret)?;

    // 2. Strict token type separation: ONLY "refresh" tokens permitted for rotation
    if claims.token_type != "refresh" {
        tracing::warn!(
            target: "auth::service",
            user_id = %claims.sub,
            token_type = %claims.token_type,
            "Rejected rotation attempt: token is not of type 'refresh'"
        );
        return Err(InternalAuthError::InvalidTokenType);
    }

    // 3. Nanosecond L1 Cache Revocation Check: Check if user or JTI was revoked
    if cache.is_token_revoked(&claims.jti, &claims.sub, claims.iat) {
        tracing::warn!(
            target: "auth::service",
            user_id = %claims.sub,
            jti = %claims.jti,
            "Rejected rotation attempt: token JTI or user sessions are revoked"
        );
        return Err(InternalAuthError::TokenRevoked);
    }

    // 4. Query user record from PostgreSQL to ensure account active
    let user_opt: Option<UserAuthRecord> = sqlx::query_as(
        r#"
        SELECT id, email, full_name, password_hash, role, is_active
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(claims.sub)
    .fetch_optional(pool)
    .await?;

    let user = match user_opt {
        Some(u) => u,
        None => return Err(InternalAuthError::UserNotFoundInPostgres),
    };

    if !user.is_active {
        tracing::warn!(
            target: "auth::service",
            user_id = %user.id,
            "Rejected rotation attempt: account suspended"
        );
        return Err(InternalAuthError::AccountSuspended);
    }

    // 5. Algorithmic Demographic Dashboard Routing
    let dashboard = match user.role.as_str() {
        "kid" => "kids",
        "teen" => "teens",
        "young-adult" => "young-adults",
        other => other,
    }
    .to_string();

    // 6. Compute BLAKE3 hex hash of the presented refresh token
    let presented_hash = hash_refresh_token(raw_refresh_token);

    // 7. Generate a fresh new session ID while strictly preserving the family ID
    let new_session_id = Uuid::new_v4();

    // 8. Forge new candidate access (10 min) & refresh (7 day) token pair
    let new_token_pair = generate_token_pair(
        user.id,
        &user.role,
        Some(&dashboard),
        new_session_id,
        claims.fid,
        secret,
    )?;

    // 9. Execute atomic database transaction with row-level lock and theft detection
    let rotation_params = NewSessionParams {
        new_session_id,
        user_id: user.id,
        family_id: claims.fid,
        new_refresh_token_hash: &new_token_pair.refresh_token_hash,
        user_agent,
        ip_address,
        new_expires_at: new_token_pair.refresh_expires_at,
    };

    let outcome = rotate_session_atomic(
        pool,
        claims.sid,
        claims.fid,
        user.id,
        &presented_hash,
        &rotation_params,
    )
    .await?;

    match outcome {
        RotationOutcome::Success => {
            tracing::info!(
                target: "auth::service",
                user_id = %user.id,
                family_id = %claims.fid,
                old_session_id = %claims.sid,
                new_session_id = %new_session_id,
                "Refresh token rotated successfully under Stateful RTR"
            );

            Ok(LoginResponse {
                status: "success".to_string(),
                message: "Token refreshed successfully".to_string(),
                access_token: new_token_pair.access_token,
                refresh_token: new_token_pair.refresh_token,
                user: UserType {
                    id: user.id.to_string(),
                    email: user.email,
                    full_name: user.full_name,
                    is_active: user.is_active,
                    dashboard,
                },
            })
        }
        RotationOutcome::Compromised { family_id } => {
            // Replay/Theft Attack Confirmed:
            // An already revoked refresh token was replayed, or hash mismatch on an existing session.
            let now_ts = chrono::Utc::now().timestamp();
            cache.revoke_all_user_sessions(user.id, now_ts).await;

            tracing::warn!(
                target: "auth::security::theft_detected",
                user_id = %user.id,
                family_id = %family_id,
                session_id = %claims.sid,
                "HIGH SEVERITY ALERT: Refresh token theft / replay attack detected! Entire session family deleted and global L1 user kill-switch engaged"
            );

            Err(InternalAuthError::TokenReuseDetected)
        }
        RotationOutcome::InvalidOrExpired => {
            tracing::warn!(
                target: "auth::service",
                user_id = %user.id,
                session_id = %claims.sid,
                "Refresh token rotation rejected: session not found or expired"
            );

            Err(InternalAuthError::SessionExpired)
        }
    }
}

/// Dual-Mode Logout Execution:
/// Supports single-device session family invalidation or multi-device global kill-switch.
pub async fn logout_user_session(
    pool: &PgPool,
    cache: &RevocationCache,
    claims: &Claims,
    all_devices: bool,
    optional_refresh_token: Option<&str>,
) -> Result<LogoutResponse, InternalAuthError> {
    if all_devices {
        // Mode 2 — Global Multi-Device Logout
        let now_ts = chrono::Utc::now().timestamp();
        // 1. Immediately blacklist current Access Token JTI
        cache.revoke_jti(claims.jti).await;
        // 2. Stamp user ID into Tier-2 Global User Kill-Switch with 10-minute TTL
        cache.revoke_all_user_sessions(claims.sub, now_ts).await;
        // 3. Batch delete all sessions in PostgreSQL across all devices
        let deleted_count = delete_all_user_sessions(pool, claims.sub).await?;

        tracing::info!(
            target: "auth::service",
            user_id = %claims.sub,
            purged_sessions = deleted_count,
            "Global multi-device logout completed; L1 kill-switch active"
        );

        Ok(LogoutResponse {
            status: "success".to_string(),
            message: "Session terminated securely".to_string(),
            mode: "all_devices".to_string(),
        })
    } else {
        // Mode 1 — Single-Device Logout
        // 1. Immediately blacklist current Access Token JTI in L1 RAM
        cache.revoke_jti(claims.jti).await;
        // 2. Delete the session family from PostgreSQL
        let deleted_count = delete_session_family(pool, claims.fid, claims.sub).await?;
        // 3. If a refresh token was explicitly provided, also purge by its BLAKE3 hash
        if let Some(raw_rt) = optional_refresh_token {
            let hash = hash_refresh_token(raw_rt);
            let _ = delete_session_by_hash(pool, &hash).await;
        }

        tracing::info!(
            target: "auth::service",
            user_id = %claims.sub,
            family_id = %claims.fid,
            session_id = %claims.sid,
            purged_sessions = deleted_count,
            "Single-device logout completed"
        );

        Ok(LogoutResponse {
            status: "success".to_string(),
            message: "Session terminated securely".to_string(),
            mode: "single_device".to_string(),
        })
    }
}
