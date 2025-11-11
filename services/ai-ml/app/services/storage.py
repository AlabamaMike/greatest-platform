"""MinIO storage service for ML models."""

import os
from pathlib import Path
from typing import List, Optional
from dataclasses import dataclass
from minio import Minio
from minio.error import S3Error

from app.core.config import settings
from app.utils.logger import logger


@dataclass
class ModelMetadata:
    """Metadata for a stored model."""
    name: str
    version: str
    size_bytes: int
    last_modified: str
    path: str


class ModelStorage:
    """MinIO-based storage for ML models and artifacts."""

    def __init__(self):
        """Initialize model storage."""
        self.client: Optional[Minio] = None
        self._connected = False
        self.bucket = settings.minio_bucket

    def connect(self) -> None:
        """Connect to MinIO."""
        try:
            self.client = Minio(
                settings.minio_endpoint,
                access_key=settings.minio_access_key,
                secret_key=settings.minio_secret_key,
                secure=settings.minio_secure,
            )

            # Ensure bucket exists
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                logger.info(f"Created MinIO bucket: {self.bucket}")

            self._connected = True
            logger.info("✅ MinIO model storage connected")
        except Exception as e:
            logger.error(f"Failed to connect to MinIO: {e}")
            self._connected = False
            # Continue without remote storage in development
            if settings.is_production:
                raise

    def disconnect(self) -> None:
        """Disconnect from MinIO (MinIO client doesn't need explicit disconnect)."""
        self._connected = False
        logger.info("MinIO model storage disconnected")

    def download_model(
        self,
        model_name: str,
        version: str = "latest"
    ) -> Optional[Path]:
        """
        Download model from MinIO to local cache.

        Args:
            model_name: Name of the model
            version: Version of the model (default: "latest")

        Returns:
            Path to downloaded model directory, or None if failed
        """
        if not self._connected or not self.client:
            logger.warning(f"Cannot download model {model_name}: not connected")
            return None

        try:
            # Construct object prefix
            object_prefix = f"{model_name}/{version}/"

            # Create local directory
            local_path = Path(settings.model_cache_dir) / model_name / version
            local_path.mkdir(parents=True, exist_ok=True)

            # List and download all objects with this prefix
            objects = self.client.list_objects(
                self.bucket,
                prefix=object_prefix,
                recursive=True
            )

            downloaded_files = 0
            for obj in objects:
                # Get relative path within model directory
                relative_path = obj.object_name[len(object_prefix):]
                if not relative_path:  # Skip directory entries
                    continue

                # Download file
                local_file = local_path / relative_path
                local_file.parent.mkdir(parents=True, exist_ok=True)

                self.client.fget_object(
                    self.bucket,
                    obj.object_name,
                    str(local_file)
                )
                downloaded_files += 1

            if downloaded_files > 0:
                logger.info(
                    f"Downloaded model {model_name} v{version} "
                    f"({downloaded_files} files) to {local_path}"
                )
                return local_path
            else:
                logger.warning(f"No files found for model {model_name} v{version}")
                return None

        except S3Error as e:
            logger.error(f"Failed to download model {model_name}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error downloading model {model_name}: {e}")
            return None

    def upload_model(
        self,
        model_name: str,
        version: str,
        local_path: Path
    ) -> bool:
        """
        Upload model from local path to MinIO.

        Args:
            model_name: Name of the model
            version: Version of the model
            local_path: Path to local model directory

        Returns:
            True if upload successful, False otherwise
        """
        if not self._connected or not self.client:
            logger.warning(f"Cannot upload model {model_name}: not connected")
            return False

        try:
            if not local_path.exists():
                logger.error(f"Local path does not exist: {local_path}")
                return False

            # Upload all files in directory
            uploaded_files = 0
            for file_path in local_path.rglob("*"):
                if file_path.is_file():
                    # Construct object name
                    relative_path = file_path.relative_to(local_path)
                    object_name = f"{model_name}/{version}/{relative_path}"

                    # Upload file
                    self.client.fput_object(
                        self.bucket,
                        object_name,
                        str(file_path)
                    )
                    uploaded_files += 1

            logger.info(
                f"Uploaded model {model_name} v{version} "
                f"({uploaded_files} files) to MinIO"
            )
            return True

        except S3Error as e:
            logger.error(f"Failed to upload model {model_name}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error uploading model {model_name}: {e}")
            return False

    def list_models(self) -> List[ModelMetadata]:
        """
        List all available models in storage.

        Returns:
            List of model metadata
        """
        if not self._connected or not self.client:
            return []

        try:
            models = []
            objects = self.client.list_objects(self.bucket, recursive=False)

            for obj in objects:
                # Object names are in format: model_name/
                if obj.is_dir:
                    model_name = obj.object_name.rstrip("/")

                    # List versions for this model
                    versions = self.client.list_objects(
                        self.bucket,
                        prefix=f"{model_name}/",
                        recursive=False
                    )

                    for version_obj in versions:
                        if version_obj.is_dir:
                            version = version_obj.object_name.split("/")[1]
                            models.append(ModelMetadata(
                                name=model_name,
                                version=version,
                                size_bytes=version_obj.size or 0,
                                last_modified=str(version_obj.last_modified),
                                path=version_obj.object_name
                            ))

            return models

        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return []

    def model_exists(self, model_name: str, version: str = "latest") -> bool:
        """Check if model exists in storage."""
        if not self._connected or not self.client:
            return False

        try:
            # Check if any objects exist with this prefix
            objects = list(self.client.list_objects(
                self.bucket,
                prefix=f"{model_name}/{version}/",
                recursive=False
            ))
            return len(objects) > 0
        except Exception:
            return False

    @property
    def is_connected(self) -> bool:
        """Check if storage is connected."""
        return self._connected


# Global model storage instance
model_storage = ModelStorage()
