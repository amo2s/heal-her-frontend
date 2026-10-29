use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct RequestOtpInput {
    pub email: String,
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
}

