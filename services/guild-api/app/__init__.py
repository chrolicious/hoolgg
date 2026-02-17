"""Guild API - Authentication, permissions, and guild management for hool.gg"""

from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()


def create_app() -> Flask:
    """Application factory pattern"""
    app = Flask(__name__)

    # Configuration
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["DATABASE_URL"] = os.getenv("DATABASE_URL")
    app.config["REDIS_URL"] = os.getenv("REDIS_URL")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", "900"))
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = int(
        os.getenv("JWT_REFRESH_TOKEN_EXPIRES", "604800")
    )

    # Blizzard OAuth
    app.config["BLIZZARD_CLIENT_ID"] = os.getenv("BLIZZARD_CLIENT_ID")
    app.config["BLIZZARD_CLIENT_SECRET"] = os.getenv("BLIZZARD_CLIENT_SECRET")
    app.config["BLIZZARD_REDIRECT_URI"] = os.getenv("BLIZZARD_REDIRECT_URI")
    app.config["BLIZZARD_REGION"] = os.getenv("BLIZZARD_REGION", "us")

    # CORS
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, origins=cors_origins, supports_credentials=True)

    # Initialize database
    from app.models import init_db

    init_db(app)

    # Initialize Redis cache
    from app.cache import init_redis

    init_redis(app)

    # Register blueprints
    from app.routes import auth, health, guilds

    app.register_blueprint(auth.bp)
    app.register_blueprint(health.bp)
    app.register_blueprint(guilds.bp)

    # Start background scheduler (6-hourly guild sync)
    # Note: Only start in production/non-debug mode to avoid duplicate jobs during development
    if not app.config.get("TESTING") and not app.config.get("DEBUG"):
        from app.jobs.sync_ranks import start_scheduler

        start_scheduler(app)

    return app
