"""Structured logging configuration."""

import logging
import sys
from typing import Any, Dict
import json
from datetime import datetime

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": settings.service_name,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields
        if hasattr(record, "extra"):
            log_data.update(record.extra)

        return json.dumps(log_data)


def setup_logging() -> logging.Logger:
    """Configure and return logger instance."""
    logger = logging.getLogger(settings.service_name)
    logger.setLevel(getattr(logging, settings.log_level.upper()))

    # Remove existing handlers
    logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)

    if settings.is_production:
        # JSON formatting for production
        console_handler.setFormatter(JSONFormatter())
    else:
        # Human-readable formatting for development
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.propagate = False

    return logger


# Global logger instance
logger = setup_logging()
