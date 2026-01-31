/**
 * Stage Routes - User journey stage endpoints
 */

import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getStage,
  getAllStagesDefinition,
  getProgress,
  getFeatureGates
} from '../controllers/stageController.js';

const router = express.Router();

/**
 * GET /api/stage
 * Get current user's stage
 * Protected: Yes (requires JWT)
 */
router.get('/', authenticate, getStage);

/**
 * GET /api/stage/all
 * Get all stage definitions
 * Protected: No (public documentation)
 */
router.get('/all', getAllStagesDefinition);

/**
 * GET /api/stage/progress
 * Get user's detailed progress
 * Protected: Yes (requires JWT)
 */
router.get('/progress', authenticate, getProgress);

/**
 * GET /api/stage/gates
 * Get available features based on stage
 * Protected: Yes (requires JWT)
 */
router.get('/gates', authenticate, getFeatureGates);

export default router;
