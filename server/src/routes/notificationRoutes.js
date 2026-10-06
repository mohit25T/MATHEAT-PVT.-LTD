import express from 'express';
import {
  getNotifications,
  createNotification,
  markAllRead
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', authenticate, createNotification);
router.post('/mark-read', authenticate, markAllRead);

export default router;
