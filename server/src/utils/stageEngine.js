/**
 * Stage Engine - Determines user's current stage in the counselling journey
 * 
 * Stages:
 * 1: Onboarding incomplete
 * 2: Onboarding complete, shortlist empty
 * 3: Shortlist has items, no locked choice
 * 4: Locked university choice selected
 */

/**
 * Calculate user's current stage
 * @param {Object} stageData - Data object containing profile and shortlist info
 * @param {boolean} stageData.profileCompleted - Is profile complete?
 * @param {number} stageData.shortlistCount - Number of items in shortlist
 * @param {number} stageData.lockedCount - Number of locked universities
 * @returns {Object} Stage information
 */
export function calculateStage(stageData) {
  const { profileCompleted, shortlistCount = 0, lockedCount = 0 } = stageData;

  // Stage 4: Locked university selected
  if (lockedCount > 0) {
    return {
      stageNumber: 4,
      stageLabel: 'University Locked',
      description: 'You have locked in your university choice',
      nextStep: 'View your locked university and complete applications',
      isComplete: true,
      gateFeatures: {
        onboarding: true,
        counsellor: true,
        universities: true,
        shortlist: true,
        lockedUniversity: true,
        applications: true
      }
    };
  }

  // Stage 3: Shortlist has items
  if (shortlistCount > 0) {
    return {
      stageNumber: 3,
      stageLabel: 'Shortlist Created',
      description: 'You have added universities to your shortlist',
      nextStep: 'Compare universities and lock your final choice',
      isComplete: false,
      gateFeatures: {
        onboarding: true,
        counsellor: true,
        universities: true,
        shortlist: true,
        lockedUniversity: false,
        applications: false
      }
    };
  }

  // Stage 2: Onboarding complete, empty shortlist
  if (profileCompleted) {
    return {
      stageNumber: 2,
      stageLabel: 'Onboarding Complete',
      description: 'Your profile is complete and ready for university discovery',
      nextStep: 'Explore universities and build your shortlist',
      isComplete: false,
      gateFeatures: {
        onboarding: true,
        counsellor: true,
        universities: true,
        shortlist: false,
        lockedUniversity: false,
        applications: false
      }
    };
  }

  // Stage 1: Onboarding incomplete (default)
  return {
    stageNumber: 1,
    stageLabel: 'Onboarding',
    description: 'Complete your profile to get started',
    nextStep: 'Fill out your academic background, interests, and goals',
    isComplete: false,
    gateFeatures: {
      onboarding: false,
      counsellor: false,
      universities: false,
      shortlist: false,
      lockedUniversity: false,
      applications: false
    }
  };
}

/**
 * Check if a specific feature is available for a stage
 * @param {number} stageNumber - Current stage number
 * @param {string} feature - Feature name
 * @returns {boolean} Is feature available?
 */
export function isFeatureAvailable(stageNumber, feature) {
  const stageData = { profileCompleted: false, shortlistCount: 0, lockedCount: 0 };
  
  if (stageNumber >= 2) stageData.profileCompleted = true;
  if (stageNumber >= 3) stageData.shortlistCount = 1;
  if (stageNumber >= 4) stageData.lockedCount = 1;

  const stage = calculateStage(stageData);
  return stage.gateFeatures[feature] || false;
}

/**
 * Get all stages with their requirements
 * @returns {Array} Array of stage definitions
 */
export function getAllStages() {
  return [
    {
      stageNumber: 1,
      stageLabel: 'Onboarding',
      description: 'Complete your profile to get started',
      requirements: [],
      nextStep: 'Fill out your academic background, interests, and goals'
    },
    {
      stageNumber: 2,
      stageLabel: 'Onboarding Complete',
      description: 'Your profile is complete and ready for university discovery',
      requirements: ['profileCompleted = true'],
      nextStep: 'Explore universities and build your shortlist'
    },
    {
      stageNumber: 3,
      stageLabel: 'Shortlist Created',
      description: 'You have added universities to your shortlist',
      requirements: ['profileCompleted = true', 'shortlist.count >= 1'],
      nextStep: 'Compare universities and lock your final choice'
    },
    {
      stageNumber: 4,
      stageLabel: 'University Locked',
      description: 'You have locked in your university choice',
      requirements: ['profileCompleted = true', 'locked_university.count >= 1'],
      nextStep: 'View your locked university and complete applications'
    }
  ];
}

/**
 * Validate stage data integrity
 * @param {Object} stageData - Stage data to validate
 * @returns {Object} Validation result
 */
export function validateStageData(stageData) {
  const errors = [];

  if (typeof stageData.profileCompleted !== 'boolean') {
    errors.push('profileCompleted must be boolean');
  }

  if (!Number.isInteger(stageData.shortlistCount) || stageData.shortlistCount < 0) {
    errors.push('shortlistCount must be non-negative integer');
  }

  if (!Number.isInteger(stageData.lockedCount) || stageData.lockedCount < 0) {
    errors.push('lockedCount must be non-negative integer');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
