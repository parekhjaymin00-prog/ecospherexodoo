import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getCarbonTransactions,
  getCarbonStats,
  getCarbonTrend,
  getCarbonByScope,
  createCarbonTransaction,
  updateCarbonTransaction,
  deleteCarbonTransaction,
} from '../controllers/carbonTransactionController.js';

const router = Router();

router.get('/', authMiddleware, getCarbonTransactions);
router.get('/stats', authMiddleware, getCarbonStats);
router.get('/trend', authMiddleware, getCarbonTrend);
router.get('/by-scope', authMiddleware, getCarbonByScope);
router.post('/', authMiddleware, createCarbonTransaction);
router.put('/:id', authMiddleware, updateCarbonTransaction);
router.delete('/:id', authMiddleware, deleteCarbonTransaction);

export default router;
