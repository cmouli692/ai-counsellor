/**
 * Lock Model
 * Database operations for university locking system
 *
 * Features:
 * - Users can lock one university
 * - Locked university must exist in shortlist
 * - UNIQUE constraint prevents multiple locks
 * - Warning system for unlock operations
 */

// import pool from '../db.js';
import db from "../config/database.js";

/**
 * Lock a university for a user
 * Prerequisites: University must be in user's shortlist
 * One locked university per user (enforced by UNIQUE constraint)
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @returns {Object} Locked university entry
 */
export const lockUniversity = async (userId, universityId) => {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // Check if university exists
    const uniCheck = `
      SELECT id FROM universities WHERE id = $1
    `;
    const uniResult = await client.query(uniCheck, [universityId]);
    if (uniResult.rows.length === 0) {
      throw new Error("University not found");
    }

    // Check if university is in shortlist
    const shortlistCheck = `
      SELECT id FROM shortlist 
      WHERE user_id = $1 AND university_id = $2
    `;
    const shortlistResult = await client.query(shortlistCheck, [
      userId,
      universityId,
    ]);
    if (shortlistResult.rows.length === 0) {
      throw new Error("University not in shortlist");
    }

    // Delete previous lock if exists
    const deleteOldLock = `
      DELETE FROM locked_university 
      WHERE user_id = $1
    `;
    await client.query(deleteOldLock, [userId]);

    // Lock new university
    const lockQuery = `
      INSERT INTO locked_university (user_id, university_id)
      VALUES ($1, $2)
      RETURNING id, user_id, university_id, locked_at;
    `;

    const result = await client.query(lockQuery, [userId, universityId]);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");

    // Foreign key constraint - invalid university ID
    if (error.code === "23503") {
      throw new Error("University not found");
    }
    // Unique constraint violation - already locked
    if (error.code === "23505") {
      throw new Error("University already locked");
    }

    throw error;
  } finally {
    client.release();
  }
};

/**
 * Unlock user's locked university
 * Returns warning message about consequences
 * @param {string} userId - User UUID
 * @returns {Object} Unlock information with warning
 */
export const unlockUniversity = async (userId) => {
  const query = `
    DELETE FROM locked_university
    WHERE user_id = $1
    RETURNING id, user_id, university_id, locked_at;
  `;

  try {
    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return null; // No lock found
    }

    const unlockedData = result.rows[0];

    // Return warning message with the unlocked data
    return {
      unlocked: true,
      previouslyLockedUniversityId: unlockedData.university_id,
      unlockedAt: new Date().toISOString(),
      warning:
        "Unlocking your university selection. You can now lock a different university. Note: Any pending applications may be affected.",
      data: unlockedData,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's currently locked university with full details
 * @param {string} userId - User UUID
 * @returns {Object} Locked university with details or null
 */
export const getLockedUniversity = async (userId) => {
  const query = `
    SELECT 
      lu.id,
      lu.user_id,
      lu.university_id,
      lu.locked_at,
      u.name,
      u.country,
      u.city,
      u.ranking,
      u.description,
      u.website,
    FROM locked_university lu
    JOIN universities u ON lu.university_id = u.id
    WHERE lu.user_id = $1
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if user has a locked university
 * @param {string} userId - User UUID
 * @returns {boolean} True if locked, false otherwise
 */
export const isLocked = async (userId) => {
  const query = `
    SELECT id FROM locked_university 
    WHERE user_id = $1
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Get lock status for a university and user
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @returns {Object} Lock status information
 */
export const getLockStatus = async (userId, universityId) => {
  const query = `
    SELECT 
      lu.id,
      lu.user_id,
      lu.university_id,
      lu.locked_at,
      (lu.university_id = $2) as is_this_locked,
      EXISTS(SELECT 1 FROM shortlist WHERE user_id = $1 AND university_id = $2) as in_shortlist
    FROM locked_university lu
    WHERE lu.user_id = $1
  `;

  try {
    const result = await db.query(query, [userId, universityId]);

    if (result.rows.length === 0) {
      return {
        hasLock: false,
        isThisUniversityLocked: false,
        inShortlist: false,
      };
    }

    const row = result.rows[0];
    return {
      hasLock: true,
      lockedUniversityId: row.university_id,
      isThisUniversityLocked: row.is_this_locked,
      lockedAt: row.locked_at,
      inShortlist: row.in_shortlist,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Validate if user can proceed to applications
 * Requirement: User must have at least 1 locked university
 * @param {string} userId - User UUID
 * @returns {Object} Validation result with message
 */
export const validateLockedForApplications = async (userId) => {
  const query = `
    SELECT COUNT(*) as count FROM locked_university WHERE user_id = $1
  `;

  try {
    const result = await db.query(query, [userId]);
    const lockedCount = parseInt(result.rows[0].count);

    return {
      isValid: lockedCount >= 1,
      lockedCount: lockedCount,
      message:
        lockedCount >= 1
          ? "User has locked a university. Applications stage is available."
          : "User must lock a university before accessing applications.",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * University exists validation helper
 * @param {number} universityId - University ID
 * @returns {boolean} True if university exists
 */
export const universityExists = async (universityId) => {
  const query = `SELECT id FROM universities WHERE id = $1`;

  try {
    const result = await db.query(query, [universityId]);
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Get count of locked universities for a user
 * (Should be 0 or 1, used for validation)
 * @param {string} userId - User UUID
 * @returns {number} Count of locked universities
 */
export const getLockedCount = async (userId) => {
  const query = `SELECT COUNT(*) as count FROM locked_university WHERE user_id = $1`;

  try {
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].count);
  } catch (error) {
    throw error;
  }
};
