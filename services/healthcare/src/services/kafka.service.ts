import { Kafka, Producer } from 'kafkajs';
import { logger } from '../utils/logger';

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;

  constructor(brokers: string[]) {
    this.kafka = new Kafka({ clientId: 'healthcare-service', brokers });
  }

  async connect(): Promise<void> {
    this.producer = this.kafka.producer();
    await this.producer.connect();
    logger.info('✅ Kafka connected');
  }

  async disconnect(): Promise<void> {
    if (this.producer) await this.producer.disconnect();
  }

  async publishEvent(topic: string, event: any): Promise<void> {
    if (!this.producer) throw new Error('Kafka not connected');
    await this.producer.send({
      topic,
      messages: [{
        key: event.id || Date.now().toString(),
        value: JSON.stringify({
          specversion: '1.0',
          type: event.type,
          source: '/healthcare-service',
          id: event.id || Date.now().toString(),
          time: new Date().toISOString(),
          data: event.data,
        }),
      }],
    });
  }

  async publishAppointmentCreated(appointmentId: string, patientId: string, providerId: string): Promise<void> {
    await this.publishEvent('healthcare.events', {
      type: 'appointment.created',
      id: appointmentId,
      data: { appointmentId, patientId, providerId },
    });
  }

  async publishConsultationCompleted(consultationId: string, patientId: string, diagnosis: string): Promise<void> {
    await this.publishEvent('healthcare.events', {
      type: 'consultation.completed',
      id: consultationId,
      data: { consultationId, patientId, diagnosis },
    });
  }
}
