import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getRewards, createReward, updateReward, deleteReward } from '../controllers/rewardController.js';
const router = Router();
router.get('/', authMiddleware, getRewards);
router.post('/', authMiddleware, createReward);
router.put('/:id', authMiddleware, updateReward);
router.delete('/:id', authMiddleware, deleteReward);
export default router;
