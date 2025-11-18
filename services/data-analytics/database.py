import os
from sqlalchemy import create_engine, text, Column, String, Integer, Float, DateTime, ARRAY, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()

class DatabaseService:
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL', 'postgresql://nexus:nexus_dev_password@localhost:5432/nexus')
        self.engine = None
        self.SessionLocal = None

    async def connect(self):
        """Initialize database connection and create tables"""
        try:
            self.engine = create_engine(
                self.database_url,
                pool_size=20,
                max_overflow=0,
                pool_pre_ping=True
            )

            # Test connection
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            logger.info("✅ Database connected successfully")

            # Create session factory
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

            # Initialize schema
            await self.initialize_schema()

        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise

    async def disconnect(self):
        """Close database connection"""
        if self.engine:
            self.engine.dispose()
            logger.info("Database connection closed")

    def get_session(self):
        """Get a database session"""
        if not self.SessionLocal:
            raise Exception("Database not connected")
        return self.SessionLocal()

    async def initialize_schema(self):
        """Initialize database schema for data analytics"""
        schema = """
            CREATE SCHEMA IF NOT EXISTS analytics;

            -- SDG Indicators
            CREATE TABLE IF NOT EXISTS analytics.sdg_indicators (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                goal_number INTEGER NOT NULL CHECK (goal_number BETWEEN 1 AND 17),
                indicator_id VARCHAR(50) NOT NULL,
                indicator_name VARCHAR(255) NOT NULL,
                current_value DECIMAL(12,4),
                target_value DECIMAL(12,4),
                progress DECIMAL(5,2),
                status VARCHAR(50),
                data_sources TEXT[],
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB,
                UNIQUE(goal_number, indicator_id)
            );

            -- Data Collections (for field data)
            CREATE TABLE IF NOT EXISTS analytics.data_collections (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                collection_type VARCHAR(100) NOT NULL,
                source VARCHAR(100) NOT NULL,
                data JSONB NOT NULL,
                quality_score DECIMAL(3,2),
                verified BOOLEAN DEFAULT false,
                verified_by UUID,
                verified_at TIMESTAMP,
                location_lat DECIMAL(10,8),
                location_lon DECIMAL(11,8),
                country VARCHAR(100),
                region VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB
            );

            -- Datasets
            CREATE TABLE IF NOT EXISTS analytics.datasets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                format VARCHAR(50) NOT NULL,
                size_mb DECIMAL(12,2),
                record_count INTEGER,
                category VARCHAR(100),
                tags TEXT[],
                file_path TEXT,
                download_url TEXT,
                access_level VARCHAR(50) DEFAULT 'public',
                license VARCHAR(100),
                created_by UUID,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB
            );

            -- Analytics Queries
            CREATE TABLE IF NOT EXISTS analytics.queries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                query_type VARCHAR(100) NOT NULL,
                query_params JSONB NOT NULL,
                results JSONB,
                execution_time_ms INTEGER,
                rows_processed INTEGER,
                status VARCHAR(50) DEFAULT 'completed',
                created_by UUID,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Dashboards
            CREATE TABLE IF NOT EXISTS analytics.dashboards (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                dashboard_type VARCHAR(100),
                widgets JSONB NOT NULL,
                access_level VARCHAR(50) DEFAULT 'public',
                created_by UUID,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB
            );

            -- Impact Metrics (aggregated platform metrics)
            CREATE TABLE IF NOT EXISTS analytics.impact_metrics (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                metric_name VARCHAR(255) NOT NULL,
                metric_value DECIMAL(20,2) NOT NULL,
                metric_type VARCHAR(100) NOT NULL,
                category VARCHAR(100),
                sdg_goal INTEGER CHECK (sdg_goal BETWEEN 1 AND 17),
                measurement_period_start DATE,
                measurement_period_end DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB
            );

            -- Predictions (ML model predictions)
            CREATE TABLE IF NOT EXISTS analytics.predictions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                model_type VARCHAR(100) NOT NULL,
                prediction_type VARCHAR(100) NOT NULL,
                prediction_data JSONB NOT NULL,
                confidence_score DECIMAL(3,2),
                timeframe VARCHAR(100),
                recommended_actions TEXT[],
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                metadata JSONB
            );

            -- Research Datasets (anonymized for research)
            CREATE TABLE IF NOT EXISTS analytics.research_datasets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                record_count INTEGER,
                anonymization_method VARCHAR(100),
                access_requirements TEXT,
                approval_required BOOLEAN DEFAULT true,
                category VARCHAR(100),
                tags TEXT[],
                file_path TEXT,
                created_by UUID,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB
            );

            -- Data Exports
            CREATE TABLE IF NOT EXISTS analytics.exports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                export_type VARCHAR(100) NOT NULL,
                format VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                file_path TEXT,
                download_url TEXT,
                size_mb DECIMAL(12,2),
                record_count INTEGER,
                requested_by UUID,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                expires_at TIMESTAMP
            );

            -- Create indexes for performance
            CREATE INDEX IF NOT EXISTS idx_sdg_indicators_goal ON analytics.sdg_indicators(goal_number);
            CREATE INDEX IF NOT EXISTS idx_data_collections_type ON analytics.data_collections(collection_type);
            CREATE INDEX IF NOT EXISTS idx_data_collections_country ON analytics.data_collections(country);
            CREATE INDEX IF NOT EXISTS idx_datasets_category ON analytics.datasets(category);
            CREATE INDEX IF NOT EXISTS idx_queries_type ON analytics.queries(query_type);
            CREATE INDEX IF NOT EXISTS idx_impact_metrics_name ON analytics.impact_metrics(metric_name);
            CREATE INDEX IF NOT EXISTS idx_impact_metrics_sdg ON analytics.impact_metrics(sdg_goal);
            CREATE INDEX IF NOT EXISTS idx_predictions_model ON analytics.predictions(model_type);
            CREATE INDEX IF NOT EXISTS idx_research_datasets_category ON analytics.research_datasets(category);

            -- Updated_at trigger function
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            -- Apply triggers to tables
            DROP TRIGGER IF EXISTS update_datasets_updated_at ON analytics.datasets;
            CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON analytics.datasets
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_dashboards_updated_at ON analytics.dashboards;
            CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON analytics.dashboards
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_research_datasets_updated_at ON analytics.research_datasets;
            CREATE TRIGGER update_research_datasets_updated_at BEFORE UPDATE ON analytics.research_datasets
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """

        try:
            with self.engine.connect() as conn:
                conn.execute(text(schema))
                conn.commit()
            logger.info("✅ Database schema initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize database schema: {e}")
            raise

# Global database instance
db_service = DatabaseService()
