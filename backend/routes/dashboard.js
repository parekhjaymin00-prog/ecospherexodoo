import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getDashboardScores, getDashboardTrend } from '../controllers/dashboardController.js';

const router = Router();

router.get('/scores', authMiddleware, getDashboardScores);
router.get('/trend', authMiddleware, getDashboardTrend);

export default router;
