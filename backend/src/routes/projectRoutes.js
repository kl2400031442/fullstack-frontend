import { Router } from 'express';
import { body } from 'express-validator';
import { createProject, getProjects } from '../controllers/projectController.js';
import { protect, teacherOrAdminOnly } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

router.get('/', protect, getProjects);

router.post(
  '/',
  protect,
  teacherOrAdminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('status').optional().isIn(['active', 'pending', 'reviewed', 'completed']).withMessage('Invalid status'),
    body('maxTeamSize').optional().isInt({ min: 1, max: 10 }).withMessage('maxTeamSize must be between 1 and 10'),
    body('assignedStudentIds').optional().isArray().withMessage('assignedStudentIds must be an array'),
  ],
  validate,
  createProject,
);

export default router;
