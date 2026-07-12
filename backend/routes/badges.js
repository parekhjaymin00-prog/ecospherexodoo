import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getBadges, createBadge, updateBadge, deleteBadge } from '../controllers/badgeController.js';
const router = Router();
router.get('/', authMiddleware, getBadges);
router.post('/', authMiddleware, createBadge);
router.put('/:id', authMiddleware, updateBadge);
router.delete('/:id', authMiddleware, deleteBadge);
export default router;
