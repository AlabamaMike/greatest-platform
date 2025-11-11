"""Translation engine using NLLB and other multilingual models."""

import time
from typing import Optional
from transformers import pipeline
import torch

from app.core.model_manager import model_manager
from app.services.cache import cache_service
from app.services.events import event_publisher
from app.utils.logger import logger
from app.models.schemas import TranslationRequest, TranslationResponse


class TranslationEngine:
    """Multilingual translation using open-source models."""

    def __init__(self):
        """Initialize translation engine."""
        self.model_name = "facebook/nllb-200-distilled-600M"
        self.pipeline = None
        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize the translation engine."""
        try:
            # Load translation model
            success = await model_manager.load_model(
                self.model_name,
                model_type="pipeline",
                version="latest"
            )

            if success:
                self.pipeline = model_manager.get_pipeline(self.model_name)
                self._initialized = True
                logger.info("✅ Translation engine initialized")
            else:
                logger.warning("Translation engine using fallback mode")
                self._initialized = False

            return success
        except Exception as e:
            logger.error(f"Failed to initialize translation engine: {e}")
            return False

    async def translate(
        self,
        request: TranslationRequest,
        user_id: Optional[str] = None
    ) -> TranslationResponse:
        """
        Translate text from source to target language.

        Args:
            request: Translation request
            user_id: Optional user ID for tracking

        Returns:
            Translation response
        """
        start_time = time.time()

        # Check cache first
        cached_result = await cache_service.get_translation(
            request.text,
            request.source_lang,
            request.target_lang
        )

        if cached_result:
            logger.info(f"Translation cache hit for {request.source_lang} -> {request.target_lang}")
            return TranslationResponse(**cached_result, cached=True)

        # Perform translation
        try:
            if self._initialized and self.pipeline:
                # Use NLLB model
                translated = await self._translate_with_nllb(
                    request.text,
                    request.source_lang,
                    request.target_lang
                )
                model_used = self.model_name
                confidence = 0.92  # NLLB typically has high confidence
            else:
                # Fallback: simple mock translation for development
                translated = self._mock_translate(
                    request.text,
                    request.source_lang,
                    request.target_lang
                )
                model_used = "mock-translator"
                confidence = 0.75

            inference_time = (time.time() - start_time) * 1000

            response = TranslationResponse(
                original_text=request.text,
                translated_text=translated,
                source_lang=request.source_lang,
                target_lang=request.target_lang,
                detected_lang=request.source_lang,  # TODO: Add language detection
                confidence=confidence,
                model=model_used,
                cached=False
            )

            # Cache the result
            await cache_service.set_translation(
                request.text,
                request.source_lang,
                request.target_lang,
                response.model_dump()
            )

            # Publish event
            await event_publisher.publish_translation_completed(
                request.text,
                request.source_lang,
                request.target_lang,
                translated,
                user_id
            )

            logger.info(
                f"Translation completed in {inference_time:.0f}ms "
                f"({request.source_lang} -> {request.target_lang})"
            )

            return response

        except Exception as e:
            logger.error(f"Translation failed: {e}")
            # Return error or fallback
            return TranslationResponse(
                original_text=request.text,
                translated_text=f"[Translation error: {str(e)}]",
                source_lang=request.source_lang,
                target_lang=request.target_lang,
                confidence=0.0,
                model="error",
                cached=False
            )

    async def _translate_with_nllb(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> str:
        """Translate using NLLB model."""
        try:
            # NLLB uses special language codes
            src_code = self._get_nllb_code(source_lang)
            tgt_code = self._get_nllb_code(target_lang)

            if not self.pipeline:
                raise ValueError("Pipeline not initialized")

            # Perform translation
            result = self.pipeline(
                text,
                src_lang=src_code,
                tgt_lang=tgt_code,
                max_length=400
            )

            if isinstance(result, list) and len(result) > 0:
                return result[0]["translation_text"]
            elif isinstance(result, dict):
                return result["translation_text"]
            else:
                raise ValueError(f"Unexpected result format: {type(result)}")

        except Exception as e:
            logger.error(f"NLLB translation error: {e}")
            raise

    def _get_nllb_code(self, lang_code: str) -> str:
        """Convert ISO language code to NLLB format."""
        # NLLB uses format like "eng_Latn" for English
        nllb_mapping = {
            "en": "eng_Latn",
            "es": "spa_Latn",
            "fr": "fra_Latn",
            "sw": "swh_Latn",
            "ar": "arb_Arab",
            "zh": "zho_Hans",
            "hi": "hin_Deva",
            "pt": "por_Latn",
            "de": "deu_Latn",
            "ja": "jpn_Jpan",
            "ko": "kor_Hang",
            "ru": "rus_Cyrl",
            "it": "ita_Latn",
            "tr": "tur_Latn",
            "vi": "vie_Latn",
            "th": "tha_Thai",
            "id": "ind_Latn",
            "pl": "pol_Latn",
            "uk": "ukr_Cyrl",
            "ro": "ron_Latn",
        }
        return nllb_mapping.get(lang_code, f"{lang_code}_Latn")

    def _mock_translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> str:
        """Mock translation for development/testing."""
        return f"[TRANSLATED from {source_lang} to {target_lang}]: {text}"

    def get_supported_languages(self) -> dict:
        """Get list of supported languages."""
        # Top 50 languages supported by NLLB
        languages = [
            {"code": "en", "name": "English"},
            {"code": "es", "name": "Spanish"},
            {"code": "fr", "name": "French"},
            {"code": "de", "name": "German"},
            {"code": "it", "name": "Italian"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "ru", "name": "Russian"},
            {"code": "zh", "name": "Chinese"},
            {"code": "ja", "name": "Japanese"},
            {"code": "ko", "name": "Korean"},
            {"code": "ar", "name": "Arabic"},
            {"code": "hi", "name": "Hindi"},
            {"code": "sw", "name": "Swahili"},
            {"code": "yo", "name": "Yoruba"},
            {"code": "ig", "name": "Igbo"},
            {"code": "am", "name": "Amharic"},
            {"code": "ha", "name": "Hausa"},
            {"code": "so", "name": "Somali"},
            {"code": "zu", "name": "Zulu"},
            {"code": "xh", "name": "Xhosa"},
            {"code": "sn", "name": "Shona"},
            {"code": "ny", "name": "Chichewa"},
            {"code": "rw", "name": "Kinyarwanda"},
            {"code": "st", "name": "Sesotho"},
            {"code": "tn", "name": "Setswana"},
            {"code": "vi", "name": "Vietnamese"},
            {"code": "th", "name": "Thai"},
            {"code": "id", "name": "Indonesian"},
            {"code": "ms", "name": "Malay"},
            {"code": "tl", "name": "Tagalog"},
            {"code": "bn", "name": "Bengali"},
            {"code": "ur", "name": "Urdu"},
            {"code": "te", "name": "Telugu"},
            {"code": "mr", "name": "Marathi"},
            {"code": "ta", "name": "Tamil"},
            {"code": "gu", "name": "Gujarati"},
            {"code": "kn", "name": "Kannada"},
            {"code": "ml", "name": "Malayalam"},
            {"code": "ne", "name": "Nepali"},
            {"code": "si", "name": "Sinhala"},
            {"code": "pl", "name": "Polish"},
            {"code": "uk", "name": "Ukrainian"},
            {"code": "cs", "name": "Czech"},
            {"code": "ro", "name": "Romanian"},
            {"code": "el", "name": "Greek"},
            {"code": "tr", "name": "Turkish"},
            {"code": "fa", "name": "Persian"},
            {"code": "he", "name": "Hebrew"},
            {"code": "nl", "name": "Dutch"},
            {"code": "sv", "name": "Swedish"},
        ]

        return {
            "total": len(languages),
            "languages": languages
        }


# Global translation engine instance
translation_engine = TranslationEngine()
