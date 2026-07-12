import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getDepartments,
  getDepartmentStats,
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';

const router = Router();

router.get('/', authMiddleware, getDepartments);
router.get('/stats', authMiddleware, getDepartmentStats);
router.get('/all', authMiddleware, getAllDepartments);
router.get('/:id', authMiddleware, getDepartmentById);
router.post('/', authMiddleware, createDepartment);
router.put('/:id', authMiddleware, updateDepartment);
router.delete('/:id', authMiddleware, deleteDepartment);

export default router;
