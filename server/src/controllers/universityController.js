/**
 * University Controller
 * Handle university-related HTTP requests
 */

import {
  getAllUniversities,
  getRecommendations,
  getUniversityById,
  getUniversitiesByCountry,
  searchUniversities
} from '../models/universityModel.js';

/**
 * GET /api/universities
 * Get filtered list of universities
 * Query params: country, maxCost, program, search
 */
export async function getUniversities(req, res) {
  try {
    const { country, maxCost, program, search } = req.query;

    let universities = [];

    // If search query provided
    if (search) {
      universities = await searchUniversities(search);
    } else {
      // Apply filters
      const filters = {};
      if (country) filters.country = country;
      if (maxCost) filters.maxCost = parseInt(maxCost);
      if (program) filters.program = program;

      universities = await getAllUniversities(filters);
    }

    return res.json({
      success: true,
      count: universities ? universities.length : 0,
      universities: universities || []
    });
  } catch (error) {
    console.error('Error in getUniversities:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch universities',
      message: error.message
    });
  }
}

/**
 * GET /api/universities/:id
 * Get single university by ID
 */
export async function getUniversity(req, res) {
  try {
    const { id } = req.params;

    const university = await getUniversityById(id);

    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found'
      });
    }

    return res.json({
      success: true,
      university
    });
  } catch (error) {
    console.error('Error in getUniversity:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch university',
      message: error.message
    });
  }
}

/**
 * GET /api/universities/country/:country
 * Get all universities in a country
 */
export async function getCountryUniversities(req, res) {
  try {
    const { country } = req.params;

    const universities = await getUniversitiesByCountry(country);

    if (!universities || universities.length === 0) {
      return res.json({
        success: true,
        country,
        count: 0,
        universities: []
      });
    }

    return res.json({
      success: true,
      country,
      count: universities.length,
      universities
    });
  } catch (error) {
    console.error('Error in getCountryUniversities:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch universities',
      message: error.message
    });
  }
}

/**
 * POST /api/universities/recommended
 * Get personalized recommendations based on user profile
 */
export async function getRecommendedUniversities(req, res) {
  try {
    const { profileCompleted, avgGPA, examScore, budget, examReadiness, interests } = req.body;

    // Validate required fields
    if (profileCompleted === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['profileCompleted', 'avgGPA', 'examScore', 'budget']
      });
    }

    // Get recommendations
    const recommendations = await getRecommendations({
      profileCompleted,
      avgGPA: avgGPA || 3.5,
      examScore: parseInt(examScore) || 0,
      budget: parseInt(budget) || 0,
      examReadiness: examReadiness || 'Preparing',
      interests: interests || []
    });

    if (recommendations.error) {
      return res.status(400).json({
        success: false,
        ...recommendations
      });
    }

    return res.json({
      success: true,
      ...recommendations
    });
  } catch (error) {
    console.error('Error in getRecommendedUniversities:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error.message,
      recommendations: { dream: [], target: [], safe: [] }
    });
  }
}

/**
 * GET /api/universities/stats
 * Get statistics about universities in database
 */
export async function getStatistics(req, res) {
  try {
    const universities = await getAllUniversities({});

    // Handle empty database
    if (!universities || universities.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalUniversities: 0,
          countries: [],
          averageAcceptanceRate: 0,
          averageYearlyCost: 0,
          costRange: { min: 0, max: 0 },
          byCountry: {}
        }
      });
    }

    // Calculate stats
    const stats = {
      totalUniversities: universities.length,
      byCountry: {},
      averageAcceptanceRate: 0,
      averageYearlyCost: 0,
      costRange: { min: Infinity, max: -Infinity },
      countries: []
    };

    let totalAcceptance = 0;
    let totalCost = 0;

    universities.forEach(uni => {
      // Count by country
      if (uni.country) {
        stats.byCountry[uni.country] = (stats.byCountry[uni.country] || 0) + 1;
      }

      // Accumulate for averages
      const acceptance = parseFloat(uni.acceptance_rate) || 0;
      const cost = parseInt(uni.yearly_cost) || 0;
      totalAcceptance += acceptance;
      totalCost += cost;

      // Track cost range (only update if cost is valid)
      if (cost > 0) {
        stats.costRange.min = Math.min(stats.costRange.min, cost);
        stats.costRange.max = Math.max(stats.costRange.max, cost);
      }
    });

    // Calculate averages safely
    stats.averageAcceptanceRate = universities.length > 0
      ? parseFloat((totalAcceptance / universities.length).toFixed(2))
      : 0;
    stats.averageYearlyCost = universities.length > 0
      ? Math.round(totalCost / universities.length)
      : 0;
    
    // Handle case where no valid costs were found
    if (stats.costRange.min === Infinity) {
      stats.costRange = { min: 0, max: 0 };
    }

    // Get list of countries
    stats.countries = Object.keys(stats.byCountry).sort();

    return res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate statistics',
      message: error.message,
      stats: {
        totalUniversities: 0,
        countries: [],
        averageAcceptanceRate: 0,
        averageYearlyCost: 0,
        costRange: { min: 0, max: 0 },
        byCountry: {}
      }
    });
  }
}
