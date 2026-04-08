import { Router } from 'express';
import { body } from 'express-validator';
import { protect, teacherOrAdminOnly } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import {
  createSubmission,
  getCompletedCourses,
  getSubmissionsForTeacher,
  reviewSubmission,
} from '../controllers/submissionController.js';

const router = Router();

router.post(
  '/submissions',
  protect,
  [
    body('projectId').isInt({ min: 1 }).withMessage('projectId is required'),
    body('fileUrl').trim().notEmpty().withMessage('fileUrl is required'),
  ],
  validate,
  createSubmission,
);

router.get('/submissions', protect, teacherOrAdminOnly, getSubmissionsForTeacher);

router.put(
  '/submissions/:id/review',
  protect,
  teacherOrAdminOnly,
  [body('reviewComment').optional().isString().withMessage('reviewComment must be text')],
  validate,
  reviewSubmission,
);

router.get('/completed', protect, getCompletedCourses);

export default router;
