use crate::error::InternalAuthError;
use chrono::{DateTime, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// BLAKE3 Cryptographic Hashing Utility.
/// Computes a deterministic 64-character hexadecimal digest of the raw refresh token.
/// Refresh tokens are NEVER stored in plaintext in the database.
pub fn hash_refresh_token(raw_token: &str) -> String {
    blake3::hash(raw_token.as_bytes()).to_hex().to_string()
}

/// Upgraded Zero-Trust JWT Claims.
/// Includes demographic role, user ID, session ID, family ID, token ID, and demographic dashboard routing.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Claims {
    pub sub: Uuid,
    pub jti: Uuid,
    pub sid: Uuid,
    pub fid: Uuid,
    pub role: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub dashboard: Option<String>,
    pub iat: i64,
    pub exp: i64,
    pub token_type: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub aud: Option<String>,
}

/// Backward compatibility alias
#[allow(dead_code)]
pub type TokenClaims = Claims;

/// Result structure returned from token generation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedTokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub refresh_token_hash: String,
    pub refresh_expires_at: DateTime<Utc>,
}

/// Forges an asymmetric access (10 min) & refresh (7 day) token pair.
/// Embeds JTI, Session ID (sid), Family ID (fid), and Demographic Role into claims.
pub fn generate_token_pair(
    user_id: Uuid,
    role: &str,
    dashboard: Option<&str>,
    session_id: Uuid,
    family_id: Uuid,
    secret: &str,
) -> Result<GeneratedTokenPair, InternalAuthError> {
    let now_utc = Utc::now();
    let current_time = now_utc.timestamp();

    let access_exp = current_time + 600; // 10 minutes (600 seconds)
    let refresh_exp = current_time + (7 * 24 * 60 * 60); // 7 days (604,800 seconds)
    let refresh_expires_at = now_utc + chrono::Duration::seconds(7 * 24 * 60 * 60);

    let access_jti = Uuid::now_v7();
    let refresh_jti = Uuid::now_v7();

    let access_claims = Claims {
        sub: user_id,
        jti: access_jti,
        sid: session_id,
        fid: family_id,
        role: role.to_string(),
        dashboard: dashboard.map(|d| d.to_string()),
        iat: current_time,
        exp: access_exp,
        token_type: "access".to_string(),
        aud: Some(role.to_string()),
    };

    let refresh_claims = Claims {
        sub: user_id,
        jti: refresh_jti,
        sid: session_id,
        fid: family_id,
        role: role.to_string(),
        dashboard: dashboard.map(|d| d.to_string()),
        iat: current_time,
        exp: refresh_exp,
        token_type: "refresh".to_string(),
        aud: Some(role.to_string()),
    };

    let encoding_key = EncodingKey::from_secret(secret.as_ref());
    let header = Header::new(Algorithm::HS256);

    let access_token = encode(&header, &access_claims, &encoding_key)
        .map_err(|e| InternalAuthError::JwtSigningError(e.to_string()))?;

    let refresh_token = encode(&header, &refresh_claims, &encoding_key)
        .map_err(|e| InternalAuthError::JwtSigningError(e.to_string()))?;

    let refresh_token_hash = hash_refresh_token(&refresh_token);

    Ok(GeneratedTokenPair {
        access_token,
        refresh_token,
        refresh_token_hash,
        refresh_expires_at,
    })
}

/// Cryptographically decodes and verifies a JWT token's signature and expiration.
pub fn verify_token(token: &str, secret: &str) -> Result<Claims, InternalAuthError> {
    let decoding_key = DecodingKey::from_secret(secret.as_ref());
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_aud = false;

    let token_data = decode::<Claims>(token, &decoding_key, &validation)
        .map_err(|e| InternalAuthError::InvalidToken(e.to_string()))?;

    Ok(token_data.claims)
}

/// Backward compatibility helper for legacy call sites.
#[allow(dead_code)]
pub fn forge_token_pair(
    user_id: &str,
    role: &str,
    dashboard: &str,
    secret: &str,
) -> Result<(String, String), InternalAuthError> {
    let uid = user_id.parse::<Uuid>().unwrap_or_else(|_| Uuid::new_v4());
    let sid = Uuid::new_v4();
    let fid = Uuid::new_v4();
    let pair = generate_token_pair(uid, role, Some(dashboard), sid, fid, secret)?;
    Ok((pair.access_token, pair.refresh_token))
}

#[cfg(test)]
mod tests {
    use super::*;
    use jsonwebtoken::{decode, DecodingKey, Validation};

    #[test]
    fn test_hash_refresh_token_blake3() {
        let raw = "test_refresh_token_string_123456789";
        let hash = hash_refresh_token(raw);
        assert_eq!(hash.len(), 64);
        // Deterministic check
        assert_eq!(hash, hash_refresh_token(raw));
        // Different token produces different hash
        assert_ne!(hash, hash_refresh_token("different_token"));
    }

    #[test]
    fn test_generate_token_pair_success_and_claims_validation() {
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let family_id = Uuid::new_v4();
        let role = "young-adult";
        let dashboard = "young-adults";
        let secret = "test_super_secret_key_for_jwt_forge_validation_32_bytes";

        let pair = generate_token_pair(
            user_id,
            role,
            Some(dashboard),
            session_id,
            family_id,
            secret,
        )
        .expect("Token pair generation failed");

        assert!(!pair.access_token.is_empty());
        assert!(!pair.refresh_token.is_empty());
        assert_ne!(pair.access_token, pair.refresh_token);
        assert_eq!(pair.refresh_token_hash.len(), 64);

        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_audience(&[role]);
        let decoding_key = DecodingKey::from_secret(secret.as_ref());

        // Validate Access Token
        let decoded_access = decode::<Claims>(&pair.access_token, &decoding_key, &validation)
            .expect("Failed to decode access token");
        assert_eq!(decoded_access.claims.sub, user_id);
        assert_eq!(decoded_access.claims.sid, session_id);
        assert_eq!(decoded_access.claims.fid, family_id);
        assert_eq!(decoded_access.claims.role, role);
        assert_eq!(decoded_access.claims.dashboard.as_deref(), Some(dashboard));
        assert_eq!(decoded_access.claims.token_type, "access");
        assert_eq!(decoded_access.claims.exp - decoded_access.claims.iat, 600);

        // Validate Refresh Token
        let decoded_refresh = decode::<Claims>(&pair.refresh_token, &decoding_key, &validation)
            .expect("Failed to decode refresh token");
        assert_eq!(decoded_refresh.claims.sub, user_id);
        assert_eq!(decoded_refresh.claims.sid, session_id);
        assert_eq!(decoded_refresh.claims.fid, family_id);
        assert_eq!(decoded_refresh.claims.role, role);
        assert_eq!(decoded_refresh.claims.dashboard.as_deref(), Some(dashboard));
        assert_eq!(decoded_refresh.claims.token_type, "refresh");
        assert_eq!(decoded_refresh.claims.exp - decoded_refresh.claims.iat, 604800);

        // JTIs must be distinct
        assert_ne!(decoded_access.claims.jti, decoded_refresh.claims.jti);

        // Test verify_token helper
        let verified = verify_token(&pair.access_token, secret).expect("verify_token must succeed");
        assert_eq!(verified.sub, user_id);
        assert_eq!(verified.token_type, "access");

        // Invalid secret must fail
        assert!(verify_token(&pair.access_token, "wrong_secret").is_err());
    }
}
