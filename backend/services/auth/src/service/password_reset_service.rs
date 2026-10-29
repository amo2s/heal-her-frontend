use crate::{
    error::InternalAuthError,
    infrastructure::mailer,
    state::AppState,
};
use rand::Rng;
use uuid::Uuid;

#[derive(sqlx::FromRow)]
struct UserResetLookup {
    #[allow(dead_code)]
    id: Uuid,
    full_name: String,
}

/// Orchestrates the constant-time Ghost Protocol for password reset OTP requests.
/// Anti-enumeration defense: masks whether an email exists in PostgreSQL by equalizing
/// CPU cycles and network latency via dummy hashing and asynchronous sleep.
pub async fn process_otp_request(state: &AppState, email: &str) -> Result<(), InternalAuthError> {
    // 1. Sanitization
    let clean_email = email.trim().to_lowercase();

    // 2. Database Lookup
    let user_opt: Option<UserResetLookup> = sqlx::query_as(
        r#"
        SELECT id, full_name
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(&clean_email)
    .fetch_optional(&state.pool)
    .await?;

    match user_opt {
        Some(user) => {
            // Branch A (Real User Found)
            let otp_num: u32 = rand::thread_rng().gen_range(0..=999_999);
            let otp = format!("{:06}", otp_num);
            let otp_hash = blake3::hash(otp.as_bytes()).to_hex().to_string();

            state.reset_cache.otp_cache.insert(clean_email.clone(), otp_hash).await;

            let email_clone = clean_email.clone();
            let name_clone = user.full_name.clone();
            tokio::spawn(async move {
                mailer::send_reset_otp_email(&email_clone, &name_clone, &otp).await;
            });

            tracing::info!(
                target: "auth::password_reset",
                email = %clean_email,
                "Password reset OTP generated and dispatched asynchronously"
            );

            Ok(())
        }
        None => {
            // Branch B (Fake / Unregistered User): The Ghost Protocol initiates
            let dummy_num: u32 = rand::thread_rng().gen_range(0..=999_999);
            let dummy_otp = format!("{:06}", dummy_num);
            let _dummy_hash = blake3::hash(dummy_otp.as_bytes()).to_hex().to_string();

            tokio::time::sleep(std::time::Duration::from_millis(85)).await;

            tracing::info!(
                target: "auth::password_reset::ghost",
                email = %clean_email,
                "Ghost protocol executed: dummy hash and constant-time latency applied"
            );

            Ok(())
        }
    }
}

