use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct RequestOtpInput {
    pub email: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyOtpInput {
    pub email: String,
    pub otp_code: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyOtpResponse {
    pub status: String,
    pub reset_token: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmResetInput {
    pub reset_token: String,
    pub new_password: String,
    pub confirm_password: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmResetResponse {
    pub status: String,
    pub message: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_request_otp_input_deserialization() {
        let json = r#"{"email":"reset@healher.internal"}"#;
        let input: RequestOtpInput = serde_json::from_str(json).unwrap();
        assert_eq!(input.email, "reset@healher.internal");
    }

    #[test]
    fn test_verify_otp_input_deserialization() {
        let json = r#"{"email":"reset@healher.internal","otpCode":"123456"}"#;
        let input: VerifyOtpInput = serde_json::from_str(json).unwrap();
        assert_eq!(input.email, "reset@healher.internal");
        assert_eq!(input.otp_code, "123456");
    }

    #[test]
    fn test_verify_otp_response_serialization() {
        let response = VerifyOtpResponse {
            status: "success".to_string(),
            reset_token: "test_token_base64".to_string(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"resetToken\":\"test_token_base64\""));
        assert!(json.contains("\"status\":\"success\""));
    }

    #[test]
    fn test_confirm_reset_input_deserialization() {
        let json = r#"{"resetToken":"token123","newPassword":"Password1!","confirmPassword":"Password1!"}"#;
        let input: ConfirmResetInput = serde_json::from_str(json).unwrap();
        assert_eq!(input.reset_token, "token123");
        assert_eq!(input.new_password, "Password1!");
        assert_eq!(input.confirm_password, "Password1!");
    }

    #[test]
    fn test_confirm_reset_response_serialization() {
        let response = ConfirmResetResponse {
            status: "success".to_string(),
            message: "Password securely updated.".to_string(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"message\":\"Password securely updated.\""));
        assert!(json.contains("\"status\":\"success\""));
    }
}
