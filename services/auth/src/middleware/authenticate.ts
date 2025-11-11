import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;

      if (decoded.type !== 'access') {
        res.status(401).json({
          success: false,
          error: 'Invalid token type',
        });
        return;
      }

      (req as any).user = { userId: decoded.userId };
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: 'Token expired',
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
  } catch (error) {
    logger.error('Authentication error', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};
