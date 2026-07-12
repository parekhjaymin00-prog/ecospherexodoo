import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getEnvironmentalGoals,
  getGoalStats,
  getEnvironmentalGoalById,
  createEnvironmentalGoal,
  updateEnvironmentalGoal,
  deleteEnvironmentalGoal,
} from '../controllers/environmentalGoalController.js';

const router = Router();

router.get('/', authMiddleware, getEnvironmentalGoals);
router.get('/stats', authMiddleware, getGoalStats);
router.get('/:id', authMiddleware, getEnvironmentalGoalById);
router.post('/', authMiddleware, createEnvironmentalGoal);
router.put('/:id', authMiddleware, updateEnvironmentalGoal);
router.delete('/:id', authMiddleware, deleteEnvironmentalGoal);

export default router;
