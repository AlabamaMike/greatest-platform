import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Unhandled error', { error: error.message, stack: error.stack, path: req.path });
  res.status(500).json({ success: false, error: 'Internal server error' });
};
