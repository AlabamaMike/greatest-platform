import { Request, Response } from 'express';
import { DatabaseService } from '../services/database.service';
import { KafkaService } from '../services/kafka.service';
import { logger } from '../utils/logger';

const dbService = new DatabaseService(
  process.env.DATABASE_URL || 'postgresql://nexus:nexus_dev_password@localhost:5432/nexus',
  process.env.MONGODB_URL || 'mongodb://nexus:nexus_dev_password@localhost:27017/nexus'
);
const kafkaService = new KafkaService((process.env.KAFKA_BROKERS || 'localhost:9092').split(','));

export class AppointmentController {
  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, providerId, appointmentType, scheduledAt, notes } = req.body;

      const result = await dbService.query(
        `INSERT INTO healthcare.appointments (patient_id, provider_id, appointment_type, scheduled_at, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [patientId, providerId, appointmentType, scheduledAt, notes]
      );

      const appointment = result.rows[0];

      await kafkaService.publishAppointmentCreated(appointment.id, patientId, providerId);

      logger.info('Appointment created', { appointmentId: appointment.id });

      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      logger.error('Create appointment error', error);
      res.status(500).json({ success: false, error: 'Failed to create appointment' });
    }
  }

  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, providerId, status } = req.query;

      let query = 'SELECT * FROM healthcare.appointments WHERE 1=1';
      const params: any[] = [];

      if (patientId) {
        params.push(patientId);
        query += ` AND patient_id = $${params.length}`;
      }

      if (providerId) {
        params.push(providerId);
        query += ` AND provider_id = $${params.length}`;
      }

      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }

      query += ' ORDER BY scheduled_at DESC';

      const result = await dbService.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        count: result.rowCount,
      });
    } catch (error) {
      logger.error('Get appointments error', error);
      res.status(500).json({ success: false, error: 'Failed to get appointments' });
    }
  }

  async getAppointmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await dbService.query(
        'SELECT * FROM healthcare.appointments WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Appointment not found' });
        return;
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      logger.error('Get appointment error', error);
      res.status(500).json({ success: false, error: 'Failed to get appointment' });
    }
  }

  async updateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { scheduledAt, status, notes } = req.body;

      const result = await dbService.query(
        `UPDATE healthcare.appointments
         SET scheduled_at = COALESCE($1, scheduled_at),
             status = COALESCE($2, status),
             notes = COALESCE($3, notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [scheduledAt, status, notes, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Appointment not found' });
        return;
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      logger.error('Update appointment error', error);
      res.status(500).json({ success: false, error: 'Failed to update appointment' });
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await dbService.query(
        `UPDATE healthcare.appointments
         SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Appointment not found' });
        return;
      }

      res.json({ success: true, message: 'Appointment cancelled', data: result.rows[0] });
    } catch (error) {
      logger.error('Cancel appointment error', error);
      res.status(500).json({ success: false, error: 'Failed to cancel appointment' });
    }
  }
}
