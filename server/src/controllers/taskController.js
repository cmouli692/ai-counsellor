/**
 * Task Controller
 * Handle task HTTP requests
 *
 * Features:
 * - Get all user tasks with statistics
 * - Create new tasks
 * - Toggle task status (done/pending)
 * - Delete tasks
 * - View task statistics
 */

import {
  createTask,
  getUserTasks,
  getUniversityTasks,
  getTaskById,
  updateTaskStatus,
  deleteTask,
  getTaskStats
} from '../models/taskModel.js';

/**
 * GET /api/tasks
 * Get all tasks for the authenticated user
 *
 * Query params:
 * - universityId (optional): Filter tasks by university
 *
 * Response:
 * - 200: Success with tasks and statistics
 * - 500: Server error
 */
export const getTasksHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { universityId } = req.query;

    let tasks;

    // Get tasks filtered by university if provided
    if (universityId) {
      const uniId = Number(universityId);
      if (!Number.isInteger(uniId) || uniId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid university ID',
          message: 'University ID must be a valid positive integer'
        });
      }
      tasks = await getUniversityTasks(userId, uniId);
    } else {
      // Get all tasks for user
      tasks = await getUserTasks(userId);
    }

    // Get task statistics
    const stats = await getTaskStats(userId);

    return res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {
        tasks,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Error getting tasks:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tasks',
      message: error.message
    });
  }
};

/**
 * POST /api/tasks
 * Create a new task
 *
 * Body:
 * - universityId (required): INTEGER
 * - title (required): string
 * - description (optional): string
 *
 * Response:
 * - 201: Task created successfully
 * - 400: Invalid input
 * - 409: Task already exists
 * - 500: Server error
 */
export const createTaskHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { universityId, title, description } = req.body;

    // Validate inputs
    if (!universityId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'universityId and title are required'
      });
    }

    // Validate university ID
    const uniId = Number(universityId);
    if (!Number.isInteger(uniId) || uniId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid university ID',
        message: 'University ID must be a valid positive integer'
      });
    }

    // Validate title
    if (typeof title !== 'string' || title.trim().length === 0 || title.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Invalid title',
        message: 'Title must be a non-empty string (max 255 characters)'
      });
    }

    // Create task
    const task = await createTask(
      userId,
      uniId,
      title.trim(),
      description?.trim() || ''
    );

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });

  } catch (error) {
    console.error('Error creating task:', error);

    // Duplicate task
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Task already exists for this university'
      });
    }

    // Invalid university/user
    if (error.message.includes('Invalid user or university')) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Invalid university or user'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
};

/**
 * PATCH /api/tasks/:taskId
 * Update task status (toggle between done and pending)
 *
 * Body:
 * - status (required): 'done' or 'pending'
 *
 * Response:
 * - 200: Task updated successfully
 * - 400: Invalid input or status
 * - 404: Task not found
 * - 500: Server error
 */
export const updateTaskHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const { status } = req.body;

    // Validate task ID
    const taskIdNum = Number(taskId);
    if (!Number.isInteger(taskIdNum) || taskIdNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
        message: 'Task ID must be a valid positive integer'
      });
    }

    // Validate status
    if (!status || !['pending', 'done'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: 'Status must be either "pending" or "done"'
      });
    }

    // Update task
    const task = await updateTaskStatus(taskIdNum, userId, status);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Error updating task:', error);

    // Task not found or unauthorized
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Task not found or you do not have permission to update it'
      });
    }

    // Invalid status
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
};

/**
 * DELETE /api/tasks/:taskId
 * Delete a task
 *
 * Response:
 * - 200: Task deleted successfully
 * - 400: Invalid task ID
 * - 404: Task not found
 * - 500: Server error
 */
export const deleteTaskHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    // Validate task ID
    const taskIdNum = Number(taskId);
    if (!Number.isInteger(taskIdNum) || taskIdNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
        message: 'Task ID must be a valid positive integer'
      });
    }

    // Delete task
    const deleted = await deleteTask(taskIdNum, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Task not found or you do not have permission to delete it'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { taskId: taskIdNum }
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
};

/**
 * GET /api/tasks/statistics
 * Get task statistics for the user
 *
 * Response:
 * - 200: Statistics retrieved
 * - 500: Server error
 */
export const getTaskStatisticsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getTaskStats(userId);

    return res.status(200).json({
      success: true,
      message: 'Task statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error getting task statistics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
};
