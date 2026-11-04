# app/security.py
import logging
from datetime import datetime, timezone, timedelta
import jwt
from fastapi import HTTPException, status

from app.config import get_settings

logger = logging.getLogger("tos_service.security")
settings = get_settings()


def mint_execution_receipt(user_id: str, request_id: str) -> str:
    """
    Mints a short-lived Ed25519 (EdDSA) JWT Execution Receipt (RFC 7519 / RFC 8037).
    Cryptographically proves that legal consent execution succeeded across RAM rendering,
    Supabase storage, audit ledger, and Google Mailer.
    Presented to the Rust Auth microservice to atomically upgrade the user's session.
    """
    now = datetime.now(timezone.utc)
    exp = now + timedelta(seconds=120)

    payload = {
        "sub": str(user_id),
        "jti": str(request_id),
        "iss": "heal-her-python-legal",
        "aud": "heal-her-rust-auth",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    try:
        private_key = settings.execution_private_key_pem
        if not private_key:
            raise ValueError("TOS_EXECUTION_PRIVATE_KEY is not configured in settings")

        token = jwt.encode(
            payload,
            private_key,
            algorithm="EdDSA",
        )
        return token
    except jwt.PyJWTError as exc:
        logger.error(
            f"PyJWT cryptographic signing failure for user {user_id} [Request {request_id}]: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mint cryptographic execution receipt: {exc}",
        )
    except Exception as exc:
        logger.error(
            f"Unexpected cryptographic error during receipt minting for user {user_id} [Request {request_id}]: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cryptographic execution receipt failure: {exc}",
        )
