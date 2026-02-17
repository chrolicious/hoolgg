# Caching Strategy - guild-api

This document describes the Redis caching layer implementation in guild-api.

## Overview

The guild-api uses Redis for caching to improve performance and reduce database load. Caching is particularly important for:

- Permission checks (checked on every request)
- Guild member lists (frequently accessed)
- User profile data

## Configuration

### Environment Variables

```bash
REDIS_URL=redis://host:port/0
```

### Connection Pool

The application uses a connection pool for efficient Redis connections:

```python
from app.cache import init_redis, get_redis

# In application factory
init_redis(app)

# In routes/services
redis_client = get_redis()
```

## Cache Functions

### Basic Operations

```python
from app.cache import cache_get, cache_set, cache_delete

# Set value (TTL: 5 minutes by default)
cache_set("key", {"data": "value"})

# Set with custom TTL (10 minutes)
cache_set("key", {"data": "value"}, ttl=600)

# Get value
result = cache_get("key")

# Delete value
cache_delete("key")
```

### Pattern-Based Operations

```python
from app.cache import cache_delete_pattern

# Delete all keys matching pattern
deleted_count = cache_delete_pattern("guild:123:*")
```

### Decorator-Based Caching

```python
from app.cache import cached

@cached("user:profile", ttl=600)
def get_user_profile(user_id):
    # Expensive database operation
    return fetch_from_db(user_id)

# First call: Cache miss, executes function
profile = get_user_profile(123)

# Second call: Cache hit, returns cached result
profile = get_user_profile(123)
```

## Common Cache Patterns

### Permission Checks

Permission checks are cached for 5 minutes (300 seconds):

```python
from app.cache import cache_permission_check, cache_set_permission_check

# Check cache first
cached = cache_permission_check(guild_id, bnet_id, tool_name)
if cached is not None:
    return cached["has_access"]

# Cache miss - check database
has_access = check_permission_from_db(guild_id, bnet_id, tool_name)

# Cache result
cache_set_permission_check(guild_id, bnet_id, tool_name, has_access, ttl=300)
```

### Cache Invalidation

When data changes, invalidate related cache entries:

```python
from app.cache import invalidate_guild_cache, invalidate_user_cache

# When guild settings change
invalidate_guild_cache(guild_id)

# When user data changes
invalidate_user_cache(bnet_id)
```

## Cache Key Patterns

### Permission Checks
- **Pattern**: `permission:{guild_id}:{bnet_id}:{tool_name}`
- **TTL**: 300 seconds (5 minutes)
- **Example**: `permission:123:456789:progress`

### Guild Members
- **Pattern**: `guild:{guild_id}:members`
- **TTL**: 300 seconds (5 minutes)
- **Example**: `guild:123:members`

### User Profile
- **Pattern**: `user:profile:{bnet_id}`
- **TTL**: 600 seconds (10 minutes)
- **Example**: `user:profile:456789`

## TTL Guidelines

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Permission checks | 5 minutes | Balance between freshness and performance |
| Guild members | 5 minutes | Roster changes are infrequent |
| User profiles | 10 minutes | User data rarely changes |
| Guild settings | 10 minutes | Settings change infrequently |
| Temporary data | 1 minute | Very short-lived data |

## Cache Invalidation Strategy

### When to Invalidate

Invalidate cache entries when the underlying data changes:

1. **Guild permissions updated** → Invalidate all permission checks for that guild
2. **Guild member rank changed** → Invalidate member cache and permission checks
3. **Guild settings updated** → Invalidate guild cache
4. **User logs out** → Invalidate user session cache

### Invalidation Examples

```python
from app.cache import cache_delete, cache_delete_pattern, invalidate_guild_cache

# After updating guild permissions
@app.route('/guilds/<int:guild_id>/permissions', methods=['PUT'])
def update_permissions(guild_id):
    # Update database
    update_guild_permissions(guild_id)

    # Invalidate cache
    invalidate_guild_cache(guild_id)

    return jsonify({"success": True})

# After syncing guild members
@app.route('/guilds/<int:guild_id>/sync', methods=['POST'])
def sync_guild_members(guild_id):
    # Sync from Blizzard API
    sync_members_from_blizzard(guild_id)

    # Invalidate member cache
    cache_delete(f"guild:{guild_id}:members")

    # Invalidate all permission checks for this guild
    cache_delete_pattern(f"permission:{guild_id}:*")

    return jsonify({"success": True})
```

## Graceful Degradation

The caching layer is designed to fail gracefully if Redis is unavailable:

```python
def cache_get(key: str) -> Optional[Any]:
    if not redis_client:
        return None  # No cache, continue without it

    try:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    except Exception as e:
        logger.error(f"Cache get error: {e}")
        return None  # Continue without cache
```

**Benefits:**
- Application continues to work without Redis
- Performance may degrade, but functionality remains
- Errors are logged for monitoring

## Monitoring

### Key Metrics to Monitor

1. **Cache Hit Rate**
   - Target: > 80%
   - Monitor: `hits / (hits + misses)`

2. **Cache Size**
   - Monitor memory usage
   - Set maxmemory policy in Redis

3. **Connection Pool Usage**
   - Monitor active connections
   - Adjust pool size if needed

4. **Cache Errors**
   - Monitor error logs
   - Alert on connection failures

### Redis CLI Commands

```bash
# Connect to Redis
redis-cli -h host -p port

# Check memory usage
INFO memory

# View cache hit rate
INFO stats

# List all keys (use carefully in production)
KEYS *

# View specific key
GET "permission:123:456789:progress"

# Delete specific key
DEL "permission:123:456789:progress"

# Delete pattern (use SCAN instead of KEYS in production)
EVAL "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 "guild:123:*"

# Flush all cache (DANGEROUS - production use only in emergencies)
FLUSHDB
```

## Best Practices

### 1. Always Set TTL

Never cache data indefinitely:

```python
# Bad - no TTL
cache_set("key", value)

# Good - explicit TTL
cache_set("key", value, ttl=300)
```

### 2. Handle Cache Misses

Always handle the case where cache is empty:

```python
# Get from cache
cached = cache_get("key")

# Handle miss
if cached is None:
    # Fetch from database
    data = fetch_from_database()
    # Cache result
    cache_set("key", data, ttl=300)
    return data

return cached
```

### 3. Invalidate on Writes

Always invalidate cache when data changes:

```python
# Update database
update_data(id)

# Invalidate cache
cache_delete(f"data:{id}")
```

### 4. Use Namespaces

Prefix keys with namespace for easy management:

```python
# Good - namespaced keys
cache_set(f"guild:{guild_id}:members", members)
cache_set(f"user:{user_id}:profile", profile)

# Bad - no namespace
cache_set(f"{guild_id}_members", members)
```

### 5. Monitor Performance

Track cache effectiveness:

```python
import logging

logger.debug(f"Cache hit for key: {key}")  # On hit
logger.debug(f"Cache miss for key: {key}")  # On miss
logger.error(f"Cache error: {e}")  # On error
```

## Testing

### Testing with Cache

```python
def test_permission_check_with_cache():
    # First call - cache miss
    result1 = check_permission(guild_id, bnet_id, tool_name)

    # Second call - cache hit (should be faster)
    result2 = check_permission(guild_id, bnet_id, tool_name)

    assert result1 == result2
```

### Testing without Cache

For unit tests, disable Redis:

```python
# In test setup
app.config['REDIS_URL'] = None
init_redis(app)  # Will disable caching

# Tests will run without cache
```

## Troubleshooting

### Cache Not Working

1. Check Redis is running:
   ```bash
   redis-cli ping
   ```

2. Verify REDIS_URL is set:
   ```bash
   echo $REDIS_URL
   ```

3. Check logs for connection errors:
   ```bash
   grep "Redis" app.log
   ```

### High Memory Usage

1. Check Redis memory:
   ```bash
   redis-cli INFO memory
   ```

2. Set maxmemory policy:
   ```bash
   redis-cli CONFIG SET maxmemory 256mb
   redis-cli CONFIG SET maxmemory-policy allkeys-lru
   ```

3. Review TTL values - reduce if too high

### Cache Stampede

If many requests miss cache at the same time (cache stampede):

1. Use cache warming (pre-populate cache)
2. Implement cache locking
3. Use probabilistic early expiration

## References

- [Redis Documentation](https://redis.io/documentation)
- [redis-py Documentation](https://redis-py.readthedocs.io/)
- [Cache Stampede Prevention](https://en.wikipedia.org/wiki/Cache_stampede)
