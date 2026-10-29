use serde::Serialize;
use std::sync::OnceLock;
use std::time::Duration;

static HTTP_CLIENT: OnceLock<reqwest::Client> = OnceLock::new();

fn get_mailer_client() -> &'static reqwest::Client {
    HTTP_CLIENT.get_or_init(|| {
        reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .unwrap_or_else(|err| {
                tracing::error!(
                    target: "auth::mailer",
                    error = %err,
                    "Failed to build HTTP client; falling back to default"
                );
                reqwest::Client::new()
            })
    })
}

#[derive(Serialize)]
struct MailerPayload<'a> {
    recipient: &'a str,
    subject: &'static str,
    html_body: String,
}

pub async fn send_reset_otp_email(email: &str, recipient_name: &str, otp_code: &str) {
    let webhook_url = match std::env::var("GOOGLE_MAILER_WEBHOOK_URL") {
        Ok(url) if !url.trim().is_empty() => url,
        _ => {
            tracing::warn!(
                target: "auth::mailer",
                recipient = %email,
                "GOOGLE_MAILER_WEBHOOK_URL environment variable is not configured. Reset OTP email dispatch skipped."
            );
            return;
        }
    };

    let html_body = format!(
        "<h1>Heal Her Account Recovery</h1><p>Hello {}, your secure code is: <b>{}</b></p><p>This code expires in 10 minutes.</p>",
        recipient_name, otp_code
    );

    let payload = MailerPayload {
        recipient: email,
        subject: "Heal Her - Secure Authorization Code",
        html_body,
    };

    let client = get_mailer_client();
    match client.post(&webhook_url).json(&payload).send().await {
        Ok(response) => {
            if response.status().is_success() {
                tracing::info!(
                    target: "auth::mailer",
                    recipient = %email,
                    status = %response.status(),
                    "Reset OTP email successfully dispatched via Google Mailer Webhook"
                );
            } else {
                tracing::error!(
                    target: "auth::mailer",
                    recipient = %email,
                    status = %response.status(),
                    "Google Mailer Webhook returned non-success HTTP status"
                );
            }
        }
        Err(err) => {
            tracing::error!(
                target: "auth::mailer",
                recipient = %email,
                error = %err,
                "Failed to dispatch reset OTP email via Google Mailer Webhook"
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_send_reset_otp_email_missing_env() {
        // Without GOOGLE_MAILER_WEBHOOK_URL set, function returns gracefully without panic
        std::env::remove_var("GOOGLE_MAILER_WEBHOOK_URL");
        send_reset_otp_email("test@example.com", "Test User", "123456").await;
    }
}

