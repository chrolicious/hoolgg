"""Configuration management for recruitment-api"""

import os
from typing import Optional


class Config:
    """Base configuration"""

    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")

    # JWT (for verifying tokens from guild-api)
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")

    # Guild API
    GUILD_API_URL: str = os.getenv("GUILD_API_URL", "http://localhost:5000")

    # External APIs
    RAIDER_IO_API_URL: str = os.getenv("RAIDER_IO_API_URL", "https://raider.io/api/v1")
    WOW_PROGRESS_API_URL: str = os.getenv(
        "WOW_PROGRESS_API_URL", "https://www.wowprogress.com/api"
    )
    WARCRAFT_LOGS_API_URL: str = os.getenv(
        "WARCRAFT_LOGS_API_URL", "https://www.warcraftlogs.com/api/v2"
    )

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
