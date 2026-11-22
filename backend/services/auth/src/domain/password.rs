use crate::error::InternalAuthError;

/// Zero-Dependency Entropy Gate: validates password complexity in nanoseconds
/// using native Rust char iterators without regex dependencies or ReDoS risks.
/// Rules:
/// - Between 8 and 128 Unicode characters
/// - At least one uppercase ASCII letter
/// - At least one lowercase ASCII letter
/// - At least one ASCII digit
/// - At least one special / non-alphanumeric character
/// - No null bytes or ASCII control characters
pub fn validate_password_complexity(password: &str) -> Result<(), InternalAuthError> {
    let char_count = password.chars().count();
    if char_count < 8 {
        return Err(InternalAuthError::ValidationError(
            "Password must be at least 8 characters long".into(),
        ));
    }
    if char_count > 128 {
        return Err(InternalAuthError::ValidationError(
            "Password must not exceed 128 characters".into(),
        ));
    }

    if password.chars().any(|c| c.is_control() || c == '\0') {
        return Err(InternalAuthError::ValidationError(
            "Password cannot contain null bytes or control characters".into(),
        ));
    }

    let has_upper = password.chars().any(|c| c.is_ascii_uppercase());
    let has_lower = password.chars().any(|c| c.is_ascii_lowercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());
    let has_special = password.chars().any(|c| !c.is_alphanumeric());

    if !has_upper || !has_lower || !has_digit || !has_special {
        return Err(InternalAuthError::ValidationError(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character".into(),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_password_complexity() {
        assert!(validate_password_complexity("Short1!").is_err());
        assert!(validate_password_complexity("lowercase1!").is_err());
        assert!(validate_password_complexity("UPPERCASE1!").is_err());
        assert!(validate_password_complexity("NoDigitsHere!").is_err());
        assert!(validate_password_complexity("NoSpecial123").is_err());
        assert!(validate_password_complexity("With\0Null1!a").is_err());
        assert!(validate_password_complexity("With\nControl1!a").is_err());

        let long_pwd = "A1!".to_string() + &"a".repeat(126);
        assert!(validate_password_complexity(&long_pwd).is_err());

        assert!(validate_password_complexity("ValidPass123!").is_ok());
        assert!(validate_password_complexity("C0mpl3x_P@ssw0rd").is_ok());
    }
}
