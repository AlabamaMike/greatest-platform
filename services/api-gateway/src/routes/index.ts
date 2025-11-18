import { Router } from 'express';
import config from '../config';
import { createServiceProxy } from '../services/proxy.service';
import healthService from '../services/health.service';
import redisService from '../services/redis.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { standardLimiter, authLimiter, readOnlyLimiter } from '../middleware/rateLimit.middleware';
import logger from '../utils/logger';

const router = Router();

// Gateway health check (doesn't check downstream services)
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    redis: redisService.getConnectionStatus() ? 'connected' : 'disconnected',
  });
});

// Aggregated health check (includes all downstream services)
router.get('/health/aggregate', async (req, res) => {
  const health = healthService.getAggregatedHealth();
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503;

  res.status(statusCode).json(health);
});

// Individual service health check
router.get('/health/:service', async (req, res) => {
  const { service } = req.params;
  const health = await healthService.getServiceHealth(service);

  if (!health) {
    return res.status(404).json({
      success: false,
      error: 'Service not found',
    });
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503;
  res.status(statusCode).json(health);
});

// Gateway information
router.get('/info', (req, res) => {
  res.json({
    name: 'Nexus API Gateway',
    version: '1.0.0',
    description: 'Unified entry point for all Nexus Platform microservices',
    services: Object.values(config.services).map(s => ({
      name: s.name,
      path: config.apiPrefix + s.path,
    })),
    documentation: '/docs',
    timestamp: new Date().toISOString(),
  });
});

// Service routes with authentication and rate limiting
const setupServiceRoutes = () => {
  const services = Object.values(config.services);

  services.forEach(service => {
    const servicePath = `${config.apiPrefix}${service.path}`;

    logger.info(`Setting up proxy for ${service.name} at ${servicePath}`);

    // Apply different rate limiters based on service
    if (service.name === 'auth') {
      // Auth service gets stricter rate limiting
      router.use(servicePath, authLimiter, createServiceProxy(service));
    } else {
      // Other services use standard rate limiting and authentication
      router.use(
        servicePath,
        standardLimiter,
        authenticateToken,
        createServiceProxy(service)
      );
    }
  });
};

setupServiceRoutes();

export default router;
