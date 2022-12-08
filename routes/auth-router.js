import express from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/auth-controller.js';

const router = express.Router();

router.post(
  '/register',
  body('email').isEmail().withMessage('Не корректная почта'),
  body('password').isLength({ min: 6, max: 32 }).withMessage('Пароль менее 6 символов'),
  AuthController.register,
);
router.post('/login', AuthController.login);
router.post('/login/access-token', AuthController.getAccessToken);
router.get('/logout', AuthController.logout);

export default router;
