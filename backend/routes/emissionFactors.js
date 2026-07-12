import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getEmissionFactors,
  getAllEmissionFactors,
  getEmissionFactorById,
  createEmissionFactor,
  updateEmissionFactor,
  deleteEmissionFactor,
} from '../controllers/emissionFactorController.js';

const router = Router();

router.get('/', authMiddleware, getEmissionFactors);
router.get('/all', authMiddleware, getAllEmissionFactors);
router.get('/:id', authMiddleware, getEmissionFactorById);
router.post('/', authMiddleware, createEmissionFactor);
router.put('/:id', authMiddleware, updateEmissionFactor);
router.delete('/:id', authMiddleware, deleteEmissionFactor);

export default router;
