import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ready',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRoutes };
