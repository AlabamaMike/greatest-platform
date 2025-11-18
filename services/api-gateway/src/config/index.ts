import dotenv from 'dotenv';

dotenv.config();

export interface ServiceConfig {
  name: string;
  url: string;
  path: string;
  timeout?: number;
}

export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Service URLs
  services: {
    auth: {
      name: 'auth',
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      path: '/auth',
      timeout: 10000,
    },
    healthcare: {
      name: 'healthcare',
      url: process.env.HEALTHCARE_SERVICE_URL || 'http://localhost:3003',
      path: '/healthcare',
      timeout: 30000,
    },
    education: {
      name: 'education',
      url: process.env.EDUCATION_SERVICE_URL || 'http://localhost:3004',
      path: '/education',
      timeout: 30000,
    },
    economic: {
      name: 'economic',
      url: process.env.ECONOMIC_SERVICE_URL || 'http://localhost:3005',
      path: '/economic',
      timeout: 30000,
    },
    dataAnalytics: {
      name: 'data-analytics',
      url: process.env.DATA_ANALYTICS_SERVICE_URL || 'http://localhost:8000',
      path: '/data',
      timeout: 60000,
    },
    crisis: {
      name: 'crisis',
      url: process.env.CRISIS_SERVICE_URL || 'http://localhost:3007',
      path: '/crisis',
      timeout: 30000,
    },
    aiMl: {
      name: 'ai-ml',
      url: process.env.AI_ML_SERVICE_URL || 'http://localhost:8001',
      path: '/ai',
      timeout: 60000,
    },
  } as Record<string, ServiceConfig>,

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // Security
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Timeouts
  timeouts: {
    service: parseInt(process.env.SERVICE_TIMEOUT || '30000'),
    proxy: parseInt(process.env.PROXY_TIMEOUT || '60000'),
  },

  // Health Check
  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
  },
};

export default config;
