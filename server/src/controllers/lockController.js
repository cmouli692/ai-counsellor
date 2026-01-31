/**
 * Lock Controller
 * Handle university locking HTTP requests
 * 
 * Features:
 * - Lock one university (POST /api/lock/:universityId)
 * - Unlock with warning (POST /api/lock/unlock)
 * - Validate access to applications stage
 * - Enforce one lock per user
 */

import {
  lockUniversity,
  unlockUniversity,
  getLockedUniversity,
  isLocked,
  getLockStatus,
  validateLockedForApplications,
  universityExists
} from '../models/lockModel.js';
import { generateTasksForUniversity } from '../models/taskModel.js';

/**
 * POST /api/lock/:universityId
 * Lock a university for applications
 * 
 * Prerequisites:
 * - University must exist
 * - University must be in user's shortlist
 * - Only one university can be locked per user
 * 
 * Response:
 * - 200: Successfully locked
 * - 400: Invalid university ID
 * - 404: University not found or not in shortlist
 * - 409: University already locked
 * - 500: Server error
 */
export const lockUniversityHandler = async (req, res) => {
  try {
    const { universityId } = req.params;
    const userId = req.user.id;

    // Parse university ID as INTEGER (not UUID)
    const uniId = Number(universityId);
    if (!Number.isInteger(uniId) || uniId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid university ID',
        message: 'University ID must be a valid positive integer'
      });
    }

    // Check if university exists
    const exists = await universityExists(uniId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'University not found',
        message: `University with ID ${uniId} does not exist`
      });
    }

    // Lock the university
    const lockedEntry = await lockUniversity(userId, uniId);

    // Auto-generate default tasks for this university
    try {
      await generateTasksForUniversity(userId, uniId);
    } catch (taskError) {
      console.warn('Warning: Failed to auto-generate tasks:', taskError.message);
      // Don't fail the lock operation if task generation fails
    }

    return res.status(200).json({
      success: true,
      message: 'University locked successfully. Tasks auto-generated.',
      data: {
        id: lockedEntry.id,
        userId: lockedEntry.user_id,
        universityId: lockedEntry.university_id,
        lockedAt: lockedEntry.locked_at
      }
    });

  } catch (error) {
    console.error('Error locking university:', error);

    // University not in shortlist
    if (error.message === 'University not in shortlist') {
      return res.status(404).json({
        success: false,
        error: 'University not in shortlist',
        message: 'You must add the university to your shortlist before locking it'
      });
    }

    // University not found
    if (error.message === 'University not found') {
      return res.status(404).json({
        success: false,
        error: 'University not found',
        message: 'The specified university does not exist'
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to lock university. Please try again later.'
    });
  }
};

/**
 * POST /api/lock/unlock
 * Unlock the currently locked university
 * 
 * Warning: This action cannot be undone without re-locking
 * 
 * Response:
 * - 200: Successfully unlocked (with warning message)
 * - 404: No university is currently locked
 * - 500: Server error
 */
export const unlockUniversityHandler = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current lock before unlocking (for response data)
    const currentLock = await getLockedUniversity(userId);
    
    if (!currentLock) {
      return res.status(404).json({
        success: false,
        error: 'No locked university',
        message: 'You do not currently have a locked university'
      });
    }

    // Unlock the university
    const unlockResult = await unlockUniversity(userId);

    if (!unlockResult) {
      return res.status(404).json({
        success: false,
        error: 'No locked university',
        message: 'You do not currently have a locked university'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'University unlocked successfully',
      warning: unlockResult.warning,
      data: {
        previouslyLockedUniversity: {
          id: currentLock.university_id,
          name: currentLock.name,
          country: currentLock.country,
          city: currentLock.city
        },
        unlockedAt: unlockResult.unlockedAt,
        nextSteps: 'You can now lock a different university, or proceed without a lock'
      }
    });

  } catch (error) {
    console.error('Error unlocking university:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to unlock university. Please try again later.'
    });
  }
};

/**
 * GET /api/lock/status
 * Get current lock status for user
 * 
 * Response:
 * - 200: Status information returned
 * - 500: Server error
 */
export const getLockStatusHandler = async (req, res) => {
  try {
    const userId = req.user.id;

    const locked = await isLocked(userId);
    let lockedUniversity = null;

    if (locked) {
      lockedUniversity = await getLockedUniversity(userId);
    }

    return res.status(200).json({
      success: true,
      message: 'Lock status retrieved',
      data: {
        isLocked: locked,
        lockedUniversity: lockedUniversity ? {
          id: lockedUniversity.university_id,
          name: lockedUniversity.name,
          country: lockedUniversity.country,
          city: lockedUniversity.city,
          rank: lockedUniversity.rank,
          fees: lockedUniversity.fees,
          lockedAt: lockedUniversity.locked_at
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting lock status:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to retrieve lock status. Please try again later.'
    });
  }
};

/**
 * GET /api/lock/validate-applications
 * Check if user can proceed to applications stage
 * 
 * Requirements:
 * - User must have at least 1 locked university
 * 
 * Response:
 * - 200: Validation result returned
 * - 403: User cannot access applications (no lock)
 * - 500: Server error
 */
export const validateApplicationsAccessHandler = async (req, res) => {
  try {
    const userId = req.user.id;

    const validation = await validateLockedForApplications(userId);

    if (!validation.isValid) {
      return res.status(403).json({
        success: false,
        error: 'Applications locked',
        message: validation.message,
        data: {
          canAccessApplications: false,
          requiredLockedUniversities: 1,
          currentLockedUniversities: validation.lockedCount
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: validation.message,
      data: {
        canAccessApplications: true,
        lockedUniversities: validation.lockedCount
      }
    });

  } catch (error) {
    console.error('Error validating applications access:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to validate applications access. Please try again later.'
    });
  }
};
