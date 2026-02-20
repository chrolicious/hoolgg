"""Configuration management for progress-api"""

import os
from typing import Dict, Any


class Config:
    """Base configuration"""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DATABASE_URL = os.getenv("DATABASE_URL")
    REDIS_URL = os.getenv("REDIS_URL")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")

    # API configurations
    BLIZZARD_CLIENT_ID = os.getenv("BLIZZARD_CLIENT_ID")
    BLIZZARD_CLIENT_SECRET = os.getenv("BLIZZARD_CLIENT_SECRET")
    BLIZZARD_REGION = os.getenv("BLIZZARD_REGION", "us")
    BLIZZARD_API_TIMEOUT = int(os.getenv("BLIZZARD_API_TIMEOUT", "10"))

    WARCRAFTLOGS_CLIENT_ID = os.getenv("WARCRAFTLOGS_CLIENT_ID")
    WARCRAFTLOGS_CLIENT_SECRET = os.getenv("WARCRAFTLOGS_CLIENT_SECRET")

    GUILD_API_URL = os.getenv("GUILD_API_URL", "http://localhost:5000")

    # Cache TTLs
    CHARACTER_CACHE_TTL = int(os.getenv("CHARACTER_CACHE_TTL", "3600"))

    @staticmethod
    def get_blizzard_oauth_url() -> str:
        """Get Blizzard OAuth base URL for region"""
        region = os.getenv("BLIZZARD_REGION", "us")
        if region == "us":
            return "https://oauth.battle.net"
        elif region == "eu":
            return "https://oauth.battle.net"
        elif region == "kr":
            return "https://oauth.battle.net"
        elif region == "tw":
            return "https://oauth.battle.net"
        return "https://oauth.battle.net"

    @staticmethod
    def get_blizzard_api_url() -> str:
        """Get Blizzard API base URL for region"""
        region = os.getenv("BLIZZARD_REGION", "us")
        return f"https://{region}.api.blizzard.com"


class DevelopmentConfig(Config):
    """Development configuration"""

    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""

    DEBUG = False
    TESTING = True


class ProductionConfig(Config):
    """Production configuration"""

    DEBUG = False
    TESTING = False


config_by_name: Dict[str, Any] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
