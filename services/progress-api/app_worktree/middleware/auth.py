"""Authentication middleware - JWT token verification"""

import jwt
from typing import Optional, Dict, Any
from flask import current_app
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    """
    Verify JWT token

    Args:
        token: JWT token string
        token_type: Type of token ("access" or "refresh")

    Returns:
        Decoded payload dict or None if invalid
    """
    if not token:
        # Development mode: return test user if no token provided
        import os
        if os.getenv("FLASK_ENV") == "development":
            logger.info("Dev mode: returning test user (bnet_id=1)")
            return {"bnet_id": 1, "type": "access"}
        return None

    secret_key = current_app.config.get("JWT_SECRET_KEY")
    if not secret_key:
        logger.error("JWT_SECRET_KEY not configured")
        return None

    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])

        # Verify token type
        if payload.get("type") != token_type:
            logger.warning(f"Token type mismatch: expected {token_type}, got {payload.get('type')}")
            return None

        return payload

    except jwt.ExpiredSignatureError:
        logger.info("Token expired")
        return None

    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return None


def create_test_token(bnet_id: int, expires_in: int = 3600) -> str:
    """
    Create a test JWT token for integration tests

    Args:
        bnet_id: User's Battle.net ID
        expires_in: Token expiration time in seconds (default: 1 hour)

    Returns:
        Encoded JWT token string
    """
    secret_key = current_app.config.get("JWT_SECRET_KEY", "dev-jwt-secret")

    payload = {
        "bnet_id": bnet_id,
        "type": "access",
        "exp": datetime.utcnow() + timedelta(seconds=expires_in),
        "iat": datetime.utcnow()
    }

    return jwt.encode(payload, secret_key, algorithm="HS256")
