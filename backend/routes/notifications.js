import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
const router = Router();
router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/read-all', authMiddleware, markAllAsRead);
export default router;
