"""Health check route"""

from flask import Blueprint, jsonify

bp = Blueprint("health", __name__)


@bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "recruitment-api"}), 200
