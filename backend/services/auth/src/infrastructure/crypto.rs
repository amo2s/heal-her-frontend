use crate::error::AppError;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Algorithm, Argon2, Params, Version,
};

/// Parameters matching system specifications:
/// Memory Cost (m_cost) = 65536 KiB (64 MB), Time Cost (t_cost) = 3 iterations, Parallelism (p_cost) = 4 lanes
pub const M_COST: u32 = 65536;
pub const T_COST: u32 = 3;
pub const P_COST: u32 = 4;

pub fn configure_argon2() -> Result<Argon2<'static>, AppError> {
    let params = Params::new(M_COST, T_COST, P_COST, None)
        .map_err(|err| AppError::HashingError(format!("Failed to construct Argon2 params: {err}")))?;

    Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let argon2 = configure_argon2()?;
    let salt = SaltString::generate(&mut OsRng);

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|err| AppError::HashingError(format!("Argon2id password hashing failed: {err}")))?;

    Ok(password_hash.to_string())
}

/// Timing-Attack Immunity:
/// When an email is already registered, execute a real Argon2id hash on a dummy payload.
/// This equalizes CPU time and prevents user enumeration via time-based side-channel analysis.
pub fn execute_dummy_hash() -> Result<(), AppError> {
    let argon2 = configure_argon2()?;
    let salt = SaltString::generate(&mut OsRng);
    let dummy_secret = b"HEAL_HER_SIDE_CHANNEL_EQUALIZER_INPUT_SALT";

    let _ = argon2
        .hash_password(dummy_secret, &salt)
        .map_err(|err| AppError::HashingError(format!("Dummy hash execution failed: {err}")))?;

    Ok(())
}
