import express from 'express';
import { getProfile, createOrUpdateProfile } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * GET /api/profile/me
 * Get current user's profile with completion status
 * Headers: Authorization: Bearer <token>
 * Returns: { profileCompleted, profile }
 * Protected route - requires valid JWT
 */
router.get('/me', authenticate, getProfile);

/**
 * POST /api/profile
 * Create or update user profile (onboarding)
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   name,
 *   grade,
 *   stream,
 *   interests,
 *   career_aspirations,
 *   budget_range,
 *   exam_readiness
 * }
 * Returns: { profileCompleted, profile }
 * Protected route - requires valid JWT
 */
router.post('/', authenticate, createOrUpdateProfile);

export default router;
