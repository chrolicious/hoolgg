"""JWT token generation and validation service"""

import jwt
import time
from typing import Dict, Optional
from flask import current_app


def generate_access_token(bnet_id: int) -> str:
    """
    Generate JWT access token (15-minute lifetime)

    Payload: { bnet_id, iat, exp }
    """
    now = int(time.time())
    expires_in = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]

    payload = {
        "bnet_id": bnet_id,
        "iat": now,  # Issued at
        "exp": now + expires_in,  # Expiration
        "type": "access",
    }

    secret = current_app.config["JWT_SECRET_KEY"]
    token = jwt.encode(payload, secret, algorithm="HS256")

    return token


def generate_refresh_token(bnet_id: int) -> str:
    """
    Generate JWT refresh token (7-day lifetime)

    Payload: { bnet_id, iat, exp }
    """
    now = int(time.time())
    expires_in = current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]

    payload = {
        "bnet_id": bnet_id,
        "iat": now,  # Issued at
        "exp": now + expires_in,  # Expiration
        "type": "refresh",
    }

    secret = current_app.config["JWT_SECRET_KEY"]
    token = jwt.encode(payload, secret, algorithm="HS256")

    return token


def verify_token(token: str, token_type: str = "access") -> Optional[Dict]:
    """
    Verify and decode JWT token

    Args:
        token: JWT token string
        token_type: "access" or "refresh"

    Returns:
        Decoded payload if valid, None if invalid/expired
    """
    try:
        secret = current_app.config["JWT_SECRET_KEY"]
        payload = jwt.decode(token, secret, algorithms=["HS256"])

        # Verify token type
        if payload.get("type") != token_type:
            return None

        return payload

    except jwt.ExpiredSignatureError:
        current_app.logger.warning(f"Token expired: {token_type}")
        return None
    except jwt.InvalidTokenError as e:
        current_app.logger.warning(f"Invalid token: {e}")
        return None


def decode_token_without_verification(token: str) -> Optional[Dict]:
    """
    Decode token without verification (for debugging/logging only)

    DO NOT use for authentication - only for extracting info from expired tokens
    """
    try:
        payload = jwt.decode(
            token, options={"verify_signature": False, "verify_exp": False}
        )
        return payload
    except Exception:
        return None
