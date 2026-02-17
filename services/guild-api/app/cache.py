"""Redis connection pool and caching layer for guild-api"""

import redis
import json
import logging
from typing import Optional, Any
from functools import wraps

logger = logging.getLogger(__name__)

# Global Redis connection pool
redis_client: Optional[redis.Redis] = None


def init_redis(app) -> Optional[redis.Redis]:
    """Initialize Redis connection pool"""
    global redis_client

    redis_url = app.config.get("REDIS_URL")
    if not redis_url:
        logger.warning("REDIS_URL not configured. Caching will be disabled.")
        return None

    try:
        redis_client = redis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30,
        )
        # Test connection
        redis_client.ping()
        logger.info("Redis connection pool initialized successfully")
        return redis_client
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        redis_client = None
        return None


def get_redis() -> Optional[redis.Redis]:
    """Get Redis client instance"""
    return redis_client


def cache_get(key: str) -> Optional[Any]:
    """Get value from cache

    Args:
        key: Cache key

    Returns:
        Cached value (deserialized from JSON) or None if not found or error
    """
    if not redis_client:
        return None

    try:
        value = redis_client.get(key)
        if value is None:
            return None
        return json.loads(value)
    except Exception as e:
        logger.error(f"Cache get error for key {key}: {e}")
        return None


def cache_set(key: str, value: Any, ttl: int = 300) -> bool:
    """Set value in cache

    Args:
        key: Cache key
        value: Value to cache (will be JSON serialized)
        ttl: Time to live in seconds (default: 300 = 5 minutes)

    Returns:
        True if successful, False otherwise
    """
    if not redis_client:
        return False

    try:
        serialized = json.dumps(value)
        redis_client.setex(key, ttl, serialized)
        return True
    except Exception as e:
        logger.error(f"Cache set error for key {key}: {e}")
        return False


def cache_delete(key: str) -> bool:
    """Delete value from cache

    Args:
        key: Cache key

    Returns:
        True if successful, False otherwise
    """
    if not redis_client:
        return False

    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Cache delete error for key {key}: {e}")
        return False


def cache_delete_pattern(pattern: str) -> int:
    """Delete all keys matching a pattern

    Args:
        pattern: Pattern to match (e.g., "guild:123:*")

    Returns:
        Number of keys deleted, or 0 on error
    """
    if not redis_client:
        return 0

    try:
        keys = redis_client.keys(pattern)
        if keys:
            return redis_client.delete(*keys)
        return 0
    except Exception as e:
        logger.error(f"Cache delete pattern error for pattern {pattern}: {e}")
        return 0


def cached(key_prefix: str, ttl: int = 300):
    """Decorator to cache function results

    Usage:
        @cached("user:profile", ttl=600)
        def get_user_profile(user_id):
            # ... expensive operation ...
            return profile

    Args:
        key_prefix: Prefix for cache key (will append function args)
        ttl: Time to live in seconds (default: 300 = 5 minutes)
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key from prefix and arguments
            cache_key_parts = [key_prefix]
            cache_key_parts.extend(str(arg) for arg in args)
            cache_key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = ":".join(cache_key_parts)

            # Try to get from cache
            cached_result = cache_get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_result

            # Cache miss - execute function
            logger.debug(f"Cache miss for key: {cache_key}")
            result = func(*args, **kwargs)

            # Store in cache
            cache_set(cache_key, result, ttl)

            return result

        return wrapper

    return decorator


# Convenience functions for common cache patterns


def cache_permission_check(guild_id: int, bnet_id: int, tool_name: str) -> Optional[dict]:
    """Get cached permission check result

    Args:
        guild_id: Guild ID
        bnet_id: Battle.net ID
        tool_name: Tool name

    Returns:
        Permission check result or None if not cached
    """
    key = f"permission:{guild_id}:{bnet_id}:{tool_name}"
    return cache_get(key)


def cache_set_permission_check(
    guild_id: int, bnet_id: int, tool_name: str, has_access: bool, ttl: int = 300
) -> bool:
    """Cache permission check result

    Args:
        guild_id: Guild ID
        bnet_id: Battle.net ID
        tool_name: Tool name
        has_access: Whether user has access
        ttl: Time to live in seconds (default: 300 = 5 minutes)

    Returns:
        True if successful, False otherwise
    """
    key = f"permission:{guild_id}:{bnet_id}:{tool_name}"
    return cache_set(key, {"has_access": has_access}, ttl)


def invalidate_guild_cache(guild_id: int) -> int:
    """Invalidate all cache entries for a guild

    Args:
        guild_id: Guild ID

    Returns:
        Number of keys deleted
    """
    pattern = f"*:{guild_id}:*"
    return cache_delete_pattern(pattern)


def invalidate_user_cache(bnet_id: int) -> int:
    """Invalidate all cache entries for a user

    Args:
        bnet_id: Battle.net ID

    Returns:
        Number of keys deleted
    """
    pattern = f"*:{bnet_id}:*"
    return cache_delete_pattern(pattern)
