/**
 * AI Counsellor Routes
 * Endpoints for AI-powered university counselling
 */

import express from 'express';
import {authenticate} from '../middleware/authenticate.js';
import {
  counsellorHandler,
  getCounsellorContextHandler,
} from '../controllers/counsellorController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/ai/counsellor
 * Get AI counselling with recommendations and actions
 * Body: { message: string }
 * Returns: { message, recommended, actions, updated user data }
 */
router.post('/', counsellorHandler);

/**
 * GET /api/ai/counsellor/context
 * Get user's counsellor context (profile, stage, shortlist, tasks)
 */
// router.get('/context', getCounsellorContextHandler);

export default router;
