import { createClient } from 'redis';
import config from '../config';
import logger from '../utils/logger';

class RedisService {
  private client: ReturnType<typeof createClient> | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        password: config.redis.password,
      });

      this.client.on('error', (err) => {
        logger.error(`Redis Client Error: ${err}`);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.warn(`Failed to connect to Redis: ${error}`);
      logger.warn('Continuing without Redis caching');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error: ${error}`);
      return null;
    }
  }

  async set(key: string, value: string, expirationInSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      if (expirationInSeconds) {
        await this.client.setEx(key, expirationInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error(`Redis SET error: ${error}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default new RedisService();
