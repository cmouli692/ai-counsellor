import {
  getUserProfile,
  upsertOnboarding
} from '../models/userModel.js';

/**
 * GET /api/profile/me
 * Get current user's profile/onboarding data
 * Protected: requires JWT
 */
export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found in token'
      });
    }

    const profile = await getUserProfile(req.user.id);

    return res.status(200).json({
      profileCompleted: profile?.completed || false,
      profile: profile || null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * POST /api/profile
 * Create or update user onboarding/profile (UPSERT)
 * Protected: requires JWT
 * Body: {
 *   personal_info: { name, career_aspirations, ... },
 *   academic_background: { grade, stream, ... },
 *   preferences: { interests, budget_range, exam_readiness, ... }
 * }
 */
export const createOrUpdateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found in token'
      });
    }

    const { personal_info, academic_background, preferences } = req.body;

    if (!personal_info || !academic_background || !preferences) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'personal_info, academic_background, and preferences are required'
      });
    }

    const profile = await upsertOnboarding(req.user.id, {
      personal_info,
      academic_background,
      preferences
    });

    return res.status(201).json({
      profileCompleted: true,
      profile
    });

  } catch (error) {
    console.error('Create/update profile error:', error);

    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create/update profile'
    });
  }
};


export default {
  getProfile,
  createOrUpdateProfile
};
