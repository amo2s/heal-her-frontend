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
}

