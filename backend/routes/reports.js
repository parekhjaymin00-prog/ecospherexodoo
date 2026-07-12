import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getEnvironmentalReport, getSocialReport, getGovernanceReport, getOverallESGReport, globalSearch } from '../controllers/reportsController.js';

const router = Router();
router.get('/environmental', authMiddleware, getEnvironmentalReport);
router.get('/social', authMiddleware, getSocialReport);
router.get('/governance', authMiddleware, getGovernanceReport);
router.get('/overall', authMiddleware, getOverallESGReport);
router.get('/search', authMiddleware, globalSearch);

export default router;
