import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';

const router = express.Router();

const authService = new AuthService();
const authController = new AuthController(authService);

// Register User
router.post('/signup', authController.signup);

// Login User
router.post('/login', authController.login);

export default router;
