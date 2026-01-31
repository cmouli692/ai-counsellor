# Tasks API - cURL Examples

## Setup

Set your token as environment variable (from login/signup response):

```bash
TOKEN="your_jwt_token_here"
BASE_URL="http://localhost:5000/api"
```

---

## 1. Get All Tasks

```bash
curl -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [...],
    "statistics": {
      "totalTasks": 5,
      "completedTasks": 0,
      "pendingTasks": 5,
      "universitiesCount": 1,
      "completionPercentage": 0
    }
  }
}
```

---

## 2. Get Tasks for Specific University

```bash
curl -X GET "$BASE_URL/tasks?universityId=1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Create a Custom Task

```bash
curl -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "universityId": 1,
    "title": "Schedule Campus Visit",
    "description": "Book a virtual campus tour with the admissions office"
  }'
```

**Response:**
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

---

## 4. Mark Task as Done

```bash
curl -X PATCH "$BASE_URL/tasks/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

---

## 5. Mark Task as Pending

```bash
curl -X PATCH "$BASE_URL/tasks/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending"
  }'
```

---

## 6. Delete a Task

```bash
curl -X DELETE "$BASE_URL/tasks/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 7. Get Task Statistics

```bash
curl -X GET "$BASE_URL/tasks/statistics" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Task statistics retrieved successfully",
  "data": {
    "totalTasks": 5,
    "completedTasks": 1,
    "pendingTasks": 4,
    "universitiesCount": 1,
    "completionPercentage": 20
  }
}
```

---

## 8. Lock University (Auto-generates Tasks)

```bash
curl -X POST "$BASE_URL/lock/1" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
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

Auto-generated tasks:
- Statement of Purpose (SOP)
- IELTS/GRE Preparation
- Transcripts
- Resume/CV
- Application Forms

---

## Complete Workflow Example

```bash
# 1. Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# 2. Add university to shortlist
curl -s -X POST "$BASE_URL/shortlist/1" \
  -H "Authorization: Bearer $TOKEN"

# 3. Lock university (auto-generates tasks)
curl -s -X POST "$BASE_URL/lock/1" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get all tasks
curl -s -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.tasks'

# 5. Mark first task as done
curl -s -X PATCH "$BASE_URL/tasks/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# 6. Check statistics
curl -s -X GET "$BASE_URL/tasks/statistics" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

---

## Error Examples

### Invalid Task ID
```bash
curl -X PATCH "$BASE_URL/tasks/invalid" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid task ID",
  "message": "Task ID must be a valid positive integer"
}
```

### Unauthorized (Missing Token)
```bash
curl -X GET "$BASE_URL/tasks"
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

### Invalid Status
```bash
curl -X PATCH "$BASE_URL/tasks/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "invalid"}'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid status",
  "message": "Status must be either \"pending\" or \"done\""
}
```

### Task Not Found
```bash
curl -X PATCH "$BASE_URL/tasks/9999" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

**Response (404):**
```json
{
  "success": false,
  "error": "Not found",
  "message": "Task not found or you do not have permission to update it"
}
```

---

## Using jq for Pretty Output

```bash
# Get tasks and format nicely
curl -s -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.tasks[] | {id, title, status, university_name}'

# Get statistics
curl -s -X GET "$BASE_URL/tasks/statistics" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'

# Parse login response and extract token
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass"}' | jq '.data.token'
```

---

## Testing with Postman

### Environment Variables
```
TOKEN: {{token}}
BASE_URL: http://localhost:5000/api
```

### Collections

1. **Login**
   - Method: POST
   - URL: {{BASE_URL}}/auth/login
   - Body: `{"email": "user@example.com", "password": "password"}`
   - Script: `pm.environment.set("token", pm.response.json().data.token);`

2. **Get Tasks**
   - Method: GET
   - URL: {{BASE_URL}}/tasks
   - Headers: `Authorization: Bearer {{TOKEN}}`

3. **Create Task**
   - Method: POST
   - URL: {{BASE_URL}}/tasks
   - Headers: `Authorization: Bearer {{TOKEN}}`
   - Body: 
   ```json
   {
     "universityId": 1,
     "title": "My Custom Task",
     "description": "Task description here"
   }
   ```

4. **Update Task**
   - Method: PATCH
   - URL: {{BASE_URL}}/tasks/1
   - Headers: `Authorization: Bearer {{TOKEN}}`
   - Body: `{"status": "done"}`

5. **Delete Task**
   - Method: DELETE
   - URL: {{BASE_URL}}/tasks/1
   - Headers: `Authorization: Bearer {{TOKEN}}`

6. **Get Statistics**
   - Method: GET
   - URL: {{BASE_URL}}/tasks/statistics
   - Headers: `Authorization: Bearer {{TOKEN}}`
