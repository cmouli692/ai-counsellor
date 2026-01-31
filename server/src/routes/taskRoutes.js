/**
 * Task Routes
 * API endpoints for task management
 */

import express from 'express';
import {authenticate} from '../middleware/authenticate.js';
import {
  getTasksHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  getTaskStatisticsHandler
} from '../controllers/taskController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/tasks
 * Get all tasks for the authenticated user
 * Query params: ?universityId=1 (optional)
 */
router.get('/', getTasksHandler);

/**
 * GET /api/tasks/statistics
 * Get task statistics for the user
 */
router.get('/statistics', getTaskStatisticsHandler);

/**
 * POST /api/tasks
 * Create a new task
 * Body: { universityId, title, description }
 */
router.post('/', createTaskHandler);

/**
 * PATCH /api/tasks/:taskId
 * Update task status (toggle done/pending)
 * Body: { status: 'done' | 'pending' }
 */
router.patch('/:taskId', updateTaskHandler);

/**
 * DELETE /api/tasks/:taskId
 * Delete a task
 */
router.delete('/:taskId', deleteTaskHandler);

export default router;
