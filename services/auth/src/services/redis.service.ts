import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

export class RedisService {
  private client: Redis | null = null;

  async connect(): Promise<void> {
    try {
      this.client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on('error', (error) => {
        logger.error('Redis error', error);
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis connected successfully');
      });

      await this.client.ping();
    } catch (error) {
      logger.error('❌ Redis connection failed', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis connection closed');
    }
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis not connected');
    }
    return this.client;
  }

  // Session management
  async setSession(userId: string, data: any, ttl: number = 604800): Promise<void> {
    const client = this.getClient();
    const key = `session:${userId}`;
    await client.setex(key, ttl, JSON.stringify(data));
  }

  async getSession(userId: string): Promise<any | null> {
    const client = this.getClient();
    const key = `session:${userId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(userId: string): Promise<void> {
    const client = this.getClient();
    const key = `session:${userId}`;
    await client.del(key);
  }

  // Rate limiting
  async checkRateLimit(identifier: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const client = this.getClient();
    const key = `ratelimit:${identifier}`;
    const current = await client.incr(key);

    if (current === 1) {
      await client.pexpire(key, windowMs);
    }

    return current <= maxRequests;
  }

  // Token blacklist (for revoked JWTs)
  async blacklistToken(token: string, ttl: number): Promise<void> {
    const client = this.getClient();
    const key = `blacklist:${token}`;
    await client.setex(key, ttl, '1');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const client = this.getClient();
    const key = `blacklist:${token}`;
    const result = await client.get(key);
    return result !== null;
  }

  // Caching
  async cache(key: string, data: any, ttl: number = 3600): Promise<void> {
    const client = this.getClient();
    await client.setex(key, ttl, JSON.stringify(data));
  }

  async getCached(key: string): Promise<any | null> {
    const client = this.getClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateCache(key: string): Promise<void> {
    const client = this.getClient();
    await client.del(key);
  }
}
