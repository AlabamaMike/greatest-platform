import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'healthcare-service', timestamp: new Date().toISOString() });
});

export { router as healthRoutes };
