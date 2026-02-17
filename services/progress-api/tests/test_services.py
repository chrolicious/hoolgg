"""Test service layer"""

from app.services.cache_service import CacheService


def test_cache_service_build_key():
    """Test cache key building"""
    cache = CacheService()

    key = cache.build_character_cache_key("TestChar", "Area-52")

    assert key == "character:testchar:area-52"


def test_cache_service_get_set():
    """Test cache get/set operations"""
    cache = CacheService()

    # Set a value
    success = cache.set("test_key", {"data": "test"}, ttl=60)

    # Get the value
    value = cache.get("test_key")

    if success:
        assert value == {"data": "test"}

    # Delete the value
    cache.delete("test_key")

    # Should return None after deletion
    value = cache.get("test_key")
    assert value is None
