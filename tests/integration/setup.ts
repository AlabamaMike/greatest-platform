import { GenericContainer, StartedTestContainer } from 'testcontainers';

export class TestContainerManager {
  private static postgresContainer: StartedTestContainer;
  private static redisContainer: StartedTestContainer;
  private static kafkaContainer: StartedTestContainer;

  static async setupAll(): Promise<void> {
    // Start PostgreSQL
    this.postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_DB: 'nexus_test',
        POSTGRES_USER: 'nexus_test',
        POSTGRES_PASSWORD: 'test_password',
      })
      .withExposedPorts(5432)
      .start();

    // Start Redis
    this.redisContainer = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .start();

    // Start Kafka (simplified for testing)
    this.kafkaContainer = await new GenericContainer('confluentinc/cp-kafka:latest')
      .withEnvironment({
        KAFKA_BROKER_ID: '1',
        KAFKA_ZOOKEEPER_CONNECT: 'localhost:2181',
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092',
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
      })
      .withExposedPorts(9092)
      .start();

    // Set environment variables for tests
    process.env.DATABASE_URL = `postgresql://nexus_test:test_password@localhost:${this.postgresContainer.getMappedPort(
      5432
    )}/nexus_test`;
    process.env.REDIS_URL = `redis://localhost:${this.redisContainer.getMappedPort(6379)}`;
    process.env.KAFKA_BROKERS = `localhost:${this.kafkaContainer.getMappedPort(9092)}`;
  }

  static async teardownAll(): Promise<void> {
    if (this.postgresContainer) {
      await this.postgresContainer.stop();
    }
    if (this.redisContainer) {
      await this.redisContainer.stop();
    }
    if (this.kafkaContainer) {
      await this.kafkaContainer.stop();
    }
  }

  static getPostgresUrl(): string {
    return process.env.DATABASE_URL || '';
  }

  static getRedisUrl(): string {
    return process.env.REDIS_URL || '';
  }

  static getKafkaBrokers(): string {
    return process.env.KAFKA_BROKERS || '';
  }
}
