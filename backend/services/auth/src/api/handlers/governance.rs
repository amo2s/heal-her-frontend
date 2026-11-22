
use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use validator::Validate;

use crate::{
    api::middleware::governance::{
        extract_client_ip, verify_handshake, ApprovedManagementActor, ManagementIdentity,
    },
    domain::governance::{
        can_approve_or_reject, can_suspend_reactivate_or_delete, GovernanceAction, ManagementRole,
    },
    error::ApiError,
    infrastructure::crypto::hash_password,
    state::AppState,
};

// ============================================================================
// REQUEST & RESPONSE DTOs
// ============================================================================

#[derive(Debug, Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ManagementSignupRequest {
    #[validate(length(
        min = 2,
        max = 120,
        message = "full_name must be between 2 and 120 characters"
    ))]
    pub full_name: String,

    #[validate(email(message = "email must be a valid email address"))]
    pub email: String,

    #[validate(length(min = 8, message = "password must be at least 8 characters long"))]
    pub password: String,

    pub requested_role: String,

    pub bot_trap: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
#[serde(deny_unknown_fields)]
pub struct OptionalReasonRequest {
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ListUsersQuery {
    pub role: Option<String>,
    pub approval_status: Option<String>,
    pub is_active: Option<bool>,
    pub include_deleted: Option<bool>,
    pub search: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ListAuditLogsQuery {
    pub action: Option<String>,
    pub actor_id: Option<Uuid>,
    pub target_user_id: Option<Uuid>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ManagementUserRow {
    pub id: Uuid,
    pub full_name: String,
    pub email: String,
    pub role: String,
    pub approval_status: String,
    pub is_active: bool,
    pub approved_by: Option<Uuid>,
    pub approved_at: Option<DateTime<Utc>>,
    pub suspended_by: Option<Uuid>,
    pub suspended_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct AuditLogRow {
    pub id: Uuid,
    pub actor_id: Uuid,
    pub actor_role: String,
    pub target_user_id: Option<Uuid>,
    pub action: String,
    pub metadata: serde_json::Value,
    pub ip_address: Option<String>,
    pub created_at: DateTime<Utc>,
    pub actor_name: Option<String>,
    pub actor_email: Option<String>,
    pub target_name: Option<String>,
    pub target_email: Option<String>,
}

// ============================================================================
// 1. POST /api/v1/auth/management/signup
// ============================================================================
pub async fn handle_management_signup(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<ManagementSignupRequest>,
) -> Result<impl IntoResponse, ApiError> {
    // 1. Optional handshake verification
    verify_handshake(&headers, &state.frontend_handshake_secret)?;

    // 2. Bot trap check
    if let Some(ref trap) = payload.bot_trap {
        if !trap.trim().is_empty() {
            tracing::warn!(target: "governance::signup", "Bot trap tripped on management signup");
            return Err(ApiError::BadRequest("Invalid registration payload".to_string()));
        }
    }

    // 3. Validation
    payload
        .validate()
        .map_err(|e| ApiError::BadRequest(e.to_string()))?;

    // Password Complexity Enforcement (SEC-004)
    crate::domain::password::validate_password_complexity(&payload.password)?;

    // Check control characters in full_name
    if payload.full_name.chars().any(|c| c.is_control()) {
        return Err(ApiError::BadRequest(
            "full_name cannot contain control characters".to_string(),
        ));
    }
    let trimmed_name = payload.full_name.trim().to_string();

    // 4. Role validation: Strictly staff or admin (reject super_admin & legacy)
    let requested_role = payload.requested_role.trim().to_lowercase();
    if requested_role != "staff" && requested_role != "admin" {
        return Err(ApiError::BadRequest(
            "Invalid requested role. Only 'staff' and 'admin' are permitted for self-registration."
                .to_string(),
        ));
    }

    let normalized_email = payload.email.trim().to_lowercase();
    let password_hash = hash_password(payload.password).await?;
    let new_user_id = Uuid::now_v7();
    let client_ip = extract_client_ip(&headers);

    // 5. Atomic transaction: insert user + audit log
    let mut tx = state.pool.begin().await?;

    let insert_result = sqlx::query(
        r#"
        INSERT INTO users (
            id, full_name, email, age, role, password_hash, is_active, is_verified, tos_cleared, approval_status, created_at, updated_at
        )
        VALUES ($1, $2, $3, 25, $4, $5, TRUE, FALSE, TRUE, 'PENDING', NOW(), NOW())
        "#,
    )
    .bind(new_user_id)
    .bind(&trimmed_name)
    .bind(&normalized_email)
    .bind(&requested_role)
    .bind(&password_hash)
    .execute(&mut *tx)
    .await;

    if let Err(err) = insert_result {
        let _ = tx.rollback().await;
        if let Some(db_err) = err.as_database_error() {
            if db_err.code().as_deref() == Some("23505") {
                crate::infrastructure::crypto::execute_dummy_hash().await?;
                return Err(ApiError::Conflict(
                    "An account with this email already exists".to_string(),
                ));
            }
        }
        return Err(ApiError::InternalServerError(
            "Failed to create user account".to_string(),
        ));
    }

    // Insert immutable audit log
    let audit_metadata = json!({
        "requested_role": requested_role,
        "email": normalized_email,
        "full_name": trimmed_name
    });

    sqlx::query(
        r#"
        INSERT INTO governance_audit_logs (
            id, actor_id, actor_role, target_user_id, action, metadata, ip_address, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
        "#,
    )
    .bind(new_user_id)
    .bind(&requested_role)
    .bind(new_user_id)
    .bind(GovernanceAction::MANAGEMENT_SIGNUP)
    .bind(audit_metadata)
    .bind(client_ip)
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        tracing::error!(target: "governance::signup", error = ?e, "Failed to write audit log");
        ApiError::InternalServerError("Failed to record governance audit entry".to_string())
    })?;

    tx.commit().await?;

    tracing::info!(
        target: "governance::signup",
        user_id = %new_user_id,
        role = %requested_role,
        "New management user registered into PENDING queue"
    );

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "success",
            "message": "Management account registered and awaiting approval.",
            "data": {
                "id": new_user_id,
                "full_name": trimmed_name,
                "email": normalized_email,
                "role": requested_role,
                "approval_status": "PENDING"
            }
        })),
    ))
}

// ============================================================================
// 2. GET /api/v1/auth/management/me
// ============================================================================
pub async fn handle_management_me(
    State(state): State<AppState>,
    identity: ManagementIdentity,
) -> Result<impl IntoResponse, ApiError> {
    #[derive(sqlx::FromRow)]
    struct MeRecord {
        id: Uuid,
        full_name: String,
        email: String,
        role: String,
        approval_status: String,
        is_active: bool,
        approved_at: Option<DateTime<Utc>>,
        created_at: DateTime<Utc>,
        deleted_at: Option<DateTime<Utc>>,
    }

    let user_opt: Option<MeRecord> = sqlx::query_as(
        r#"
        SELECT id, full_name, email, role, approval_status, is_active, approved_at, created_at, deleted_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(identity.user_id)
    .fetch_optional(&state.pool)
    .await?;

    let record = match user_opt {
        Some(r) => r,
        None => return Err(ApiError::Unauthorized("Account not found".to_string())),
    };

    if record.deleted_at.is_some() || !record.is_active {
        return Err(ApiError::Forbidden(
            "Account is no longer active or has been suspended".to_string(),
        ));
    }

    if record.approval_status.eq_ignore_ascii_case("REJECTED") {
        return Err(ApiError::Forbidden(
            "Account registration was rejected".to_string(),
        ));
    }

    let live_role = ManagementRole::parse_strict(&record.role).ok_or_else(|| {
        ApiError::Forbidden("Account does not hold a valid management role".to_string())
    })?;

    let first_name = record
        .full_name
        .trim()
        .split_whitespace()
        .next()
        .unwrap_or("")
        .to_string();

    // Signal token refresh if live DB role or approval_status differs from the caller's JWT claims
    let jwt_status = identity.claims.approval_status.as_deref().unwrap_or("");
    let jwt_role = identity.claims.role.trim().to_lowercase();
    let requires_token_refresh = !record.approval_status.eq_ignore_ascii_case(jwt_status)
        || live_role.as_str() != jwt_role.as_str();

    Ok(Json(json!({
        "status": "success",
        "data": {
            "id": record.id,
            "full_name": record.full_name,
            "first_name": first_name,
            "email": record.email,
            "role": live_role.as_str(),
            "approval_status": record.approval_status,
            "is_active": record.is_active,
            "approved_at": record.approved_at,
            "created_at": record.created_at,
            "requires_token_refresh": requires_token_refresh
        }
    })))
}

// ============================================================================
// 3. GET /api/v1/auth/management/users
// ============================================================================
pub async fn handle_list_management_users(
    State(state): State<AppState>,
    actor: ApprovedManagementActor,
    Query(query): Query<ListUsersQuery>,
) -> Result<impl IntoResponse, ApiError> {
    if actor.role == ManagementRole::Staff {
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: Staff accounts cannot list management directory".to_string(),
        ));
    }

    // Role-based visibility enforcement
    let target_role_filter: Option<String> = if actor.role == ManagementRole::Admin {
        if let Some(ref r) = query.role {
            if r.trim().to_lowercase() != "staff" {
                return Err(ApiError::Forbidden(
                    "INSUFFICIENT_PERMISSIONS: Admins can only view staff accounts".to_string(),
                ));
            }
        }
        Some("staff".to_string())
    } else {
        query.role.map(|r| r.trim().to_lowercase())
    };

    let limit = query.limit.unwrap_or(20).clamp(1, 100);
    let offset = query.offset.unwrap_or(0).max(0);
    let include_deleted = if actor.role == ManagementRole::SuperAdmin {
        query.include_deleted.unwrap_or(false)
    } else {
        false
    };

    let search_pattern = query.search.as_ref().map(|s| {
        let escaped = s
            .replace('\\', "\\\\")
            .replace('%', "\\%")
            .replace('_', "\\_");
        format!("%{escaped}%")
    });

    // Compute KPI counts
    #[derive(sqlx::FromRow)]
    struct CountsRow {
        pending_staff: i64,
        pending_admin: i64,
        active_staff: i64,
        active_admin: i64,
        suspended_count: i64,
    }

    let counts: CountsRow = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE role = 'staff' AND approval_status = 'PENDING' AND deleted_at IS NULL) as pending_staff,
            COUNT(*) FILTER (WHERE role = 'admin' AND approval_status = 'PENDING' AND deleted_at IS NULL) as pending_admin,
            COUNT(*) FILTER (WHERE role = 'staff' AND approval_status = 'APPROVED' AND is_active = TRUE AND deleted_at IS NULL) as active_staff,
            COUNT(*) FILTER (WHERE role = 'admin' AND approval_status = 'APPROVED' AND is_active = TRUE AND deleted_at IS NULL) as active_admin,
            COUNT(*) FILTER (WHERE role IN ('staff', 'admin') AND is_active = FALSE AND deleted_at IS NULL) as suspended_count
        FROM users
        WHERE role IN ('super_admin', 'admin', 'staff')
        "#,
    )
    .fetch_one(&state.pool)
    .await?;

    // Build paginated query
    let users: Vec<ManagementUserRow> = sqlx::query_as(
        r#"
        SELECT
            id, full_name, email, role, approval_status, is_active,
            approved_by, approved_at, suspended_by, suspended_at, deleted_at,
            created_at, updated_at
        FROM users
        WHERE role IN ('super_admin', 'admin', 'staff')
          AND ($1::text IS NULL OR role = $1)
          AND ($2::text IS NULL OR approval_status = $2)
          AND ($3::boolean IS NULL OR is_active = $3)
          AND ($4::boolean = TRUE OR deleted_at IS NULL)
          AND (
              $5::text IS NULL
              OR full_name ILIKE $5 ESCAPE '\'
              OR email ILIKE $5 ESCAPE '\'
          )
        ORDER BY created_at DESC
        LIMIT $6 OFFSET $7
        "#,
    )
    .bind(target_role_filter.as_deref())
    .bind(query.approval_status.as_deref())
    .bind(query.is_active)
    .bind(include_deleted)
    .bind(search_pattern.as_deref())
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.pool)
    .await?;

    let total: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM users
        WHERE role IN ('super_admin', 'admin', 'staff')
          AND ($1::text IS NULL OR role = $1)
          AND ($2::text IS NULL OR approval_status = $2)
          AND ($3::boolean IS NULL OR is_active = $3)
          AND ($4::boolean = TRUE OR deleted_at IS NULL)
          AND (
              $5::text IS NULL
              OR full_name ILIKE $5 ESCAPE '\'
              OR email ILIKE $5 ESCAPE '\'
          )
        "#,
    )
    .bind(target_role_filter.as_deref())
    .bind(query.approval_status.as_deref())
    .bind(query.is_active)
    .bind(include_deleted)
    .bind(search_pattern.as_deref())
    .fetch_one(&state.pool)
    .await?;

    let has_more = offset + (users.len() as i64) < total;

    Ok(Json(json!({
        "status": "success",
        "data": users,
        "counts": {
            "pending_staff": counts.pending_staff,
            "pending_admin": counts.pending_admin,
            "active_staff": counts.active_staff,
            "active_admin": counts.active_admin,
            "suspended_count": counts.suspended_count
        },
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": has_more
        }
    })))
}

// ============================================================================
// 4. POST /api/v1/auth/management/users/{id}/approve
// ============================================================================
pub async fn handle_approve_management_user(
    State(state): State<AppState>,
    actor: ApprovedManagementActor,
    headers: HeaderMap,
    Path(target_id): Path<Uuid>,
) -> Result<impl IntoResponse, ApiError> {
    if actor.role == ManagementRole::Staff {
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: Staff accounts cannot approve users".to_string(),
        ));
    }

    let client_ip = extract_client_ip(&headers);
    let mut tx = state.pool.begin().await?;

    // 1. Fresh actor verification inside transaction
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct ActorCheck {
        role: String,
        is_active: bool,
        approval_status: String,
        deleted_at: Option<DateTime<Utc>>,
    }

    let actor_check: Option<ActorCheck> = sqlx::query_as(
        r#"
        SELECT role, is_active, approval_status, deleted_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(actor.user_id)
    .fetch_optional(&mut *tx)
    .await?;

    let actor_row = match actor_check {
        Some(r) => r,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::Unauthorized("Acting account not found".to_string()));
        }
    };

    if actor_row.deleted_at.is_some()
        || !actor_row.is_active
        || !actor_row.approval_status.eq_ignore_ascii_case("APPROVED")
    {
        let _ = tx.rollback().await;
        return Err(ApiError::Forbidden(
            "Acting account is not active or approved".to_string(),
        ));
    }

    let live_actor_role = ManagementRole::parse_strict(&actor_row.role).ok_or_else(|| {
        ApiError::Forbidden("Acting account no longer has a management role".to_string())
    })?;

    // 2. Lock target user row FOR UPDATE
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct TargetRow {
        id: Uuid,
        email: String,
        full_name: String,
        role: String,
        approval_status: String,
        is_active: bool,
        deleted_at: Option<DateTime<Utc>>,
    }

    let target_opt: Option<TargetRow> = sqlx::query_as(
        r#"
        SELECT id, email, full_name, role, approval_status, is_active, deleted_at
        FROM users
        WHERE id = $1
        FOR UPDATE
        "#,
    )
    .bind(target_id)
    .fetch_optional(&mut *tx)
    .await?;

    let target = match target_opt {
        Some(t) => t,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::BadRequest("Target user not found".to_string()));
        }
    };

    if target.deleted_at.is_some() {
        let _ = tx.rollback().await;
        return Err(ApiError::BadRequest(
            "Cannot approve a deleted account".to_string(),
        ));
    }

    let target_role = ManagementRole::parse_strict(&target.role).ok_or_else(|| {
        ApiError::BadRequest("Target user is not a management account".to_string())
    })?;

    // 3. Hierarchy verification
    if !can_approve_or_reject(live_actor_role, target_role) {
        let _ = tx.rollback().await;
        return Err(ApiError::Forbidden(
            "Admins can only approve staff accounts; super_admin approval is required for admin accounts"
                .to_string(),
        ));
    }

    // 4. Status verification
    if !target.approval_status.eq_ignore_ascii_case("PENDING") {
        let _ = tx.rollback().await;
        return Err(ApiError::Conflict(
            "Account is not in PENDING status".to_string(),
        ));
    }

    // 5. Update target status
    sqlx::query(
        r#"
        UPDATE users
        SET approval_status = 'APPROVED', approved_by = $2, approved_at = NOW(), is_active = TRUE, updated_at = NOW()
        WHERE id = $1
        "#,
    )
    .bind(target_id)
    .bind(actor.user_id)
    .execute(&mut *tx)
    .await?;

    // 6. Record immutable audit log
    let metadata = json!({
        "target_email": target.email,
        "target_full_name": target.full_name,
        "target_role": target.role,
        "previous_status": "PENDING"
    });

    sqlx::query(
        r#"
        INSERT INTO governance_audit_logs (
            id, actor_id, actor_role, target_user_id, action, metadata, ip_address, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
        "#,
    )
    .bind(actor.user_id)
    .bind(live_actor_role.as_str())
    .bind(target_id)
    .bind(GovernanceAction::ACCOUNT_APPROVED)
    .bind(metadata)
    .bind(client_ip)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    tracing::info!(
        target: "governance::approval",
        actor_id = %actor.user_id,
        target_id = %target_id,
        target_role = %target.role,
        "Account approved successfully"
    );

    Ok(Json(json!({
        "status": "success",
        "message": "User account approved successfully.",
        "data": {
            "id": target_id,
            "email": target.email,
            "full_name": target.full_name,
            "role": target.role,
            "approval_status": "APPROVED",
            "is_active": true
        }
    })))
}

// ============================================================================
// 5. POST /api/v1/auth/management/users/{id}/reject
// ============================================================================
pub async fn handle_reject_management_user(
    State(state): State<AppState>,
    actor: ApprovedManagementActor,
    headers: HeaderMap,
    Path(target_id): Path<Uuid>,
    body: Option<Json<OptionalReasonRequest>>,
) -> Result<impl IntoResponse, ApiError> {
    if actor.role == ManagementRole::Staff {
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: Staff accounts cannot reject users".to_string(),
        ));
    }

    let reason = body.and_then(|b| b.reason.clone()).map(|r| {
        let trimmed = r.trim().to_string();
        if trimmed.len() > 500 {
            trimmed[..500].to_string()
        } else {
            trimmed
        }
    });

    let client_ip = extract_client_ip(&headers);
    let mut tx = state.pool.begin().await?;

    // Actor freshness check
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct ActorCheck {
        role: String,
        is_active: bool,
        approval_status: String,
        deleted_at: Option<DateTime<Utc>>,
    }

    let actor_check: Option<ActorCheck> = sqlx::query_as(
        r#"
        SELECT role, is_active, approval_status, deleted_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(actor.user_id)
    .fetch_optional(&mut *tx)
    .await?;

    let actor_row = match actor_check {
        Some(r) => r,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::Unauthorized("Acting account not found".to_string()));
        }
    };

    if actor_row.deleted_at.is_some()
        || !actor_row.is_active
        || !actor_row.approval_status.eq_ignore_ascii_case("APPROVED")
    {
        let _ = tx.rollback().await;
        return Err(ApiError::Forbidden(
            "Acting account is not active or approved".to_string(),
        ));
    }

    let live_actor_role = ManagementRole::parse_strict(&actor_row.role).ok_or_else(|| {
        ApiError::Forbidden("Acting account no longer has a management role".to_string())
    })?;

    // Lock target FOR UPDATE
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct TargetRow {
        id: Uuid,
        email: String,
        full_name: String,
        role: String,
        approval_status: String,
        is_active: bool,
        deleted_at: Option<DateTime<Utc>>,
    }

    let target_opt: Option<TargetRow> = sqlx::query_as(
        r#"
        SELECT id, email, full_name, role, approval_status, is_active, deleted_at
        FROM users
        WHERE id = $1
        FOR UPDATE
        "#,
    )
    .bind(target_id)
    .fetch_optional(&mut *tx)
    .await?;

    let target = match target_opt {
        Some(t) => t,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::BadRequest("Target user not found".to_string()));
        }
    };

    if target.deleted_at.is_some() {
        let _ = tx.rollback().await;
        return Err(ApiError::BadRequest(
            "Cannot reject a deleted account".to_string(),
        ));
    }

    let target_role = ManagementRole::parse_strict(&target.role).ok_or_else(|| {
        ApiError::BadRequest("Target user is not a management account".to_string())
    })?;

    if !can_approve_or_reject(live_actor_role, target_role) {
        let _ = tx.rollback().await;
        return Err(ApiError::Forbidden(
            "Admins can only reject staff accounts; super_admin rejection is required for admin accounts"
                .to_string(),
        ));
    }

    if !target.approval_status.eq_ignore_ascii_case("PENDING") {
        let _ = tx.rollback().await;
        return Err(ApiError::Conflict(
            "Account is not in PENDING status".to_string(),
        ));
    }

    // Update target
    sqlx::query(
        r#"
        UPDATE users
        SET approval_status = 'REJECTED', is_active = FALSE, updated_at = NOW()
        WHERE id = $1
        "#,
    )
    .bind(target_id)
    .execute(&mut *tx)
    .await?;

    // Purge sessions in database
    sqlx::query("DELETE FROM sessions WHERE user_id = $1")
        .bind(target_id)
        .execute(&mut *tx)
        .await?;

    // Record audit log
    let metadata = json!({
        "target_email": target.email,
        "target_full_name": target.full_name,
        "target_role": target.role,
        "reason": reason
    });

    sqlx::query(
        r#"
        INSERT INTO governance_audit_logs (
            id, actor_id, actor_role, target_user_id, action, metadata, ip_address, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
        "#,
    )
    .bind(actor.user_id)
    .bind(live_actor_role.as_str())
    .bind(target_id)
    .bind(GovernanceAction::ACCOUNT_REJECTED)
    .bind(metadata)
    .bind(client_ip)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    // Post-commit immediate L1 RAM cache invalidation
    state
        .cache
        .revoke_all_user_sessions(target_id, Utc::now().timestamp())
        .await;

    tracing::info!(
        target: "governance::reject",
        actor_id = %actor.user_id,
        target_id = %target_id,
        "Account rejected and sessions purged"
    );

    Ok(Json(json!({
        "status": "success",
        "message": "User account rejected and sessions revoked.",
        "data": {
            "id": target_id,
            "approval_status": "REJECTED",
            "is_active": false
        }
    })))
}

// ============================================================================
// 6. POST /api/v1/auth/management/users/{id}/suspend (super_admin only)
// ============================================================================
pub async fn handle_suspend_management_user(
    State(state): State<AppState>,
    actor: ApprovedManagementActor,
    headers: HeaderMap,
    Path(target_id): Path<Uuid>,
    body: Option<Json<OptionalReasonRequest>>,
) -> Result<impl IntoResponse, ApiError> {
    if actor.role != ManagementRole::SuperAdmin {
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: SuperAdmin authority required to suspend accounts"
                .to_string(),
        ));
    }

    let reason = body.and_then(|b| b.reason.clone()).map(|r| {
        let trimmed = r.trim().to_string();
        if trimmed.len() > 500 {
            trimmed[..500].to_string()
        } else {
            trimmed
        }
    });

    let client_ip = extract_client_ip(&headers);
    let mut tx = state.pool.begin().await?;

    // Actor freshness
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct ActorCheck {
        role: String,
        is_active: bool,
        approval_status: String,
        deleted_at: Option<DateTime<Utc>>,
    }

    let actor_check: Option<ActorCheck> = sqlx::query_as(
        r#"
        SELECT role, is_active, approval_status, deleted_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(actor.user_id)
    .fetch_optional(&mut *tx)
    .await?;

    let actor_row = match actor_check {
        Some(r) => r,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::Unauthorized("Acting account not found".to_string()));
        }
    };

    if actor_row.deleted_at.is_some()
        || !actor_row.is_active
        || !actor_row.approval_status.eq_ignore_ascii_case("APPROVED")
        || actor_row.role != "super_admin"
    {
        let _ = tx.rollback().await;
        return Err(ApiError::Forbidden(
            "Acting account is not an active, approved super_admin".to_string(),
        ));
    }

    // Lock target FOR UPDATE
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct TargetRow {
        id: Uuid,
        email: String,
        full_name: String,
        role: String,
        approval_status: String,
        is_active: bool,
        deleted_at: Option<DateTime<Utc>>,
    }

    let target_opt: Option<TargetRow> = sqlx::query_as(
        r#"
        SELECT id, email, full_name, role, approval_status, is_active, deleted_at
        FROM users
        WHERE id = $1
        FOR UPDATE
        "#,
    )
    .bind(target_id)
    .fetch_optional(&mut *tx)
    .await?;

    let target = match target_opt {
        Some(t) => t,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::BadRequest("Target user not found".to_string()));
        }
    };

    if target.deleted_at.is_some() {
        let _ = tx.rollback().await;
        return Err(ApiError::BadRequest(
            "Cannot suspend a deleted account".to_string(),
        ));
    }

    let target_role = ManagementRole::parse_strict(&target.role).ok_or_else(|| {
        ApiError::BadRequest("Target user is not a management account".to_string())
    })?;

    if !can_suspend_reactivate_or_delete(
        ManagementRole::SuperAdmin,
        actor.user_id,
        target_role,
        target_id,
    ) {
        let _ = tx.rollback().await;
        if actor.user_id == target_id {
            return Err(ApiError::Forbidden(
                "Cannot suspend your own account".to_string(),
            ));
        }
        if target_role == ManagementRole::SuperAdmin {
            return Err(ApiError::Forbidden(
                "SuperAdmin accounts cannot be suspended".to_string(),
            ));
        }
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: Action not permitted".to_string(),
        ));
    }

    if !target.is_active {
        let _ = tx.rollback().await;
        return Err(ApiError::Conflict(
            "Account is already suspended".to_string(),
        ));
    }

    // Update target
    sqlx::query(
        r#"
        UPDATE users
        SET is_active = FALSE, suspended_by = $2, suspended_at = NOW(), updated_at = NOW()
        WHERE id = $1
        "#,
    )
    .bind(target_id)
    .bind(actor.user_id)
    .execute(&mut *tx)
    .await?;

    // Purge sessions in database
    sqlx::query("DELETE FROM sessions WHERE user_id = $1")
        .bind(target_id)
        .execute(&mut *tx)
        .await?;

    // Record audit log
    let metadata = json!({
        "target_email": target.email,
        "target_full_name": target.full_name,
        "target_role": target.role,
        "reason": reason
    });

    sqlx::query(
        r#"
        INSERT INTO governance_audit_logs (
            id, actor_id, actor_role, target_user_id, action, metadata, ip_address, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
        "#,
    )
    .bind(actor.user_id)
    .bind(ManagementRole::SuperAdmin.as_str())
    .bind(target_id)
    .bind(GovernanceAction::ACCOUNT_SUSPENDED)
    .bind(metadata)
    .bind(client_ip)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    // Post-commit immediate L1 RAM cache invalidation
    state
        .cache
        .revoke_all_user_sessions(target_id, Utc::now().timestamp())
        .await;

    tracing::info!(
        target: "governance::suspend",
        actor_id = %actor.user_id,
        target_id = %target_id,
        "Account suspended and sessions purged"
    );

    Ok(Json(json!({
        "status": "success",
        "message": "User account suspended and active sessions revoked.",
        "data": {
            "id": target_id,
            "is_active": false
        }
    })))
}

// ============================================================================
// 7. POST /api/v1/auth/management/users/{id}/reactivate (super_admin only)
// ============================================================================
pub async fn handle_reactivate_management_user(
    State(state): State<AppState>,
    actor: ApprovedManagementActor,
    headers: HeaderMap,
    Path(target_id): Path<Uuid>,
) -> Result<impl IntoResponse, ApiError> {
    if actor.role != ManagementRole::SuperAdmin {
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: SuperAdmin authority required to reactivate accounts"
                .to_string(),
        ));
    }

    let client_ip = extract_client_ip(&headers);
    let mut tx = state.pool.begin().await?;

    // Actor freshness
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct ActorCheck {
        role: String,
        is_active: bool,
        approval_status: String,
        deleted_at: Option<DateTime<Utc>>,
    }

    let actor_check: Option<ActorCheck> = sqlx::query_as(
        r#"
        SELECT role, is_active, approval_status, deleted_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(actor.user_id)
    .fetch_optional(&mut *tx)
    .await?;

    let actor_row = match actor_check {
        Some(r) => r,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::Unauthorized("Acting account not found".to_string()));
        }
    };

    if actor_row.deleted_at.is_some()
        || !actor_row.is_active
        || !actor_row.approval_status.eq_ignore_ascii_case("APPROVED")
        || actor_row.role != "super_admin"
    {
        let _ = tx.rollback().await;
        return Err(ApiError::Forbidden(
            "Acting account is not an active, approved super_admin".to_string(),
        ));
    }

    // Lock target FOR UPDATE
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct TargetRow {
        id: Uuid,
        email: String,
        full_name: String,
        role: String,
        approval_status: String,
        is_active: bool,
        deleted_at: Option<DateTime<Utc>>,
    }

    let target_opt: Option<TargetRow> = sqlx::query_as(
        r#"
        SELECT id, email, full_name, role, approval_status, is_active, deleted_at
        FROM users
        WHERE id = $1
        FOR UPDATE
        "#,
    )
    .bind(target_id)
    .fetch_optional(&mut *tx)
    .await?;

    let target = match target_opt {
        Some(t) => t,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::BadRequest("Target user not found".to_string()));
        }
    };

    if target.deleted_at.is_some() {
        let _ = tx.rollback().await;
        return Err(ApiError::BadRequest(
            "Cannot reactivate a deleted account".to_string(),
        ));
    }

    let target_role = ManagementRole::parse_strict(&target.role).ok_or_else(|| {
        ApiError::BadRequest("Target user is not a management account".to_string())
    })?;

    if !can_suspend_reactivate_or_delete(
        ManagementRole::SuperAdmin,
        actor.user_id,
        target_role,
        target_id,
    ) {
        let _ = tx.rollback().await;
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: Action not permitted".to_string(),
        ));
    }

    if target.is_active && target.approval_status.eq_ignore_ascii_case("APPROVED") {
        let _ = tx.rollback().await;
        return Err(ApiError::Conflict(
            "Account is already active and approved".to_string(),
        ));
    }

    // Update target
    sqlx::query(
        r#"
        UPDATE users
        SET is_active = TRUE, suspended_by = NULL, suspended_at = NULL, updated_at = NOW()
        WHERE id = $1
        "#,
    )
    .bind(target_id)
    .execute(&mut *tx)
    .await?;

    // Record audit log
    let metadata = json!({
        "target_email": target.email,
        "target_full_name": target.full_name,
        "target_role": target.role
    });

    sqlx::query(
        r#"
        INSERT INTO governance_audit_logs (
            id, actor_id, actor_role, target_user_id, action, metadata, ip_address, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
        "#,
    )
    .bind(actor.user_id)
    .bind(ManagementRole::SuperAdmin.as_str())
    .bind(target_id)
    .bind(GovernanceAction::ACCOUNT_REACTIVATED)
    .bind(metadata)
    .bind(client_ip)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    tracing::info!(
        target: "governance::reactivate",
        actor_id = %actor.user_id,
        target_id = %target_id,
        "Account reactivated successfully"
    );

    Ok(Json(json!({
        "status": "success",
        "message": "User account reactivated successfully.",
        "data": {
            "id": target_id,
            "is_active": true
        }
    })))
}

// ============================================================================
// 8. DELETE /api/v1/auth/management/users/{id} (super_admin only)
// ============================================================================
pub async fn handle_delete_management_user(
    State(state): State<AppState>,
    actor: ApprovedManagementActor,
    headers: HeaderMap,
    Path(target_id): Path<Uuid>,
) -> Result<impl IntoResponse, ApiError> {
    if actor.role != ManagementRole::SuperAdmin {
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: SuperAdmin authority required to delete accounts"
                .to_string(),
        ));
    }

    let client_ip = extract_client_ip(&headers);
    let mut tx = state.pool.begin().await?;

    // Actor freshness
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct ActorCheck {
        role: String,
        is_active: bool,
        approval_status: String,
        deleted_at: Option<DateTime<Utc>>,
    }

    let actor_check: Option<ActorCheck> = sqlx::query_as(
        r#"
        SELECT role, is_active, approval_status, deleted_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(actor.user_id)
    .fetch_optional(&mut *tx)
    .await?;

    let actor_row = match actor_check {
        Some(r) => r,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::Unauthorized("Acting account not found".to_string()));
        }
    };

    if actor_row.deleted_at.is_some()
        || !actor_row.is_active
        || !actor_row.approval_status.eq_ignore_ascii_case("APPROVED")
        || actor_row.role != "super_admin"
    {
        let _ = tx.rollback().await;
        return Err(ApiError::Forbidden(
            "Acting account is not an active, approved super_admin".to_string(),
        ));
    }

    // Lock target FOR UPDATE
    #[derive(sqlx::FromRow)]
    #[allow(dead_code)]
    struct TargetRow {
        id: Uuid,
        email: String,
        full_name: String,
        role: String,
        approval_status: String,
        is_active: bool,
        deleted_at: Option<DateTime<Utc>>,
    }

    let target_opt: Option<TargetRow> = sqlx::query_as(
        r#"
        SELECT id, email, full_name, role, approval_status, is_active, deleted_at
        FROM users
        WHERE id = $1
        FOR UPDATE
        "#,
    )
    .bind(target_id)
    .fetch_optional(&mut *tx)
    .await?;

    let target = match target_opt {
        Some(t) => t,
        None => {
            let _ = tx.rollback().await;
            return Err(ApiError::BadRequest("Target user not found".to_string()));
        }
    };

    if target.deleted_at.is_some() {
        let _ = tx.rollback().await;
        return Err(ApiError::BadRequest(
            "Account has already been deleted".to_string(),
        ));
    }

    let target_role = ManagementRole::parse_strict(&target.role).ok_or_else(|| {
        ApiError::BadRequest("Target user is not a management account".to_string())
    })?;

    if !can_suspend_reactivate_or_delete(
        ManagementRole::SuperAdmin,
        actor.user_id,
        target_role,
        target_id,
    ) {
        let _ = tx.rollback().await;
        if actor.user_id == target_id {
            return Err(ApiError::Forbidden(
                "Cannot delete your own account".to_string(),
            ));
        }
        if target_role == ManagementRole::SuperAdmin {
            return Err(ApiError::Forbidden(
                "SuperAdmin accounts cannot be deleted".to_string(),
            ));
        }
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: Action not permitted".to_string(),
        ));
    }

    // Execute soft delete
    sqlx::query(
        r#"
        UPDATE users
        SET deleted_at = NOW(), is_active = FALSE, suspended_by = $2, suspended_at = COALESCE(suspended_at, NOW()), updated_at = NOW()
        WHERE id = $1
        "#,
    )
    .bind(target_id)
    .bind(actor.user_id)
    .execute(&mut *tx)
    .await?;

    // Purge sessions in database
    sqlx::query("DELETE FROM sessions WHERE user_id = $1")
        .bind(target_id)
        .execute(&mut *tx)
        .await?;

    // Record audit log
    let metadata = json!({
        "target_email": target.email,
        "target_full_name": target.full_name,
        "target_role": target.role
    });

    sqlx::query(
        r#"
        INSERT INTO governance_audit_logs (
            id, actor_id, actor_role, target_user_id, action, metadata, ip_address, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
        "#,
    )
    .bind(actor.user_id)
    .bind(ManagementRole::SuperAdmin.as_str())
    .bind(target_id)
    .bind(GovernanceAction::ACCOUNT_DELETED)
    .bind(metadata)
    .bind(client_ip)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    // Post-commit immediate L1 RAM cache invalidation
    state
        .cache
        .revoke_all_user_sessions(target_id, Utc::now().timestamp())
        .await;

    tracing::info!(
        target: "governance::delete",
        actor_id = %actor.user_id,
        target_id = %target_id,
        "Account soft-deleted and sessions purged"
    );

    Ok(Json(json!({
        "status": "success",
        "message": "User account soft-deleted and active sessions revoked.",
        "data": {
            "id": target_id,
            "deleted": true
        }
    })))
}

// ============================================================================
// 9. GET /api/v1/auth/management/audit-logs (super_admin only)
// ============================================================================
pub async fn handle_get_audit_logs(
    State(state): State<AppState>,
    actor: ApprovedManagementActor,
    Query(query): Query<ListAuditLogsQuery>,
) -> Result<impl IntoResponse, ApiError> {
    if actor.role != ManagementRole::SuperAdmin {
        return Err(ApiError::Forbidden(
            "INSUFFICIENT_PERMISSIONS: SuperAdmin authority required to access governance audit logs"
                .to_string(),
        ));
    }

    if let Some(ref act) = query.action {
        if !GovernanceAction::is_valid(act) {
            return Err(ApiError::BadRequest("Invalid governance action filter".to_string()));
        }
    }

    let limit = query.limit.unwrap_or(25).clamp(1, 100);
    let offset = query.offset.unwrap_or(0).max(0);

    let logs: Vec<AuditLogRow> = sqlx::query_as(
        r#"
        SELECT
            l.id,
            l.actor_id,
            l.actor_role,
            l.target_user_id,
            l.action,
            l.metadata,
            l.ip_address,
            l.created_at,
            ua.full_name AS actor_name,
            ua.email AS actor_email,
            ut.full_name AS target_name,
            ut.email AS target_email
        FROM governance_audit_logs l
        LEFT JOIN users ua ON l.actor_id = ua.id
        LEFT JOIN users ut ON l.target_user_id = ut.id
        WHERE ($1::text IS NULL OR l.action = $1)
          AND ($2::uuid IS NULL OR l.actor_id = $2)
          AND ($3::uuid IS NULL OR l.target_user_id = $3)
        ORDER BY l.created_at DESC
        LIMIT $4 OFFSET $5
        "#,
    )
    .bind(query.action.as_deref())
    .bind(query.actor_id)
    .bind(query.target_user_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.pool)
    .await?;

    let total: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM governance_audit_logs l
        WHERE ($1::text IS NULL OR l.action = $1)
          AND ($2::uuid IS NULL OR l.actor_id = $2)
          AND ($3::uuid IS NULL OR l.target_user_id = $3)
        "#,
    )
    .bind(query.action.as_deref())
    .bind(query.actor_id)
    .bind(query.target_user_id)
    .fetch_one(&state.pool)
    .await?;

    let has_more = offset + (logs.len() as i64) < total;

    Ok(Json(json!({
        "status": "success",
        "data": logs,
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": has_more
        }
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_management_signup_request_valid() {
        let valid_json = r#"{
            "full_name": "Dr. Sarah Connor",
            "email": "sarah@healher.org",
            "password": "Password123!",
            "requested_role": "staff"
        }"#;

        let req: ManagementSignupRequest = serde_json::from_str(valid_json).expect("Deserialization must succeed");
        assert!(req.validate().is_ok());
        assert_eq!(req.requested_role, "staff");
    }

    #[test]
    fn test_management_signup_unknown_fields_rejected() {
        let json_with_extra = r#"{
            "full_name": "Dr. Sarah Connor",
            "email": "sarah@healher.org",
            "password": "Password123!",
            "requested_role": "staff",
            "malicious_role": "super_admin"
        }"#;

        let res: Result<ManagementSignupRequest, _> = serde_json::from_str(json_with_extra);
        assert!(res.is_err(), "Must reject unknown fields");
    }

    #[test]
    fn test_management_signup_validation_failures() {
        // Short password
        let short_pwd = ManagementSignupRequest {
            full_name: "Sarah".to_string(),
            email: "sarah@healher.org".to_string(),
            password: "short".to_string(),
            requested_role: "staff".to_string(),
            bot_trap: None,
        };
        assert!(short_pwd.validate().is_err());

        // Invalid email
        let bad_email = ManagementSignupRequest {
            full_name: "Sarah".to_string(),
            email: "not-an-email".to_string(),
            password: "SecurePassword123!".to_string(),
            requested_role: "staff".to_string(),
            bot_trap: None,
        };
        assert!(bad_email.validate().is_err());

        // Short full_name
        let short_name = ManagementSignupRequest {
            full_name: "S".to_string(),
            email: "sarah@healher.org".to_string(),
            password: "SecurePassword123!".to_string(),
            requested_role: "staff".to_string(),
            bot_trap: None,
        };
        assert!(short_name.validate().is_err());
    }

    #[test]
    fn test_optional_reason_unknown_fields_rejected() {
        let json_with_extra = r#"{"reason": "Valid reason", "unexpected": true}"#;
        let res: Result<OptionalReasonRequest, _> = serde_json::from_str(json_with_extra);
        assert!(res.is_err(), "Must reject unknown fields on reason payload");
    }
}
