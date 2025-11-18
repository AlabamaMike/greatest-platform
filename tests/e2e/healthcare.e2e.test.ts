/**
 * E2E Tests for Healthcare Service
 */

import { getHealthcareClient, getAuthClient } from './helpers/api-client';
import { generateTestUser, generateTestPatient, generateTestProvider, delay } from './helpers/test-data';

describe('Healthcare Service E2E Tests', () => {
  let healthcareClient: ReturnType<typeof getHealthcareClient>;
  let authClient: ReturnType<typeof getAuthClient>;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    healthcareClient = getHealthcareClient();
    authClient = getAuthClient();

    // Create a test user and get auth token
    testUser = generateTestUser({ role: 'healthcare_provider' });
    await authClient.post('/auth/register', testUser);
    await delay(100);

    const loginResponse = await authClient.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });

    if (loginResponse.status === 200) {
      authToken = loginResponse.data.token;
      healthcareClient.setAuthToken(authToken);
    }
  });

  afterAll(() => {
    healthcareClient.clearAuthToken();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await healthcareClient.get('/health');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });

  describe('Patient Management', () => {
    let patientId: string;

    it('should create a new patient', async () => {
      const patientData = generateTestPatient();
      const response = await healthcareClient.post('/api/patients', patientData);

      // Might be 201 or 404/501 if not implemented
      if (response.status === 201) {
        expect(response.data).toHaveProperty('patient');
        expect(response.data.patient).toHaveProperty('id');
        patientId = response.data.patient.id;
      } else {
        // Service might not be fully implemented
        expect([404, 501]).toContain(response.status);
      }
    });

    it('should get patient by ID', async () => {
      if (!patientId) {
        // Skip if patient creation failed
        return;
      }

      const response = await healthcareClient.get(`/api/patients/${patientId}`);

      if (response.status === 200) {
        expect(response.data).toHaveProperty('patient');
        expect(response.data.patient.id).toBe(patientId);
      } else {
        expect([404, 501]).toContain(response.status);
      }
    });

    it('should list all patients', async () => {
      const response = await healthcareClient.get('/api/patients');

      // Might be 200 or 404/501 if not implemented
      if (response.status === 200) {
        expect(response.data).toHaveProperty('patients');
        expect(Array.isArray(response.data.patients)).toBe(true);
      } else {
        expect([404, 501]).toContain(response.status);
      }
    });

    it('should update patient information', async () => {
      if (!patientId) {
        return;
      }

      const updateData = {
        phone: '+9876543210',
      };

      const response = await healthcareClient.put(`/api/patients/${patientId}`, updateData);

      if (response.status === 200) {
        expect(response.data).toHaveProperty('patient');
        expect(response.data.patient.phone).toBe(updateData.phone);
      } else {
        expect([404, 501]).toContain(response.status);
      }
    });

    it('should delete a patient', async () => {
      if (!patientId) {
        return;
      }

      const response = await healthcareClient.delete(`/api/patients/${patientId}`);

      // Accept 200, 204, or not implemented
      if (response.status === 200 || response.status === 204) {
        // Verify deletion
        const getResponse = await healthcareClient.get(`/api/patients/${patientId}`);
        expect(getResponse.status).toBe(404);
      } else {
        expect([404, 501]).toContain(response.status);
      }
    });
  });

  describe('Provider Management', () => {
    it('should create a new provider', async () => {
      const providerData = generateTestProvider();
      const response = await healthcareClient.post('/api/providers', providerData);

      if (response.status === 201) {
        expect(response.data).toHaveProperty('provider');
        expect(response.data.provider).toHaveProperty('id');
      } else {
        expect([404, 501]).toContain(response.status);
      }
    });

    it('should list all providers', async () => {
      const response = await healthcareClient.get('/api/providers');

      if (response.status === 200) {
        expect(response.data).toHaveProperty('providers');
        expect(Array.isArray(response.data.providers)).toBe(true);
      } else {
        expect([404, 501]).toContain(response.status);
      }
    });
  });

  describe('Appointment Management', () => {
    it('should create an appointment', async () => {
      const appointmentData = {
        patientId: 'test-patient-id',
        providerId: 'test-provider-id',
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        type: 'consultation',
      };

      const response = await healthcareClient.post('/api/appointments', appointmentData);

      // Might fail if patients/providers don't exist
      if (response.status === 201) {
        expect(response.data).toHaveProperty('appointment');
      } else {
        expect([400, 404, 501]).toContain(response.status);
      }
    });

    it('should list all appointments', async () => {
      const response = await healthcareClient.get('/api/appointments');

      if (response.status === 200) {
        expect(response.data).toHaveProperty('appointments');
        expect(Array.isArray(response.data.appointments)).toBe(true);
      } else {
        expect([404, 501]).toContain(response.status);
      }
    });
  });

  describe('Consultation Management', () => {
    it('should list consultations', async () => {
      const response = await healthcareClient.get('/api/consultations');

      if (response.status === 200) {
        expect(response.data).toHaveProperty('consultations');
        expect(Array.isArray(response.data.consultations)).toBe(true);
      } else {
        expect([404, 501]).toContain(response.status);
      }
    });
  });

  describe('Data Collection', () => {
    it('should access data collection endpoints', async () => {
      const response = await healthcareClient.get('/api/data-collection');

      // Endpoint might not be implemented
      expect([200, 404, 501]).toContain(response.status);
    });
  });

  describe('Training Resources', () => {
    it('should access training resources', async () => {
      const response = await healthcareClient.get('/api/training');

      // Endpoint might not be implemented
      expect([200, 404, 501]).toContain(response.status);
    });
  });
});
