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
}
