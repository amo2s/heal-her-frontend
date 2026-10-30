use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct SignupRequest {
    #[validate(email(message = "email must be a syntactically valid email address"))]
    pub email: String,

    #[validate(length(min = 8, message = "password must be at least 8 characters long"))]
    pub password: String,

    #[validate(length(
        min = 2,
        max = 100,
        message = "full_name must be between 2 and 100 characters"
    ))]
    pub full_name: String,

    #[validate(range(min = 4, max = 120, message = "age must be strictly between 4 and 120"))]
    pub age: i16,

    /// Honeypot bot trap field; bots that populate this will be silently dropped
    pub bot_trap: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum UserRole {
    Kid,
    Teen,
    YoungAdult,
}

impl UserRole {
    pub fn from_age(age: i16) -> Self {
        if age <= 12 {
            Self::Kid
        } else if age <= 17 {
            Self::Teen
        } else {
            Self::YoungAdult
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Kid => "kid",
            Self::Teen => "teen",
            Self::YoungAdult => "young-adult",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct SignupResponse {
    pub status: &'static str,
    pub message: &'static str,
    pub user_id: Uuid,
}
