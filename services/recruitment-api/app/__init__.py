"""Recruitment API - Candidate search, rating, and pipeline management for hool.gg"""

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

    # External API URLs
    app.config["GUILD_API_URL"] = os.getenv("GUILD_API_URL", "http://localhost:5000")
    app.config["RAIDER_IO_API_URL"] = os.getenv(
        "RAIDER_IO_API_URL", "https://raider.io/api/v1"
    )
    app.config["WOW_PROGRESS_API_URL"] = os.getenv(
        "WOW_PROGRESS_API_URL", "https://www.wowprogress.com/api"
    )
    app.config["WARCRAFT_LOGS_API_URL"] = os.getenv(
        "WARCRAFT_LOGS_API_URL", "https://www.warcraftlogs.com/api/v2"
    )

    # CORS
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, origins=cors_origins, supports_credentials=True)

    # Initialize database
    from app.models import init_db

    init_db(app)

    # Register blueprints
    from app.routes import health, recruitment

    app.register_blueprint(health.bp)
    app.register_blueprint(recruitment.bp)

    return app
