# Tasks API - Technical Specification

## System Architecture

### Request Flow

```
HTTP Request
    ↓
Express Middleware (CORS, Body Parser, Auth)
    ↓
authenticate.js (JWT Verification)
    ├─ Extracts userId from token
    ├─ Attaches to req.user.id
    └─ Returns 401 if invalid
    ↓
Route Handler (taskRoutes.js)
    ├─ Routes to appropriate controller
    └─ Passes req, res
    ↓
Controller (taskController.js)
    ├─ Validates input parameters
    ├─ Checks authorization
    └─ Calls model functions
    ↓
Model (taskModel.js)
    ├─ Executes SQL queries
    ├─ Manages database transactions
    └─ Handles errors
    ↓
Database (PostgreSQL)
    ├─ CRUD operations
    ├─ Constraint validation
    └─ Returns results
    ↓
Response (JSON)
    ├─ Status code
    ├─ Success/error flag
    └─ Data or error message
```

---

## Data Model

### Task Entity

```javascript
{
  id: INTEGER (PRIMARY KEY, AUTO INCREMENT),
  user_id: UUID (FOREIGN KEY),
  university_id: INTEGER (FOREIGN KEY),
  title: STRING (255 chars max),
  description: TEXT (optional),
  status: ENUM ('pending' | 'done'),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Task Status States

```
┌─────────┐
│ pending │ ← Initial state
└────┬────┘
     │ User marks as done
     ↓
┌─────────┐
│  done   │
└────┬────┘
     │ User marks as pending again
     ↓
┌─────────┐
│ pending │
└─────────┘
```

---

## API Contract Specifications

### Request/Response Format

All responses follow standardized format:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null
}
```

Error responses include `error` field:

```json
{
  "success": false,
  "error": string,
  "message": string
}
```

---

## Endpoint Specifications

### GET /api/tasks

**Purpose:** Retrieve user's tasks with optional filtering

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| universityId | integer | No | Filter tasks by university |

**Request Example:**
```
GET /api/tasks?universityId=1
Authorization: Bearer {JWT_TOKEN}
```

**Response Codes:**
| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successfully retrieved tasks |
| 400 | Bad Request | Invalid universityId format |
| 401 | Unauthorized | Missing/invalid JWT token |
| 500 | Server Error | Database error |

**Response Body:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": 1,
        "user_id": "uuid",
        "university_id": 1,
        "title": "Statement of Purpose (SOP)",
        "description": "...",
        "status": "pending",
        "created_at": "ISO8601",
        "updated_at": "ISO8601",
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

**Validation Rules:**
- If `universityId` provided: Must be positive integer
- JWT token: Must be valid and not expired

**Authorization:**
- Users can only see their own tasks
- Returns all user tasks if no filter
- Returns filtered tasks if universityId provided

---

### POST /api/tasks

**Purpose:** Create a new task

**Request Body:**
```json
{
  "universityId": integer,
  "title": string,
  "description": string (optional)
}
```

**Request Example:**
```
POST /api/tasks
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "universityId": 1,
  "title": "Schedule Campus Visit",
  "description": "Book a virtual campus tour"
}
```

**Response Codes:**
| Code | Meaning | Scenario |
|------|---------|----------|
| 201 | Created | Task successfully created |
| 400 | Bad Request | Invalid input or missing fields |
| 401 | Unauthorized | Missing/invalid JWT token |
| 404 | Not Found | Invalid university or user |
| 409 | Conflict | Task already exists for this university |
| 500 | Server Error | Database error |

**Response Body:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 6,
    "user_id": "uuid",
    "university_id": 1,
    "title": "Schedule Campus Visit",
    "description": "Book a virtual campus tour",
    "status": "pending",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

**Validation Rules:**
- `universityId`: Required, must be positive integer
- `title`: Required, 1-255 characters, cannot be empty
- `description`: Optional, trimmed of whitespace
- Combination of (user_id, university_id, title) must be unique

**Database Constraints:**
- Foreign key: universityId must exist in universities table
- UNIQUE constraint prevents duplicates

---

### PATCH /api/tasks/:taskId

**Purpose:** Update task status (toggle between pending and done)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | integer | Yes | Task ID to update |

**Request Body:**
```json
{
  "status": "done" | "pending"
}
```

**Request Example:**
```
PATCH /api/tasks/1
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{"status": "done"}
```

**Response Codes:**
| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Task updated successfully |
| 400 | Bad Request | Invalid taskId or invalid status |
| 401 | Unauthorized | Missing/invalid JWT token |
| 404 | Not Found | Task not found or unauthorized |
| 500 | Server Error | Database error |

**Response Body:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "user_id": "uuid",
    "university_id": 1,
    "title": "Statement of Purpose (SOP)",
    "description": "...",
    "status": "done",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

**Validation Rules:**
- `taskId`: Must be positive integer
- `status`: Must be exactly "done" or "pending"
- User must own the task (authorization check)

**Behavior:**
- Updates task status in database
- Updates `updated_at` timestamp automatically
- Returns 404 if task doesn't exist or user unauthorized

---

### DELETE /api/tasks/:taskId

**Purpose:** Delete a task

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | integer | Yes | Task ID to delete |

**Request Example:**
```
DELETE /api/tasks/1
Authorization: Bearer {JWT_TOKEN}
```

**Response Codes:**
| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Task deleted successfully |
| 400 | Bad Request | Invalid taskId format |
| 401 | Unauthorized | Missing/invalid JWT token |
| 404 | Not Found | Task not found or unauthorized |
| 500 | Server Error | Database error |

**Response Body:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "taskId": 1
  }
}
```

**Validation Rules:**
- `taskId`: Must be positive integer
- User must own the task

**Behavior:**
- Removes task from database
- Returns 404 if task doesn't exist
- No soft delete; data is permanently removed

---

### GET /api/tasks/statistics

**Purpose:** Get user's task completion statistics

**Request Example:**
```
GET /api/tasks/statistics
Authorization: Bearer {JWT_TOKEN}
```

**Response Codes:**
| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Statistics retrieved |
| 401 | Unauthorized | Missing/invalid JWT token |
| 500 | Server Error | Database error |

**Response Body:**
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

**Metrics:**
- `totalTasks`: Total number of tasks
- `completedTasks`: Tasks with status = 'done'
- `pendingTasks`: Tasks with status = 'pending'
- `universitiesCount`: Number of unique universities with tasks
- `completionPercentage`: (completedTasks / totalTasks) * 100, rounded

---

## Auto-Generation Specification

### When Triggered
- User locks a university: `POST /api/lock/:universityId`
- After university is successfully locked
- Before returning response to client

### Default Tasks Generated

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

### Generation Process

```
Function: generateTasksForUniversity(userId, universityId)

For each defaultTask in TASKS:
  Try:
    createTask(userId, universityId, title, description)
    ✓ Task created
  Catch error:
    If "already exists":
      ✓ Skip (task already there)
    Else:
      ✗ Throw error (genuine problem)

Return array of created tasks
```

### Error Handling

In `lockUniversityHandler`:
```javascript
try {
  await generateTasksForUniversity(userId, uniId);
} catch (taskError) {
  console.warn('Warning: Failed to auto-generate tasks:', taskError.message);
  // Don't fail the lock operation
  // Lock succeeds even if task generation fails
}
```

**Rationale:**
- Lock operation is primary (must succeed)
- Task generation is secondary (best effort)
- If task generation fails, user still gets locked
- Warning logged for debugging

---

## Database Operations

### SQL Queries

#### INSERT Task
```sql
INSERT INTO tasks (user_id, university_id, title, description)
VALUES ($1, $2, $3, $4)
RETURNING id, user_id, university_id, title, description, status, created_at, updated_at;
```

Parameters: `[userId, universityId, title, description]`

#### SELECT Tasks
```sql
SELECT 
  t.id, t.user_id, t.university_id, t.title, t.description, 
  t.status, t.created_at, t.updated_at,
  u.name as university_name, u.country
FROM tasks t
JOIN universities u ON t.university_id = u.id
WHERE t.user_id = $1
ORDER BY t.created_at DESC;
```

Parameters: `[userId]`

#### UPDATE Task
```sql
UPDATE tasks
SET status = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2 AND user_id = $3
RETURNING id, user_id, university_id, title, description, status, created_at, updated_at;
```

Parameters: `[status, taskId, userId]`

#### DELETE Task
```sql
DELETE FROM tasks
WHERE id = $1 AND user_id = $2
RETURNING id;
```

Parameters: `[taskId, userId]`

#### GET Statistics
```sql
SELECT
  COUNT(*) as total_tasks,
  SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
  COUNT(DISTINCT university_id) as universities_count
FROM tasks
WHERE user_id = $1;
```

Parameters: `[userId]`

---

## Security Specifications

### Authentication
- All endpoints require valid JWT token in `Authorization` header
- Format: `Authorization: Bearer {TOKEN}`
- Invalid/expired tokens return 401 Unauthorized

### Authorization
- Users can only access their own tasks
- Tasks are filtered by `user_id` in all queries
- Unauthorized access returns 404 (not 403, for privacy)

### Input Validation

**universityId:**
```javascript
const uniId = Number(universityId);
if (!Number.isInteger(uniId) || uniId <= 0) {
  throw new Error('Invalid university ID');
}
```

**taskId:**
```javascript
const taskIdNum = Number(taskId);
if (!Number.isInteger(taskIdNum) || taskIdNum <= 0) {
  throw new Error('Invalid task ID');
}
```

**title:**
```javascript
if (typeof title !== 'string' || title.trim().length === 0 || title.length > 255) {
  throw new Error('Invalid title');
}
```

**status:**
```javascript
if (!['pending', 'done'].includes(status)) {
  throw new Error('Invalid status');
}
```

### SQL Injection Prevention
- All queries use parameterized statements
- No string concatenation in SQL
- Parameters: $1, $2, etc.

### Database Constraints

**UNIQUE Constraint:**
```sql
UNIQUE(user_id, university_id, title)
```
Prevents duplicate tasks for same university and user.

**Foreign Keys:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
```
Automatically delete tasks if user or university is deleted.

**CHECK Constraint:**
```sql
CHECK (status IN ('pending', 'done'))
```
Ensures only valid statuses in database.

---

## Error Handling Specifications

### Error Response Format

```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Detailed error message"
}
```

### Status Code Mapping

| Status | Scenario | Example |
|--------|----------|---------|
| 201 | Resource created | POST /tasks succeeds |
| 400 | Bad request | Invalid universityId format |
| 401 | Unauthorized | Missing JWT token |
| 404 | Not found | Task doesn't exist |
| 409 | Conflict | Duplicate task |
| 500 | Server error | Database connection fails |

### Common Error Messages

| Code | Message | Cause |
|------|---------|-------|
| 400 | "Invalid university ID" | Non-integer universityId |
| 400 | "Invalid task ID" | Non-integer taskId |
| 400 | "Invalid status" | Status not "pending" or "done" |
| 400 | "Missing required fields" | title or universityId missing |
| 404 | "Task not found or unauthorized" | Task doesn't exist or unauthorized |
| 404 | "Invalid university or user" | Foreign key doesn't exist |
| 409 | "Task already exists for this university" | Unique constraint violation |
| 500 | "Failed to create task" | Database error |

---

## Performance Specifications

### Indexes

```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_university_id ON tasks(university_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### Query Performance

- **GET /api/tasks**: O(n) where n = user's tasks (indexed by user_id)
- **GET /api/tasks?universityId=X**: O(m) where m = university's tasks (indexed)
- **POST /api/tasks**: O(1) insert (checks unique constraint)
- **PATCH /api/tasks/:taskId**: O(1) update (indexed by id)
- **DELETE /api/tasks/:taskId**: O(1) delete (indexed by id)
- **GET /api/tasks/statistics**: O(n) aggregation (full scan but indexed)

### Caching
- No caching implemented (tasks are user-specific)
- Each request hits database for current state
- Suitable for real-time task updates

---

## Testing Strategy

### Unit Tests
Model functions tested for:
- Success scenarios
- Error scenarios (invalid input, not found, duplicates)
- Database constraint violations

### Integration Tests
Full endpoint testing including:
- Authentication/authorization
- Input validation
- Response format
- Status codes
- Error messages

### End-to-End Tests
Complete workflows:
- Lock university → auto-generate tasks
- Create task → update status → delete
- Filter tasks by university
- Check statistics

---

## Deployment Checklist

- [ ] Run database migration (07-create-tasks-table.sql)
- [ ] Verify migration success
- [ ] Update app.js with task routes import and registration
- [ ] Update lock controller with task generation import
- [ ] Restart server
- [ ] Run test suite: node scripts/testTasksAPI.js
- [ ] Verify all tests pass
- [ ] Check logs for warnings
- [ ] Test manually with cURL or Postman
- [ ] Deploy to production

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-28 | Initial implementation - full CRUD + auto-generation |

---

**Technical Specification Complete**
All endpoints fully specified with validation, error handling, and security requirements.
