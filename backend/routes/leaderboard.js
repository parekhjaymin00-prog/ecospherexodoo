import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getLeaderboard, getDepartmentLeaderboard } from '../controllers/leaderboardController.js';
const router = Router();
router.get('/', authMiddleware, getLeaderboard);
router.get('/departments', authMiddleware, getDepartmentLeaderboard);
export default router;
