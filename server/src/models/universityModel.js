/**
 * University Model Functions
 * Database operations for universities
 */

import db from '../config/database.js';




/**
 * Get all universities with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.country - Filter by country
 * @param {number} filters.maxCost - Filter by maximum yearly cost
 * @param {string} filters.program - Filter by program
 * @returns {Promise<Array>} Array of universities
 */
export async function getAllUniversities(filters = {}) {
  try {
    let query = 'SELECT * FROM universities WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (filters.country) {
      query += ` AND country = $${paramIndex}`;
      params.push(filters.country);
      paramIndex++;
    }

    if (filters.maxCost) {
      query += ` AND yearly_cost <= $${paramIndex}`;
      params.push(filters.maxCost);
      paramIndex++;
    }

    if (filters.program) {
      query += ` AND program ILIKE $${paramIndex}`;
      params.push(`%${filters.program}%`);
      paramIndex++;
    }

    query += ' ORDER BY acceptance_rate ASC, yearly_cost ASC';

    const result = await db.query(query, params);
    return result.rows || [];
  } catch (error) {
    console.error('Error in getAllUniversities:', error);
    return [];
  }
}

/**
 * Get university by ID
 * @param {number} id - University ID
 * @returns {Promise<Object>} University object
 */
export async function getUniversityById(id) {
  try {
    const result = await db.query('SELECT * FROM universities WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching university by ID:', error);
    return null;
  }
}

/**
 * Get personalized recommendations based on user profile
 * @param {Object} profileData - User profile data
 * @param {boolean} profileData.profileCompleted - Is profile complete?
 * @param {number} profileData.budget - Annual budget in INR
 * @param {string} profileData.examReadiness - Exam readiness level
 * @param {number} profileData.avgGPA - Average GPA/grades
 * @param {number} profileData.examScore - Exam score (0-1600)
 * @param {Array} profileData.interests - User interests/tags
 * @returns {Promise<Object>} Recommendations with Dream/Target/Safe arrays
 */
export async function getRecommendations(profileData) {
  // Validate profile
  if (!profileData.profileCompleted) {
    return {
      error: 'Profile incomplete',
      message: 'Please complete your profile to get recommendations',
      recommendations: { dream: [], target: [], safe: [] }
    };
  }

  if (!profileData.examScore || !profileData.budget) {
    return {
      error: 'Missing exam score or budget',
      message: 'Please provide exam score and budget information',
      recommendations: { dream: [], target: [], safe: [] }
    };
  }

  try {
    // Get all universities (no cost filter for MVP)
    const allUniversities = await getAllUniversities({});

    if (!allUniversities || allUniversities.length === 0) {
      return {
        success: true,
        message: 'No universities available',
        recommendations: { dream: [], target: [], safe: [] }
      };
    }

    const recommendations = {
      dream: [],
      target: [],
      safe: []
    };

    // Simple heuristic: categorize based on acceptance_rate (which exists in schema)
    for (const uni of allUniversities) {
      const basicRec = {
        id: uni.id,
        name: uni.name,
        country: uni.country,
        program: uni.program,
        yearly_cost: uni.yearly_cost,
        acceptance_rate: uni.acceptance_rate,
        tags: uni.tags || [],
        website: uni.website,
        description: uni.description,
        fitReason: `Offers ${uni.program}`,
        riskReason: uni.acceptance_rate < 5 ? 'Highly competitive' : 'None',
        acceptanceChance: 'Possible'
      };

      // Simple categorization: by acceptance rate
      if (uni.acceptance_rate < 5) {
        recommendations.dream.push(basicRec);
      } else if (uni.acceptance_rate < 15) {
        recommendations.target.push(basicRec);
      } else {
        recommendations.safe.push(basicRec);
      }
    }

    return {
      success: true,
      profileMatched: {
        examScore: profileData.examScore,
        avgGPA: profileData.avgGPA,
        budget: profileData.budget,
        examReadiness: profileData.examReadiness
      },
      recommendations
    };
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return {
      success: false,
      error: 'Error generating recommendations',
      recommendations: { dream: [], target: [], safe: [] }
    };
  }
}

/**
 * Get universities by country
 * @param {string} country - Country name
 * @returns {Promise<Array>} Universities in that country
 */
export async function getUniversitiesByCountry(country) {
  try {
    const result = await db.query(
      'SELECT * FROM universities WHERE country = $1 ORDER BY acceptance_rate ASC',
      [country]
    );
    return result.rows || [];
  } catch (error) {
    console.error('Error in getUniversitiesByCountry:', error);
    return [];
  }
}

/**
 * Search universities
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching universities
 */
export async function searchUniversities(query) {
  try {
    const searchQuery = `%${query}%`;
    const result = await db.query(
      `SELECT * FROM universities 
       WHERE name ILIKE $1 OR program ILIKE $1 OR description ILIKE $1
       ORDER BY acceptance_rate ASC`,
      [searchQuery]
    );
    return result.rows || [];
  } catch (error) {
    console.error('Error in searchUniversities:', error);
    return [];
  }
}
