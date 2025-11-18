import axios from 'axios';
import config, { ServiceConfig } from '../config';
import logger from '../utils/logger';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  details?: any;
  error?: string;
}

export interface AggregatedHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  services: ServiceHealth[];
  timestamp: string;
  gatewayVersion: string;
}

class HealthService {
  private healthCache: Map<string, ServiceHealth> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  startHealthChecks(): void {
    // Initial check
    this.checkAllServices();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllServices();
    }, config.healthCheck.interval);

    logger.info('Health check monitoring started');
  }

  stopHealthChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Health check monitoring stopped');
    }
  }

  async checkAllServices(): Promise<void> {
    const services = Object.values(config.services);

    await Promise.allSettled(
      services.map(service => this.checkServiceHealth(service))
    );
  }

  async checkServiceHealth(service: ServiceConfig): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      const response = await axios.get(`${service.url}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500, // Consider 4xx as healthy
      });

      const responseTime = Date.now() - startTime;
      const health: ServiceHealth = {
        name: service.name,
        status: response.status === 200 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date().toISOString(),
        details: response.data,
      };

      this.healthCache.set(service.name, health);
      return health;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const health: ServiceHealth = {
        name: service.name,
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date().toISOString(),
        error: error.message || 'Service unreachable',
      };

      this.healthCache.set(service.name, health);
      logger.warn(`Health check failed for ${service.name}: ${error.message}`);
      return health;
    }
  }

  getAggregatedHealth(): AggregatedHealth {
    const services = Array.from(this.healthCache.values());

    // If no services have been checked yet, return unknown status
    if (services.length === 0) {
      return {
        status: 'degraded',
        services: [],
        timestamp: new Date().toISOString(),
        gatewayVersion: '1.0.0',
      };
    }

    // Determine overall status
    const hasUnhealthy = services.some(s => s.status === 'unhealthy');
    const hasDegraded = services.some(s => s.status === 'degraded');

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (hasUnhealthy) {
      overallStatus = 'unhealthy';
    } else if (hasDegraded) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      services,
      timestamp: new Date().toISOString(),
      gatewayVersion: '1.0.0',
    };
  }

  async getServiceHealth(serviceName: string): Promise<ServiceHealth | null> {
    const service = Object.values(config.services).find(s => s.name === serviceName);

    if (!service) {
      return null;
    }

    // Check if we have recent cached data
    const cached = this.healthCache.get(serviceName);
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.lastChecked).getTime();
      if (cacheAge < 30000) { // Cache for 30 seconds
        return cached;
      }
    }

    // Perform fresh health check
    return await this.checkServiceHealth(service);
  }
}

export default new HealthService();
