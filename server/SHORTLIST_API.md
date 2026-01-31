# 🎓 Shortlist API Documentation

## Overview

The Shortlist API enables users to build a curated list of universities and lock their final choice. All endpoints require JWT authentication.

**Base URL:** `http://localhost:5000/api/shortlist`

---

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

The token is obtained from `/api/auth/login` and attached by the frontend to all requests.

---

## Endpoints

### 1. POST /api/shortlist/:universityId
**Add University to Shortlist**

Adds a university to the authenticated user's shortlist. Prevents duplicate entries.

**URL Parameters:**
- `universityId` (number, required) - The ID of the university to add

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "University added to shortlist",
  "data": {
    "id": 1,
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "university_id": 3,
    "created_at": "2026-01-27T12:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid university ID:
```json
{
  "success": false,
  "error": "Invalid university ID",
  "message": "University ID must be a valid number"
}
```

**404 Not Found** - University doesn't exist:
```json
{
  "success": false,
  "error": "University not found",
  "message": "University with ID 999 does not exist"
}
```

**409 Conflict** - Already shortlisted:
```json
{
  "success": false,
  "error": "Already shortlisted",
  "message": "This university is already in your shortlist"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/shortlist/3 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

---

### 2. DELETE /api/shortlist/:universityId
**Remove University from Shortlist**

Removes a university from the authenticated user's shortlist.

**URL Parameters:**
- `universityId` (number, required) - The ID of the university to remove

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "University removed from shortlist",
  "data": {
    "universityId": 3
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid university ID:
```json
{
  "success": false,
  "error": "Invalid university ID",
  "message": "University ID must be a valid number"
}
```

**404 Not Found** - Not in shortlist:
```json
{
  "success": false,
  "error": "Not found",
  "message": "University not found in your shortlist"
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/shortlist/3 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 3. GET /api/shortlist/mine
**Get User's Shortlist & Locked University**

Retrieves all universities in the user's shortlist and their locked university (if any).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User shortlist and locked university",
  "data": {
    "shortlist": [
      {
        "id": 1,
        "created_at": "2026-01-27T10:30:00.000Z",
        "university_id": 3,
        "name": "MIT",
        "country": "USA",
        "program": "Computer Science",
        "yearly_cost": 8000000,
        "acceptance_rate": "2.70",
        "avg_gpa": "3.96",
        "avg_exam_score": 1540,
        "tags": ["Ivy League", "Engineering", "AI/ML", "Research"],
        "website": "https://mit.edu",
        "description": "Premier engineering and technology institute"
      },
      {
        "id": 2,
        "created_at": "2026-01-27T11:00:00.000Z",
        "university_id": 1,
        "name": "Harvard University",
        "country": "USA",
        "program": "Computer Science",
        "yearly_cost": 8500000,
        "acceptance_rate": "3.20",
        "avg_gpa": "3.90",
        "avg_exam_score": 1530,
        "tags": ["Ivy League", "Research", "CS", "AI"],
        "website": "https://harvard.edu",
        "description": "Prestigious Ivy League institution with world-class CS program"
      }
    ],
    "shortlistCount": 2,
    "lockedUniversity": {
      "id": 1,
      "locked_at": "2026-01-27T12:00:00.000Z",
      "university_id": 3,
      "name": "MIT",
      "country": "USA",
      "program": "Computer Science",
      "yearly_cost": 8000000,
      "acceptance_rate": "2.70",
      "avg_gpa": "3.96",
      "avg_exam_score": 1540,
      "tags": ["Ivy League", "Engineering", "AI/ML", "Research"],
      "website": "https://mit.edu",
      "description": "Premier engineering and technology institute"
    },
    "hasLockedUniversity": true
  }
}
```

**Empty Response (200 OK):**
```json
{
  "success": true,
  "message": "User shortlist and locked university",
  "data": {
    "shortlist": [],
    "shortlistCount": 0,
    "lockedUniversity": null,
    "hasLockedUniversity": false
  }
}
```

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/shortlist/mine \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Database Schema

### shortlist Table
```sql
CREATE TABLE shortlist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  university_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, university_id)
);
```

**Constraints:**
- `UNIQUE(user_id, university_id)` - Prevents duplicate shortlist entries
- Foreign key to `users(id)` with CASCADE delete
- Foreign key to `universities(id)` with CASCADE delete

### locked_university Table
```sql
CREATE TABLE locked_university (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  university_id INTEGER NOT NULL,
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints:**
- `UNIQUE(user_id)` - Each user can only lock one university
- Foreign key to `users(id)` with CASCADE delete
- Foreign key to `universities(id)` with RESTRICT delete

---

## Features

### ✅ Duplicate Prevention
- Unique constraint on `(user_id, university_id)` in shortlist table
- `isShortlisted()` check before adding
- Returns `409 Conflict` if duplicate attempt

### ✅ Data Integrity
- Foreign keys ensure referenced universities exist
- CASCADE delete removes shortlist entries when user is deleted
- RESTRICT delete prevents university deletion if locked by user

### ✅ User Isolation
- All endpoints authenticated (JWT required)
- Users only see their own shortlist and locked university
- `req.user.id` from JWT token ensures isolation

### ✅ Complete University Data
- Returns full university details (name, country, program, costs, stats, tags, etc.)
- Includes calculated fields (acceptance rate, GPA, exam scores)
- Website and description for user research

---

## Error Handling

| Status | Scenario | Response |
|--------|----------|----------|
| 201 | University successfully added | success: true |
| 200 | University removed / Shortlist retrieved | success: true |
| 400 | Invalid input (bad university ID) | Invalid university ID |
| 401 | Missing/invalid authentication token | Unauthorized |
| 404 | University not found / Not in shortlist | Not found |
| 409 | Duplicate shortlist entry | Already shortlisted |
| 500 | Database error | Internal server error |

---

## Usage Examples

### Add Universities to Shortlist
```javascript
// JavaScript/Fetch
const token = localStorage.getItem('token');

async function addToShortlist(universityId) {
  const response = await fetch(`/api/shortlist/${universityId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Added to shortlist:', data.data);
  } else {
    console.error('Error:', data.message);
  }
}

// Usage
addToShortlist(3); // Add MIT
addToShortlist(1); // Add Harvard
```

### Get User's Shortlist
```javascript
async function getMyShortlist() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/shortlist/mine', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Shortlist:', data.data.shortlist);
    console.log('Locked university:', data.data.lockedUniversity);
    console.log('Count:', data.data.shortlistCount);
  }
}
```

### Remove from Shortlist
```javascript
async function removeFromShortlist(universityId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/shortlist/${universityId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Removed from shortlist');
  } else {
    console.error('Error:', data.message);
  }
}
```

---

## Integration Notes

### Frontend Integration
1. Use JWT token from `/api/auth/login`
2. Store token in localStorage or session
3. Attach token to all shortlist API requests
4. Handle 401 errors by redirecting to login
5. Display shortlist count and locked university in UI

### Backend Integration
1. Migration `06-create-shortlist-tables.sql` creates required tables
2. Model functions in `shortlistModel.js` handle all database operations
3. Controller functions in `shortlistController.js` handle HTTP logic
4. Routes in `shortlistRoutes.js` define endpoints
5. Integrated into `app.js` via `/api/shortlist` prefix

### Testing with cURL
```bash
# 1. Get auth token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Add to shortlist
curl -X POST http://localhost:5000/api/shortlist/3 \
  -H "Authorization: Bearer $TOKEN"

# 3. Get shortlist
curl -X GET http://localhost:5000/api/shortlist/mine \
  -H "Authorization: Bearer $TOKEN"

# 4. Remove from shortlist
curl -X DELETE http://localhost:5000/api/shortlist/3 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Performance Considerations

- Shortlist is indexed on `user_id` for fast user lookups
- Locked university has unique constraint on `user_id` for fast retrieval
- Full university details included in response (denormalized query)
- No pagination needed (typical shortlist is 5-15 items)

---

## Version
- **Version:** 1.0.0
- **Created:** January 27, 2026
- **Status:** Production Ready
