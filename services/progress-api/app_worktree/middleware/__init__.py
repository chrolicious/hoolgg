"""Middleware for progress-api"""

from app.middleware.auth import verify_token

__all__ = ["verify_token"]
