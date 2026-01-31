/**
 * Task Model
 * Database operations for user tasks
 *
 * Features:
 * - CRUD operations for tasks
 * - Auto-generate tasks when university is locked
 * - Track task completion status
 * - Associate tasks with user and university
 */

import db from '../config/database.js';

/**
 * Create a task
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @returns {Object} Created task
 */
export const createTask = async (userId, universityId, title, description = '') => {
  const query = `
    INSERT INTO tasks (user_id, university_id, title, description)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, university_id, title, description, status, created_at, updated_at;
  `;

  try {
    const result = await db.query(query, [userId, universityId, title, description]);
    return result.rows[0];
  } catch (error) {
    // Unique constraint violation - task already exists for this university
    if (error.code === '23505') {
      throw new Error('Task already exists for this university');
    }
    // Foreign key constraint
    if (error.code === '23503') {
      throw new Error('Invalid user or university');
    }
    throw error;
  }
};

/**
 * Get all tasks for a user
 * @param {string} userId - User UUID
 * @returns {Array} Array of tasks
 */
export const getUserTasks = async (userId) => {
  const query = `
    SELECT 
      t.id,
      t.user_id,
      t.university_id,
      t.title,
      t.description,
      t.status,
      t.created_at,
      t.updated_at,
      u.name as university_name,
      u.country
    FROM tasks t
    JOIN universities u ON t.university_id = u.id
    WHERE t.user_id = $1
    ORDER BY t.created_at DESC;
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
};

/**
 * Get tasks for a specific university
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @returns {Array} Array of tasks
 */
export const getUniversityTasks = async (userId, universityId) => {
  const query = `
    SELECT 
      id,
      user_id,
      university_id,
      title,
      description,
      status,
      created_at,
      updated_at
    FROM tasks
    WHERE user_id = $1 AND university_id = $2
    ORDER BY created_at ASC;
  `;

  const result = await db.query(query, [userId, universityId]);
  return result.rows;
};

/**
 * Get single task
 * @param {number} taskId - Task ID
 * @param {string} userId - User UUID (for security)
 * @returns {Object|null} Task or null
 */
export const getTaskById = async (taskId, userId) => {
  const query = `
    SELECT 
      t.id,
      t.user_id,
      t.university_id,
      t.title,
      t.description,
      t.status,
      t.created_at,
      t.updated_at,
      u.name as university_name
    FROM tasks t
    JOIN universities u ON t.university_id = u.id
    WHERE t.id = $1 AND t.user_id = $2;
  `;

  const result = await db.query(query, [taskId, userId]);
  return result.rows[0] || null;
};

/**
 * Update task status (toggle done/pending)
 * @param {number} taskId - Task ID
 * @param {string} userId - User UUID (for security)
 * @param {string} status - New status ('done' or 'pending')
 * @returns {Object} Updated task
 */
export const updateTaskStatus = async (taskId, userId, status) => {
  // Validate status
  if (!['pending', 'done'].includes(status)) {
    throw new Error('Invalid status. Must be "pending" or "done"');
  }

  const query = `
    UPDATE tasks
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND user_id = $3
    RETURNING id, user_id, university_id, title, description, status, created_at, updated_at;
  `;

  const result = await db.query(query, [status, taskId, userId]);

  if (result.rows.length === 0) {
    throw new Error('Task not found or unauthorized');
  }

  return result.rows[0];
};

/**
 * Delete a task
 * @param {number} taskId - Task ID
 * @param {string} userId - User UUID (for security)
 * @returns {boolean} True if deleted
 */
export const deleteTask = async (taskId, userId) => {
  const query = `
    DELETE FROM tasks
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;

  const result = await db.query(query, [taskId, userId]);
  return result.rows.length > 0;
};

/**
 * Auto-generate default tasks when university is locked
 * @param {string} userId - User UUID
 * @param {number} universityId - University ID
 * @returns {Array} Array of created tasks
 */
export const generateTasksForUniversity = async (userId, universityId) => {
  const defaultTasks = [
    { title: 'Statement of Purpose (SOP)', description: 'Write a compelling statement of purpose for the university' },
    { title: 'IELTS/GRE Preparation', description: 'Prepare for and take the required entrance exams' },
    { title: 'Transcripts', description: 'Obtain and prepare official transcripts from previous institutions' },
    { title: 'Resume/CV', description: 'Create or update your resume/CV with relevant experience' },
    { title: 'Application Forms', description: 'Complete the university application forms' }
  ];

  const createdTasks = [];

  for (const taskDef of defaultTasks) {
    try {
      const task = await createTask(userId, universityId, taskDef.title, taskDef.description);
      createdTasks.push(task);
    } catch (error) {
      // If task already exists, continue (don't throw error)
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  return createdTasks;
};

/**
 * Get task statistics for a user
 * @param {string} userId - User UUID
 * @returns {Object} Task statistics
 */
export const getTaskStats = async (userId) => {
  const query = `
    SELECT
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
      COUNT(DISTINCT university_id) as universities_count
    FROM tasks
    WHERE user_id = $1;
  `;

  const result = await db.query(query, [userId]);
  const row = result.rows[0];

  return {
    totalTasks: parseInt(row.total_tasks || 0),
    completedTasks: parseInt(row.completed_tasks || 0),
    pendingTasks: parseInt(row.pending_tasks || 0),
    universitiesCount: parseInt(row.universities_count || 0),
    completionPercentage: row.total_tasks > 0 ? Math.round((row.completed_tasks / row.total_tasks) * 100) : 0
  };
};
