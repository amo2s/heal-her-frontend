use askama::Template;
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

/// Compile-Time Type-Safe Email Template for Password Reset OTP.
/// Verified during `cargo build` against `templates/reset_otp.html`.
#[derive(Template)]
#[template(path = "reset_otp.html")]
pub struct ResetOtpTemplate<'a> {
    pub recipient_name: &'a str,
    pub otp_code: &'a str,
    pub expiry_minutes: u8,
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

    let template = ResetOtpTemplate {
        recipient_name,
        otp_code,
        expiry_minutes: 10,
    };

    let html_body = match template.render() {
        Ok(html) => html,
        Err(e) => {
            tracing::error!(
                target: "auth::mailer",
                error = ?e,
                "Failed to render Askama email template"
            );
            return; // Abort silently so the async task doesn't panic
        }
    };

    let payload = serde_json::json!({
        "recipient": email,
        "subject": "Heal Her - Secure Authorization Code",
        "html_body": html_body
    });

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

    #[test]
    fn test_reset_otp_template_rendering() {
        let template = ResetOtpTemplate {
            recipient_name: "Jane Doe",
            otp_code: "987654",
            expiry_minutes: 10,
        };
        let html = template
            .render()
            .expect("Askama template should render successfully");
        assert!(html.contains("Hello Jane Doe,"));
        assert!(html.contains("987654"));
        assert!(html.contains("10 minutes"));
        assert!(html.contains("Heal <span style=\"color: #DA8CA0;\">Her</span>"));
    }

    #[tokio::test]
    async fn test_send_reset_otp_email_missing_env() {
        // Without GOOGLE_MAILER_WEBHOOK_URL set, function returns gracefully without panic
        std::env::remove_var("GOOGLE_MAILER_WEBHOOK_URL");
        send_reset_otp_email("test@example.com", "Test User", "123456").await;
    }
}
