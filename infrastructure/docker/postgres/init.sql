-- Initialize Nexus Platform Database

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create schemas for different services
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS healthcare;
CREATE SCHEMA IF NOT EXISTS education;
CREATE SCHEMA IF NOT EXISTS economic;
CREATE SCHEMA IF NOT EXISTS crisis;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA auth TO nexus;
GRANT ALL PRIVILEGES ON SCHEMA healthcare TO nexus;
GRANT ALL PRIVILEGES ON SCHEMA education TO nexus;
GRANT ALL PRIVILEGES ON SCHEMA economic TO nexus;
GRANT ALL PRIVILEGES ON SCHEMA crisis TO nexus;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO nexus;

-- Log
SELECT 'Nexus Platform database initialized successfully!' AS status;
