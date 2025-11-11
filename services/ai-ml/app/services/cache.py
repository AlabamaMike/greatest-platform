"""Redis caching service for AI/ML inference results."""

import json
import hashlib
from typing import Any, Optional
import redis.asyncio as aioredis

from app.core.config import settings
from app.utils.logger import logger


class CacheService:
    """Redis-based caching for inference results."""

    def __init__(self):
        """Initialize cache service."""
        self.redis: Optional[aioredis.Redis] = None
        self._connected = False

    async def connect(self) -> None:
        """Connect to Redis."""
        try:
            self.redis = await aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            await self.redis.ping()
            self._connected = True
            logger.info("✅ Redis cache connected")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self._connected = False
            # Continue without cache in development
            if settings.is_production:
                raise

    async def disconnect(self) -> None:
        """Disconnect from Redis."""
        if self.redis:
            await self.redis.close()
            self._connected = False
            logger.info("Redis cache disconnected")

    def _make_key(self, prefix: str, *args: Any) -> str:
        """Generate cache key from prefix and arguments."""
        # Create deterministic hash of arguments
        data = json.dumps(args, sort_keys=True)
        hash_value = hashlib.sha256(data.encode()).hexdigest()[:16]
        return f"{settings.service_name}:{prefix}:{hash_value}"

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self._connected or not self.redis:
            return None

        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.warning(f"Cache get error for key {key}: {e}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache with optional TTL."""
        if not self._connected or not self.redis:
            return False

        try:
            ttl = ttl or settings.redis_cache_ttl_seconds
            serialized = json.dumps(value)
            await self.redis.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.warning(f"Cache set error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self._connected or not self.redis:
            return False

        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete error for key {key}: {e}")
            return False

    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate all keys matching pattern."""
        if not self._connected or not self.redis:
            return 0

        try:
            cursor = 0
            deleted = 0
            while True:
                cursor, keys = await self.redis.scan(
                    cursor,
                    match=pattern,
                    count=100
                )
                if keys:
                    deleted += await self.redis.delete(*keys)
                if cursor == 0:
                    break
            logger.info(f"Invalidated {deleted} keys matching {pattern}")
            return deleted
        except Exception as e:
            logger.warning(f"Cache invalidation error for pattern {pattern}: {e}")
            return 0

    async def get_translation(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> Optional[dict]:
        """Get cached translation."""
        key = self._make_key("translation", text, source_lang, target_lang)
        return await self.get(key)

    async def set_translation(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        result: dict
    ) -> bool:
        """Cache translation result."""
        key = self._make_key("translation", text, source_lang, target_lang)
        return await self.set(key, result, settings.translation_cache_ttl)

    async def get_prediction(
        self,
        model_type: str,
        features: dict
    ) -> Optional[dict]:
        """Get cached prediction."""
        key = self._make_key("prediction", model_type, features)
        return await self.get(key)

    async def set_prediction(
        self,
        model_type: str,
        features: dict,
        result: dict
    ) -> bool:
        """Cache prediction result."""
        key = self._make_key("prediction", model_type, features)
        return await self.set(key, result, settings.prediction_cache_ttl)

    async def get_recommendation(
        self,
        user_id: str,
        context: str,
        filters: Optional[dict] = None
    ) -> Optional[dict]:
        """Get cached recommendations."""
        key = self._make_key("recommendation", user_id, context, filters)
        return await self.get(key)

    async def set_recommendation(
        self,
        user_id: str,
        context: str,
        result: dict,
        filters: Optional[dict] = None
    ) -> bool:
        """Cache recommendation result."""
        key = self._make_key("recommendation", user_id, context, filters)
        return await self.set(key, result, settings.recommendation_cache_ttl)

    @property
    def is_connected(self) -> bool:
        """Check if cache is connected."""
        return self._connected


# Global cache instance
cache_service = CacheService()
