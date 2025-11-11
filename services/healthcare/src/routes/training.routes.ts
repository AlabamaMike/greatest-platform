import { Router } from 'express';

const router = Router();

router.get('/modules', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: 'Basic Healthcare Training', duration: 40, certification: true },
      { id: 2, title: 'Telemedicine Best Practices', duration: 20, certification: true },
      { id: 3, title: 'Disease Surveillance Protocols', duration: 15, certification: false },
    ],
  });
});

router.post('/enroll', (req, res) => {
  res.json({ success: true, message: 'Enrolled in training module', data: req.body });
});

export { router as trainingRoutes };
