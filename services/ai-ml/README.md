# AI/ML Service

**Language**: Python with PyTorch & Transformers
**Status**: ✅ **Production-Ready Implementation**

## Overview

Privacy-preserving AI infrastructure for the Nexus platform. All models run locally - no user data is sent to external services.

## Features

### 🌐 Translation (100+ Languages)
- NLLB-200 multilingual model
- Automatic language detection
- Redis caching for performance
- Support for African, Asian, and global languages

### 🧠 Natural Language Processing
- Sentiment analysis and emotion detection
- Named entity recognition (NER)
- Content moderation
- Text generation
- Skill gap analysis

### 👁️ Computer Vision
- OCR (text extraction from images)
- Image analysis
- Medical image assessment
- Accessibility descriptions

### 📊 Predictive Analytics
- Health outcome prediction
- Learning success forecasting
- Resource demand prediction
- Outbreak risk assessment

### 💡 Recommendations
- Course recommendations
- Job matching
- Healthcare provider suggestions
- Learning path optimization

### 🎤 Speech Recognition
- Speech-to-text transcription (Whisper)
- Multi-language support
- Word-level timestamps

## Architecture

```
FastAPI Application
├── app/
│   ├── core/          # Core services (ModelManager, Config)
│   ├── engines/       # AI engines (Translation, NLP, Vision, etc.)
│   ├── services/      # Infrastructure (Cache, Events, Storage)
│   ├── models/        # Pydantic schemas
│   ├── api/           # API routes
│   └── utils/         # Utilities (logging, helpers)
├── app.py             # Application entry point
├── requirements.txt   # Python dependencies
└── Dockerfile         # Container configuration
```

## Quick Start

### With Docker Compose (Recommended)

```bash
docker-compose up ai-ml-service
```

Service available at: `http://localhost:3008`

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env

# Run the service
python app.py
```

## API Endpoints

Full documentation available at `http://localhost:3008/docs` when service is running.

### Core
- `GET /health` - Health check
- `GET /api/v1/ai/models` - List available models
- `GET /api/v1/ai/languages` - Supported languages

### Translation
- `POST /api/v1/ai/translate` - Multi-language translation

### NLP
- `POST /api/v1/ai/sentiment` - Sentiment analysis
- `POST /api/v1/ai/extract-entities` - Entity extraction
- `POST /api/v1/ai/moderate` - Content moderation
- `POST /api/v1/ai/generate` - Text generation
- `POST /api/v1/ai/skill-gap` - Skill gap analysis

### Computer Vision
- `POST /api/v1/ai/ocr` - OCR/text extraction
- `POST /api/v1/ai/analyze-image` - Image analysis

### Predictions & Recommendations
- `POST /api/v1/ai/predict` - Predictive analytics
- `POST /api/v1/ai/recommend` - Personalized recommendations

### Speech
- `POST /api/v1/ai/speech-to-text` - Speech transcription

## Configuration

See `.env.example` for all configuration options.

Key settings:
- `DEVICE`: Set to `cuda` for GPU acceleration
- `REDIS_URL`: Redis connection for caching
- `KAFKA_BROKERS`: Kafka for event publishing
- `MODEL_CACHE_DIR`: Directory for cached models

## Privacy & Security

- ✅ All models run locally - no external API calls
- ✅ Data encrypted in transit (HTTPS)
- ✅ Redis/MinIO data encrypted at rest
- ✅ No user data retention (except optional cache)
- ✅ Open-source models only

## Documentation

- Full specification: `IMPLEMENTATION_SPEC.md`
- API documentation: `http://localhost:3008/docs`
- Interactive API: `http://localhost:3008/redoc`
