"""Kafka event publisher for AI/ML service."""

import json
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import uuid4
from aiokafka import AIOKafkaProducer

from app.core.config import settings
from app.utils.logger import logger


class EventPublisher:
    """Publish events to Kafka for async processing and integration."""

    def __init__(self):
        """Initialize event publisher."""
        self.producer: Optional[AIOKafkaProducer] = None
        self._connected = False

    async def connect(self) -> None:
        """Connect to Kafka."""
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=settings.kafka_brokers_list,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
            await self.producer.start()
            self._connected = True
            logger.info("✅ Kafka event publisher connected")
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            self._connected = False
            # Continue without events in development
            if settings.is_production:
                raise

    async def disconnect(self) -> None:
        """Disconnect from Kafka."""
        if self.producer:
            await self.producer.stop()
            self._connected = False
            logger.info("Kafka event publisher disconnected")

    async def publish(
        self,
        event_type: str,
        data: Dict[str, Any],
        topic: Optional[str] = None
    ) -> bool:
        """Publish event to Kafka."""
        if not self._connected or not self.producer:
            logger.warning(f"Cannot publish event {event_type}: not connected")
            return False

        try:
            topic = topic or f"{settings.kafka_topic_prefix}.events"

            event = {
                "specversion": "1.0",
                "type": event_type,
                "source": f"/{settings.service_name}",
                "id": str(uuid4()),
                "time": datetime.utcnow().isoformat(),
                "data": data,
            }

            await self.producer.send(topic, value=event)
            logger.debug(f"Published event {event_type} to {topic}")
            return True
        except Exception as e:
            logger.error(f"Failed to publish event {event_type}: {e}")
            return False

    async def publish_translation_completed(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        translated_text: str,
        user_id: Optional[str] = None
    ) -> bool:
        """Publish translation completed event."""
        return await self.publish(
            "ai.translation.completed",
            {
                "source_lang": source_lang,
                "target_lang": target_lang,
                "character_count": len(text),
                "user_id": user_id,
            }
        )

    async def publish_prediction_completed(
        self,
        model_type: str,
        prediction: str,
        probability: float,
        user_id: Optional[str] = None
    ) -> bool:
        """Publish prediction completed event."""
        return await self.publish(
            "ai.prediction.completed",
            {
                "model_type": model_type,
                "prediction": prediction,
                "probability": probability,
                "user_id": user_id,
            }
        )

    async def publish_recommendation_generated(
        self,
        user_id: str,
        context: str,
        recommendation_count: int
    ) -> bool:
        """Publish recommendation generated event."""
        return await self.publish(
            "ai.recommendation.generated",
            {
                "user_id": user_id,
                "context": context,
                "recommendation_count": recommendation_count,
            }
        )

    async def publish_image_analyzed(
        self,
        analysis_type: str,
        findings_count: int,
        user_id: Optional[str] = None
    ) -> bool:
        """Publish image analysis completed event."""
        return await self.publish(
            "ai.image.analyzed",
            {
                "analysis_type": analysis_type,
                "findings_count": findings_count,
                "user_id": user_id,
            }
        )

    async def publish_model_loaded(
        self,
        model_name: str,
        version: str,
        load_time_ms: float
    ) -> bool:
        """Publish model loaded event."""
        return await self.publish(
            "ai.model.loaded",
            {
                "model_name": model_name,
                "version": version,
                "load_time_ms": load_time_ms,
            }
        )

    async def publish_model_failed(
        self,
        model_name: str,
        error: str
    ) -> bool:
        """Publish model loading/inference failure event."""
        return await self.publish(
            "ai.model.failed",
            {
                "model_name": model_name,
                "error": error,
            }
        )

    @property
    def is_connected(self) -> bool:
        """Check if event publisher is connected."""
        return self._connected


# Global event publisher instance
event_publisher = EventPublisher()
