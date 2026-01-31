/**
 * Shortlist Controller
 * Handle shortlist and locked university HTTP requests
 */

import {
  addToShortlist,
  removeFromShortlist,
  getShortlist,
  getLockedUniversity,
  isShortlisted,
  universityExists
} from '../models/shortlistModel.js';

/**
 * POST /api/shortlist/:universityId
 * Add university to user's shortlist
 * Requires: Authentication
 * Prevents: Duplicate entries
 */
export const addUniversityToShortlist = async (req, res) => {
  try {
    // Get university ID from URL parameter
    const { universityId } = req.params;
    const userId = req.user.id;

    // Parse university ID as INTEGER (not UUID)
    const uniId = Number(universityId);
    if (!Number.isInteger(uniId) || uniId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid university ID',
        message: 'University ID must be a valid positive integer'
      });
    }

    // Check if university exists
    const exists = await universityExists(uniId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'University not found',
        message: `University with ID ${uniId} does not exist`
      });
    }

    // Check if already shortlisted
    const alreadyShortlisted = await isShortlisted(userId, uniId);
    if (alreadyShortlisted) {
      return res.status(409).json({
        success: false,
        error: 'Already shortlisted',
        message: 'This university is already in your shortlist'
      });
    }

    // Add to shortlist
    const shortlistEntry = await addToShortlist(userId, uniId);

    return res.status(201).json({
      success: true,
      message: 'University added to shortlist',
      data: shortlistEntry
    });
  } catch (error) {
    console.error('Error adding to shortlist:', error.message);

    if (error.message.includes('already in shortlist')) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry',
        message: error.message
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * DELETE /api/shortlist/:universityId
 * Remove university from user's shortlist
 * Requires: Authentication
 */
export const removeUniversityFromShortlist = async (req, res) => {
  try {
    const { universityId } = req.params;
    const userId = req.user.id;

    // Parse university ID as INTEGER (not UUID)
    const uniId = Number(universityId);
    if (!Number.isInteger(uniId) || uniId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid university ID',
        message: 'University ID must be a valid positive integer'
      });
    }

    // Remove from shortlist
    const removed = await removeFromShortlist(userId, uniId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'University not found in your shortlist'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'University removed from shortlist',
      data: { universityId: uniId }
    });
  } catch (error) {
    console.error('Error removing from shortlist:', error.message);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * GET /api/shortlist/mine
 * Get user's shortlist + locked university
 * Requires: Authentication
 */
export const getMyShortlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get shortlist
    const shortlist = await getShortlist(userId);

    // Get locked university
    const lockedUniversity = await getLockedUniversity(userId);

    return res.status(200).json({
      success: true,
      message: 'User shortlist and locked university',
      data: {
        shortlist: shortlist || [],
        shortlistCount: (shortlist || []).length,
        lockedUniversity: lockedUniversity || null,
        hasLockedUniversity: lockedUniversity !== null
      }
    });
  } catch (error) {
    console.error('Error fetching shortlist:', error.message);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
