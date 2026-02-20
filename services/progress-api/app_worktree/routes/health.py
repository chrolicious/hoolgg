"""Health check endpoint"""

from flask import Blueprint, jsonify

bp = Blueprint("health", __name__)


@bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint

    Returns service status and version info
    """
    return jsonify({
        "status": "healthy",
        "service": "progress-api",
        "version": "0.1.0"
    }), 200
