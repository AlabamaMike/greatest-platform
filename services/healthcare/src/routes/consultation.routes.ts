import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Start telemedicine consultation (WebRTC)', sessionId: 'session_' + Date.now() });
});

router.post('/:id/complete', (req, res) => {
  res.json({ success: true, message: 'Complete consultation with diagnosis/prescription', data: req.body });
});

export { router as consultationRoutes };
