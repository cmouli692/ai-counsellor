/**
 * Stage Controller - Handles stage-related requests
 */

import { calculateStage, getAllStages } from "../utils/stageEngine.js";
// import db from '../db.js';
import db from "../config/database.js";

/**
 * GET /api/stage
 * Get current user's stage with detailed information
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Stage information
 */
export async function getStage(req, res) {
  try {
    const userId = req.user.id;

    // Fetch profile completion status
    // const profileQuery = `
    //   SELECT profile_completed
    //   FROM profile
    //   WHERE user_id = $1
    // `;
    // const profileResult = await db.getOne(profileQuery, [userId]);
    // const profileCompleted = profileResult?.profile_completed || false;

    const profileQuery = `
  SELECT completed
  FROM onboarding 
  WHERE user_id = $1
`;
    const profileResult = await db.getOne(profileQuery, [userId]);
    const profileCompleted = profileResult?.completed || false;

    // Count shortlisted universities
    const shortlistQuery = `
      SELECT COUNT(*) as count 
      FROM shortlist 
      WHERE user_id = $1
    `;
    const shortlistResult = await db.getOne(shortlistQuery, [userId]);
    const shortlistCount = parseInt(shortlistResult?.count || 0);

    // Count locked universities
    const lockedQuery = `
      SELECT COUNT(*) as count 
      FROM locked_university 
      WHERE user_id = $1
    `;
    const lockedResult = await db.getOne(lockedQuery, [userId]);
    const lockedCount = parseInt(lockedResult?.count || 0);

    // Calculate stage
    const stageData = {
      profileCompleted,
      shortlistCount,
      lockedCount,
    };

    const stage = calculateStage(stageData);

    // Enhance response with metadata
    const response = {
      message: "Stage retrieved successfully",
      stage: {
        ...stage,
        data: {
          profileCompleted,
          shortlistCount,
          lockedCount,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching stage:", error);
    res.status(500).json({
      error: "Server Error",
      message: "Failed to retrieve stage information",
    });
  }
}

/**
 * GET /api/stage/all
 * Get all stage definitions (no auth required for documentation)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} All stage definitions
 */
export function getAllStagesDefinition(req, res) {
  try {
    const stages = getAllStages();

    res.status(200).json({
      message: "All stages retrieved successfully",
      stages,
      total: stages.length,
    });
  } catch (error) {
    console.error("Error fetching all stages:", error);
    res.status(500).json({
      error: "Server Error",
      message: "Failed to retrieve stage definitions",
    });
  }
}

/**
 * GET /api/stage/progress
 * Get user's progress through the stages with completion percentage
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Progress information
 */
export async function getProgress(req, res) {
  try {
    const userId = req.user.id;

    // Fetch all required data
   const profileQuery = `
  SELECT completed, created_at
  FROM onboarding
  WHERE user_id = $1
`;
const profileData = await db.getOne(profileQuery, [userId]);


    const shortlistQuery = `
      SELECT COUNT(*) as count FROM shortlist WHERE user_id = $1
    `;
    const shortlistData = await db.getOne(shortlistQuery, [userId]);

    const lockedQuery = `
      SELECT 
        u.id, u.name, u.location, u.city, 
        lu.created_at as locked_at
      FROM locked_university lu
      JOIN universities u ON lu.university_id = u.id
      WHERE lu.user_id = $1
      LIMIT 1
    `;
    const lockedData = await db.getOne(lockedQuery, [userId]);

    const stageData = {
      profileCompleted: profileData?.completed || false,
      shortlistCount: parseInt(shortlistData?.count || 0),
      lockedCount: lockedData ? 1 : 0,
    };

    const currentStage = calculateStage(stageData);

    // Calculate progress percentage
    const progressPercentage = Math.round((currentStage.stageNumber / 4) * 100);

    res.status(200).json({
      message: "Progress retrieved successfully",
      progress: {
        currentStage: currentStage.stageNumber,
        stageLabel: currentStage.stageLabel,
        progressPercentage,
        completionStatus: {
          onboardingComplete: stageData.profileCompleted,
          shortlistCreated: stageData.shortlistCount > 0,
          universityLocked: stageData.lockedCount > 0,
        },
        details: {
          profile: profileData
            ? {
                name: profileData.name,
                grade: profileData.grade,
                stream: profileData.stream,
                completedAt: profileData.created_at,
              }
            : null,
          shortlist: {
            count: stageData.shortlistCount,
          },
          lockedUniversity: lockedData
            ? {
                id: lockedData.id,
                name: lockedData.name,
                location: lockedData.location,
                city: lockedData.city,
                lockedAt: lockedData.locked_at,
              }
            : null,
        },
        nextStep: currentStage.nextStep,
        isComplete: currentStage.isComplete,
      },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({
      error: "Server Error",
      message: "Failed to retrieve progress information",
    });
  }
}

/**
 * GET /api/stage/gates
 * Get available features based on current stage
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Feature gates
 */
export async function getFeatureGates(req, res) {
  try {
    const userId = req.user.id;

    // Fetch stage data
    const profileQuery = `
  SELECT completed
  FROM onboarding
  WHERE user_id = $1
`;
const profileResult = await db.getOne(profileQuery, [userId]);

  

    const shortlistQuery = `SELECT COUNT(*) as count FROM shortlist WHERE user_id = $1`;
    const shortlistResult = await db.getOne(shortlistQuery, [userId]);

    const lockedQuery = `SELECT COUNT(*) as count FROM locked_university WHERE user_id = $1`;
    const lockedResult = await db.getOne(lockedQuery, [userId]);

    const stageData = {
     profileCompleted: profileResult?.completed || false,

      shortlistCount: parseInt(shortlistResult?.count || 0),
      lockedCount: parseInt(lockedResult?.count || 0),
    };

    const stage = calculateStage(stageData);

    res.status(200).json({
      message: "Feature gates retrieved successfully",
      stageNumber: stage.stageNumber,
      stageLabel: stage.stageLabel,
      features: {
        onboarding: {
          available: stage.gateFeatures.onboarding,
          description: "Complete your profile with academic details and goals",
        },
        counsellor: {
          available: stage.gateFeatures.counsellor,
          description: "Get AI-powered counselling and recommendations",
        },
        universities: {
          available: stage.gateFeatures.universities,
          description: "Search and explore universities",
        },
        shortlist: {
          available: stage.gateFeatures.shortlist,
          description: "Save universities to your shortlist",
        },
        lockedUniversity: {
          available: stage.gateFeatures.lockedUniversity,
          description: "Lock in your final university choice",
        },
        applications: {
          available: stage.gateFeatures.applications,
          description: "Submit applications to your locked university",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching feature gates:", error);
    res.status(500).json({
      error: "Server Error",
      message: "Failed to retrieve feature gates",
    });
  }
}

export default {
  getStage,
  getAllStagesDefinition,
  getProgress,
  getFeatureGates,
};
