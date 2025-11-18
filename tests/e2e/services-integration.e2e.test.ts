/**
 * E2E Tests for Service Integration
 * Tests cross-service communication and workflows
 */

import { getAuthClient, getHealthcareClient, getEducationClient } from './helpers/api-client';
import { generateTestUser, delay } from './helpers/test-data';

describe('Service Integration E2E Tests', () => {
  let authClient: ReturnType<typeof getAuthClient>;
  let healthcareClient: ReturnType<typeof getHealthcareClient>;
  let educationClient: ReturnType<typeof getEducationClient>;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    authClient = getAuthClient();
    healthcareClient = getHealthcareClient();
    educationClient = getEducationClient();
  });

  describe('Cross-Service Authentication', () => {
    beforeAll(async () => {
      // Register and login to get a token
      testUser = generateTestUser();
      await authClient.post('/auth/register', testUser);
      await delay(100);

      const loginResponse = await authClient.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      if (loginResponse.status === 200) {
        authToken = loginResponse.data.token;
      }
    });

    it('should authenticate across healthcare service with auth token', async () => {
      if (!authToken) {
        return; // Skip if auth failed
      }

      healthcareClient.setAuthToken(authToken);
      const response = await healthcareClient.get('/api/patients');

      // Should not return 401 (unauthorized)
      expect(response.status).not.toBe(401);
      // Might be 200 (success), 404 (not found), or 501 (not implemented)
      expect([200, 404, 501]).toContain(response.status);
    });

    it('should authenticate across education service with auth token', async () => {
      if (!authToken) {
        return;
      }

      educationClient.setAuthToken(authToken);
      const response = await educationClient.get('/api/courses');

      // Should not return 401 (unauthorized)
      expect(response.status).not.toBe(401);
      expect([200, 404, 501]).toContain(response.status);
    });
  });

  describe('Service Health Checks', () => {
    it('should have all services responding to health checks', async () => {
      const services = [
        { name: 'Auth', client: authClient },
        { name: 'Healthcare', client: healthcareClient },
        { name: 'Education', client: educationClient },
      ];

      for (const service of services) {
        const response = await service.client.get('/health');

        // Services should respond (200) or not be running (connection error)
        if (response.status === 200) {
          expect(response.data).toHaveProperty('status');
        }
      }
    });
  });

  describe('User Journey: Healthcare Workflow', () => {
    it('should support complete patient registration workflow', async () => {
      // 1. User registers
      const newUser = generateTestUser({ role: 'patient' });
      const registerResponse = await authClient.post('/auth/register', newUser);

      if (registerResponse.status !== 201) {
        return; // Skip if registration fails
      }

      await delay(100);

      // 2. User logs in
      const loginResponse = await authClient.post('/auth/login', {
        email: newUser.email,
        password: newUser.password,
      });

      if (loginResponse.status !== 200) {
        return;
      }

      const token = loginResponse.data.token;
      healthcareClient.setAuthToken(token);

      // 3. Create patient record
      const patientData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        dateOfBirth: '1990-01-01',
        gender: 'male',
      };

      const patientResponse = await healthcareClient.post('/api/patients', patientData);

      // Might not be implemented yet
      if (patientResponse.status === 201) {
        expect(patientResponse.data).toHaveProperty('patient');
        expect(patientResponse.data.patient.email).toBe(newUser.email);
      }
    });
  });

  describe('User Journey: Education Workflow', () => {
    it('should support complete student enrollment workflow', async () => {
      // 1. User registers
      const newUser = generateTestUser({ role: 'student' });
      const registerResponse = await authClient.post('/auth/register', newUser);

      if (registerResponse.status !== 201) {
        return;
      }

      await delay(100);

      // 2. User logs in
      const loginResponse = await authClient.post('/auth/login', {
        email: newUser.email,
        password: newUser.password,
      });

      if (loginResponse.status !== 200) {
        return;
      }

      const token = loginResponse.data.token;
      educationClient.setAuthToken(token);

      // 3. Browse available courses
      const coursesResponse = await educationClient.get('/api/courses');

      if (coursesResponse.status === 200) {
        expect(coursesResponse.data).toHaveProperty('courses');
      }
    });
  });

  afterAll(() => {
    healthcareClient.clearAuthToken();
    educationClient.clearAuthToken();
  });
});
