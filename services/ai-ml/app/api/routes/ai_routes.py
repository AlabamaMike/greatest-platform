"""API routes for AI/ML service."""

from datetime import datetime
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException, Form

from app.models.schemas import *
from app.engines.translation import translation_engine
from app.engines.nlp import nlp_engine
from app.engines.vision import cv_engine
from app.engines.prediction import prediction_engine
from app.engines.recommendation import recommendation_engine
from app.engines.speech import speech_engine
from app.utils.logger import logger

router = APIRouter()


# ============================================================================
# Health & Info Endpoints
# ============================================================================

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ai-ml-service",
        "models_loaded": ["translation", "nlp", "vision", "prediction", "recommendation", "speech"],
        "timestamp": datetime.now().isoformat()
    }


@router.get("/api/v1/ai/models")
async def get_models():
    """Get information about available models."""
    return {
        "success": True,
        "data": {
            "models": [
                {
                    "name": "NLLB-200",
                    "purpose": "Multilingual translation (100+ languages)",
                    "size": "600M parameters",
                    "privacy": "Runs locally - no data sent to external APIs"
                },
                {
                    "name": "Sentiment Analyzer",
                    "purpose": "Text sentiment analysis and emotion detection",
                    "size": "Base model",
                    "privacy": "Privacy-preserving local inference"
                },
                {
                    "name": "NER Model",
                    "purpose": "Named entity recognition",
                    "size": "Base model",
                    "privacy": "Local processing only"
                },
                {
                    "name": "Computer Vision",
                    "purpose": "Image analysis, OCR, accessibility",
                    "size": "Various models",
                    "privacy": "Privacy-preserving visual AI"
                },
                {
                    "name": "Whisper",
                    "purpose": "Speech recognition and transcription",
                    "size": "Large-v2",
                    "privacy": "Local processing only"
                }
            ],
            "note": "All models run on Nexus infrastructure - user data never leaves the platform"
        }
    }


@router.get("/api/v1/ai/languages")
async def get_supported_languages():
    """Get list of supported languages."""
    languages = translation_engine.get_supported_languages()
    return {
        "success": True,
        "data": languages
    }


# ============================================================================
# Translation Endpoints
# ============================================================================

@router.post("/api/v1/ai/translate")
async def translate(request: TranslationRequest):
    """Translate text between languages."""
    try:
        result = await translation_engine.translate(request)
        return {
            "success": True,
            "message": "Translation complete",
            "data": result.model_dump(),
            "metadata": {
                "cached": result.cached,
                "character_count": len(request.text)
            }
        }
    except Exception as e:
        logger.error(f"Translation endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# NLP Endpoints
# ============================================================================

@router.post("/api/v1/ai/sentiment")
async def analyze_sentiment(text: str):
    """Analyze sentiment of text."""
    try:
        result = await nlp_engine.analyze_sentiment(text)
        return {
            "success": True,
            "message": "Sentiment analysis complete",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Sentiment analysis endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/extract-entities")
async def extract_entities(text: str):
    """Extract named entities from text."""
    try:
        result = await nlp_engine.extract_entities(text)
        return {
            "success": True,
            "message": "Entity extraction complete",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Entity extraction endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/moderate")
async def moderate_content(content: str):
    """Moderate content for safety."""
    try:
        result = await nlp_engine.moderate_content(content)
        return {
            "success": True,
            "message": "Content moderation analysis",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Content moderation endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/generate")
async def generate_text(prompt: str, max_tokens: int = 200):
    """Generate text from prompt."""
    try:
        result = await nlp_engine.generate_text(prompt, max_tokens)
        return {
            "success": True,
            "message": "Text generation complete",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Text generation endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/skill-gap")
async def analyze_skill_gap(current_skills: List[str], target_role: str):
    """Analyze skill gap for career development."""
    try:
        result = await nlp_engine.analyze_skill_gap(current_skills, target_role)
        return {
            "success": True,
            "message": "Skill gap analysis complete",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Skill gap analysis endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Computer Vision Endpoints
# ============================================================================

@router.post("/api/v1/ai/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """Extract text from images (OCR)."""
    try:
        result = await cv_engine.perform_ocr(file)
        return {
            "success": True,
            "message": "OCR processing complete",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"OCR endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    analysis_type: str = Form("general")
):
    """Analyze image content."""
    try:
        result = await cv_engine.analyze_image(file, analysis_type)
        return {
            "success": True,
            "message": f"Image analysis complete ({analysis_type})",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Image analysis endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Prediction Endpoints
# ============================================================================

@router.post("/api/v1/ai/predict")
async def predict(request: PredictionRequest):
    """Make predictions using ML models."""
    try:
        result = await prediction_engine.predict(request)
        return {
            "success": True,
            "message": f"Prediction from {request.model_type} model",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Prediction endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Recommendation Endpoints
# ============================================================================

@router.post("/api/v1/ai/recommend")
async def recommend(request: RecommendationRequest):
    """Get personalized recommendations."""
    try:
        result = await recommendation_engine.recommend(request)
        return {
            "success": True,
            "message": f"AI-powered recommendations for {request.context}",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Recommendation endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Speech Endpoints
# ============================================================================

@router.post("/api/v1/ai/speech-to-text")
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = Form(None)
):
    """Transcribe speech to text."""
    try:
        result = await speech_engine.transcribe(audio, language)
        return {
            "success": True,
            "message": "Speech transcription complete",
            "data": result.model_dump()
        }
    except Exception as e:
        logger.error(f"Speech-to-text endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
