import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';

const router = Router();
const controller = new AppointmentController();

router.post('/', controller.createAppointment.bind(controller));
router.get('/', controller.getAppointments.bind(controller));
router.get('/:id', controller.getAppointmentById.bind(controller));
router.put('/:id', controller.updateAppointment.bind(controller));
router.delete('/:id', controller.cancelAppointment.bind(controller));

export { router as appointmentRoutes };
