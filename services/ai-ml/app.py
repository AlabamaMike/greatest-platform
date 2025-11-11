"""Main application entry point for AI/ML service."""

import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.utils.logger import logger
from app.api.routes.ai_routes import router as ai_router

# Import services
from app.services.cache import cache_service
from app.services.events import event_publisher
from app.services.storage import model_storage

# Import engines
from app.engines.translation import translation_engine
from app.engines.nlp import nlp_engine
from app.engines.vision import cv_engine
from app.engines.prediction import prediction_engine
from app.engines.recommendation import recommendation_engine
from app.engines.speech import speech_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown."""
    # Startup
    logger.info("🚀 Starting AI/ML Service...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Device: {settings.device}")

    # Initialize infrastructure services
    try:
        await cache_service.connect()
        await event_publisher.connect()
        model_storage.connect()
    except Exception as e:
        logger.error(f"Failed to initialize infrastructure services: {e}")
        if settings.is_production:
            raise

    # Initialize AI engines
    try:
        logger.info("Initializing AI engines...")
        await translation_engine.initialize()
        await nlp_engine.initialize()
        await cv_engine.initialize()
        await prediction_engine.initialize()
        await recommendation_engine.initialize()
        await speech_engine.initialize()
        logger.info("✅ All AI engines initialized")
    except Exception as e:
        logger.error(f"Failed to initialize AI engines: {e}")
        # Continue with available engines

    logger.info("🤖 AI/ML Service ready!")
    logger.info("🧠 Privacy-preserving AI - Translation, predictions, recommendations!")
    logger.info("🔒 All models run locally - your data stays private")

    yield

    # Shutdown
    logger.info("Shutting down AI/ML Service...")
    try:
        await cache_service.disconnect()
        await event_publisher.disconnect()
        model_storage.disconnect()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

    logger.info("AI/ML Service stopped")


# Create FastAPI application
app = FastAPI(
    title="Nexus AI/ML Service",
    description="Privacy-preserving AI for translation, predictions, recommendations, and more",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai_router, tags=["AI/ML"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Nexus AI/ML Service",
        "version": "1.0.0",
        "status": "operational",
        "description": "Privacy-preserving AI infrastructure",
        "features": [
            "Multi-language translation (100+ languages)",
            "Predictive analytics",
            "Personalized recommendations",
            "Computer vision (OCR, image analysis)",
            "Natural language processing",
            "Speech-to-text transcription"
        ],
        "privacy": "All models run locally - no external API calls",
        "docs": "/docs"
    }


if __name__ == "__main__":
    logger.info("🤖 AI/ML Service starting...")
    logger.info("🧠 Privacy-preserving AI - Translation, predictions, recommendations!")
    logger.info("🔒 All models run locally - your data stays private")

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=settings.port,
        log_level=settings.log_level.lower(),
        reload=settings.is_development
    )
