"""Model manager for lazy loading and caching ML models."""

import time
from pathlib import Path
from typing import Any, Dict, Optional
from dataclasses import dataclass
import torch
from transformers import (
    AutoModel,
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    AutoModelForSequenceClassification,
    pipeline
)

from app.core.config import settings
from app.utils.logger import logger
from app.services.storage import model_storage
from app.services.events import event_publisher


@dataclass
class ModelInfo:
    """Information about a loaded model."""
    name: str
    version: str
    size_mb: float
    device: str
    loaded_at: float
    last_used: float


class ModelManager:
    """Manages ML model loading, caching, and lifecycle."""

    def __init__(self):
        """Initialize model manager."""
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        self.pipelines: Dict[str, Any] = {}
        self.model_info: Dict[str, ModelInfo] = {}
        self.device = self._detect_device()
        self.model_cache_dir = Path(settings.model_cache_dir)
        self.model_cache_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Model manager initialized with device: {self.device}")

    def _detect_device(self) -> str:
        """Detect available device (CUDA/CPU)."""
        if settings.enable_gpu and torch.cuda.is_available():
            return "cuda"
        return "cpu"

    async def load_model(
        self,
        model_name: str,
        model_type: str = "default",
        version: str = "latest"
    ) -> bool:
        """
        Load model into memory.

        Args:
            model_name: Name/path of the model
            model_type: Type of model (translation, sentiment, etc.)
            version: Version to load

        Returns:
            True if loading successful
        """
        start_time = time.time()

        try:
            # Check if already loaded
            cache_key = f"{model_name}:{version}"
            if cache_key in self.models:
                logger.info(f"Model {model_name} already loaded")
                self.model_info[cache_key].last_used = time.time()
                return True

            # Try to download from MinIO if not in local cache
            local_path = self.model_cache_dir / model_name / version
            if not local_path.exists():
                logger.info(f"Downloading model {model_name} from storage...")
                downloaded_path = model_storage.download_model(model_name, version)
                if downloaded_path:
                    local_path = downloaded_path
                else:
                    # Fallback to Hugging Face Hub
                    logger.info(f"Model not in storage, will load from Hugging Face")
                    local_path = model_name

            # Load based on model type
            if model_type == "translation":
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    str(local_path),
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                )
                tokenizer = AutoTokenizer.from_pretrained(str(local_path))
                self.tokenizers[cache_key] = tokenizer
            elif model_type == "sentiment":
                model = AutoModelForSequenceClassification.from_pretrained(str(local_path))
                tokenizer = AutoTokenizer.from_pretrained(str(local_path))
                self.tokenizers[cache_key] = tokenizer
            elif model_type == "pipeline":
                # For pipeline-based models (e.g., Whisper, CLIP)
                pipe = pipeline(model_name, model=str(local_path), device=self.device)
                self.pipelines[cache_key] = pipe
                model = pipe.model
            else:
                # Default: AutoModel
                model = AutoModel.from_pretrained(str(local_path))
                tokenizer = AutoTokenizer.from_pretrained(str(local_path))
                self.tokenizers[cache_key] = tokenizer

            # Move to device
            model = model.to(self.device)
            model.eval()  # Set to evaluation mode

            # Store model
            self.models[cache_key] = model

            # Calculate model size
            param_size = sum(p.nelement() * p.element_size() for p in model.parameters())
            buffer_size = sum(b.nelement() * b.element_size() for b in model.buffers())
            size_mb = (param_size + buffer_size) / 1024 / 1024

            # Store model info
            load_time_ms = (time.time() - start_time) * 1000
            self.model_info[cache_key] = ModelInfo(
                name=model_name,
                version=version,
                size_mb=size_mb,
                device=self.device,
                loaded_at=time.time(),
                last_used=time.time()
            )

            logger.info(
                f"✅ Loaded model {model_name} ({size_mb:.2f} MB) "
                f"in {load_time_ms:.0f}ms on {self.device}"
            )

            # Publish event
            await event_publisher.publish_model_loaded(
                model_name,
                version,
                load_time_ms
            )

            return True

        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            await event_publisher.publish_model_failed(model_name, str(e))
            return False

    def get_model(self, model_name: str, version: str = "latest") -> Optional[Any]:
        """Get loaded model."""
        cache_key = f"{model_name}:{version}"
        if cache_key in self.models:
            self.model_info[cache_key].last_used = time.time()
            return self.models[cache_key]
        return None

    def get_tokenizer(self, model_name: str, version: str = "latest") -> Optional[Any]:
        """Get tokenizer for model."""
        cache_key = f"{model_name}:{version}"
        return self.tokenizers.get(cache_key)

    def get_pipeline(self, model_name: str, version: str = "latest") -> Optional[Any]:
        """Get pipeline for model."""
        cache_key = f"{model_name}:{version}"
        return self.pipelines.get(cache_key)

    def unload_model(self, model_name: str, version: str = "latest") -> bool:
        """Unload model from memory."""
        cache_key = f"{model_name}:{version}"

        if cache_key not in self.models:
            return False

        try:
            # Remove model
            del self.models[cache_key]

            # Remove tokenizer if exists
            if cache_key in self.tokenizers:
                del self.tokenizers[cache_key]

            # Remove pipeline if exists
            if cache_key in self.pipelines:
                del self.pipelines[cache_key]

            # Remove info
            if cache_key in self.model_info:
                del self.model_info[cache_key]

            # Clear CUDA cache if using GPU
            if self.device == "cuda":
                torch.cuda.empty_cache()

            logger.info(f"Unloaded model {model_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to unload model {model_name}: {e}")
            return False

    def get_loaded_models(self) -> Dict[str, ModelInfo]:
        """Get info about all loaded models."""
        return self.model_info.copy()

    def get_memory_usage(self) -> Dict[str, float]:
        """Get memory usage statistics."""
        total_size_mb = sum(info.size_mb for info in self.model_info.values())

        stats = {
            "total_models": len(self.models),
            "total_size_mb": total_size_mb,
            "device": self.device,
        }

        if self.device == "cuda":
            stats["cuda_allocated_mb"] = torch.cuda.memory_allocated() / 1024 / 1024
            stats["cuda_reserved_mb"] = torch.cuda.memory_reserved() / 1024 / 1024

        return stats

    async def warmup_models(self, model_list: list[tuple[str, str]]) -> None:
        """Preload models on service startup."""
        logger.info(f"Warming up {len(model_list)} models...")
        for model_name, model_type in model_list:
            await self.load_model(model_name, model_type)


# Global model manager instance
model_manager = ModelManager()
