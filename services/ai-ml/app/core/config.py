"""Configuration management for AI/ML service."""

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service
    environment: str = "development"
    port: int = 8000
    log_level: str = "info"
    service_name: str = "ai-ml-service"

    # Redis
    redis_url: str = "redis://:nexus_dev_password@localhost:6379"
    redis_cache_ttl_seconds: int = 3600

    # Kafka
    kafka_brokers: str = "localhost:9092"
    kafka_topic_prefix: str = "ai"

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "nexus"
    minio_secret_key: str = "nexus_dev_password"
    minio_bucket: str = "nexus-ai-models"
    minio_secure: bool = False

    # Model Configuration
    model_cache_dir: str = "/models"
    model_cache_size_gb: int = 10
    device: str = "cpu"  # 'cuda' for GPU

    # Performance
    batch_size: int = 32
    max_workers: int = 4
    inference_timeout_seconds: int = 30

    # Feature Flags
    enable_gpu: bool = False
    enable_onnx_optimization: bool = False
    enable_model_quantization: bool = False

    # Cache TTL (seconds)
    translation_cache_ttl: int = 2592000  # 30 days
    prediction_cache_ttl: int = 3600  # 1 hour
    recommendation_cache_ttl: int = 21600  # 6 hours

    # Rate Limiting
    rate_limit_per_minute: int = 60

    # Monitoring
    enable_metrics: bool = True
    metrics_port: int = 9090

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def kafka_brokers_list(self) -> List[str]:
        """Parse Kafka brokers from comma-separated string."""
        return [b.strip() for b in self.kafka_brokers.split(",")]

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == "development"


# Global settings instance
settings = Settings()
