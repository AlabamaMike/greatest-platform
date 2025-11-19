import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://nexus:nexus_dev_password@localhost:5432/nexus',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://:nexus_dev_password@localhost:6379',

  // Kafka
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
