import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { healthRoutes } from './routes/health.routes';
import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { KafkaService } from './services/kafka.service';

class AuthServiceApp {
  private app: Application;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private kafkaService: KafkaService;

  constructor() {
    this.app = express();
    this.databaseService = new DatabaseService();
    this.redisService = new RedisService();
    this.kafkaService = new KafkaService();
  }

  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
    }));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });
  }

  private setupRoutes(): void {
    this.app.use('/health', healthRoutes);
    this.app.use('/api/v1/auth', authRoutes);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async initializeServices(): Promise<void> {
    try {
      await this.databaseService.connect();
      await this.redisService.connect();
      await this.kafkaService.connect();
      logger.info('All services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize services', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      await this.initializeServices();
      this.setupMiddleware();
      this.setupRoutes();
      this.setupErrorHandling();

      this.app.listen(config.port, () => {
        logger.info(`🚀 Auth Service running on port ${config.port}`);
        logger.info(`📝 Environment: ${config.nodeEnv}`);
        logger.info(`🌍 Ready to change the world through authentication!`);
      });
    } catch (error) {
      logger.error('Failed to start Auth Service', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down Auth Service...');
    await this.databaseService.disconnect();
    await this.redisService.disconnect();
    await this.kafkaService.disconnect();
    process.exit(0);
  }
}

// Create and start the application
const authService = new AuthServiceApp();

// Graceful shutdown
process.on('SIGTERM', () => authService.shutdown());
process.on('SIGINT', () => authService.shutdown());

// Start the service
authService.start();

export default authService;
