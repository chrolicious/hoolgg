"""Route blueprints for progress-api"""

from app.routes.health import bp as health_bp
from app.routes.progress import bp as progress_bp
from app.routes.characters import bp as characters_bp
from app.routes.gear import bp as gear_bp
from app.routes.crests import bp as crests_bp
from app.routes.professions import bp as professions_bp
from app.routes.tasks import bp as tasks_bp
from app.routes.bis import bp as bis_bp
from app.routes.talents import bp as talents_bp
from app.routes.vault import bp as vault_bp
from app.routes.season import bp as season_bp
from app.routes.reference import bp as reference_bp

__all__ = [
    "health_bp",
    "progress_bp",
    "characters_bp",
    "gear_bp",
    "crests_bp",
    "professions_bp",
    "tasks_bp",
    "bis_bp",
    "talents_bp",
    "vault_bp",
    "season_bp",
    "reference_bp",
]
