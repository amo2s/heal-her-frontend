use serde::{Deserialize, Serialize};
use validator::Validate;

/// Strict credentials payload validated at the API perimeter.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email(message = "email must be a valid email address"))]
    pub email: String,

    #[validate(length(min = 8, message = "password must be at least 8 characters long"))]
    pub password: String,

    /// Honeypot trap field; automated bots that fill this will be silently dropped with 401
    pub bot_trap: Option<String>,
}

/// Sanitized user entity representation exposed in authentication responses.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct UserType {
    pub id: String,
    pub email: String,
    #[serde(rename = "fullName")]
    pub full_name: String,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    pub dashboard: String,
}

/// Successful authentication response returned to the Next.js gateway / client.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LoginResponse {
    pub status: String,
    pub message: String,
    #[serde(rename = "accessToken")]
    pub access_token: String,
    #[serde(rename = "refreshToken")]
    pub refresh_token: String,
    pub user: UserType,
}

/// Request payload for token refresh endpoint.
#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RefreshRequest {
    #[serde(alias = "refresh_token")]
    pub refresh_token: Option<String>,
}

/// Request payload for session termination (logout).
#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LogoutRequest {
    #[serde(default, alias = "all_devices")]
    pub all_devices: bool,
    #[serde(alias = "refresh_token")]
    pub refresh_token: Option<String>,
}

/// Response payload for session termination (logout).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LogoutResponse {
    pub status: String,
    pub message: String,
    pub mode: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_login_request_validation() {
        // Valid login request
        let valid = LoginRequest {
            email: "user@example.com".to_string(),
            password: "secure_password_123".to_string(),
            bot_trap: None,
        };
        assert!(valid.validate().is_ok());

        // Invalid email
        let invalid_email = LoginRequest {
            email: "not-an-email".to_string(),
            password: "secure_password_123".to_string(),
            bot_trap: None,
        };
        assert!(invalid_email.validate().is_err());

        // Short password (< 8 chars)
        let short_pwd = LoginRequest {
            email: "user@example.com".to_string(),
            password: "short".to_string(),
            bot_trap: None,
        };
        assert!(short_pwd.validate().is_err());
    }

    #[test]
    fn test_logout_request_deserialization() {
        // Empty payload
        let req: LogoutRequest = serde_json::from_str("{}").unwrap();
        assert!(!req.all_devices);
        assert!(req.refresh_token.is_none());

        // CamelCase allDevices: true
        let req: LogoutRequest =
            serde_json::from_str(r#"{"allDevices": true, "refreshToken": "test_tok"}"#).unwrap();
        assert!(req.all_devices);
        assert_eq!(req.refresh_token.as_deref(), Some("test_tok"));

        // Snake_case all_devices: true
        let req: LogoutRequest =
            serde_json::from_str(r#"{"all_devices": true, "refresh_token": "test_tok"}"#).unwrap();
        assert!(req.all_devices);
        assert_eq!(req.refresh_token.as_deref(), Some("test_tok"));
    }

    #[test]
    fn test_constant_time_comparison() {
        use subtle::ConstantTimeEq;
        let h1 = crate::infrastructure::jwt::hash_refresh_token("token_a");
        let h2 = crate::infrastructure::jwt::hash_refresh_token("token_a");
        let h3 = crate::infrastructure::jwt::hash_refresh_token("token_b");

        assert!(bool::from(h1.as_bytes().ct_eq(h2.as_bytes())));
        assert!(!bool::from(h1.as_bytes().ct_eq(h3.as_bytes())));
    }
}
