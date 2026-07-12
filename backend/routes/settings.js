import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getSettings, updateSettings, getESGConfig, updateESGConfig, getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/settingsController.js';

const router = Router();
router.get('/', authMiddleware, getSettings);
router.put('/', authMiddleware, updateSettings);
router.get('/esg-config', authMiddleware, getESGConfig);
router.put('/esg-config', authMiddleware, updateESGConfig);
router.get('/categories', authMiddleware, getCategories);
router.post('/categories', authMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);

export default router;
