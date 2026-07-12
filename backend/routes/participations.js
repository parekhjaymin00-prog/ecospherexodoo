import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getParticipations,
  getMyParticipations,
  joinActivity,
  approveParticipation,
  uploadProof,
  deleteParticipation,
} from '../controllers/participationController.js';

const router = Router();

router.get('/', authMiddleware, getParticipations);
router.get('/my', authMiddleware, getMyParticipations);
router.post('/join', authMiddleware, joinActivity);
router.put('/:id/approve', authMiddleware, approveParticipation);
router.put('/:id/proof', authMiddleware, uploadProof);
router.delete('/:id', authMiddleware, deleteParticipation);

export default router;
