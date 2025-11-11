import Redis from 'ioredis';
import { logger } from '../utils/logger';

export class RedisService {
  private client: Redis | null = null;

  constructor(private url: string) {}

  async connect(): Promise<void> {
    this.client = new Redis(this.url);
    this.client.on('error', (error) => logger.error('Redis error', error));
    await this.client.ping();
    logger.info('✅ Redis connected');
  }

  async disconnect(): Promise<void> {
    if (this.client) await this.client.quit();
  }

  getClient(): Redis {
    if (!this.client) throw new Error('Redis not connected');
    return this.client;
  }

  async cache(key: string, data: any, ttl: number = 3600): Promise<void> {
    await this.getClient().setex(key, ttl, JSON.stringify(data));
  }

  async getCached(key: string): Promise<any | null> {
    const data = await this.getClient().get(key);
    return data ? JSON.parse(data) : null;
  }
}
