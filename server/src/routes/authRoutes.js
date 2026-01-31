import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 * Body: { name, email, password }
 * Returns: { token, user }
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Headers: Authorization: Bearer <token>
 * Returns: { user }
 * Protected route - requires valid JWT
 */
router.get('/me', authenticate, getMe);

export default router;
