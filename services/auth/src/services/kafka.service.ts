import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { config } from '../config';
import { logger } from '../utils/logger';

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'auth-service',
      brokers: config.kafkaBrokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  async connect(): Promise<void> {
    try {
      // Initialize producer
      this.producer = this.kafka.producer();
      await this.producer.connect();

      // Initialize consumer
      this.consumer = this.kafka.consumer({ groupId: 'auth-service-group' });
      await this.consumer.connect();

      logger.info('✅ Kafka connected successfully');
    } catch (error) {
      logger.error('❌ Kafka connection failed', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.consumer) {
      await this.consumer.disconnect();
    }
    logger.info('Kafka connection closed');
  }

  async publishEvent(topic: string, event: any): Promise<void> {
    if (!this.producer) {
      throw new Error('Kafka producer not initialized');
    }

    try {
      const message = {
        key: event.id || Date.now().toString(),
        value: JSON.stringify({
          specversion: '1.0',
          type: event.type,
          source: '/auth-service',
          id: event.id || Date.now().toString(),
          time: new Date().toISOString(),
          datacontenttype: 'application/json',
          data: event.data,
        }),
      };

      await this.producer.send({
        topic,
        messages: [message],
      });

      logger.debug('Event published', { topic, type: event.type });
    } catch (error) {
      logger.error('Failed to publish event', { topic, event, error });
      throw error;
    }
  }

  async subscribe(topic: string, handler: (message: EachMessagePayload) => Promise<void>): Promise<void> {
    if (!this.consumer) {
      throw new Error('Kafka consumer not initialized');
    }

    await this.consumer.subscribe({ topic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: handler,
    });

    logger.info(`Subscribed to topic: ${topic}`);
  }

  // User event publishers
  async publishUserRegistered(userId: string, email: string, fullName: string): Promise<void> {
    await this.publishEvent('user.events', {
      type: 'user.registered',
      id: userId,
      data: { userId, email, fullName, registeredAt: new Date().toISOString() },
    });
  }

  async publishUserLoggedIn(userId: string, ip: string, userAgent: string): Promise<void> {
    await this.publishEvent('user.events', {
      type: 'user.logged_in',
      id: userId,
      data: { userId, ip, userAgent, loginAt: new Date().toISOString() },
    });
  }

  async publishUserLoggedOut(userId: string): Promise<void> {
    await this.publishEvent('user.events', {
      type: 'user.logged_out',
      id: userId,
      data: { userId, logoutAt: new Date().toISOString() },
    });
  }

  async publishPasswordChanged(userId: string): Promise<void> {
    await this.publishEvent('user.events', {
      type: 'user.password_changed',
      id: userId,
      data: { userId, changedAt: new Date().toISOString() },
    });
  }

  async publishEmailVerified(userId: string, email: string): Promise<void> {
    await this.publishEvent('user.events', {
      type: 'user.email_verified',
      id: userId,
      data: { userId, email, verifiedAt: new Date().toISOString() },
    });
  }
}
