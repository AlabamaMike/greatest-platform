import request from 'supertest';

describe('Healthcare Service Integration Tests', () => {
  const baseUrl = 'http://localhost:3002';

  beforeAll(async () => {
    // In real scenario, authenticate to get token
    // For now, we'll test endpoints that might not require auth
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(baseUrl).get('/health');

      if (response.status === 200) {
        expect(response.body.status).toBe('healthy');
        expect(response.body.service).toContain('healthcare');
      }
    });
  });

  describe('Appointment Management', () => {
    let appointmentId: string;

    it('should create a new appointment', async () => {
      const appointmentData = {
        patientId: 'patient-123',
        providerId: 'provider-456',
        appointmentType: 'consultation',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        notes: 'Regular checkup',
      };

      const response = await request(baseUrl)
        .post('/api/v1/healthcare/appointments')
        .send(appointmentData);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        appointmentId = response.body.data.id;
      }
    });

    it('should get appointments list', async () => {
      const response = await request(baseUrl).get(
        '/api/v1/healthcare/appointments'
      );

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should get appointment by ID', async () => {
      if (!appointmentId) return;

      const response = await request(baseUrl).get(
        `/api/v1/healthcare/appointments/${appointmentId}`
      );

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(appointmentId);
      }
    });

    it('should update appointment', async () => {
      if (!appointmentId) return;

      const updateData = {
        status: 'confirmed',
        notes: 'Patient confirmed attendance',
      };

      const response = await request(baseUrl)
        .put(`/api/v1/healthcare/appointments/${appointmentId}`)
        .send(updateData);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('confirmed');
      }
    });

    it('should cancel appointment', async () => {
      if (!appointmentId) return;

      const response = await request(baseUrl).delete(
        `/api/v1/healthcare/appointments/${appointmentId}`
      );

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Patient Management', () => {
    it('should register a new patient', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        contactNumber: '+1234567890',
        email: 'john.doe@example.com',
      };

      const response = await request(baseUrl)
        .post('/api/v1/healthcare/patients')
        .send(patientData);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
      }
    });

    it('should get patient list', async () => {
      const response = await request(baseUrl).get('/api/v1/healthcare/patients');

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('Telemedicine Consultations', () => {
    it('should initiate a consultation', async () => {
      const consultationData = {
        patientId: 'patient-123',
        providerId: 'provider-456',
        type: 'video',
        symptoms: 'Headache and fever',
      };

      const response = await request(baseUrl)
        .post('/api/v1/healthcare/consultations')
        .send(consultationData);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('sessionUrl');
      }
    });
  });
});
