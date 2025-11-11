import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Submit health data (mobile) - disease surveillance, malnutrition tracking', data: req.body });
});

router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Health data dashboard for monitoring outbreaks', data: { totalSubmissions: 0 } });
});

export { router as dataCollectionRoutes };
