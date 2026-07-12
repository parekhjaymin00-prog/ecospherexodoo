import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getTrainingRecords, createTrainingRecord, updateTrainingRecord, deleteTrainingRecord, getDiversityMetrics } from '../controllers/trainingController.js';

const router = Router();
router.get('/', authMiddleware, getTrainingRecords);
router.post('/', authMiddleware, createTrainingRecord);
router.put('/:id', authMiddleware, updateTrainingRecord);
router.delete('/:id', authMiddleware, deleteTrainingRecord);
router.get('/diversity', authMiddleware, getDiversityMetrics);

export default router;
