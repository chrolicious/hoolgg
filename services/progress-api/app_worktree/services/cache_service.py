"""Cache service - Redis caching layer"""

import redis
import json
import logging
from typing import Optional, Any
from flask import current_app

logger = logging.getLogger(__name__)


class CacheService:
    """Service for caching data in Redis"""

    def __init__(self):
        self._redis_client: Optional[redis.Redis] = None

    def get_client(self) -> Optional[redis.Redis]:
        """Get or create Redis client"""
        if self._redis_client:
            return self._redis_client

        redis_url = current_app.config.get("REDIS_URL")
        if not redis_url:
            logger.warning("REDIS_URL not configured, caching disabled")
            return None

        try:
            self._redis_client = redis.from_url(
                redis_url, decode_responses=True, socket_timeout=5
            )
            # Test connection
            self._redis_client.ping()
            logger.info("Redis connection established")
            return self._redis_client

        except redis.RedisError as e:
            logger.error(f"Failed to connect to Redis: {e}")
            return None

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value (parsed from JSON) or None
        """
        client = self.get_client()
        if not client:
            return None

        try:
            value = client.get(key)
            if value:
                return json.loads(value)
            return None

        except (redis.RedisError, json.JSONDecodeError) as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache (will be JSON-serialized)
            ttl: Time to live in seconds (optional)

        Returns:
            True if successful, False otherwise
        """
        client = self.get_client()
        if not client:
            return False

        try:
            serialized = json.dumps(value)
            if ttl:
                client.setex(key, ttl, serialized)
            else:
                client.set(key, serialized)
            return True

        except (redis.RedisError, TypeError) as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """
        Delete value from cache

        Args:
            key: Cache key

        Returns:
            True if successful, False otherwise
        """
        client = self.get_client()
        if not client:
            return False

        try:
            client.delete(key)
            return True

        except redis.RedisError as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

    def build_character_cache_key(self, character_name: str, realm: str) -> str:
        """Build cache key for character data"""
        return f"character:{character_name.lower()}:{realm.lower()}"

    def get_character_data(self, character_name: str, realm: str) -> Optional[Any]:
        """Get cached character data"""
        key = self.build_character_cache_key(character_name, realm)
        return self.get(key)

    def cache_character_data(
        self, character_name: str, realm: str, data: Any, ttl: Optional[int] = None
    ) -> bool:
        """Cache character data"""
        key = self.build_character_cache_key(character_name, realm)
        if ttl is None:
            ttl = current_app.config.get("CHARACTER_CACHE_TTL", 3600)
        return self.set(key, data, ttl)
