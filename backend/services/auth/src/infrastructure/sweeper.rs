use sqlx::PgPool;
use std::time::Duration;

/// Purges expired or revoked sessions in bounded batches of 1,000 rows
/// using FOR UPDATE SKIP LOCKED to prevent table-level lock contention under high concurrent load.
pub async fn sweep_expired_sessions(pool: &PgPool) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        DELETE FROM sessions
        WHERE id IN (
            SELECT id FROM sessions
            WHERE expires_at < NOW()
               OR (is_revoked = TRUE AND expires_at < NOW() + INTERVAL '6 days')
            LIMIT 1000
            FOR UPDATE SKIP LOCKED
        )
        "#,
    )
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}

/// Continuous background worker that wakes up every 15 minutes (900s)
/// and sweeps expired/revoked sessions from the database.
pub async fn start_session_sweeper(pool: PgPool) {
    let mut ticker = tokio::time::interval(Duration::from_secs(900));
    // Consume initial tick so the first interval wait occurs naturally
    ticker.tick().await;

    tracing::info!("Session sweeper background worker started (interval: 15 minutes)");

    loop {
        ticker.tick().await;

        match sweep_expired_sessions(&pool).await {
            Ok(count) => {
                if count > 0 {
                    tracing::info!(swept_sessions = count, "Session sweeper purged expired/revoked sessions");
                } else {
                    tracing::debug!("Session sweeper executed: 0 sessions needed purging");
                }
            }
            Err(err) => {
                tracing::error!(error = ?err, "Session sweeper encountered error while purging sessions");
            }
        }
    }
}

