import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create patient record - FHIR compliant', data: req.body });
});

router.get('/:id/records', (req, res) => {
  res.json({ success: true, message: `Get medical records for patient ${req.params.id}`, data: [] });
});

export { router as patientRoutes };
