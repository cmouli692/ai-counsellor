// import pool from '../db.js';
import db from '../config/database.js';



// ============================================
// USER QUERIES
// ============================================

/**
 * Create a new user
 * @param {Object} user - { email, password_hash }
 * @returns {Object} Created user with id
 */
export const createUser = async (email, passwordHash) => {
  const query = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at, updated_at;
  `;

  try {
    const result = await db.query(query, [email, passwordHash]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Email already registered');
    }
    throw error;
  }
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Object|null} User object or null
 */
export const findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password_hash, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {string} userId - User UUID
 * @returns {Object|null} User object or null
 */
export const findUserById = async (userId) => {
  const query = `
    SELECT id, email, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
};

/**
 * Get user with profile
 * @param {string} userId - User UUID
 * @returns {Object|null} User with profile or null
 */
export const getUserWithProfile = async (userId) => {
  const query = `
    SELECT
      u.id,
      u.email,
      u.created_at AS user_created_at,
      o.id AS onboarding_id,
      o.completed,
      o.personal_info,
      o.academic_background,
      o.preferences,
      o.created_at AS onboarding_created_at
    FROM users u
    LEFT JOIN onboarding o ON u.id = o.user_id
    WHERE u.id = $1
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
};


/**
 * Check if user exists by email
 * @param {string} email - User email
 * @returns {boolean} True if exists
 */
export const userExists = async (email) => {
  const query = `
    SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists;
  `;

  const result = await db.query(query, [email]);
  return result.rows[0].exists;
};

/**
 * Update user password
 * @param {string} userId - User UUID
 * @param {string} newPasswordHash - New password hash
 * @returns {Object} Updated user
 */
export const updateUserPassword = async (userId, newPasswordHash) => {
  const query = `
    UPDATE users
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, email, updated_at;
  `;

  const result = await db.query(query, [newPasswordHash, userId]);
  return result.rows[0] || null;
};

// ============================================
// PROFILE QUERIES
// ============================================

/**
 * Get user profile
 * @param {string} userId - User UUID
 * @returns {Object|null} Profile or null
 */
export const getUserProfile = async (userId) => {
  const query = `
    SELECT *
    FROM onboarding
    WHERE user_id = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
};


/**
 * Check if profile exists
 * @param {string} userId - User UUID
 * @returns {boolean} True if profile exists
 */
// export const profileExists = async (userId) => {
//   const query = `
//     SELECT EXISTS(SELECT 1 FROM profile WHERE user_id = $1) as exists;
//   `;
export const profileExists = async (userId) => {
  const query = `
    SELECT EXISTS(SELECT 1 FROM onboarding WHERE user_id = $1) as exists;
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0].exists;
};

/**
 * Create user profile (onboarding)
 * @param {string} userId - User UUID
 * @param {Object} profileData - { name, grade, stream, interests, career_aspirations, budget_range, exam_readiness }
 * @returns {Object} Created profile
 */
// export const createProfile = async (userId, profileData) => {
//   const {
//     name,
//     grade,
//     stream,
//     interests,
//     career_aspirations,
//     budget_range,
//     exam_readiness
//   } = profileData;

//   // const query = `
//   //   INSERT INTO profile (
//   //     user_id,
//   //     name,
//   //     grade,
//   //     stream,
//   //     interests,
//   //     career_aspirations,
//   //     budget_range,
//   //     exam_readiness,
//   //     profile_completed
//   //   )
//   //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
//   //   RETURNING *;
//   // `;

//    const query = `
//     INSERT INTO onboarding (
//       user_id,
//       name,
//       grade,
//       stream,
//       interests,
//       career_aspirations,
//       budget_range,
//       exam_readiness,
//       profile_completed
//     )
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
//     RETURNING *;
//   `;

//   try {
//     const result = await db.query(query, [
//       userId,
//       name,
//       grade,
//       stream,
//       interests,
//       career_aspirations,
//       budget_range,
//       exam_readiness
//     ]);
//     return result.rows[0];
//   } catch (error) {
//     if (error.code === '23505') {
//       // Unique constraint violation (already has profile)
//       throw new Error('Profile already exists for this user');
//     }
//     throw error;
//   }
// };

export const createProfile = async (userId, profileData) => {
  const query = `
    INSERT INTO onboarding (
      user_id,
      personal_info,
      academic_background,
      preferences,
      completed
    )
    VALUES ($1, $2, $3, $4, true)
    ON CONFLICT (user_id)
    DO UPDATE SET
      personal_info = EXCLUDED.personal_info,
      academic_background = EXCLUDED.academic_background,
      preferences = EXCLUDED.preferences,
      completed = true,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [
    userId,
    {
      name: profileData.name,
      career_aspirations: profileData.career_aspirations,
    },
    {
      grade: profileData.grade,
      stream: profileData.stream,
    },
    {
      interests: profileData.interests,
      budget_range: profileData.budget_range,
      exam_readiness: profileData.exam_readiness,
    }
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};




/**
 * Update user profile
 * @param {string} userId - User UUID
 * @param {Object} profileData - Partial or complete profile data
 * @returns {Object} Updated profile
 */
export const updateProfile = async (userId, profileData) => {
  const query = `
    UPDATE onboarding
    SET
      personal_info = $2,
      academic_background = $3,
      preferences = $4,
      completed = true,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *;
  `;

  const values = [
    userId,
    {
      name: profileData.name,
      career_aspirations: profileData.career_aspirations
    },
    {
      grade: profileData.grade,
      stream: profileData.stream
    },
    {
      interests: profileData.interests,
      budget_range: profileData.budget_range,
      exam_readiness: profileData.exam_readiness
    }
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};


/**
 * Get profile completion status
 * @param {string} userId - User UUID
 * @returns {Object} { isCompleted, profile }
 */
// export const getProfileCompletionStatus = async (userId) => {
//   const profile = await getUserProfile(userId);
  
//   if (!profile) {
//     return {
//       profileCompleted: false,
//       profile: null
//     };
//   }

//   const isCompleted = !!(
//     profile.name &&
//     profile.grade &&
//     profile.stream &&
//     profile.interests &&
//     profile.career_aspirations &&
//     profile.budget_range &&
//     profile.exam_readiness
//   );

//   return {
//     profileCompleted: isCompleted || profile.profile_completed,
//     profile
//   };
// };

// ============================================
// TEST CONNECTION
// ============================================

export const getProfileCompletionStatus = async (userId) => {
  const profile = await getUserProfile(userId);

  return {
    profileCompleted: profile?.completed || false,
    profile
  };
};



/**
 * UPSERT onboarding record
 * If exists by user_id → UPDATE
 * If not exists → INSERT
 * @param {string} userId - User UUID
 * @param {Object} data - { personal_info, academic_background, preferences }
 * @returns {Object} Upserted onboarding record
 */
export const upsertOnboarding = async (userId, data) => {
  const query = `
    INSERT INTO onboarding (
      user_id,
      personal_info,
      academic_background,
      preferences,
      completed
    )
    VALUES ($1, $2, $3, $4, true)
    ON CONFLICT (user_id)
    DO UPDATE SET
      personal_info = EXCLUDED.personal_info,
      academic_background = EXCLUDED.academic_background,
      preferences = EXCLUDED.preferences,
      completed = true,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [
    userId,
    JSON.stringify(data.personal_info || {}),
    JSON.stringify(data.academic_background || {}),
    JSON.stringify(data.preferences || {})
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * Test database connection
 * @returns {boolean} True if connection successful
 */
export const testConnection = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

export default {
  createUser,
  findUserByEmail,
  findUserById,
  getUserWithProfile,
  userExists,
  updateUserPassword,
  getUserProfile,
  profileExists,
  upsertOnboarding,
  testConnection
};
