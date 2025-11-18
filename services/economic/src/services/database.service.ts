import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

export class DatabaseService {
  private pool: Pool | null = null;

  async connect(): Promise<void> {
    try {
      this.pool = new Pool({
        connectionString: config.databaseUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      logger.info('✅ Database connected successfully');

      // Initialize schema
      await this.initializeSchema();
    } catch (error) {
      logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('Database connection closed');
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return this.pool;
  }

  async query(text: string, params?: any[]): Promise<any> {
    const pool = this.getPool();
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Query error', { text, error });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    const pool = this.getPool();
    return pool.connect();
  }

  private async initializeSchema(): Promise<void> {
    const schema = `
      CREATE SCHEMA IF NOT EXISTS economic;

      -- Job Postings
      CREATE TABLE IF NOT EXISTS economic.jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        employer_id UUID NOT NULL,
        location VARCHAR(255),
        remote BOOLEAN DEFAULT false,
        job_type VARCHAR(50) NOT NULL,
        salary_min DECIMAL(12,2),
        salary_max DECIMAL(12,2),
        currency VARCHAR(10) DEFAULT 'USD',
        required_skills TEXT[],
        education_level VARCHAR(100),
        experience_years INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        applications_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );

      -- Job Applications
      CREATE TABLE IF NOT EXISTS economic.job_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID NOT NULL REFERENCES economic.jobs(id) ON DELETE CASCADE,
        applicant_id UUID NOT NULL,
        resume_url TEXT,
        cover_letter TEXT,
        status VARCHAR(50) DEFAULT 'submitted',
        match_score INTEGER,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by UUID,
        notes TEXT
      );

      -- Loans
      CREATE TABLE IF NOT EXISTS economic.loans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        borrower_id UUID NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        purpose VARCHAR(255) NOT NULL,
        business_plan TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        interest_rate DECIMAL(5,2),
        term_months INTEGER,
        repayment_schedule VARCHAR(50),
        approved_at TIMESTAMP,
        approved_by UUID,
        disbursed_at TIMESTAMP,
        disbursement_amount DECIMAL(12,2),
        outstanding_balance DECIMAL(12,2),
        next_payment_due DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Loan Payments
      CREATE TABLE IF NOT EXISTS economic.loan_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        loan_id UUID NOT NULL REFERENCES economic.loans(id) ON DELETE CASCADE,
        amount DECIMAL(12,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        principal_amount DECIMAL(12,2),
        interest_amount DECIMAL(12,2),
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Mobile Wallets
      CREATE TABLE IF NOT EXISTS economic.wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        balance DECIMAL(12,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'active',
        kyc_verified BOOLEAN DEFAULT false,
        daily_limit DECIMAL(12,2),
        monthly_limit DECIMAL(12,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Wallet Transactions
      CREATE TABLE IF NOT EXISTS economic.wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_id UUID NOT NULL REFERENCES economic.wallets(id),
        transaction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        to_wallet_id UUID REFERENCES economic.wallets(id),
        to_user_id UUID,
        description TEXT,
        fee DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'completed',
        reference_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Cash Transfer Programs
      CREATE TABLE IF NOT EXISTS economic.cash_transfer_programs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        organization_id UUID NOT NULL,
        description TEXT,
        amount_per_person DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        target_recipients INTEGER,
        actual_recipients INTEGER DEFAULT 0,
        total_disbursed DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Cash Transfer Recipients
      CREATE TABLE IF NOT EXISTS economic.cash_transfer_recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        program_id UUID NOT NULL REFERENCES economic.cash_transfer_programs(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'pending',
        disbursed_at TIMESTAMP,
        transaction_id VARCHAR(255),
        verification_method VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Women's Economic Programs
      CREATE TABLE IF NOT EXISTS economic.women_programs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        target_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        completion_rate DECIMAL(5,2),
        loans_issued INTEGER DEFAULT 0,
        repayment_rate DECIMAL(5,2),
        status VARCHAR(50) DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Skills Profiles
      CREATE TABLE IF NOT EXISTS economic.skills_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        skills TEXT[] NOT NULL,
        experience_years INTEGER,
        education_level VARCHAR(100),
        languages TEXT[],
        certifications TEXT[],
        availability VARCHAR(50),
        preferred_job_types TEXT[],
        preferred_locations TEXT[],
        remote_preference BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_jobs_employer ON economic.jobs(employer_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON economic.jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_location ON economic.jobs(location);
      CREATE INDEX IF NOT EXISTS idx_job_applications_job ON economic.job_applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON economic.job_applications(applicant_id);
      CREATE INDEX IF NOT EXISTS idx_loans_borrower ON economic.loans(borrower_id);
      CREATE INDEX IF NOT EXISTS idx_loans_status ON economic.loans(status);
      CREATE INDEX IF NOT EXISTS idx_loan_payments_loan ON economic.loan_payments(loan_id);
      CREATE INDEX IF NOT EXISTS idx_wallets_user ON economic.wallets(user_id);
      CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON economic.wallet_transactions(wallet_id);
      CREATE INDEX IF NOT EXISTS idx_cash_transfer_recipients_program ON economic.cash_transfer_recipients(program_id);
      CREATE INDEX IF NOT EXISTS idx_skills_profiles_user ON economic.skills_profiles(user_id);

      -- Updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Apply triggers to tables
      DROP TRIGGER IF EXISTS update_jobs_updated_at ON economic.jobs;
      CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON economic.jobs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_loans_updated_at ON economic.loans;
      CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON economic.loans
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_wallets_updated_at ON economic.wallets;
      CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON economic.wallets
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_cash_transfer_programs_updated_at ON economic.cash_transfer_programs;
      CREATE TRIGGER update_cash_transfer_programs_updated_at BEFORE UPDATE ON economic.cash_transfer_programs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_women_programs_updated_at ON economic.women_programs;
      CREATE TRIGGER update_women_programs_updated_at BEFORE UPDATE ON economic.women_programs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_skills_profiles_updated_at ON economic.skills_profiles;
      CREATE TRIGGER update_skills_profiles_updated_at BEFORE UPDATE ON economic.skills_profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
      await this.query(schema);
      logger.info('✅ Database schema initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize database schema', error);
      throw error;
    }
  }
}
