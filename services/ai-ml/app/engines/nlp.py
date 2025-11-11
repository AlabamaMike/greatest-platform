"""NLP engine for sentiment, entities, moderation, and text generation."""

import time
from typing import List, Optional
from transformers import pipeline
import torch

from app.core.model_manager import model_manager
from app.utils.logger import logger
from app.models.schemas import (
    SentimentResponse,
    Entity,
    EntityExtractionResponse,
    ModerationResponse,
    ModerationCategory,
    TextGenerationResponse,
    SkillGapResponse,
)


class NLPEngine:
    """Natural language processing engine."""

    def __init__(self):
        """Initialize NLP engine."""
        self.sentiment_pipeline = None
        self.ner_pipeline = None
        self.generation_pipeline = None
        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize the NLP engine."""
        try:
            # Load sentiment analysis model
            logger.info("Loading NLP models...")

            # For now, use mock implementations
            # In production, load actual models:
            # await model_manager.load_model("distilbert-base-uncased-finetuned-sst-2-english", "sentiment")
            # self.sentiment_pipeline = model_manager.get_pipeline("distilbert-base-uncased-finetuned-sst-2-english")

            self._initialized = True
            logger.info("✅ NLP engine initialized")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize NLP engine: {e}")
            return False

    async def analyze_sentiment(
        self,
        text: str
    ) -> SentimentResponse:
        """
        Analyze sentiment of text.

        Args:
            text: Text to analyze

        Returns:
            Sentiment analysis result
        """
        try:
            if self.sentiment_pipeline:
                # Use real model
                result = self.sentiment_pipeline(text)
                sentiment = result[0]["label"].lower()
                score = result[0]["score"]
            else:
                # Mock implementation
                sentiment, score = self._mock_sentiment(text)

            # Calculate emotions (simplified)
            emotions = self._calculate_emotions(sentiment, score)

            return SentimentResponse(
                text=text,
                sentiment=sentiment,
                score=score,
                emotions=emotions,
                model="sentiment-analyzer-v1"
            )

        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return SentimentResponse(
                text=text,
                sentiment="neutral",
                score=0.5,
                emotions={"neutral": 0.5},
                model="error"
            )

    async def extract_entities(
        self,
        text: str
    ) -> EntityExtractionResponse:
        """
        Extract named entities from text.

        Args:
            text: Text to analyze

        Returns:
            Entity extraction result
        """
        try:
            if self.ner_pipeline:
                # Use real model
                entities_data = self.ner_pipeline(text)
                entities = [
                    Entity(
                        text=ent["word"],
                        type=ent["entity"],
                        confidence=ent["score"]
                    )
                    for ent in entities_data
                ]
            else:
                # Mock implementation
                entities = self._mock_entities(text)

            return EntityExtractionResponse(
                text=text,
                entities=entities,
                model="ner-model-v1"
            )

        except Exception as e:
            logger.error(f"Entity extraction failed: {e}")
            return EntityExtractionResponse(
                text=text,
                entities=[],
                model="error"
            )

    async def moderate_content(
        self,
        content: str
    ) -> ModerationResponse:
        """
        Moderate content for safety.

        Args:
            content: Content to moderate

        Returns:
            Moderation result
        """
        try:
            # Simplified content moderation
            categories = self._calculate_moderation_scores(content)

            toxicity_score = max(
                categories.spam,
                categories.hate_speech,
                categories.violence,
                categories.adult_content
            )

            is_safe = toxicity_score < 0.5
            action = "approve" if is_safe else "review"

            return ModerationResponse(
                is_safe=is_safe,
                toxicity_score=toxicity_score,
                categories=categories,
                action=action,
                model="content-moderator-v1"
            )

        except Exception as e:
            logger.error(f"Content moderation failed: {e}")
            # Default to safe in case of error
            return ModerationResponse(
                is_safe=True,
                toxicity_score=0.0,
                categories=ModerationCategory(
                    spam=0.0,
                    hate_speech=0.0,
                    violence=0.0,
                    adult_content=0.0
                ),
                action="approve",
                model="error"
            )

    async def generate_text(
        self,
        prompt: str,
        max_tokens: int = 200
    ) -> TextGenerationResponse:
        """
        Generate text from prompt.

        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate

        Returns:
            Generated text
        """
        try:
            if self.generation_pipeline:
                # Use real model
                result = self.generation_pipeline(
                    prompt,
                    max_length=max_tokens,
                    num_return_sequences=1
                )
                generated = result[0]["generated_text"]
                tokens_used = len(generated.split())
            else:
                # Mock implementation
                generated = f"Generated response based on: {prompt}. [This would be AI-generated content in production with proper model integration.]"
                tokens_used = len(generated.split())

            return TextGenerationResponse(
                prompt=prompt,
                generated_text=generated,
                tokens_used=tokens_used,
                model="text-generator-v1",
                temperature=0.7,
                note="Privacy-preserving - runs on local infrastructure"
            )

        except Exception as e:
            logger.error(f"Text generation failed: {e}")
            return TextGenerationResponse(
                prompt=prompt,
                generated_text=f"[Generation error: {str(e)}]",
                tokens_used=0,
                model="error",
                temperature=0.7,
                note="Error occurred during generation"
            )

    async def analyze_skill_gap(
        self,
        current_skills: List[str],
        target_role: str
    ) -> SkillGapResponse:
        """
        Analyze skill gap for career development.

        Args:
            current_skills: List of current skills
            target_role: Target job role

        Returns:
            Skill gap analysis
        """
        try:
            # Mock implementation - in production, use ML model
            missing_skills = self._identify_missing_skills(
                current_skills,
                target_role
            )

            recommended_courses = [
                {
                    "title": f"{skill} Fundamentals",
                    "duration": "4 weeks",
                    "priority": "high"
                }
                for skill in missing_skills[:3]
            ]

            time_to_ready = f"{len(missing_skills) * 4}-{len(missing_skills) * 6} weeks"

            return SkillGapResponse(
                current_skills=current_skills,
                target_role=target_role,
                missing_skills=missing_skills,
                recommended_courses=recommended_courses,
                time_to_ready=time_to_ready,
                confidence=0.85
            )

        except Exception as e:
            logger.error(f"Skill gap analysis failed: {e}")
            return SkillGapResponse(
                current_skills=current_skills,
                target_role=target_role,
                missing_skills=[],
                recommended_courses=[],
                time_to_ready="Unknown",
                confidence=0.0
            )

    # Helper methods for mock implementations

    def _mock_sentiment(self, text: str) -> tuple[str, float]:
        """Mock sentiment analysis."""
        # Simple heuristic
        positive_words = ["good", "great", "excellent", "happy", "love"]
        negative_words = ["bad", "terrible", "hate", "sad", "awful"]

        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)

        if positive_count > negative_count:
            return "positive", 0.75 + (positive_count * 0.05)
        elif negative_count > positive_count:
            return "negative", 0.75 + (negative_count * 0.05)
        else:
            return "neutral", 0.65

    def _calculate_emotions(self, sentiment: str, score: float) -> dict:
        """Calculate emotion scores from sentiment."""
        if sentiment == "positive":
            return {
                "joy": score * 0.8,
                "trust": score * 0.6,
                "anticipation": score * 0.4,
            }
        elif sentiment == "negative":
            return {
                "sadness": score * 0.7,
                "anger": score * 0.5,
                "fear": score * 0.3,
            }
        else:
            return {
                "neutral": score,
                "trust": 0.3,
                "anticipation": 0.2,
            }

    def _mock_entities(self, text: str) -> List[Entity]:
        """Mock entity extraction."""
        # Simple pattern matching
        entities = []

        # Common disease names
        diseases = ["malaria", "covid", "tuberculosis", "diabetes"]
        for disease in diseases:
            if disease in text.lower():
                entities.append(Entity(
                    text=disease,
                    type="DISEASE",
                    confidence=0.92
                ))

        # Common location indicators
        locations = ["Kenya", "Nigeria", "Uganda", "Tanzania", "Ghana"]
        for location in locations:
            if location in text:
                entities.append(Entity(
                    text=location,
                    type="LOCATION",
                    confidence=0.95
                ))

        # Dr. pattern for persons
        if "Dr." in text or "Doctor" in text:
            entities.append(Entity(
                text="Dr. [Name]",
                type="PERSON",
                confidence=0.88
            ))

        return entities

    def _calculate_moderation_scores(self, content: str) -> ModerationCategory:
        """Calculate moderation scores."""
        content_lower = content.lower()

        # Simple keyword-based scoring
        spam_indicators = ["click here", "buy now", "limited offer"]
        hate_indicators = ["hate", "racist", "discriminate"]
        violence_indicators = ["kill", "attack", "violent"]
        adult_indicators = ["explicit", "nsfw", "adult"]

        spam_score = sum(0.3 for word in spam_indicators if word in content_lower)
        hate_score = sum(0.4 for word in hate_indicators if word in content_lower)
        violence_score = sum(0.4 for word in violence_indicators if word in content_lower)
        adult_score = sum(0.3 for word in adult_indicators if word in content_lower)

        return ModerationCategory(
            spam=min(spam_score, 1.0),
            hate_speech=min(hate_score, 1.0),
            violence=min(violence_score, 1.0),
            adult_content=min(adult_score, 1.0)
        )

    def _identify_missing_skills(
        self,
        current_skills: List[str],
        target_role: str
    ) -> List[str]:
        """Identify missing skills for target role."""
        # Role-based skill requirements (simplified)
        role_requirements = {
            "community health worker": [
                "Patient Assessment",
                "Medical Documentation",
                "Basic First Aid",
                "Health Education",
                "Communication Skills"
            ],
            "data analyst": [
                "Python",
                "SQL",
                "Data Visualization",
                "Statistical Analysis",
                "Excel"
            ],
            "teacher": [
                "Lesson Planning",
                "Classroom Management",
                "Assessment Design",
                "Educational Technology",
                "Child Psychology"
            ]
        }

        required = role_requirements.get(target_role.lower(), [
            "Skill 1", "Skill 2", "Skill 3"
        ])

        current_lower = [s.lower() for s in current_skills]
        missing = [
            skill for skill in required
            if skill.lower() not in current_lower
        ]

        return missing


# Global NLP engine instance
nlp_engine = NLPEngine()
