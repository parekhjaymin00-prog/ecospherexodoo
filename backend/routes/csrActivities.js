import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getCSRActivities,
  getCSRStats,
  getCSRActivityById,
  createCSRActivity,
  updateCSRActivity,
  deleteCSRActivity,
} from '../controllers/csrActivityController.js';

const router = Router();

router.get('/', authMiddleware, getCSRActivities);
router.get('/stats', authMiddleware, getCSRStats);
router.get('/:id', authMiddleware, getCSRActivityById);
router.post('/', authMiddleware, createCSRActivity);
router.put('/:id', authMiddleware, updateCSRActivity);
router.delete('/:id', authMiddleware, deleteCSRActivity);

export default router;
