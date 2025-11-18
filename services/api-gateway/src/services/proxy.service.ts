import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ServiceConfig } from '../config';
import logger from '../utils/logger';

export const createServiceProxy = (service: ServiceConfig) => {
  const proxyOptions: Options = {
    target: service.url,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1${service.path}`]: '/api/v1' + service.path,
    },
    timeout: service.timeout || 30000,
    proxyTimeout: service.timeout || 30000,

    onProxyReq: (proxyReq, req, res) => {
      logger.http(`Proxying ${req.method} ${req.path} -> ${service.name}`);

      // Forward user info if available
      if ((req as any).user) {
        proxyReq.setHeader('X-User-Id', (req as any).user.userId);
        proxyReq.setHeader('X-User-Email', (req as any).user.email);
        if ((req as any).user.role) {
          proxyReq.setHeader('X-User-Role', (req as any).user.role);
        }
      }

      // Add request ID for tracing
      const requestId = req.headers['x-request-id'] || generateRequestId();
      proxyReq.setHeader('X-Request-Id', requestId as string);

      // Add gateway identifier
      proxyReq.setHeader('X-Gateway', 'nexus-api-gateway');
    },

    onProxyRes: (proxyRes, req, res) => {
      logger.http(`Response from ${service.name}: ${proxyRes.statusCode}`);
    },

    onError: (err, req, res) => {
      logger.error(`Proxy error for ${service.name}: ${err.message}`);

      (res as any).status(503).json({
        success: false,
        error: `Service ${service.name} is currently unavailable`,
        message: err.message,
      });
    },
  };

  return createProxyMiddleware(proxyOptions);
};

const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};
