import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { appointmentRoutes } from './routes/appointment.routes';
import { patientRoutes } from './routes/patient.routes';
import { providerRoutes } from './routes/provider.routes';
import { consultationRoutes } from './routes/consultation.routes';
import { dataCollectionRoutes } from './routes/data-collection.routes';
import { trainingRoutes } from './routes/training.routes';
import { healthRoutes } from './routes/health.routes';
import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { KafkaService } from './services/kafka.service';

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://nexus:nexus_dev_password@localhost:5432/nexus',
  mongoUrl: process.env.MONGODB_URL || 'mongodb://nexus:nexus_dev_password@localhost:27017/nexus',
  redisUrl: process.env.REDIS_URL || 'redis://:nexus_dev_password@localhost:6379',
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
};

class HealthcareServiceApp {
  private app: Application;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private kafkaService: KafkaService;

  constructor() {
    this.app = express();
    this.databaseService = new DatabaseService(config.databaseUrl, config.mongoUrl);
    this.redisService = new RedisService(config.redisUrl);
    this.kafkaService = new KafkaService(config.kafkaBrokers);
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    this.app.use('/health', healthRoutes);
    this.app.use('/api/v1/healthcare/appointments', appointmentRoutes);
    this.app.use('/api/v1/healthcare/patients', patientRoutes);
    this.app.use('/api/v1/healthcare/providers', providerRoutes);
    this.app.use('/api/v1/healthcare/consultations', consultationRoutes);
    this.app.use('/api/v1/healthcare/data-collection', dataCollectionRoutes);
    this.app.use('/api/v1/healthcare/training', trainingRoutes);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async initializeServices(): Promise<void> {
    await this.databaseService.connect();
    await this.redisService.connect();
    await this.kafkaService.connect();
    logger.info('✅ All services initialized');
  }

  public async start(): Promise<void> {
    try {
      await this.initializeServices();
      this.setupMiddleware();
      this.setupRoutes();
      this.setupErrorHandling();

      this.app.listen(config.port, () => {
        logger.info(`🏥 Healthcare Service running on port ${config.port}`);
        logger.info(`💊 Providing universal healthcare access to 3.5B+ people!`);
      });
    } catch (error) {
      logger.error('Failed to start Healthcare Service', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down Healthcare Service...');
    await this.databaseService.disconnect();
    await this.redisService.disconnect();
    await this.kafkaService.disconnect();
    process.exit(0);
  }
}

const healthcareService = new HealthcareServiceApp();

process.on('SIGTERM', () => healthcareService.shutdown());
process.on('SIGINT', () => healthcareService.shutdown());

healthcareService.start();

export default healthcareService;
