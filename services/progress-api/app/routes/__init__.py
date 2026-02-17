"""Route blueprints for progress-api"""

from app.routes.health import bp as health_bp
from app.routes.progress import bp as progress_bp

__all__ = ["health_bp", "progress_bp"]
