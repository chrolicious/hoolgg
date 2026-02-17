"""Configuration management for guild-api"""

import os
from typing import Optional


class Config:
    """Base configuration"""

    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", "900"))
    JWT_REFRESH_TOKEN_EXPIRES: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", "604800"))

    # Blizzard OAuth
    BLIZZARD_CLIENT_ID: Optional[str] = os.getenv("BLIZZARD_CLIENT_ID")
    BLIZZARD_CLIENT_SECRET: Optional[str] = os.getenv("BLIZZARD_CLIENT_SECRET")
    BLIZZARD_REDIRECT_URI: Optional[str] = os.getenv("BLIZZARD_REDIRECT_URI")
    BLIZZARD_REGION: str = os.getenv("BLIZZARD_REGION", "us")

    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")


class DevelopmentConfig(Config):
    """Development configuration"""

    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""

    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""

    DEBUG = True
    TESTING = True
    DATABASE_URL = "postgresql://hool:hool@localhost:5432/hoolgg_test"


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
