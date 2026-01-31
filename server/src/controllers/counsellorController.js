/**
 * Counsellor Controller
 * Handle AI counsellor requests
 */

import {
  getUserCompleteData,
  executeCounsellorAction,
  getUpdatedUserData,
} from '../models/counsellorModel.js';
import {
  callGemini,
  ruleBasedCounsellor,
  generateCounsellorPrompt,
  parseAIResponse,
} from '../utils/aiService.js';

/**
 * POST /api/ai/counsellor
 * AI counselling endpoint
 *
 * Body:
 * - message (required): User's question or request
 *
 * Response:
 * - 200: Counsellor response with recommendations and actions
 * - 400: Invalid input
 * - 500: Server error
 */
export const counsellorHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Message is required and must be a non-empty string',
      });
    }

    // Get user's complete data
    let userData;
    try {
      userData = await getUserCompleteData(userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user data',
        message: error.message,
      });
    }

    if (!userData.profile) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    // Prepare data for AI
    const aiData = {
      targetCountries: userData.profile.target_countries || [],
      preferredFields: userData.profile.preferred_fields || [],
      preferredIntakeSession: userData.profile.preferred_intake_session || '',
      stage: userData.stage?.stage_number || 0,
      shortlistCount: userData.shortlist.length,
      lockedUniversityName: userData.lockedUniversity?.name || null,
      completedTasksCount: userData.tasks.filter((t) => t.status === 'done').length,
      pendingTasksCount: userData.tasks.filter((t) => t.status === 'pending').length,
      totalTasks: userData.tasks.length,
    };

    let counsellorResponse = null;
    let usedGemini = false;

    // Try Gemini first
    try {
      const prompt = generateCounsellorPrompt(userData.profile, aiData, message);
      const geminiResponse = await callGemini(prompt);

      if (geminiResponse) {
        usedGemini = true;
        counsellorResponse = parseAIResponse(geminiResponse);

        // If parsing failed, try to use raw response as message
        if (!counsellorResponse) {
          counsellorResponse = {
            message: geminiResponse,
            recommended: { dream: [], target: [], safe: [] },
            actions: [],
          };
        }
      }
    } catch (error) {
      console.warn('Gemini integration error:', error.message);
      // Fall through to rule-based
    }

    // Fallback to rule-based AI if Gemini didn't work
    if (!counsellorResponse) {
      counsellorResponse = ruleBasedCounsellor(
  userData.profile,
  aiData,
  message
);

    }

    // Execute actions from counsellor response
    const executedActions = [];
    if (counsellorResponse.actions && Array.isArray(counsellorResponse.actions)) {
      for (const action of counsellorResponse.actions) {
        // Skip COUNSELLOR_MESSAGE actions (informational only)
        if (action.type === 'COUNSELLOR_MESSAGE') {
          continue;
        }

        try {
          const result = await executeCounsellorAction(userId, action);
          executedActions.push({
            ...action,
            executed: result.success,
            result: result,
          });
        } catch (error) {
          console.error('Error executing action:', error);
          executedActions.push({
            ...action,
            executed: false,
            error: error.message,
          });
        }
      }
    }

    // Get updated user data after actions
    let updatedData;
    try {
      updatedData = await getUpdatedUserData(userId);
    } catch (error) {
      console.error('Error fetching updated data:', error);
      updatedData = null;
    }

    // Return response
    return res.status(200).json({
      success: true,
      message: 'Counsellor response generated',
      data: {
        counsellor: {
          message: counsellorResponse.message,
          recommended: counsellorResponse.recommended,
          actions: executedActions,
          usedGemini,
        },
        user: {
          stage: updatedData?.stage,
          shortlist: updatedData?.shortlist || [],
          lockedUniversity: updatedData?.lockedUniversity,
          tasks: updatedData?.tasks || [],
          stats: updatedData?.stats || {},
        },
      },
    });
  } catch (error) {
    console.error('Counsellor error:', error);
    return res.status(500).json({
      success: false,
      error: 'Counsellor error',
      message: error.message,
    });
  }
};

/**
 * GET /api/ai/counsellor/context
 * Get counsellor context (user data without AI interaction)
 *
 * Response:
 * - 200: User context data
 * - 500: Server error
 */
export const getCounsellorContextHandler = async (req, res) => {
  try {
    const userId = req.user.id;

    const userData = await getUserCompleteData(userId);

    if (!userData.profile) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const context = {
      profile: {
        name: `${userData.profile.first_name} ${userData.profile.last_name}`,
        targetCountries: userData.profile.target_countries || [],
        preferredFields: userData.profile.preferred_fields || [],
        preferredIntakeSession: userData.profile.preferred_intake_session,
      },
      stage: userData.stage?.stage_number || 0,
      shortlist: userData.shortlist,
      lockedUniversity: userData.lockedUniversity,
      tasks: userData.tasks,
      stats: {
        shortlistCount: userData.shortlist.length,
        completedTasks: userData.tasks.filter((t) => t.status === 'done').length,
        pendingTasks: userData.tasks.filter((t) => t.status === 'pending').length,
        totalTasks: userData.tasks.length,
      },
    };

    return res.status(200).json({
      success: true,
      message: 'Counsellor context retrieved',
      data: context,
    });
  } catch (error) {
    console.error('Error getting counsellor context:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get context',
      message: error.message,
    });
  }
};
