# tests/test_execution_receipt.py
import uuid
import jwt
from dotenv import dotenv_values
from app.security import mint_execution_receipt
from app.config import get_settings

def test_mint_execution_receipt():
    settings = get_settings()
    user_id = "test_user@example.com"
    request_id = str(uuid.uuid4())

    token = mint_execution_receipt(user_id=user_id, request_id=request_id)
    assert token is not None
    assert len(token.split(".")) == 3

    # Load public key to verify
    env_vals = dotenv_values(".env")
    pub_key_raw = env_vals.get("TOS_EXECUTION_PUBLIC_KEY") or env_vals.get("TOS_EXECUTION_PUBLIC_KEY")
    if not pub_key_raw:
        # Fall back to legal_service/.env
        env_vals = dotenv_values("backend/legal_service/.env")
        pub_key_raw = env_vals.get("TOS_EXECUTION_PUBLIC_KEY")

    pub_pem = pub_key_raw.replace("\\n", "\n").strip()

    decoded = jwt.decode(
        token,
        pub_pem,
        algorithms=["EdDSA"],
        audience="heal-her-rust-auth",
        issuer="heal-her-python-legal",
    )

    assert decoded["sub"] == user_id
    assert decoded["jti"] == request_id
    assert decoded["iss"] == "heal-her-python-legal"
    assert decoded["aud"] == "heal-her-rust-auth"
    assert decoded["exp"] - decoded["iat"] == 120
