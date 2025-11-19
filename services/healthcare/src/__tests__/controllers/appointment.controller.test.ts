import { Request, Response } from 'express';
import { AppointmentController } from '../../controllers/appointment.controller';
import { DatabaseService } from '../../services/database.service';
import { KafkaService } from '../../services/kafka.service';

jest.mock('../../services/database.service');
jest.mock('../../services/kafka.service');
jest.mock('../../utils/logger');

describe('AppointmentController', () => {
  let appointmentController: AppointmentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    appointmentController = new AppointmentController();
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should successfully create an appointment', async () => {
      const mockAppointment = {
        id: 'appt-123',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        appointment_type: 'consultation',
        scheduled_at: new Date(),
        notes: 'Regular checkup',
      };

      mockRequest.body = {
        patientId: 'patient-1',
        providerId: 'provider-1',
        appointmentType: 'consultation',
        scheduledAt: new Date(),
        notes: 'Regular checkup',
      };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: [mockAppointment],
      });
      (KafkaService.prototype.publishAppointmentCreated as jest.Mock).mockResolvedValue(
        undefined
      );

      await appointmentController.createAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointment,
      });
    });

    it('should handle errors when creating appointment', async () => {
      mockRequest.body = {
        patientId: 'patient-1',
        providerId: 'provider-1',
        appointmentType: 'consultation',
        scheduledAt: new Date(),
      };

      (DatabaseService.prototype.query as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await appointmentController.createAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create appointment',
      });
    });
  });

  describe('getAppointments', () => {
    it('should get appointments with no filters', async () => {
      const mockAppointments = [
        { id: 'appt-1', patient_id: 'patient-1', status: 'scheduled' },
        { id: 'appt-2', patient_id: 'patient-2', status: 'completed' },
      ];

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: mockAppointments,
        rowCount: 2,
      });

      await appointmentController.getAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointments,
        count: 2,
      });
    });

    it('should filter appointments by patient ID', async () => {
      mockRequest.query = { patientId: 'patient-1' };

      const mockAppointments = [{ id: 'appt-1', patient_id: 'patient-1' }];

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: mockAppointments,
        rowCount: 1,
      });

      await appointmentController.getAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointments,
        count: 1,
      });
    });

    it('should handle errors when getting appointments', async () => {
      (DatabaseService.prototype.query as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await appointmentController.getAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get appointments',
      });
    });
  });

  describe('getAppointmentById', () => {
    it('should get appointment by ID', async () => {
      mockRequest.params = { id: 'appt-123' };

      const mockAppointment = { id: 'appt-123', patient_id: 'patient-1' };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: [mockAppointment],
      });

      await appointmentController.getAppointmentById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointment,
      });
    });

    it('should return 404 if appointment not found', async () => {
      mockRequest.params = { id: 'non-existent' };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      await appointmentController.getAppointmentById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Appointment not found',
      });
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment', async () => {
      mockRequest.params = { id: 'appt-123' };
      mockRequest.body = {
        status: 'completed',
        notes: 'Patient seen',
      };

      const mockUpdatedAppointment = {
        id: 'appt-123',
        status: 'completed',
        notes: 'Patient seen',
      };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: [mockUpdatedAppointment],
      });

      await appointmentController.updateAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedAppointment,
      });
    });

    it('should return 404 if appointment not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = { status: 'completed' };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      await appointmentController.updateAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Appointment not found',
      });
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel appointment', async () => {
      mockRequest.params = { id: 'appt-123' };

      const mockCancelledAppointment = {
        id: 'appt-123',
        status: 'cancelled',
      };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: [mockCancelledAppointment],
      });

      await appointmentController.cancelAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Appointment cancelled',
        data: mockCancelledAppointment,
      });
    });

    it('should return 404 if appointment not found', async () => {
      mockRequest.params = { id: 'non-existent' };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      await appointmentController.cancelAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Appointment not found',
      });
    });
  });
});
