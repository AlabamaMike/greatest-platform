"""Pydantic schemas for API requests and responses."""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field, field_validator


# ============================================================================
# Translation Models
# ============================================================================

class TranslationOptions(BaseModel):
    """Options for translation."""
    formal: bool = False
    preserve_formatting: bool = True


class TranslationRequest(BaseModel):
    """Request for translation."""
    text: str = Field(..., min_length=1, max_length=10000)
    source_lang: str = Field(..., pattern=r"^[a-z]{2,3}$")
    target_lang: str = Field(..., pattern=r"^[a-z]{2,3}$")
    options: Optional[TranslationOptions] = None


class TranslationResponse(BaseModel):
    """Response for translation."""
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    detected_lang: Optional[str] = None
    confidence: float
    model: str
    cached: bool


# ============================================================================
# Prediction Models
# ============================================================================

class PredictionOptions(BaseModel):
    """Options for prediction."""
    explain: bool = False
    confidence_interval: float = 0.95


class PredictionRequest(BaseModel):
    """Request for prediction."""
    model_type: str
    features: Dict[str, Any]
    options: Optional[PredictionOptions] = None


class RiskFactor(BaseModel):
    """Risk factor in prediction."""
    factor: str
    impact: float


class PredictionExplanation(BaseModel):
    """Explanation of prediction."""
    method: str
    top_features: List[Dict[str, Any]]


class PredictionResponse(BaseModel):
    """Response for prediction."""
    prediction: str
    probability: float
    confidence_interval: Optional[Tuple[float, float]] = None
    risk_factors: Optional[List[RiskFactor]] = None
    recommended_actions: Optional[List[str]] = None
    model: str
    explanation: Optional[PredictionExplanation] = None


# ============================================================================
# Recommendation Models
# ============================================================================

class RecommendationRequest(BaseModel):
    """Request for recommendations."""
    user_id: str
    context: str
    limit: int = Field(5, ge=1, le=50)
    filters: Optional[Dict[str, Any]] = None


class Recommendation(BaseModel):
    """Single recommendation."""
    id: str
    title: str
    relevance_score: float
    reasoning: str
    metadata: Dict[str, Any]


class Personalization(BaseModel):
    """Personalization info."""
    user_id: str
    profile_features: List[str]
    model: str


class RecommendationResponse(BaseModel):
    """Response for recommendations."""
    recommendations: List[Recommendation]
    personalization: Personalization


# ============================================================================
# Computer Vision Models
# ============================================================================

class Finding(BaseModel):
    """Single finding from image analysis."""
    category: str
    observation: str
    confidence: float
    bounding_box: Optional[List[float]] = None


class ImageAnalysisResponse(BaseModel):
    """Response for image analysis."""
    analysis_type: str
    findings: List[Finding]
    confidence: float
    model: str
    disclaimer: Optional[str] = None


class OCRResponse(BaseModel):
    """Response for OCR."""
    filename: str
    extracted_text: str
    language_detected: str
    confidence: float
    page_count: int
    model: str


# ============================================================================
# NLP Models
# ============================================================================

class SentimentResponse(BaseModel):
    """Response for sentiment analysis."""
    text: str
    sentiment: str
    score: float
    emotions: Dict[str, float]
    model: str


class Entity(BaseModel):
    """Named entity."""
    text: str
    type: str
    confidence: float


class EntityExtractionResponse(BaseModel):
    """Response for entity extraction."""
    text: str
    entities: List[Entity]
    model: str


class ModerationCategory(BaseModel):
    """Content moderation category scores."""
    spam: float
    hate_speech: float
    violence: float
    adult_content: float


class ModerationResponse(BaseModel):
    """Response for content moderation."""
    is_safe: bool
    toxicity_score: float
    categories: ModerationCategory
    action: str
    model: str


class TextGenerationResponse(BaseModel):
    """Response for text generation."""
    prompt: str
    generated_text: str
    tokens_used: int
    model: str
    temperature: float
    note: str


class SkillGapResponse(BaseModel):
    """Response for skill gap analysis."""
    current_skills: List[str]
    target_role: str
    missing_skills: List[str]
    recommended_courses: List[Dict[str, Any]]
    time_to_ready: str
    confidence: float


# ============================================================================
# Speech Models
# ============================================================================

class WordTimestamp(BaseModel):
    """Word with timestamp."""
    word: str
    start: float
    end: float
    confidence: float


class SpeechToTextResponse(BaseModel):
    """Response for speech-to-text."""
    filename: str
    transcription: str
    language: str
    detected_language: str
    confidence: float
    duration_seconds: float
    words: Optional[List[WordTimestamp]] = None
    model: str


# ============================================================================
# Common Models
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    models_loaded: List[str]
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response."""
    success: bool = False
    error: str
    details: Optional[Dict[str, Any]] = None


class SuccessResponse(BaseModel):
    """Generic success response."""
    success: bool = True
    message: str
    data: Optional[Any] = None
    metadata: Optional[Dict[str, Any]] = None


class ModelInfo(BaseModel):
    """Information about a model."""
    name: str
    purpose: str
    size: str
    privacy: str


class ModelsListResponse(BaseModel):
    """Response for models list."""
    success: bool = True
    data: Dict[str, Any]


class LanguageInfo(BaseModel):
    """Language information."""
    code: str
    name: str


class LanguagesResponse(BaseModel):
    """Response for supported languages."""
    success: bool = True
    data: Dict[str, Any]
