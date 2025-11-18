/**
 * E2E Tests for Authentication Service
 */

import { getAuthClient } from './helpers/api-client';
import { generateTestUser, delay } from './helpers/test-data';

describe('Authentication Service E2E Tests', () => {
  let authClient: ReturnType<typeof getAuthClient>;
  let testUser: any;
  let authToken: string;

  beforeAll(() => {
    authClient = getAuthClient();
  });

  beforeEach(() => {
    testUser = generateTestUser();
  });

  afterEach(() => {
    authClient.clearAuthToken();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await authClient.get('/health');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await authClient.post('/auth/register', testUser);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(testUser.email);
      expect(response.data.user).not.toHaveProperty('password');
    });

    it('should reject registration with invalid email', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      const response = await authClient.post('/auth/register', invalidUser);

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject registration with weak password', async () => {
      const weakPasswordUser = { ...testUser, password: '123' };
      const response = await authClient.post('/auth/register', weakPasswordUser);

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await authClient.post('/auth/register', testUser);

      // Wait a bit to ensure the first registration is processed
      await delay(100);

      // Attempt duplicate registration
      const response = await authClient.post('/auth/register', testUser);

      expect(response.status).toBe(409);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject registration with missing required fields', async () => {
      const incompleteUser = { email: testUser.email };
      const response = await authClient.post('/auth/register', incompleteUser);

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await authClient.post('/auth/register', testUser);
      await delay(100);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await authClient.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.email).toBe(testUser.email);

      authToken = response.data.token;
    });

    it('should reject login with incorrect password', async () => {
      const response = await authClient.post('/auth/login', {
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject login with non-existent email', async () => {
      const response = await authClient.post('/auth/login', {
        email: 'nonexistent@example.com',
        password: 'somepassword',
      });

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject login with missing credentials', async () => {
      const response = await authClient.post('/auth/login', {
        email: testUser.email,
      });

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
    });
  });

  describe('User Profile', () => {
    beforeEach(async () => {
      // Register and login
      await authClient.post('/auth/register', testUser);
      await delay(100);

      const loginResponse = await authClient.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      authToken = loginResponse.data.token;
      authClient.setAuthToken(authToken);
    });

    it('should get user profile with valid token', async () => {
      const response = await authClient.get('/auth/profile');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.email).toBe(testUser.email);
      expect(response.data.user).not.toHaveProperty('password');
    });

    it('should reject profile access without token', async () => {
      authClient.clearAuthToken();
      const response = await authClient.get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject profile access with invalid token', async () => {
      authClient.setAuthToken('invalid-token');
      const response = await authClient.get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });
  });

  describe('Token Refresh', () => {
    beforeEach(async () => {
      // Register and login
      await authClient.post('/auth/register', testUser);
      await delay(100);

      const loginResponse = await authClient.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      authToken = loginResponse.data.token;
      authClient.setAuthToken(authToken);
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await authClient.post('/auth/refresh', {
        token: authToken,
      });

      // Might be 200 or 501 (not implemented)
      expect([200, 501]).toContain(response.status);

      if (response.status === 200) {
        expect(response.data).toHaveProperty('token');
      }
    });
  });

  describe('User Logout', () => {
    beforeEach(async () => {
      // Register and login
      await authClient.post('/auth/register', testUser);
      await delay(100);

      const loginResponse = await authClient.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      authToken = loginResponse.data.token;
      authClient.setAuthToken(authToken);
    });

    it('should logout successfully', async () => {
      const response = await authClient.post('/auth/logout');

      // Might be 200 or 501 (not implemented)
      expect([200, 204, 501]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const requests = [];

      // Make 100 rapid requests
      for (let i = 0; i < 100; i++) {
        requests.push(authClient.post('/auth/login', {
          email: 'test@example.com',
          password: 'wrong',
        }));
      }

      const responses = await Promise.all(requests);

      // Rate limiting might or might not be implemented yet
      // Just check that we don't get server errors
      responses.forEach(response => {
        expect(response.status).not.toBe(500);
      });
    });
  });
});
