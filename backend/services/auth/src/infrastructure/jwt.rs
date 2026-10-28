use crate::error::InternalAuthError;
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// TokenClaims precisely aligns with the Next.js proxy and gateway session schema.
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TokenClaims {
    pub sub: String,
    pub role: String,
    pub dashboard: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub aud: String,
    pub jti: String,
    pub exp: usize,
    pub iat: usize,
}

/// Forges an asymmetric access/refresh token pair using HS256 HMAC-SHA256 signing.
///
/// Expirations:
/// - Access Token: 10 minutes (600 seconds)
/// - Refresh Token: 7 days (604,800 seconds)
///
/// Audience (aud) is pinned to the user's role to prevent cross-demographic escalation.
/// Unique JTI (UUIDv4) is minted for each token to support granular token revocation.
#[allow(dead_code)]
pub fn forge_token_pair(
    user_id: &str,
    role: &str,
    dashboard: &str,
    secret: &str,
) -> Result<(String, String), InternalAuthError> {
    let current_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| InternalAuthError::JwtSigningError(format!("System clock drift error: {e}")))?
        .as_secs() as usize;

    let access_exp = current_time + (10 * 60);
    let refresh_exp = current_time + (7 * 24 * 60 * 60);

    let access_claims = TokenClaims {
        sub: user_id.to_string(),
        role: role.to_string(),
        dashboard: dashboard.to_string(),
        type_: "access".to_string(),
        aud: role.to_string(),
        jti: uuid::Uuid::new_v4().to_string(),
        exp: access_exp,
        iat: current_time,
    };

    let refresh_claims = TokenClaims {
        sub: user_id.to_string(),
        role: role.to_string(),
        dashboard: dashboard.to_string(),
        type_: "refresh".to_string(),
        aud: role.to_string(),
        jti: uuid::Uuid::new_v4().to_string(),
        exp: refresh_exp,
        iat: current_time,
    };

    let encoding_key = EncodingKey::from_secret(secret.as_ref());
    let header = Header::new(Algorithm::HS256);

    let access_token = encode(&header, &access_claims, &encoding_key)
        .map_err(|e| InternalAuthError::JwtSigningError(e.to_string()))?;

    let refresh_token = encode(&header, &refresh_claims, &encoding_key)
        .map_err(|e| InternalAuthError::JwtSigningError(e.to_string()))?;

    Ok((access_token, refresh_token))
}

#[cfg(test)]
mod tests {
    use super::*;
    use jsonwebtoken::{decode, DecodingKey, Validation};

    #[test]
    fn test_forge_token_pair_success_and_claims_validation() {
        let user_id = "018f4a3e-6b92-71c1-8402-9c3f41295b90";
        let role = "teen";
        let dashboard = "/dashboard/teen";
        let secret = "test_super_secret_key_for_jwt_forge_validation_32_bytes";

        let (access_token, refresh_token) =
            forge_token_pair(user_id, role, dashboard, secret).expect("Token pair generation failed");

        assert!(!access_token.is_empty());
        assert!(!refresh_token.is_empty());
        assert_ne!(access_token, refresh_token);

        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_audience(&[role]);

        let decoding_key = DecodingKey::from_secret(secret.as_ref());

        // Validate Access Token
        let decoded_access = decode::<TokenClaims>(&access_token, &decoding_key, &validation)
            .expect("Failed to decode access token");
        assert_eq!(decoded_access.claims.sub, user_id);
        assert_eq!(decoded_access.claims.role, role);
        assert_eq!(decoded_access.claims.dashboard, dashboard);
        assert_eq!(decoded_access.claims.type_, "access");
        assert_eq!(decoded_access.claims.aud, role);
        assert!(decoded_access.claims.exp > decoded_access.claims.iat);
        assert_eq!(decoded_access.claims.exp - decoded_access.claims.iat, 600);

        // Validate Refresh Token
        let decoded_refresh = decode::<TokenClaims>(&refresh_token, &decoding_key, &validation)
            .expect("Failed to decode refresh token");
        assert_eq!(decoded_refresh.claims.sub, user_id);
        assert_eq!(decoded_refresh.claims.role, role);
        assert_eq!(decoded_refresh.claims.dashboard, dashboard);
        assert_eq!(decoded_refresh.claims.type_, "refresh");
        assert_eq!(decoded_refresh.claims.aud, role);
        assert_eq!(decoded_refresh.claims.exp - decoded_refresh.claims.iat, 604800);

        // Ensure distinct JTIs
        assert_ne!(decoded_access.claims.jti, decoded_refresh.claims.jti);
    }
}
