import { Request, Response } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { DatabaseService } from '../../services/database.service';
import { RedisService } from '../../services/redis.service';
import { KafkaService } from '../../services/kafka.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../services/database.service');
jest.mock('../../services/redis.service');
jest.mock('../../services/kafka.service');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/logger');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockKafkaService: jest.Mocked<KafkaService>;

  beforeEach(() => {
    authController = new AuthController();
    mockRequest = {
      body: {},
      headers: {},
      ip: '127.0.0.1',
      get: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: new Date(),
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      (DatabaseService.prototype.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({ rows: [mockUser] }) // Insert user
        .mockResolvedValueOnce({ rows: [] }); // Insert role

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (KafkaService.prototype.publishUserRegistered as jest.Mock).mockResolvedValue(undefined);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
          }),
          accessToken: 'mock-token',
          refreshToken: 'mock-token',
        }),
      });
    });

    it('should return error if user already exists', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'existing-user' }],
      });

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with this email already exists',
      });
    });

    it('should handle registration errors', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      (DatabaseService.prototype.query as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Registration failed',
      });
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        full_name: 'Test User',
        is_active: true,
        failed_login_attempts: 0,
        locked_until: null,
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      (DatabaseService.prototype.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockUser] }) // Get user
        .mockResolvedValueOnce({ rows: [] }); // Reset failed attempts

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (KafkaService.prototype.publishUserLoggedIn as jest.Mock).mockResolvedValue(undefined);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
          }),
          accessToken: 'mock-token',
          refreshToken: 'mock-token',
        }),
      });
    });

    it('should return error for invalid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email or password',
      });
    });

    it('should return error if account is locked', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        is_active: true,
        locked_until: new Date(Date.now() + 3600000), // Locked for 1 hour
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUser],
      });

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Account is temporarily locked due to multiple failed login attempts',
      });
    });

    it('should return error if account is inactive', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        is_active: false,
        locked_until: null,
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUser],
      });

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Account is deactivated',
      });
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh access token', async () => {
      mockRequest.body = {
        refreshToken: 'valid-refresh-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-123', type: 'refresh' });
      (jwt.sign as jest.Mock).mockReturnValue('new-token');
      (RedisService.prototype.isTokenBlacklisted as jest.Mock).mockResolvedValue(false);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          accessToken: 'new-token',
          refreshToken: 'new-token',
        }),
      });
    });

    it('should return error if refresh token is missing', async () => {
      mockRequest.body = {};

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Refresh token is required',
      });
    });

    it('should return error if refresh token is blacklisted', async () => {
      mockRequest.body = {
        refreshToken: 'blacklisted-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-123', type: 'refresh' });
      (RedisService.prototype.isTokenBlacklisted as jest.Mock).mockResolvedValue(true);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token has been revoked',
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };
      (mockRequest as any).user = { userId: 'user-123' };

      (jwt.decode as jest.Mock).mockReturnValue({
        userId: 'user-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      (RedisService.prototype.blacklistToken as jest.Mock).mockResolvedValue(undefined);
      (RedisService.prototype.deleteSession as jest.Mock).mockResolvedValue(undefined);
      (KafkaService.prototype.publishUserLoggedOut as jest.Mock).mockResolvedValue(undefined);

      await authController.logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('getProfile', () => {
    it('should successfully get user profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        phone_number: '+1234567890',
        country_code: 'US',
        roles: ['user'],
        created_at: new Date(),
      };

      (mockRequest as any).user = { userId: 'user-123' };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUser],
      });

      await authController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.full_name,
        }),
      });
    });

    it('should return error if user not found', async () => {
      (mockRequest as any).user = { userId: 'non-existent' };

      (DatabaseService.prototype.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      await authController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
      });
    });
  });
});
