# Recruitment API

Flask-based recruitment API for hool.gg. Handles candidate search, rating, and recruitment pipeline management for WoW guilds.

## Features

- Multi-source candidate search (Raider.io, WoW Progress)
- Candidate rating and notes (guild-scoped)
- Recruitment pipeline management (Kanban-style)
- Candidate comparison and filtering
- Integration with WarcraftLogs for parse data
- Permission checks via guild-api

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start development server
python run.py
```

## API Endpoints

### Search

- `POST /guilds/{guild_id}/recruitment/search` - Search candidates

### Candidate Management

- `GET /guilds/{guild_id}/recruitment/candidates` - List candidates
- `GET /guilds/{guild_id}/recruitment/candidates/{candidate_id}` - Get candidate details
- `POST /guilds/{guild_id}/recruitment/candidates` - Add manual candidate
- `PUT /guilds/{guild_id}/recruitment/candidates/{candidate_id}` - Update candidate (rating/notes)
- `PUT /guilds/{guild_id}/recruitment/candidates/{candidate_id}/status` - Update candidate status
- `DELETE /guilds/{guild_id}/recruitment/candidates/{candidate_id}` - Delete candidate

### Contact Tracking

- `POST /guilds/{guild_id}/recruitment/candidates/{candidate_id}/contact` - Log contact
- `GET /guilds/{guild_id}/recruitment/candidates/{candidate_id}/history` - Get contact history

### Pipeline & Views

- `GET /guilds/{guild_id}/recruitment/pipeline` - Get Kanban view
- `GET /guilds/{guild_id}/recruitment/compare` - Compare candidates
- `GET /guilds/{guild_id}/recruitment/composition` - View raid composition needs

### Categories

- `GET /guilds/{guild_id}/recruitment/categories` - List categories
- `POST /guilds/{guild_id}/recruitment/categories` - Create custom category
- `DELETE /guilds/{guild_id}/recruitment/categories/{category_id}` - Delete custom category

## Development

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Format code
black app/
isort app/

# Type checking
mypy app/
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.
