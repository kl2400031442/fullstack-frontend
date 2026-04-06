import { Router } from 'express';
import { body } from 'express-validator';
import { login, signup, verifyMfa } from '../controllers/authController.js';
import validate from '../middleware/validate.js';

const router = Router();

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher'),
  ],
  validate,
  signup,
);

router.post(
  '/login',
  [
    body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher'),
    body('password').notEmpty().withMessage('Password is required'),
    body().custom((value) => {
      if (value.role === 'student' && !value.name && !value.studentId) {
        throw new Error('Provide name or studentId for student login');
      }
      if (value.role === 'teacher' && !value.teacherCode) {
        throw new Error('Provide teacherCode for teacher login');
      }
      return true;
    }),
  ],
  validate,
  login,
);

router.post(
  '/verify-mfa',
  [
    body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
    body('mfaToken').notEmpty().withMessage('MFA token is required'),
  ],
  validate,
  verifyMfa,
);

export default router;
