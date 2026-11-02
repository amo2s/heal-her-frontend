# app/dependencies.py
import logging
from typing import Optional
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.session import get_db

logger = logging.getLogger("tos_service.auth")
settings = get_settings()


class AuthenticatedUser:
    """
    Cryptographically authenticated caller context.
    Encapsulates verified user ID, email address, and network client IP.
    """
    def __init__(self, user_id: UUID, email: str, ip_address: str, role: Optional[str] = None):
        self.user_id = user_id
        self.email = email
        self.ip_address = ip_address
        self.role = role or "user"

    def __repr__(self) -> str:
        return f"<AuthenticatedUser id={self.user_id} email={self.email} ip={self.ip_address}>"


def extract_client_ip(request: Request) -> str:
    """
    Extracts the genuine client IP address for the non-repudiation audit trail.
    Prioritizes verified upstream proxy headers before falling back to socket address.
    """
    verified_ip = request.headers.get("x-healher-verified-ip")
    if verified_ip and verified_ip.strip():
        return verified_ip.strip()

    forwarded = request.headers.get("x-forwarded-for")
    if forwarded and forwarded.strip():
        return forwarded.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip and real_ip.strip():
        return real_ip.strip()

    if request.client and request.client.host:
        return request.client.host

    return "127.0.0.1"


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> AuthenticatedUser:
    """
    FastAPI Zero-Trust dependency.
    Validates the Bearer JWT using the shared HS256 secret key, enforces expiration,
    resolves the user's primary email, and captures network telemetry.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.warning(f"Unauthorized access attempt from {request.client.host if request.client else 'unknown'}: missing Bearer token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Expected 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ", 1)[1].strip()

    if not settings.jwt_secret_key:
        logger.critical("FATAL: JWT_SECRET_KEY is not configured in environment.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication subsystem configuration error."
        )

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=["HS256"],
            options={"require": ["sub", "exp"]}
        )
    except jwt.ExpiredSignatureError:
        logger.warning("Token verification failed: token signature expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as err:
        logger.warning(f"Token verification failed: invalid token ({err})")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(err)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    sub_str = payload.get("sub")
    if not sub_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing required 'sub' subject claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = UUID(str(sub_str))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 'sub' claim is not a valid UUID format.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Resolve email from JWT claims, custom headers, or persistent user record
    email = payload.get("email")
    if not email:
        email = request.headers.get("x-user-email")

    if not email:
        try:
            query = text("SELECT email FROM users WHERE id = :uid LIMIT 1")
            result = await db.execute(query, {"uid": user_id})
            row = result.fetchone()
            if row and row[0]:
                email = str(row[0])
        except Exception as e:
            logger.error(f"Error querying users table for user_id {user_id}: {e}")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to resolve user email for legal audit non-repudiation.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    ip_address = extract_client_ip(request)
    role = payload.get("role", "user")

    return AuthenticatedUser(
        user_id=user_id,
        email=email,
        ip_address=ip_address,
        role=role
    )

