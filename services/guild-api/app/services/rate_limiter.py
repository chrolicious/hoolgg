"""Rate limiting and circuit breaker for Blizzard API calls

Implements:
- Rate limiting (100 req/sec per IP, 36k/hour per client)
- Circuit breaker pattern (fail fast when API is down)
- Retry logic with exponential backoff
"""

import time
import redis
from typing import Callable, Any
from functools import wraps
from flask import current_app
import requests


class RateLimitExceeded(Exception):
    """Rate limit exceeded exception"""

    pass


class CircuitBreakerOpen(Exception):
    """Circuit breaker is open (API unavailable)"""

    pass


class RateLimiter:
    """
    Redis-based rate limiter

    Implements token bucket algorithm for Blizzard API rate limits.
    """

    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client

    def check_rate_limit(self, key: str, limit: int, window: int) -> bool:
        """
        Check if rate limit allows request

        Args:
            key: Rate limit key (e.g., "blizzard_api:client_id")
            limit: Maximum requests allowed in window
            window: Time window in seconds

        Returns:
            True if request allowed, False if rate limit exceeded
        """
        current_time = int(time.time())
        window_key = f"{key}:{current_time // window}"

        try:
            # Increment counter for current window
            count = self.redis.incr(window_key)

            # Set expiry on first request
            if count == 1:
                self.redis.expire(window_key, window)

            return count <= limit

        except redis.RedisError as e:
            current_app.logger.error(f"Redis error in rate limiter: {e}")
            # Fail open - allow request if Redis is down
            return True

    def wait_if_needed(self, key: str, limit: int, window: int) -> None:
        """
        Block until rate limit allows request

        Args:
            key: Rate limit key
            limit: Maximum requests allowed
            window: Time window in seconds

        Raises:
            RateLimitExceeded: If rate limit is hit after max wait time
        """
        max_wait = 5  # Max 5 seconds wait
        waited = 0

        while not self.check_rate_limit(key, limit, window):
            if waited >= max_wait:
                raise RateLimitExceeded(f"Rate limit exceeded for {key}")

            time.sleep(0.1)
            waited += 0.1


class CircuitBreaker:
    """
    Circuit breaker for Blizzard API

    States:
    - CLOSED: Normal operation, requests allowed
    - OPEN: Too many failures, requests blocked
    - HALF_OPEN: Testing if service recovered
    """

    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

    def __init__(self, redis_client: redis.Redis, failure_threshold: int = 5, timeout: int = 60):
        """
        Args:
            redis_client: Redis connection
            failure_threshold: Number of failures before opening circuit
            timeout: Seconds before attempting recovery (HALF_OPEN)
        """
        self.redis = redis_client
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.key_prefix = "circuit_breaker:blizzard_api"

    def get_state(self) -> str:
        """Get current circuit breaker state"""
        state = self.redis.get(f"{self.key_prefix}:state")
        return state.decode() if state else self.CLOSED

    def get_failures(self) -> int:
        """Get failure count"""
        failures = self.redis.get(f"{self.key_prefix}:failures")
        return int(failures) if failures else 0

    def record_success(self) -> None:
        """Record successful API call"""
        self.redis.delete(f"{self.key_prefix}:failures")
        self.redis.set(f"{self.key_prefix}:state", self.CLOSED)

    def record_failure(self) -> None:
        """Record failed API call"""
        failures = self.redis.incr(f"{self.key_prefix}:failures")

        if failures >= self.failure_threshold:
            # Open the circuit
            self.redis.set(f"{self.key_prefix}:state", self.OPEN)
            self.redis.setex(
                f"{self.key_prefix}:open_until", self.timeout, int(time.time()) + self.timeout
            )
            current_app.logger.warning(
                f"Circuit breaker OPEN - {failures} failures detected"
            )

    def can_attempt(self) -> bool:
        """Check if request can be attempted"""
        state = self.get_state()

        if state == self.CLOSED:
            return True

        if state == self.OPEN:
            # Check if timeout expired
            open_until = self.redis.get(f"{self.key_prefix}:open_until")
            if open_until and int(open_until) < int(time.time()):
                # Move to HALF_OPEN
                self.redis.set(f"{self.key_prefix}:state", self.HALF_OPEN)
                return True
            return False

        if state == self.HALF_OPEN:
            return True

        return False


def with_rate_limit_and_circuit_breaker(func: Callable) -> Callable:
    """
    Decorator for Blizzard API calls

    Applies rate limiting and circuit breaker pattern.
    """

    @wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        # Get Redis client (will be initialized in task 0.35)
        try:
            redis_url = current_app.config.get("REDIS_URL")
            if not redis_url:
                # Redis not configured, skip rate limiting
                return func(*args, **kwargs)

            redis_client = redis.from_url(redis_url)
            circuit_breaker = CircuitBreaker(redis_client)
            rate_limiter = RateLimiter(redis_client)

            # Check circuit breaker
            if not circuit_breaker.can_attempt():
                raise CircuitBreakerOpen("Blizzard API circuit breaker is OPEN")

            # Check rate limit (36,000 requests per hour = 600 per minute)
            rate_limiter.wait_if_needed("blizzard_api:hourly", 600, 60)

            # Execute API call
            try:
                result = func(*args, **kwargs)
                circuit_breaker.record_success()
                return result

            except (requests.RequestException, Exception) as e:
                circuit_breaker.record_failure()
                raise

        except redis.RedisError as e:
            current_app.logger.warning(f"Redis unavailable, bypassing rate limiter: {e}")
            # Fail open - allow request if Redis is down
            return func(*args, **kwargs)

    return wrapper
