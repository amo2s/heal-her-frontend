use chrono::{DateTime, Utc};
use sqlx::PgPool;
use subtle::ConstantTimeEq;
use uuid::Uuid;
use crate::error::InternalAuthError;

/// Database record mapping the `sessions` PostgreSQL table.
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct SessionRecord {
    pub id: Uuid,
    pub user_id: Uuid,
    pub family_id: Uuid,
    pub refresh_token_hash: String,
    pub is_revoked: bool,
    pub expires_at: DateTime<Utc>,
}

/// Outcome of an atomic session rotation attempt.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RotationOutcome {
    Success,
    Compromised { family_id: Uuid },
    InvalidOrExpired,
}

/// Parameters for creating a new session within an atomic rotation transaction.
#[derive(Debug, Clone)]
pub struct NewSessionParams<'a> {
    pub new_session_id: Uuid,
    pub user_id: Uuid,
    pub family_id: Uuid,
    pub new_refresh_token_hash: &'a str,
    pub user_agent: Option<&'a str>,
    pub ip_address: Option<&'a str>,
    pub new_expires_at: DateTime<Utc>,
}

/// Inserts a new stateful session into the PostgreSQL sessions table.
pub async fn create_session(
    pool: &PgPool,
    session_id: Uuid,
    user_id: Uuid,
    family_id: Uuid,
    refresh_token_hash: &str,
    user_agent: Option<&str>,
    ip_address: Option<&str>,
    expires_at: DateTime<Utc>,
) -> Result<(), InternalAuthError> {
    sqlx::query(
        r#"
        INSERT INTO sessions (
            id, user_id, family_id, refresh_token_hash, is_revoked, user_agent, ip_address, created_at, expires_at
        )
        VALUES ($1, $2, $3, $4, FALSE, $5, $6, NOW(), $7)
        "#,
    )
    .bind(session_id)
    .bind(user_id)
    .bind(family_id)
    .bind(refresh_token_hash)
    .bind(user_agent)
    .bind(ip_address)
    .bind(expires_at)
    .execute(pool)
    .await?;

    Ok(())
}

/// Executes an atomic, race-condition-safe Refresh Token Rotation with automatic replay/theft detection.
pub async fn rotate_session_atomic(
    pool: &PgPool,
    old_session_id: Uuid,
    expected_family_id: Uuid,
    user_id: Uuid,
    presented_token_hash: &str,
    new_session: &NewSessionParams<'_>,
) -> Result<RotationOutcome, sqlx::Error> {
    let mut tx = pool.begin().await?;

    // Lock target session row
    let row_opt: Option<SessionRecord> = sqlx::query_as(
        r#"
        SELECT id, user_id, family_id, refresh_token_hash, is_revoked, expires_at
        FROM sessions
        WHERE id = $1 AND user_id = $2
        FOR UPDATE
        "#,
    )
    .bind(old_session_id)
    .bind(user_id)
    .fetch_optional(&mut *tx)
    .await?;

    match row_opt {
        None => {
            // Case 1: Row Not Found by (old_session_id, user_id).
            // Check if a revoked row exists with refresh_token_hash = presented_token_hash
            #[derive(sqlx::FromRow)]
            struct RevokedRow {
                family_id: Uuid,
                is_revoked: bool,
            }

            let hash_row: Option<RevokedRow> = sqlx::query_as(
                r#"
                SELECT family_id, is_revoked
                FROM sessions
                WHERE refresh_token_hash = $1
                FOR UPDATE
                "#,
            )
            .bind(presented_token_hash)
            .fetch_optional(&mut *tx)
            .await?;

            if let Some(revoked_row) = hash_row {
                if revoked_row.is_revoked {
                    // Confirmed theft! Delete entire session family
                    sqlx::query(
                        r#"DELETE FROM sessions WHERE family_id = $1"#
                    )
                    .bind(revoked_row.family_id)
                    .execute(&mut *tx)
                    .await?;

                    tx.commit().await?;
                    return Ok(RotationOutcome::Compromised { family_id: revoked_row.family_id });
                }
            }

            tx.commit().await?;
            Ok(RotationOutcome::InvalidOrExpired)
        }
        Some(row) => {
            // Case 2: Row Found
            let hash_match = bool::from(
                row.refresh_token_hash.as_bytes().ct_eq(presented_token_hash.as_bytes())
            );
            let family_match = row.family_id == expected_family_id;
            let user_match = row.user_id == user_id;

            if row.is_revoked || !hash_match || !family_match || !user_match {
                // Theft or replay attempt detected! Purge entire session family
                sqlx::query(
                    r#"DELETE FROM sessions WHERE family_id = $1"#
                )
                .bind(row.family_id)
                .execute(&mut *tx)
                .await?;

                tx.commit().await?;
                return Ok(RotationOutcome::Compromised { family_id: row.family_id });
            }

            if row.expires_at <= Utc::now() {
                // Expired session
                sqlx::query(
                    r#"DELETE FROM sessions WHERE id = $1"#
                )
                .bind(row.id)
                .execute(&mut *tx)
                .await?;

                tx.commit().await?;
                return Ok(RotationOutcome::InvalidOrExpired);
            }

            // Valid rotation:
            // 1. Mark current session as revoked/rotated
            sqlx::query(
                r#"UPDATE sessions SET is_revoked = TRUE WHERE id = $1"#
            )
            .bind(row.id)
            .execute(&mut *tx)
            .await?;

            // 2. Insert new session row
            sqlx::query(
                r#"
                INSERT INTO sessions (
                    id, user_id, family_id, refresh_token_hash, is_revoked, user_agent, ip_address, created_at, expires_at
                )
                VALUES ($1, $2, $3, $4, FALSE, $5, $6, NOW(), $7)
                "#
            )
            .bind(new_session.new_session_id)
            .bind(new_session.user_id)
            .bind(new_session.family_id)
            .bind(new_session.new_refresh_token_hash)
            .bind(new_session.user_agent)
            .bind(new_session.ip_address)
            .bind(new_session.new_expires_at)
            .execute(&mut *tx)
            .await?;

            tx.commit().await?;
            Ok(RotationOutcome::Success)
        }
    }
}

/// Deletes all sessions belonging to a specific family for a given user.
pub async fn delete_session_family(pool: &PgPool, family_id: Uuid, user_id: Uuid) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        DELETE FROM sessions
        WHERE family_id = $1 AND user_id = $2
        "#,
    )
    .bind(family_id)
    .bind(user_id)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}

/// Deletes all sessions for a user across all devices.
pub async fn delete_all_user_sessions(pool: &PgPool, user_id: Uuid) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        DELETE FROM sessions
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}

/// Deletes a specific session by its refresh token hash.
pub async fn delete_session_by_hash(pool: &PgPool, token_hash: &str) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        DELETE FROM sessions
        WHERE refresh_token_hash = $1
        "#,
    )
    .bind(token_hash)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}
