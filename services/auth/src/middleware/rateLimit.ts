import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../services/redis.service';

const redisService = new RedisService();

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export const rateLimit = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.ip || 'unknown';
      const key = `${req.path}:${identifier}`;

      const allowed = await redisService.checkRateLimit(key, options.max, options.windowMs);

      if (!allowed) {
        res.status(429).json({
          success: false,
          error: 'Too many requests, please try again later',
        });
        return;
      }

      next();
    } catch (error) {
      // If rate limiting fails, allow the request
      next();
    }
  };
};
