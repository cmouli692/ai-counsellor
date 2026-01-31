# Tasks API - Visual Guide

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. USER SIGNS UP
   ↓
   ✓ Account created with UUID

2. USER COMPLETES PROFILE
   ↓
   ✓ Sets target countries, fields, preferences

3. USER ADDS UNIVERSITIES TO SHORTLIST
   ↓
   POST /api/shortlist/:universityId
   ✓ University added to shortlist

4. USER LOCKS A UNIVERSITY ← TRIGGERS AUTO-GENERATION
   ↓
   POST /api/lock/:universityId
   ↓
   ✓ University locked
   ✓ 5 tasks auto-created:
      - Statement of Purpose (SOP)
      - IELTS/GRE Preparation
      - Transcripts
      - Resume/CV
      - Application Forms
   ↓
   Response: "University locked successfully. Tasks auto-generated."

5. USER VIEWS TASKS
   ↓
   GET /api/tasks
   ✓ Returns all 5 tasks with statistics
   ✓ Completion: 0/5 (0%)

6. USER COMPLETES TASKS
   ↓
   PATCH /api/tasks/:taskId (status: "done")
   ✓ Tasks marked complete one by one
   ✓ Updated: 1/5, 2/5, 3/5, 4/5, 5/5

7. USER CHECKS PROGRESS
   ↓
   GET /api/tasks/statistics
   ✓ totalTasks: 5
   ✓ completedTasks: 2
   ✓ pendingTasks: 3
   ✓ completionPercentage: 40%

8. USER APPLIES TO UNIVERSITY
   ↓
   POST /api/applications
   ✓ Application submitted
   ✓ Tasks available for reference

9. USER CAN MANAGE ADDITIONAL TASKS
   ↓
   POST /api/tasks (custom task)
   ✓ Create custom tasks beyond defaults
   ✓ Example: "Schedule Campus Visit"
   ✓ Example: "Contact Professor"
```

---

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          tasks TABLE                              │
├─────────────────────────────────────────────────────────────────┤
│ COLUMN            │ TYPE      │ CONSTRAINTS                      │
├─────────────────────────────────────────────────────────────────┤
│ id                │ SERIAL    │ PRIMARY KEY, AUTO INCREMENT      │
│ user_id           │ UUID      │ FOREIGN KEY → users(id) CASCADE  │
│ university_id     │ INTEGER   │ FOREIGN KEY → universities(id)   │
│ title             │ VARCHAR   │ NOT NULL, 255 chars              │
│ description       │ TEXT      │ OPTIONAL                         │
│ status            │ VARCHAR   │ CHECK ('pending' | 'done')       │
│ created_at        │ TIMESTAMP │ DEFAULT CURRENT_TIMESTAMP        │
│ updated_at        │ TIMESTAMP │ DEFAULT CURRENT_TIMESTAMP        │
└─────────────────────────────────────────────────────────────────┘

CONSTRAINTS:
  ✓ PRIMARY KEY (id)
  ✓ FOREIGN KEY (user_id) → users(id) ON DELETE CASCADE
  ✓ FOREIGN KEY (university_id) → universities(id) ON DELETE CASCADE
  ✓ UNIQUE (user_id, university_id, title)
  ✓ CHECK status IN ('pending', 'done')

INDEXES:
  ✓ idx_tasks_user_id
  ✓ idx_tasks_university_id
  ✓ idx_tasks_status
```

---

## API Endpoints Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        API ENDPOINTS                              │
├──────────────────────────────────────────────────────────────────┤
│ METHOD │ ENDPOINT               │ PURPOSE              │ AUTH    │
├──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/tasks             │ Get all tasks        │ ✓ JWT   │
│ GET    │ /api/tasks?uniId=1     │ Filter by university │ ✓ JWT   │
│ GET    │ /api/tasks/statistics  │ Get completion stats │ ✓ JWT   │
│ POST   │ /api/tasks             │ Create task          │ ✓ JWT   │
│ PATCH  │ /api/tasks/:taskId     │ Toggle status        │ ✓ JWT   │
│ DELETE │ /api/tasks/:taskId     │ Delete task          │ ✓ JWT   │
└──────────────────────────────────────────────────────────────────┘

All endpoints require Authorization header:
  Authorization: Bearer {JWT_TOKEN}
```

---

## Request/Response Flow Diagram

```
CLIENT REQUEST
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ GET /api/tasks                                                    │
│ Authorization: Bearer eyJhbGci...                                 │
└─────────────────────────────────────────────────────────────────┘
    ↓
    ├─ MIDDLEWARE: Express JSON parser
    ├─ MIDDLEWARE: CORS check
    ├─ MIDDLEWARE: Authentication (verify JWT)
    │  └─ Extract userId from token
    ├─ MIDDLEWARE: Log request
    │
    ├─ ROUTE HANDLER: taskRoutes.js
    │  └─ Route to getTasksHandler
    │
    ├─ CONTROLLER: taskController.js
    │  ├─ Validate query parameters
    │  ├─ Call model functions
    │  └─ Format response
    │
    ├─ MODEL: taskModel.js
    │  ├─ Execute SQL query
    │  ├─ Handle database errors
    │  └─ Return results
    │
    ├─ DATABASE: PostgreSQL
    │  └─ SELECT tasks WHERE user_id = $1
    │
    ├─ RESPONSE FORMATTER
    │  ├─ Add success flag
    │  ├─ Add message
    │  ├─ Add data/statistics
    │  └─ Set status code (200)
    │
    ↓
CLIENT RESPONSE
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ {                                                                  │
│   "success": true,                                                │
│   "message": "Tasks retrieved successfully",                     │
│   "data": {                                                        │
│     "tasks": [...],                                               │
│     "statistics": {                                               │
│       "totalTasks": 5,                                            │
│       "completedTasks": 1,                                        │
│       "pendingTasks": 4,                                          │
│       "completionPercentage": 20                                  │
│     }                                                              │
│   }                                                                │
│ }                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task Lifecycle Diagram

```
TASK STATES & TRANSITIONS

┌─────────────┐
│   PENDING   │ ← Initial state (when created)
└──────┬──────┘
       │
       │ User marks task as done
       │
       ↓
┌─────────────┐
│    DONE     │ ← Task completed
└──────┬──────┘
       │
       │ User marks task as pending again
       │ (e.g., needs to redo)
       │
       ↓
┌─────────────┐
│   PENDING   │
└─────────────┘

OPERATIONS:
  CREATE:  Status = "pending" (default)
  READ:    Query current status
  UPDATE:  Toggle between "pending" and "done"
  DELETE:  Remove task from system
```

---

## Auto-Generation Sequence Diagram

```
USER LOCKS UNIVERSITY

POST /api/lock/1
    ↓
    ├─ lockUniversityHandler (controller)
    │  ├─ Parse universityId as INTEGER
    │  ├─ Validate university exists
    │  ├─ Call lockUniversity (model)
    │  │  └─ Lock university in database
    │  │
    │  ├─ Call generateTasksForUniversity (model) ← NEW
    │  │  ├─ For each of 5 default tasks:
    │  │  │  └─ createTask(userId, universityId, title, desc)
    │  │  │     ├─ INSERT into tasks table
    │  │  │     └─ Return created task
    │  │  │
    │  │  └─ Return array of 5 created tasks
    │  │
    │  └─ Return success response
    │
    └─ Response to client:
       {
         "success": true,
         "message": "University locked successfully. Tasks auto-generated.",
         "data": { ... }
       }

TASKS CREATED:
  1. Statement of Purpose (SOP)
  2. IELTS/GRE Preparation
  3. Transcripts
  4. Resume/CV
  5. Application Forms
```

---

## Error Handling Diagram

```
REQUEST ERROR PATHS

GET /api/tasks
    ↓
┌─────────────────────────────┐
│ Is JWT token valid?         │
└────────┬────────────────────┘
         ├─ NO → 401 Unauthorized
         │
         └─ YES
            ↓
         ┌──────────────────────────┐
         │ Is universityId provided?│
         └────────┬─────────────────┘
                  ├─ YES
                  │  ↓
                  │ ┌──────────────────────────┐
                  │ │ Is universityId integer? │
                  │ └────────┬─────────────────┘
                  │          ├─ NO → 400 Bad Request
                  │          │
                  │          └─ YES
                  │             ↓
                  │          Query database
                  │
                  └─ NO
                     ↓
                  Query database
                     ↓
         ┌──────────────────────┐
         │ Database error?      │
         └────────┬─────────────┘
                  ├─ YES → 500 Server Error
                  │
                  └─ NO → 200 OK with data

PATCH /api/tasks/:taskId
    ↓
    ├─ Is JWT valid? → NO: 401
    ├─ Is taskId integer? → NO: 400
    ├─ Is status valid? → NO: 400
    ├─ Does task exist? → NO: 404
    ├─ User authorized? → NO: 404
    └─ YES → 200 OK

DELETE /api/tasks/:taskId
    ↓
    ├─ Is JWT valid? → NO: 401
    ├─ Is taskId integer? → NO: 400
    ├─ Does task exist? → NO: 404
    ├─ User authorized? → NO: 404
    └─ YES → 200 OK
```

---

## HTTP Status Codes Diagram

```
┌────┬──────────────────────┬────────────────────────────────────┐
│ 20X SUCCESS              │                                        │
├────┼──────────────────────┼────────────────────────────────────┤
│200 │ GET, PATCH, DELETE   │ Operation successful                │
│201 │ POST                 │ Resource created                    │
├────┼──────────────────────┼────────────────────────────────────┤
│ 4XX CLIENT ERROR         │                                        │
├────┼──────────────────────┼────────────────────────────────────┤
│400 │ Bad Request          │ Invalid input (format/validation)   │
│401 │ Unauthorized         │ Missing or invalid JWT token        │
│404 │ Not Found            │ Resource doesn't exist              │
│409 │ Conflict             │ Duplicate (UNIQUE constraint)       │
├────┼──────────────────────┼────────────────────────────────────┤
│ 5XX SERVER ERROR         │                                        │
├────┼──────────────────────┼────────────────────────────────────┤
│500 │ Server Error         │ Database or system error            │
└────┴──────────────────────┴────────────────────────────────────┘
```

---

## Data Flow Diagram

```
                    ┌──────────────────┐
                    │   Frontend       │
                    │   (Vue/React)    │
                    └────────┬─────────┘
                             │
                             ↓
                    POST /api/lock/1
                    ├─ Authorization: Bearer JWT
                    └─ Body: {}
                             │
                             ↓
                    ┌──────────────────────────┐
                    │  Express Server (Node)   │
                    │  Port 5000               │
                    └────────┬─────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ↓                ↓                ↓
       ┌────────┐    ┌────────────┐    ┌──────────┐
       │ Routes │    │ Controller │    │  Model   │
       └────────┘    └────────────┘    └──────────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                             ↓
                    ┌──────────────────────┐
                    │  PostgreSQL DB       │
                    │  Port 5432           │
                    └─────────┬────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ↓               ↓               ↓
          ┌────────┐    ┌──────────┐    ┌───────────┐
          │ users  │    │ tasks    │    │universities│
          └────────┘    └──────────┘    └───────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ↓                             ↓
         ┌──────────┐                ┌──────────┐
         │ INDEXED  │                │ FOREIGN  │
         │ user_id  │                │ KEYS     │
         │ univ_id  │                │CASCADE   │
         └──────────┘                └──────────┘
```

---

## File Structure Diagram

```
server/
├── src/
│   ├── models/
│   │   ├── taskModel.js ...................... NEW ✅
│   │   ├── lockModel.js
│   │   ├── shortlistModel.js
│   │   └── universityModel.js
│   │
│   ├── controllers/
│   │   ├── taskController.js ................. NEW ✅
│   │   ├── lockController.js ................ MODIFIED ⚙️
│   │   ├── shortlistController.js
│   │   └── stageController.js
│   │
│   ├── routes/
│   │   ├── taskRoutes.js ..................... NEW ✅
│   │   ├── lockRoutes.js
│   │   ├── shortlistRoutes.js
│   │   └── ...
│   │
│   └── app.js ............................. MODIFIED ⚙️
│       (added: import taskRoutes)
│       (added: app.use('/api/tasks', taskRoutes))
│
├── database/
│   └── migrations/
│       ├── 05-create-universities.sql
│       ├── 06-create-shortlist-tables.sql
│       └── 07-create-tasks-table.sql ....... NEW ✅
│
├── scripts/
│   ├── testTasksAPI.js ..................... NEW ✅
│   └── testCompleteFlow.js
│
└── Documentation/ (6 files)
    ├── TASKS_API_OVERVIEW.md ............... NEW ✅
    ├── TASKS_API_IMPLEMENTATION.md ........ NEW ✅
    ├── TASKS_API_CURL_EXAMPLES.md ........ NEW ✅
    ├── TASKS_API_TECHNICAL_SPEC.md ....... NEW ✅
    ├── TASKS_API_SUMMARY.md .............. NEW ✅
    ├── TASKS_API_CHECKLIST.md ............ NEW ✅
    └── TASKS_API_DELIVERED.md ............ NEW ✅
```

---

## Integration Points Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Tasks API Integration                       │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  Lock System         │
│  (lockController.js) │
└──────────┬───────────┘
           │
           │ Calls generateTasksForUniversity()
           │ when locking university
           ↓
    ┌─────────────────┐
    │  Tasks System   │ ← NEW
    │ (taskModel.js)  │
    └──────┬──────────┘
           │
           ├─ Generates 5 default tasks
           ├─ Creates in tasks table
           └─ Returns created tasks


┌──────────────────────┐
│  User System         │
│ (userModel.js)       │
└──────────┬───────────┘
           │
           │ CASCADE DELETE
           ↓
    ┌─────────────────┐
    │  Tasks Table    │ ← User deleted
    │  (auto delete)  │    = All tasks deleted
    └─────────────────┘


┌──────────────────────┐
│  University System   │
│ (universityModel.js) │
└──────────┬───────────┘
           │
           │ CASCADE DELETE
           ↓
    ┌─────────────────┐
    │  Tasks Table    │ ← University deleted
    │  (auto delete)  │    = All tasks for it deleted
    └─────────────────┘


┌──────────────────────┐
│  Shortlist System    │
│ (shortlistModel.js)  │
└──────────┬───────────┘
           │
           │ Can filter tasks by shortlisted unis
           ↓
    ┌─────────────────┐
    │  Tasks API      │ ← GET /api/tasks?universityId=1
    │  Filtering      │    Only see tasks for shortlisted unis
    └─────────────────┘
```

---

## Feature Matrix

```
                FEATURE CHECKLIST
┌────────────────────────────────────────────────────────┐
│ Feature                  │ Status │ Implementation      │
├────────────────────────────────────────────────────────┤
│ Create task              │  ✅    │ POST /api/tasks     │
│ Read all tasks           │  ✅    │ GET /api/tasks      │
│ Read filtered tasks      │  ✅    │ GET ?universityId=  │
│ Update task status       │  ✅    │ PATCH /api/tasks/:id│
│ Delete task              │  ✅    │ DELETE /api/tasks   │
│ Get statistics           │  ✅    │ GET /tasks/stats    │
│ Auto-generate on lock    │  ✅    │ generateTasks()     │
│ JWT authentication       │  ✅    │ authenticate.js     │
│ User authorization       │  ✅    │ WHERE user_id = $1  │
│ Input validation         │  ✅    │ Check all params    │
│ Error handling           │  ✅    │ 400/401/404/409/500 │
│ Database constraints     │  ✅    │ UNIQUE/FK/CHECK     │
│ SQL injection prevention │  ✅    │ Parameterized ($)   │
│ Test suite               │  ✅    │ testTasksAPI.js     │
│ cURL examples            │  ✅    │ CURL_EXAMPLES.md    │
│ Full documentation       │  ✅    │ 6 docs files        │
└────────────────────────────────────────────────────────┘
```

---

**Visual Guide Complete** ✅
All diagrams show system architecture, data flow, and integration points.
