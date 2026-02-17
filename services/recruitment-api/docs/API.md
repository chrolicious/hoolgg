# Recruitment API Documentation

## Authentication

All endpoints (except `/health`) require authentication via JWT token in cookie.

The JWT token is issued by `guild-api` and shared between services.

## Permission Model

All recruitment endpoints require the "recruitment" tool permission in the specified guild.

Permission is checked via `guild-api` on each request.

## Endpoints

### Health

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "recruitment-api"
}
```

---

### Search

#### POST /guilds/{guild_id}/recruitment/search

Search for candidates from external sources (Raider.io, WoW Progress).

**Request Body:**
```json
{
  "name": "CharacterName",
  "realm": "area-52",
  "region": "us",
  "role": "Tank",
  "class": "Warrior",
  "min_ilvl": 280,
  "min_mythic_score": 2000,
  "sources": ["raider_io", "wow_progress"]
}
```

**Response:**
```json
{
  "results": [
    {
      "candidate_name": "CharacterName",
      "realm": "area-52",
      "region": "us",
      "character_class": "Warrior",
      "role": "Tank",
      "ilvl": 290,
      "raider_io_score": 2500,
      "raid_progress": "8/8 M",
      "source": "raider_io",
      "external_url": "https://raider.io/..."
    }
  ],
  "count": 1
}
```

---

### Candidates

#### GET /guilds/{guild_id}/recruitment/candidates

List all candidates for a guild.

**Query Parameters:**
- `role` - Filter by role
- `class` - Filter by class
- `status` - Filter by status
- `category_id` - Filter by category
- `min_ilvl` - Filter by minimum ilvl
- `max_ilvl` - Filter by maximum ilvl
- `sort_by` - Sort field (ilvl, rating, raider_io_score, created_at)
- `sort_order` - Sort order (asc, desc)

**Response:**
```json
{
  "candidates": [...],
  "count": 10
}
```

#### POST /guilds/{guild_id}/recruitment/candidates

Add a candidate manually.

**Request Body:**
```json
{
  "candidate_name": "CharacterName",
  "realm": "area-52",
  "region": "us",
  "character_class": "Warrior",
  "role": "Tank",
  "ilvl": 285,
  "notes": "Found via trade chat"
}
```

#### GET /guilds/{guild_id}/recruitment/candidates/{candidate_id}

Get detailed candidate information.

**Response:**
```json
{
  "id": 1,
  "candidate_name": "CharacterName",
  "realm": "area-52",
  ...
  "history": [
    {
      "contacted_date": "2026-02-17T12:00:00Z",
      "method": "discord",
      "message": "Sent recruitment message",
      "response_received": false
    }
  ]
}
```

#### PUT /guilds/{guild_id}/recruitment/candidates/{candidate_id}

Update candidate (rating, notes, etc.).

**Request Body:**
```json
{
  "rating": 5,
  "notes": "Excellent player"
}
```

#### DELETE /guilds/{guild_id}/recruitment/candidates/{candidate_id}

Delete a candidate.

---

### Status Management

#### PUT /guilds/{guild_id}/recruitment/candidates/{candidate_id}/status

Update candidate status or category.

**Request Body:**
```json
{
  "status": "interested",
  "category_id": 2
}
```

---

### Contact Tracking

#### POST /guilds/{guild_id}/recruitment/candidates/{candidate_id}/contact

Log a contact attempt.

**Request Body:**
```json
{
  "contacted_date": "2026-02-17T12:00:00Z",
  "method": "discord",
  "message": "Sent recruitment message",
  "response_received": false
}
```

#### GET /guilds/{guild_id}/recruitment/candidates/{candidate_id}/history

Get contact history for a candidate.

---

### Pipeline

#### GET /guilds/{guild_id}/recruitment/pipeline

Get Kanban-style pipeline view.

**Response:**
```json
{
  "pipeline": [
    {
      "category": {
        "id": 1,
        "category_name": "Pending",
        "custom": false,
        "display_order": 0
      },
      "candidates": [...],
      "count": 5
    },
    ...
  ]
}
```

---

### Comparison

#### GET /guilds/{guild_id}/recruitment/compare

Compare multiple candidates.

**Query Parameters:**
- `candidate_ids` - Comma-separated list of candidate IDs

**Response:**
```json
{
  "candidates": [...],
  "count": 3
}
```

---

### Raid Composition

#### GET /guilds/{guild_id}/recruitment/composition

View raid composition needs.

**Response:**
```json
{
  "composition": {
    "Tank": [...],
    "Healer": [...],
    "Melee DPS": [...],
    "Ranged DPS": [...]
  },
  "summary": {
    "Tank": 2,
    "Healer": 4,
    "Melee DPS": 6,
    "Ranged DPS": 8
  },
  "total_candidates": 20
}
```

---

### Categories

#### GET /guilds/{guild_id}/recruitment/categories

List all categories.

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "category_name": "Pending",
      "custom": false,
      "display_order": 0
    },
    ...
  ]
}
```

#### POST /guilds/{guild_id}/recruitment/categories

Create a custom category.

**Request Body:**
```json
{
  "category_name": "High Priority",
  "display_order": 10
}
```

#### DELETE /guilds/{guild_id}/recruitment/categories/{category_id}

Delete a custom category.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

### Common Error Codes

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is enforced, but may be added in the future.

## Data Retention

- Candidates are retained indefinitely unless explicitly deleted
- Contact history is retained with candidates
- Categories are retained unless explicitly deleted
