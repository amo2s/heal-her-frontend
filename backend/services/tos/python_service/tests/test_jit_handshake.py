# tests/test_jit_handshake.py
import time
import uuid
import jwt
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import pytest
from app.config import get_settings
from app.models.schemas import SignatureRequest

def test_jit_receipt_validation():
    # 1. Generate ephemeral Ed25519 keypair
    priv_key = ed25519.Ed25519PrivateKey.generate()
    priv_pem = priv_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    pub_key = priv_key.public_key()
    pub_pem = pub_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    user_id = uuid.uuid4()
    jti = uuid.uuid4()
    version = "1.0"
    now = int(time.time())

    claims = {
        "sub": str(user_id),
        "ctx": version,
        "jti": str(jti),
        "iat": now,
        "exp": now + 60,
        "iss": "heal-her-rust-auth",
    }

    token = jwt.encode(claims, priv_pem, algorithm="EdDSA")

    # Verify decode with public key
    decoded = jwt.decode(
        token,
        pub_pem,
        algorithms=["EdDSA"],
        issuer="heal-her-rust-auth",
        options={"require": ["sub", "ctx", "jti", "exp", "iss"]},
    )

    assert decoded["sub"] == str(user_id)
    assert decoded["ctx"] == version
    assert decoded["jti"] == str(jti)
    assert decoded["iss"] == "heal-her-rust-auth"

def test_signature_request_pydantic_schema():
    req = SignatureRequest(
        client_name="Test User",
        jit_receipt="mock_jit_receipt_token_string",
        is_parental_consent=False,
    )
    assert req.client_name == "Test User"
    assert req.jit_receipt == "mock_jit_receipt_token_string"
    assert req.is_parental_consent is False

