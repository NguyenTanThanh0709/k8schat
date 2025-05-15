import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

// POST /api/message/send
router.post('/send', NotificationController.createNotification);
router.patch('/send/:id', NotificationController.updateStatus);

// GET /api/message/get-messages
router.get('/get-notifications/:receiverId', NotificationController.getByReceiver);

export default router;