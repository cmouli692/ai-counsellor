/**
 * Lock Routes - University locking endpoints
 * 
 * Endpoints:
 * - POST   /api/lock/:universityId      - Lock a university
 * - POST   /api/lock/unlock              - Unlock the locked university
 * - GET    /api/lock/status              - Get current lock status
 * - GET    /api/lock/validate-applications - Check if can access applications
 */

import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  lockUniversityHandler,
  unlockUniversityHandler,
  getLockStatusHandler,
  validateApplicationsAccessHandler
} from '../controllers/lockController.js';

const router = express.Router();

/**
 * POST /api/lock/:universityId
 * Lock a university for applications
 * 
 * Requirements:
 * - Authentication required
 * - University must exist
 * - University must be in shortlist
 * - Only one per user
 * 
 * @param {number} universityId - University ID to lock
 * @returns {Object} Locked university data
 */
router.post('/:universityId', authenticate, lockUniversityHandler);

/**
 * POST /api/lock/unlock
 * Unlock the currently locked university with warning
 * 
 * Requirements:
 * - Authentication required
 * - Must have a locked university
 * 
 * Warning: Cannot be undone without re-locking
 * 
 * @returns {Object} Unlock confirmation with warning message
 */
router.post('/unlock', authenticate, unlockUniversityHandler);

/**
 * GET /api/lock/status
 * Get current lock status and locked university details
 * 
 * Requirements:
 * - Authentication required
 * 
 * @returns {Object} Lock status and details
 */
router.get('/status', authenticate, getLockStatusHandler);

/**
 * GET /api/lock/validate-applications
 * Validate if user can access applications stage
 * 
 * Requirements:
 * - Authentication required
 * - Must have at least 1 locked university
 * 
 * @returns {Object} Validation result with access status
 */
router.get('/validate-applications', authenticate, validateApplicationsAccessHandler);

export default router;
