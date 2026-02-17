# Guild API

Central authentication, permissions, and guild management service for hool.gg.

## Features

- Blizzard OAuth authentication
- JWT token generation and management
- Rank-based permission checking
- Guild creation and management
- Character-to-guild-to-rank association tracking

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
   - Database URL
   - Redis URL
   - Blizzard OAuth credentials
   - JWT secret

4. Run migrations (after Alembic setup):
```bash
alembic upgrade head
```

5. Run the development server:
```bash
python run.py
```

## API Endpoints

### Authentication
- `GET /auth/login` - Initiate Blizzard OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and revoke tokens

### Guilds
- `POST /guilds` - Create guild instance
- `GET /guilds/{guild_id}/settings` - Get guild settings
- `PUT /guilds/{guild_id}/settings` - Update guild settings
- `GET /guilds/{guild_id}/members` - Get guild roster
- `PUT /guilds/{guild_id}/permissions` - Configure permissions

### Permissions
- `GET /guilds/{guild_id}/permissions/check` - Check user permissions

### Health
- `GET /health` - Health check endpoint

## Testing

```bash
pytest
pytest --cov=app  # With coverage
```

## Deployment

```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```
