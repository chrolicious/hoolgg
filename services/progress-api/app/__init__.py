"""Progress API - Character progression tracking for hool.gg"""

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

    # Blizzard API
    app.config["BLIZZARD_CLIENT_ID"] = os.getenv("BLIZZARD_CLIENT_ID")
    app.config["BLIZZARD_CLIENT_SECRET"] = os.getenv("BLIZZARD_CLIENT_SECRET")
    app.config["BLIZZARD_REGION"] = os.getenv("BLIZZARD_REGION", "us")
    app.config["BLIZZARD_API_TIMEOUT"] = int(os.getenv("BLIZZARD_API_TIMEOUT", "10"))

    # WarcraftLogs API
    app.config["WARCRAFTLOGS_CLIENT_ID"] = os.getenv("WARCRAFTLOGS_CLIENT_ID")
    app.config["WARCRAFTLOGS_CLIENT_SECRET"] = os.getenv("WARCRAFTLOGS_CLIENT_SECRET")

    # Guild API
    app.config["GUILD_API_URL"] = os.getenv("GUILD_API_URL", "http://localhost:5000")

    # Cache settings
    app.config["CHARACTER_CACHE_TTL"] = int(os.getenv("CHARACTER_CACHE_TTL", "3600"))

    # CORS
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, origins=cors_origins, supports_credentials=True)

    # Initialize database
    from app.models import init_db

    init_db(app)

    # Register blueprints
    from app.routes import (
        health,
        progress,
        characters,
        bis,
        crests,
        gear,
        professions,
        talents,
        tasks,
        vault,
        season,
        reference,
        personal_roster,
    )

    app.register_blueprint(health.bp)
    app.register_blueprint(progress.bp)
    app.register_blueprint(characters.bp)
    app.register_blueprint(bis.bp)
    app.register_blueprint(crests.bp)
    app.register_blueprint(gear.bp)
    app.register_blueprint(professions.bp)
    app.register_blueprint(talents.bp)
    app.register_blueprint(tasks.bp)
    app.register_blueprint(vault.bp)
    app.register_blueprint(season.bp)
    app.register_blueprint(reference.bp)
    app.register_blueprint(personal_roster.bp)

    return app
