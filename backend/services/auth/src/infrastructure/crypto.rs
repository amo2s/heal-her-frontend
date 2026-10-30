use crate::error::InternalAuthError;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Algorithm, Argon2, Params, Version,
};
use tokio::task::spawn_blocking;

/// Hardened Argon2id parameters matching infrastructure security specifications:
/// Memory Cost (m_cost) = 65536 KiB (64 MB), Time Cost (t_cost) = 3 iterations, Parallelism (p_cost) = 4 lanes
pub const M_COST: u32 = 65536;
pub const T_COST: u32 = 3;
pub const P_COST: u32 = 4;

/// Pre-computed, RFC-compliant Argon2id hash used as a timing-attack equalization target.
/// Any verification against this hash burns identical CPU cycles (~600ms) before failing.
pub const DUMMY_HASH: &str =
    "$argon2id$v=19$m=65536,t=3,p=4$S09uVzZ0SjZ0S0Z6TzFvMg$yW8VpY8VpY8VpY8VpY8VpY8VpY8VpY8VpY8VpY8VpY8";

/// Verifies a plaintext password against a stored Argon2id hash on a dedicated Tokio blocking thread.
/// Offloading to `spawn_blocking` shields the Tokio async event loop from thread starvation.
#[allow(dead_code)]
pub async fn verify_password(hash: String, password: String) -> Result<(), InternalAuthError> {
    spawn_blocking(move || {
        let parsed_hash =
            PasswordHash::new(&hash).map_err(|_| InternalAuthError::Argon2HashMismatch)?;

        let params = Params::new(M_COST, T_COST, P_COST, None).map_err(|err| {
            InternalAuthError::HashingError(format!("Failed to configure Argon2 params: {err}"))
        })?;

        let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);

        argon2
            .verify_password(password.as_bytes(), &parsed_hash)
            .map_err(|_| InternalAuthError::Argon2HashMismatch)
    })
    .await
    .map_err(|err| {
        InternalAuthError::HashingError(format!("Cryptography blocking task join failed: {err}"))
    })?
}

/// Timing-Attack Shield:
/// When an account does not exist or has already been registered, executes an Argon2id verification
/// on the Tokio blocking pool against `DUMMY_HASH` with an intentionally non-matching password.
///
/// This burns ~600ms of CPU time in the background, rendering response latencies indistinguishable
/// and neutralizing user-enumeration timing attacks.
pub async fn execute_dummy_hash() -> Result<(), InternalAuthError> {
    spawn_blocking(move || {
        if let Ok(parsed_hash) = PasswordHash::new(DUMMY_HASH) {
            if let Ok(params) = Params::new(M_COST, T_COST, P_COST, None) {
                let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
                // Intentionally verify an invalid dummy password against DUMMY_HASH to burn CPU
                let _ = argon2.verify_password(b"fake_password_123", &parsed_hash);
            }
        }
        Ok::<(), InternalAuthError>(())
    })
    .await
    .map_err(|err| {
        InternalAuthError::HashingError(format!("Cryptography blocking task join failed: {err}"))
    })?
}

/// Hashes a plaintext password with Argon2id on a dedicated Tokio blocking thread.
/// Returns the PHC-formatted password hash string upon success.
pub async fn hash_password(password: String) -> Result<String, InternalAuthError> {
    spawn_blocking(move || {
        let params = Params::new(M_COST, T_COST, P_COST, None).map_err(|err| {
            InternalAuthError::HashingError(format!("Failed to configure Argon2 params: {err}"))
        })?;

        let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
        let salt = SaltString::generate(&mut OsRng);

        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|err| {
                InternalAuthError::HashingError(format!("Argon2id password hashing failed: {err}"))
            })?;

        Ok(password_hash.to_string())
    })
    .await
    .map_err(|err| {
        InternalAuthError::HashingError(format!("Cryptography blocking task join failed: {err}"))
    })?
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_dummy_hash_execution() {
        let result = execute_dummy_hash().await;
        assert!(
            result.is_ok(),
            "Dummy hash execution must swallow failure and return Ok(())"
        );
    }

    #[tokio::test]
    async fn test_verify_password_mismatch() {
        let result = verify_password(DUMMY_HASH.to_string(), "wrong_password".to_string()).await;
        assert!(matches!(result, Err(InternalAuthError::Argon2HashMismatch)));
    }
}
