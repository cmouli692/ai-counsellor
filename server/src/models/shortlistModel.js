/**
 * Shortlist Model
 * Database operations for user shortlist and locked university
 */

// import pool from '../db.js';
import db from '../config/database.js';



/**
 * Add a university to user's shortlist
 * Prevents duplicates via unique constraint
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @returns {Object} Added shortlist entry
 */
export const addToShortlist = async (userId, universityId) => {
  const query = `
    INSERT INTO shortlist (user_id, university_id)
    VALUES ($1, $2)
    RETURNING id, user_id, university_id, created_at;
  `;

  try {
    const result = await db.query(query, [userId, universityId]);
    return result.rows[0];
  } catch (error) {
    // Unique constraint violation - already shortlisted
    if (error.code === '23505') {
      throw new Error('University already in shortlist');
    }
    // Foreign key constraint - invalid university ID
    if (error.code === '23503') {
      throw new Error('University not found');
    }
    throw error;
  }
};

/**
 * Remove university from user's shortlist
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @returns {boolean} True if removed, false if not found
 */
export const removeFromShortlist = async (userId, universityId) => {
  const query = `
    DELETE FROM shortlist
    WHERE user_id = $1 AND university_id = $2
    RETURNING id;
  `;

  const result = await db.query(query, [userId, universityId]);
  return result.rows.length > 0;
};

/**
 * Get user's shortlist with full university details
 * @param {string} userId - User UUID
 * @returns {Array} Array of shortlisted universities
 */
export const getShortlist = async (userId) => {
  const query = `
    SELECT 
      s.id,
      s.created_at,
      u.id as university_id,
      u.name,
      u.country,
      u.program,
      u.yearly_cost,
      u.acceptance_rate,
      u.avg_gpa,
      u.avg_exam_score,
      u.tags,
      u.website,
      u.description
    FROM shortlist s
    JOIN universities u ON s.university_id = u.id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC;
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
};

/**
 * Get user's locked university with details
 * @param {string} userId - User UUID
 * @returns {Object|null} Locked university or null
 */
export const getLockedUniversity = async (userId) => {
  const query = `
    SELECT 
      lu.id,
      lu.locked_at,
      u.id as university_id,
      u.name,
      u.country,
      u.program,
      u.yearly_cost,
      u.acceptance_rate,
      u.avg_gpa,
      u.avg_exam_score,
      u.tags,
      u.website,
      u.description
    FROM locked_university lu
    JOIN universities u ON lu.university_id = u.id
    WHERE lu.user_id = $1;
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
};

/**
 * Check if university is already shortlisted by user
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @returns {boolean} True if shortlisted
 */
export const isShortlisted = async (userId, universityId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM shortlist
      WHERE user_id = $1 AND university_id = $2
    ) as exists;
  `;

  const result = await db.query(query, [userId, universityId]);
  return result.rows[0].exists;
};

/**
 * Lock a university for the user
 * Only one locked university per user (enforced by unique constraint)
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @returns {Object} Locked university entry
 */
export const lockUniversity = async (userId, universityId) => {
  const query = `
    INSERT INTO locked_university (user_id, university_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE
    SET university_id = $2, locked_at = CURRENT_TIMESTAMP
    RETURNING id, user_id, university_id, locked_at;
  `;

  try {
    const result = await db.query(query, [userId, universityId]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23503') {
      throw new Error('University not found');
    }
    throw error;
  }
};

/**
 * Get shortlist count for user
 * @param {string} userId - User UUID
 * @returns {number} Number of universities in shortlist
 */
export const getShortlistCount = async (userId) => {
  const query = `
    SELECT COUNT(*) as count FROM shortlist
    WHERE user_id = $1;
  `;

  const result = await db.query(query, [userId]);
  return parseInt(result.rows[0].count, 10);
};

/**
 * Check if university exists
 * @param {number} universityId - University ID
 * @returns {boolean} True if exists
 */
export const universityExists = async (universityId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM universities
      WHERE id = $1
    ) as exists;
  `;

  const result = await db.query(query, [universityId]);
  return result.rows[0].exists;
};
