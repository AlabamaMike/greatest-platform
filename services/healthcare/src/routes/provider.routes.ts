import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Find healthcare providers by specialty/location', data: [] });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Register as healthcare provider', data: req.body });
});

export { router as providerRoutes };
