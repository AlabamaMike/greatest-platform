import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../middleware/authenticate';

jest.mock('jsonwebtoken');
jest.mock('../../utils/logger');

describe('Authenticate Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate valid token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: 'user-123',
      type: 'access',
    });

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((mockRequest as any).user).toEqual({ userId: 'user-123' });
  });

  it('should reject request without token', async () => {
    mockRequest.headers = {};

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'No token provided',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject invalid token format', async () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token',
    };

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'No token provided',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject expired token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer expired-token',
    };

    const expiredError = new jwt.TokenExpiredError('Token expired', new Date());
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw expiredError;
    });

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject refresh token type', async () => {
    mockRequest.headers = {
      authorization: 'Bearer refresh-token',
    };

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: 'user-123',
      type: 'refresh',
    });

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token type',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
