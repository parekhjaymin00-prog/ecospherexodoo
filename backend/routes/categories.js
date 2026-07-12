import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getCategories, createCategory } from '../controllers/categoryController.js';

const router = Router();

router.get('/', authMiddleware, getCategories);
router.post('/', authMiddleware, createCategory);

export default router;
