import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';
import { logger } from '../utils/logger';

export class DatabaseService {
  private pgPool: Pool | null = null;
  private mongoClient: MongoClient | null = null;
  private mongodb: Db | null = null;

  constructor(private pgUrl: string, private mongoUrl: string) {}

  async connect(): Promise<void> {
    // PostgreSQL connection
    this.pgPool = new Pool({ connectionString: this.pgUrl, max: 20 });
    await this.pgPool.query('SELECT NOW()');
    logger.info('✅ PostgreSQL connected');

    // MongoDB connection
    this.mongoClient = new MongoClient(this.mongoUrl);
    await this.mongoClient.connect();
    this.mongodb = this.mongoClient.db('nexus');
    logger.info('✅ MongoDB connected');

    await this.initializeSchema();
  }

  async disconnect(): Promise<void> {
    if (this.pgPool) await this.pgPool.end();
    if (this.mongoClient) await this.mongoClient.close();
    logger.info('Database connections closed');
  }

  getPg(): Pool {
    if (!this.pgPool) throw new Error('PostgreSQL not connected');
    return this.pgPool;
  }

  getMongo(): Db {
    if (!this.mongodb) throw new Error('MongoDB not connected');
    return this.mongodb;
  }

  async query(text: string, params?: any[]): Promise<any> {
    return this.getPg().query(text, params);
  }

  private async initializeSchema(): Promise<void> {
    const schema = `
      CREATE SCHEMA IF NOT EXISTS healthcare;

      -- Healthcare Providers
      CREATE TABLE IF NOT EXISTS healthcare.providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        specialty VARCHAR(100) NOT NULL,
        license_number VARCHAR(100) NOT NULL,
        years_experience INTEGER,
        bio TEXT,
        available BOOLEAN DEFAULT true,
        rating DECIMAL(3,2),
        total_consultations INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Patients
      CREATE TABLE IF NOT EXISTS healthcare.patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        date_of_birth DATE,
        blood_type VARCHAR(10),
        allergies TEXT[],
        chronic_conditions TEXT[],
        emergency_contact JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments
      CREATE TABLE IF NOT EXISTS healthcare.appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES healthcare.patients(id),
        provider_id UUID NOT NULL REFERENCES healthcare.providers(id),
        appointment_type VARCHAR(50) NOT NULL,
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Consultations (telemedicine sessions)
      CREATE TABLE IF NOT EXISTS healthcare.consultations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        appointment_id UUID REFERENCES healthcare.appointments(id),
        patient_id UUID NOT NULL REFERENCES healthcare.patients(id),
        provider_id UUID NOT NULL REFERENCES healthcare.providers(id),
        session_id VARCHAR(255),
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        diagnosis TEXT,
        prescription JSONB,
        follow_up_required BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Health Data Collection (mobile submissions)
      CREATE TABLE IF NOT EXISTS healthcare.health_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES healthcare.patients(id),
        data_type VARCHAR(100) NOT NULL,
        value JSONB NOT NULL,
        location POINT,
        submitted_by UUID,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Training Modules
      CREATE TABLE IF NOT EXISTS healthcare.training_modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_role VARCHAR(100),
        content_url TEXT,
        duration_hours DECIMAL(5,2),
        certification_available BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Training Enrollments
      CREATE TABLE IF NOT EXISTS healthcare.training_enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_id UUID NOT NULL REFERENCES healthcare.training_modules(id),
        user_id UUID NOT NULL,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        certification_earned BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_appointments_patient ON healthcare.appointments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_provider ON healthcare.appointments(provider_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON healthcare.appointments(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_health_data_patient ON healthcare.health_data(patient_id);
      CREATE INDEX IF NOT EXISTS idx_health_data_type ON healthcare.health_data(data_type);
    `;

    try {
      await this.query(schema);
      logger.info('✅ Healthcare schema initialized');
    } catch (error) {
      logger.error('Failed to initialize schema', error);
      throw error;
    }
  }
}
