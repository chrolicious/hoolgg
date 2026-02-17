"""Health check endpoint for monitoring and deployment"""

from flask import Blueprint, jsonify, current_app
import redis
from sqlalchemy import text
from app.models import get_db

bp = Blueprint("health", __name__)


@bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint

    Returns:
        200 OK if all systems operational
        503 Service Unavailable if any critical system is down

    Checks:
    - Database connectivity
    - Redis connectivity (optional)
    - Application status
    """
    health_status = {
        "status": "healthy",
        "checks": {
            "database": "unknown",
            "redis": "unknown",
            "application": "ok",
        },
    }

    all_healthy = True

    # Check database connectivity
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        health_status["checks"]["database"] = "ok"
    except Exception as e:
        current_app.logger.error(f"Database health check failed: {e}")
        health_status["checks"]["database"] = "error"
        all_healthy = False

    # Check Redis connectivity (optional - not critical)
    try:
        redis_url = current_app.config.get("REDIS_URL")
        if redis_url:
            redis_client = redis.from_url(redis_url)
            redis_client.ping()
            health_status["checks"]["redis"] = "ok"
        else:
            health_status["checks"]["redis"] = "not_configured"
    except Exception as e:
        current_app.logger.warning(f"Redis health check failed: {e}")
        health_status["checks"]["redis"] = "error"
        # Redis failure is not critical, don't mark as unhealthy

    # Set overall status
    if all_healthy:
        health_status["status"] = "healthy"
        return jsonify(health_status), 200
    else:
        health_status["status"] = "unhealthy"
        return jsonify(health_status), 503
