# Progress API Documentation

## Overview

The Progress API handles character progression tracking, weekly iLvl targets, and guild progress monitoring for hool.gg.

## Authentication

All endpoints require a valid JWT access token in the `access_token` cookie. Tokens are issued by the guild-api service.

## Authorization

Endpoints check permissions via guild-api:
- **Members**: Can view their own characters and guild progress
- **Officers+**: Can view guild overview with sorting/filtering
- **GM only**: Can set weekly messages and configure roadmap

---

## Endpoints

### Health Check

#### `GET /health`

Check service health.

**Response:**
```json
{
  "status": "healthy",
  "service": "progress-api",
  "version": "0.1.0"
}
```

---

### Character Progress

#### `GET /guilds/{guild_id}/progress/characters`

List all characters in guild with their progress.

**Path Parameters:**
- `guild_id` (integer): Guild ID

**Response:**
```json
{
  "guild_id": 1,
  "expansion": "12.0",
  "current_week": 5,
  "characters": [
    {
      "id": 1,
      "character_name": "Warrior",
      "realm": "area-52",
      "class_name": "Warrior",
      "spec": "Protection",
      "role": "Tank",
      "current_ilvl": 265.5,
      "progress": {
        "target_ilvl": 265.0,
        "current_week": 5,
        "status": "ahead",
        "message": "Ahead of schedule! Target: 265, Current: 265.5"
      }
    }
  ]
}
```

---

#### `GET /guilds/{guild_id}/progress/character/{character_name}`

Get detailed character progress including gear priorities.

**Path Parameters:**
- `guild_id` (integer): Guild ID
- `character_name` (string): Character name

**Query Parameters:**
- `realm` (string, required): Realm slug (e.g., "area-52")

**Response:**
```json
{
  "character": {
    "character_name": "Warrior",
    "realm": "area-52",
    "class_name": "Warrior",
    "spec": "Protection",
    "role": "Tank",
    "current_ilvl": 265.5,
    "gear_details": { ... }
  },
  "target_ilvl": 265.0,
  "current_week": 5,
  "gear_priorities": [
    {
      "slot": "Legs",
      "ilvl": 255,
      "name": "Legplates of Testing"
    },
    {
      "slot": "Chest",
      "ilvl": 260,
      "name": "Chestplate of Testing"
    }
  ]
}
```

---

### Guild Overview (Officer+)

#### `GET /guilds/{guild_id}/progress/members`

Get guild progress overview with all members.

**Path Parameters:**
- `guild_id` (integer): Guild ID

**Query Parameters:**
- `sort` (string, optional): Sort by "ilvl", "name", or "class" (default: "ilvl")
- `class` (string, optional): Filter by class name
- `role` (string, optional): Filter by role (Tank, Healer, DPS)
- `status` (string, optional): Filter by status (on_track, behind, ahead)

**Response:**
```json
{
  "guild_id": 1,
  "expansion": "12.0",
  "current_week": 5,
  "target_ilvl": 265.0,
  "members": [
    {
      "character_name": "Warrior",
      "realm": "area-52",
      "class_name": "Warrior",
      "spec": "Protection",
      "role": "Tank",
      "current_ilvl": 265.5,
      "target_ilvl": 265.0,
      "status": "on_track"
    }
  ]
}
```

---

### Guild Messages (GM)

#### `GET /guilds/{guild_id}/progress/message`

Get weekly guidance message.

**Path Parameters:**
- `guild_id` (integer): Guild ID

**Response:**
```json
{
  "id": 1,
  "guild_id": 1,
  "gm_message": "Focus on M+ this week!",
  "created_by": 12345,
  "updated_at": "2026-02-17T12:00:00Z"
}
```

---

#### `PUT /guilds/{guild_id}/progress/message`

Set weekly guidance message (GM only).

**Path Parameters:**
- `guild_id` (integer): Guild ID

**Request Body:**
```json
{
  "message": "Focus on gearing your DPS. Mythic+ runs this week!"
}
```

**Response:**
```json
{
  "id": 1,
  "guild_id": 1,
  "gm_message": "Focus on gearing your DPS. Mythic+ runs this week!",
  "created_by": 12345,
  "updated_at": "2026-02-17T12:00:00Z"
}
```

---

### Expansion Roadmap

#### `GET /guilds/{guild_id}/progress/roadmap`

Get expansion roadmap with weekly targets.

**Path Parameters:**
- `guild_id` (integer): Guild ID

**Response:**
```json
{
  "expansion_id": "12.0",
  "weeks": [
    {
      "id": 1,
      "expansion_id": "12.0",
      "week": 0,
      "ilvl_target": 215.0,
      "description": "Pre-season gear"
    },
    {
      "id": 2,
      "expansion_id": "12.0",
      "week": 1,
      "ilvl_target": 235.0,
      "description": "Week 1-2: Mythic+ farm"
    }
  ]
}
```

---

### WarcraftLogs Comparison

#### `GET /guilds/{guild_id}/progress/comparisons`

Get WarcraftLogs comparison data (public data only).

**Path Parameters:**
- `guild_id` (integer): Guild ID

**Query Parameters:**
- `guild_name` (string, required): Guild name
- `realm` (string, required): Realm slug
- `region` (string, optional): Region code (default: "us")

**Response:**
```json
{
  "guild_performance": {
    "guild_name": "MyGuild",
    "realm": "area-52",
    "region": "us",
    "percentile": 75.0,
    "message": "Performance data is illustrative - full WCL integration pending"
  },
  "realm_average": 60.0,
  "comparison": {
    "vs_realm_average": 15.0
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Character not found or Blizzard API error"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch character details"
}
```

---

## Caching

Character data is cached in Redis for 1 hour (configurable via `CHARACTER_CACHE_TTL`). Fresh data is fetched from Blizzard API when cache expires or on first request.

---

## Rate Limiting

Blizzard API calls are subject to Blizzard's rate limits. The service handles this gracefully by using cached data when available.
