/**
 * Shortlist Routes
 * User shortlist management endpoints
 */

import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  addUniversityToShortlist,
  removeUniversityFromShortlist,
  getMyShortlist
} from '../controllers/shortlistController.js';

const router = express.Router();

/**
 * POST /api/shortlist/:universityId
 * Add university to shortlist
 * Requires: Authentication
 */
router.post('/:universityId', authenticate, addUniversityToShortlist);

/**
 * DELETE /api/shortlist/:universityId
 * Remove university from shortlist
 * Requires: Authentication
 */
router.delete('/:universityId', authenticate, removeUniversityFromShortlist);

/**
 * GET /api/shortlist/mine
 * Get user's shortlist + locked university
 * Requires: Authentication
 */
router.get('/mine', authenticate, getMyShortlist);

export default router;
