import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import config from './config';
import logger from './utils/logger';
import redisService from './services/redis.service';
import healthService from './services/health.service';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
const morganFormat = config.nodeEnv === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  stream: {
    write: (message: string) => logger.http(message.trim()),
  },
}));

// Request ID middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] ||
    `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-Id', requestId as string);
  next();
});

// Routes
app.use('/', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize services
const initializeServices = async () => {
  try {
    // Connect to Redis
    await redisService.connect();

    // Start health checks
    healthService.startHealthChecks();

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error(`Service initialization failed: ${error}`);
    // Continue even if some services fail
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');

  // Stop health checks
  healthService.stopHealthChecks();

  // Disconnect Redis
  await redisService.disconnect();

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  await initializeServices();

  app.listen(config.port, () => {
    logger.info('='.repeat(50));
    logger.info('🚀 Nexus API Gateway');
    logger.info('='.repeat(50));
    logger.info(`Port: ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`API Prefix: ${config.apiPrefix}`);
    logger.info('');
    logger.info('Services:');
    Object.values(config.services).forEach(service => {
      logger.info(`  - ${service.name.padEnd(15)} -> ${config.apiPrefix}${service.path}`);
    });
    logger.info('');
    logger.info(`Health Check: http://localhost:${config.port}/health`);
    logger.info(`Service Info: http://localhost:${config.port}/info`);
    logger.info('='.repeat(50));
  });
};

startServer().catch((error) => {
  logger.error(`Failed to start server: ${error}`);
  process.exit(1);
});

export default app;
