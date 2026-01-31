/**
 * University Routes
 */

import express from 'express';
import {
  getUniversities,
  getUniversity,
  getCountryUniversities,
  getRecommendedUniversities,
  getStatistics
} from '../controllers/universityController.js';

const router = express.Router();

/**
 * GET /api/universities
 * Get filtered universities
 * Query: country, maxCost, program, search
 */
router.get('/', getUniversities);

/**
 * GET /api/universities/stats
 * Get statistics about universities
 */
router.get('/stats', getStatistics);

/**
 * GET /api/universities/recommended
 * Get personalized recommendations
 * Body: profileCompleted, avgGPA, examScore, budget, examReadiness, interests
 */
router.post('/recommended', getRecommendedUniversities);

/**
 * GET /api/universities/country/:country
 * Get universities by country
 */
router.get('/country/:country', getCountryUniversities);

/**
 * GET /api/universities/:id
 * Get single university
 */
router.get('/:id', getUniversity);

export default router;
