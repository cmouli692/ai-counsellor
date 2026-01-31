# Tasks API Implementation

## Overview

Comprehensive task management system that auto-generates tasks when a user locks a university for applications.

## Features

✅ **Auto-generation**: When a university is locked, 5 default tasks are automatically created:
- Statement of Purpose (SOP)
- IELTS/GRE Preparation
- Transcripts
- Resume/CV
- Application Forms

✅ **CRUD Operations**: Create, read, update, and delete tasks

✅ **Task Statistics**: Track completion status and metrics

✅ **University Filtering**: Get tasks for specific university

## Database Schema

### tasks Table

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, university_id, title)
);
```

**Key Constraints:**
- Foreign keys to `users` and `universities`
- UNIQUE constraint prevents duplicate tasks per university
- Status enum: 'pending' or 'done'
- Automatic timestamps

## API Endpoints

### 1. GET /api/tasks
Get all tasks for authenticated user with optional filtering

**Query Parameters:**
```
?universityId=1  (optional - filter by university)
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": 1,
        "user_id": "uuid-string",
        "university_id": 1,
        "title": "Statement of Purpose (SOP)",
        "description": "Write a compelling statement of purpose for the university",
        "status": "pending",
        "created_at": "2026-01-28T10:00:00.000Z",
        "updated_at": "2026-01-28T10:00:00.000Z",
        "university_name": "MIT",
        "country": "USA"
      }
    ],
    "statistics": {
      "totalTasks": 5,
      "completedTasks": 1,
      "pendingTasks": 4,
      "universitiesCount": 1,
      "completionPercentage": 20
    }
  }
}
```

**Error Responses:**
- 400: Invalid university ID format
- 500: Server error

---

### 2. POST /api/tasks
Create a new task

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "universityId": 1,
  "title": "Schedule Campus Visit",
  "description": "Book a virtual campus tour with the admissions office"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 6,
    "user_id": "uuid-string",
    "university_id": 1,
    "title": "Schedule Campus Visit",
    "description": "Book a virtual campus tour with the admissions office",
    "status": "pending",
    "created_at": "2026-01-28T10:05:00.000Z",
    "updated_at": "2026-01-28T10:05:00.000Z"
  }
}
```

**Error Responses:**
- 400: Missing required fields or invalid input
- 404: Invalid university or user
- 409: Task already exists for this university
- 500: Server error

**Validation:**
- `universityId`: Required, must be valid positive integer
- `title`: Required, 1-255 characters
- `description`: Optional, trimmed whitespace

---

### 3. PATCH /api/tasks/:taskId
Update task status (toggle between pending and done)

**URL Parameters:**
```
:taskId - Task ID (integer)
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "done"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "user_id": "uuid-string",
    "university_id": 1,
    "title": "Statement of Purpose (SOP)",
    "description": "...",
    "status": "done",
    "created_at": "2026-01-28T10:00:00.000Z",
    "updated_at": "2026-01-28T10:05:00.000Z"
  }
}
```

**Valid Status Values:**
- `pending` - Task not yet completed
- `done` - Task completed

**Error Responses:**
- 400: Invalid task ID or invalid status
- 404: Task not found or unauthorized
- 500: Server error

---

### 4. DELETE /api/tasks/:taskId
Delete a task

**URL Parameters:**
```
:taskId - Task ID (integer)
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "taskId": 1
  }
}
```

**Error Responses:**
- 400: Invalid task ID
- 404: Task not found or unauthorized
- 500: Server error

---

### 5. GET /api/tasks/statistics
Get task completion statistics

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task statistics retrieved successfully",
  "data": {
    "totalTasks": 5,
    "completedTasks": 2,
    "pendingTasks": 3,
    "universitiesCount": 1,
    "completionPercentage": 40
  }
}
```

**Error Responses:**
- 500: Server error

---

## Auto-Generation on Lock

When a user locks a university via `POST /api/lock/:universityId`, the system automatically creates these 5 tasks:

```javascript
[
  {
    title: "Statement of Purpose (SOP)",
    description: "Write a compelling statement of purpose for the university"
  },
  {
    title: "IELTS/GRE Preparation",
    description: "Prepare for and take the required entrance exams"
  },
  {
    title: "Transcripts",
    description: "Obtain and prepare official transcripts from previous institutions"
  },
  {
    title: "Resume/CV",
    description: "Create or update your resume/CV with relevant experience"
  },
  {
    title: "Application Forms",
    description: "Complete the university application forms"
  }
]
```

**Lock Response Example:**
```json
{
  "success": true,
  "message": "University locked successfully. Tasks auto-generated.",
  "data": {
    "id": 1,
    "userId": "uuid-string",
    "universityId": 1,
    "lockedAt": "2026-01-28T10:00:00.000Z"
  }
}
```

## Code Structure

### Model: `src/models/taskModel.js`

**Functions:**
- `createTask(userId, universityId, title, description)` - Create task
- `getUserTasks(userId)` - Get all user tasks
- `getUniversityTasks(userId, universityId)` - Get university-specific tasks
- `getTaskById(taskId, userId)` - Get single task
- `updateTaskStatus(taskId, userId, status)` - Update task status
- `deleteTask(taskId, userId)` - Delete task
- `generateTasksForUniversity(userId, universityId)` - Auto-generate 5 default tasks
- `getTaskStats(userId)` - Get completion statistics

### Controller: `src/controllers/taskController.js`

**Handlers:**
- `getTasksHandler` - GET /api/tasks
- `createTaskHandler` - POST /api/tasks
- `updateTaskHandler` - PATCH /api/tasks/:taskId
- `deleteTaskHandler` - DELETE /api/tasks/:taskId
- `getTaskStatisticsHandler` - GET /api/tasks/statistics

### Routes: `src/routes/taskRoutes.js`

All routes require authentication via `authenticate` middleware.

### Lock Integration: `src/controllers/lockController.js`

Updated `lockUniversityHandler` to:
1. Lock the university (existing logic)
2. Auto-generate tasks (new logic)
3. Return success response mentioning auto-generation

## Testing

Run the comprehensive test suite:

```bash
node scripts/testTasksAPI.js
```

**Test Coverage:**
1. User signup/login
2. Profile completion
3. Add university to shortlist
4. Lock university (triggers auto-generation)
5. Get all tasks
6. Get filtered tasks by university
7. Create custom task
8. Update task status (pending → done)
9. Update task status (done → pending)
10. Get task statistics
11. Get updated tasks
12. Delete task

## Security

✅ **Authentication Required:** All endpoints require valid JWT token

✅ **Authorization:** Users can only access/modify their own tasks
- Model functions validate `userId` parameter
- Unauthorized access returns 404 (not found)

✅ **SQL Injection Prevention:** All queries use parameterized statements

✅ **Input Validation:**
- `universityId`: Must be positive integer
- `taskId`: Must be positive integer
- `title`: 1-255 characters
- `status`: Must be 'pending' or 'done'

## Database Integrity

✅ **Unique Constraint:** Prevents duplicate tasks for same (user, university, title)

✅ **Foreign Keys:**
- `user_id` → `users(id)` (ON DELETE CASCADE)
- `university_id` → `universities(id)` (ON DELETE CASCADE)

✅ **Cascading Deletes:** Deleting user or university automatically removes related tasks

## Error Handling

All endpoints return consistent error response format:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 404: Not Found
- 409: Conflict (duplicate)
- 500: Server Error

## Integration Points

### With Lock System
- Triggered automatically when university is locked
- Generates 5 default tasks for application preparation

### With Shortlist System
- Tasks associated with shortlisted universities
- Can filter tasks by university

### With User System
- Tasks deleted when user is deleted (CASCADE)
- Tasks visible only to task owner

### With University System
- Tasks reference university information
- Tasks deleted when university is deleted (CASCADE)

## Example Workflow

```
1. User signs up
   ↓
2. User completes profile
   ↓
3. User adds university to shortlist
   ↓
4. User locks university
   ✓ Auto-generates 5 tasks
   ↓
5. User sees tasks: GET /api/tasks
   ↓
6. User completes tasks: PATCH /api/tasks/1 (status: done)
   ↓
7. User checks progress: GET /api/tasks/statistics
   ✓ Completion percentage: 20% (1/5 done)
```

## Files Created

- `database/migrations/07-create-tasks-table.sql` - Database schema
- `src/models/taskModel.js` - CRUD operations and auto-generation
- `src/controllers/taskController.js` - HTTP handlers
- `src/routes/taskRoutes.js` - Route definitions
- `scripts/testTasksAPI.js` - Comprehensive test suite

## Files Modified

- `src/app.js` - Added task routes registration
- `src/controllers/lockController.js` - Added task auto-generation on lock

## Deployment Steps

1. Run migration: Apply `07-create-tasks-table.sql` to database
2. Restart server: `npm start`
3. Test: `node scripts/testTasksAPI.js`

## Future Enhancements

- Task priorities (low, medium, high)
- Task deadlines and reminders
- Task comments/notes
- Batch task operations
- Task templates per university type
- Export tasks as PDF/Excel
- Email reminders for pending tasks
