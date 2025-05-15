import { Router } from 'express';
import { MessageController, } from '../controllers/message.controller';

const router = Router();

// POST /api/message/send
router.post('/send', MessageController.sendMessage);

// GET /api/message/get-messages
router.get('/get-messages', MessageController.getMessages);

export default router;