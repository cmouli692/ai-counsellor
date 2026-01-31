# 🔒 Lock API - University Locking System

## Overview

The Lock API implements a mandatory university locking system that enforces a crucial business rule: **Users must lock one university before proceeding to the applications stage**.

This system prevents users from applying without making a committed choice, ensuring data integrity and user decision quality.

---

## 🎯 Key Features

### 1. One Lock Per User
- Each user can lock **exactly one university** at any time
- Locking a new university automatically replaces the previous lock
- No manual deletion step needed

### 2. Shortlist Prerequisite
- **University must be in user's shortlist** before locking
- Prevents locking random universities
- Encourages deliberate decision-making

### 3. Applications Gate
- **Applications stage is blocked** unless user has ≥ 1 locked university
- Validation endpoint checks access eligibility
- Clear error messages guide users

### 4. Unlock Warning System
- Unlocking displays explicit warning about consequences
- Warning message: "Unlocking your university selection. You can now lock a different university. Note: Any pending applications may be affected."
- Prevents accidental unlocks

---

## 📋 API Endpoints

### 1. POST /api/lock/:universityId

**Lock a university for applications**

#### Prerequisites
- ✓ Authentication required (Bearer token)
- ✓ University must exist
- ✓ University must be in user's shortlist
- ✓ One per user (replaces existing lock)

#### Request
```bash
curl -X POST http://localhost:5000/api/lock/3 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "University locked successfully",
  "data": {
    "id": 5,
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "universityId": 3,
    "lockedAt": "2026-01-27T10:30:00.000Z"
  }
}
```

#### Error Responses

**400 - Invalid University ID**
```json
{
  "success": false,
  "error": "Invalid university ID",
  "message": "University ID must be a valid number"
}
```

**404 - University Not Found**
```json
{
  "success": false,
  "error": "University not found",
  "message": "The specified university does not exist"
}
```

**404 - University Not in Shortlist**
```json
{
  "success": false,
  "error": "University not in shortlist",
  "message": "You must add the university to your shortlist before locking it"
}
```

**401 - Missing Authentication**
```json
{
  "error": "Missing authorization header",
  "message": "Authorization header is required"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | University locked successfully |
| 400 | Invalid university ID |
| 401 | Missing/invalid authentication |
| 404 | University not found or not in shortlist |
| 500 | Server error |

---

### 2. POST /api/lock/unlock

**Unlock the currently locked university**

#### Prerequisites
- ✓ Authentication required (Bearer token)
- ✓ Must have a locked university

#### Request
```bash
curl -X POST http://localhost:5000/api/lock/unlock \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "University unlocked successfully",
  "warning": "Unlocking your university selection. You can now lock a different university. Note: Any pending applications may be affected.",
  "data": {
    "previouslyLockedUniversity": {
      "id": 3,
      "name": "Harvard University",
      "country": "USA",
      "city": "Cambridge"
    },
    "unlockedAt": "2026-01-27T10:35:00.000Z",
    "nextSteps": "You can now lock a different university, or proceed without a lock"
  }
}
```

#### Error Responses

**404 - No Locked University**
```json
{
  "success": false,
  "error": "No locked university",
  "message": "You do not currently have a locked university"
}
```

**401 - Missing Authentication**
```json
{
  "error": "Missing authorization header",
  "message": "Authorization header is required"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | University unlocked successfully |
| 401 | Missing/invalid authentication |
| 404 | No locked university found |
| 500 | Server error |

---

### 3. GET /api/lock/status

**Get current lock status with locked university details**

#### Prerequisites
- ✓ Authentication required (Bearer token)

#### Request
```bash
curl -X GET http://localhost:5000/api/lock/status \
  -H "Authorization: Bearer <jwt_token>"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Lock status retrieved",
  "data": {
    "isLocked": true,
    "lockedUniversity": {
      "id": 3,
      "name": "Harvard University",
      "country": "USA",
      "city": "Cambridge",
      "rank": 1,
      "fees": 75000,
      "lockedAt": "2026-01-27T10:30:00.000Z"
    }
  }
}
```

#### Response When Not Locked
```json
{
  "success": true,
  "message": "Lock status retrieved",
  "data": {
    "isLocked": false,
    "lockedUniversity": null
  }
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Status retrieved successfully |
| 401 | Missing/invalid authentication |
| 500 | Server error |

---

### 4. GET /api/lock/validate-applications

**Validate if user can access applications stage**

#### Prerequisites
- ✓ Authentication required (Bearer token)
- ✓ Must have at least 1 locked university

#### Request
```bash
curl -X GET http://localhost:5000/api/lock/validate-applications \
  -H "Authorization: Bearer <jwt_token>"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User has locked a university. Applications stage is available.",
  "data": {
    "canAccessApplications": true,
    "lockedUniversities": 1
  }
}
```

#### Blocked Response (403 Forbidden)
```json
{
  "success": false,
  "error": "Applications locked",
  "message": "User must lock a university before accessing applications.",
  "data": {
    "canAccessApplications": false,
    "requiredLockedUniversities": 1,
    "currentLockedUniversities": 0
  }
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | User can access applications |
| 401 | Missing/invalid authentication |
| 403 | User cannot access applications (no lock) |
| 500 | Server error |

---

## 🔑 Authentication

All endpoints require JWT authentication via the Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Token Format:** Standard Bearer token from `/api/auth/login`

**User Identification:** Token payload contains `user_id` used to isolate user data

---

## 💾 Database Schema

### locked_university Table

```sql
CREATE TABLE locked_university (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  university_id INTEGER NOT NULL,
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_locked_university_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_locked_university_ref FOREIGN KEY (university_id) 
    REFERENCES universities(id) ON DELETE RESTRICT
);

CREATE INDEX idx_locked_university_user_id ON locked_university(user_id);
CREATE INDEX idx_locked_university_locked_at ON locked_university(locked_at);
```

**Key Constraints:**
- `UNIQUE(user_id)` - Enforces one lock per user
- `ON DELETE CASCADE` for user - Removes lock when user deleted
- `ON DELETE RESTRICT` for university - Prevents deleting locked universities

---

## 🔗 Related Tables

### Dependencies

The locking system depends on these existing tables:

#### users Table
```sql
id UUID PRIMARY KEY
-- User identification for lock ownership
```

#### universities Table
```sql
id SERIAL PRIMARY KEY
-- University references in locks
```

#### shortlist Table
```sql
id SERIAL PRIMARY KEY
user_id UUID
university_id INTEGER
UNIQUE(user_id, university_id)
-- Prerequisite for locking (must be shortlisted first)
```

---

## 📊 Data Flow

### User Journey

```
1. User Logs In
   ↓
2. User Creates Profile
   ↓
3. User Shortlists Universities
   ↓
4. User Locks One University ← [THIS SYSTEM]
   ↓
5. User Can Access Applications Stage
   ↓
6. User Creates Applications
```

### Lock Lifecycle

```
Initial State: No Lock
    ↓
Lock University → Locked State
    ↓
├─ Change Lock → (Replaces Existing Lock)
├─ Unlock → No Lock State
└─ Leave As Is → Locked State
```

---

## 🛡️ Security Features

### User Isolation
- All operations filtered by `req.user.id` from JWT token
- Users cannot access/modify other users' locks
- Database constraints enforce isolation

### Input Validation
- University ID must be integer
- University must exist in database
- University must be in user's shortlist
- Parameter type checking before database queries

### SQL Injection Prevention
- Parameterized queries throughout
- No string concatenation in SQL
- Safe against malicious input

### Authentication Enforcement
- All endpoints protected by authenticate middleware
- Missing/invalid token returns 401
- Token verification before processing

---

## 🚀 Usage Examples

### Complete Workflow

**1. User shortlists universities**
```bash
# Add to shortlist
curl -X POST http://localhost:5000/api/shortlist/3 \
  -H "Authorization: Bearer <token>"
```

**2. User locks one university**
```bash
# Lock the shortlisted university
curl -X POST http://localhost:5000/api/lock/3 \
  -H "Authorization: Bearer <token>"
```

**3. Check lock status**
```bash
# Get current lock
curl -X GET http://localhost:5000/api/lock/status \
  -H "Authorization: Bearer <token>"
```

**4. Verify applications access**
```bash
# Check if can access applications
curl -X GET http://localhost:5000/api/lock/validate-applications \
  -H "Authorization: Bearer <token>"
```

**5. Change lock (replace)**
```bash
# Lock a different university (automatically replaces old lock)
curl -X POST http://localhost:5000/api/lock/5 \
  -H "Authorization: Bearer <token>"
```

**6. Unlock (if needed)**
```bash
# Unlock the current selection
curl -X POST http://localhost:5000/api/lock/unlock \
  -H "Authorization: Bearer <token>"
```

---

## 📱 Frontend Integration

### React Example

```javascript
// Login
const { data: loginData } = await axios.post('/api/auth/login', {
  email, password
});
const token = loginData.token;

// Shortlist universities
await axios.post('/api/shortlist/3', {}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Lock a university
await axios.post('/api/lock/3', {}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Check if can access applications
try {
  await axios.get('/api/lock/validate-applications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // User can access applications
  navigateTo('/applications');
} catch (error) {
  if (error.response?.status === 403) {
    // User cannot access - must lock first
    showMessage('Please lock a university first');
  }
}

// Change lock
await axios.post('/api/lock/5', {}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Unlock
await axios.post('/api/lock/unlock', {}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## ⚠️ Error Handling Guide

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "University ID must be a valid number" | Non-numeric ID in URL | Check ID parameter format |
| "University not found" | ID doesn't exist in database | Verify university exists |
| "Not in shortlist" | Trying to lock unlisted university | Add to shortlist first |
| "No locked university" | Trying to unlock when none locked | Check lock status first |
| "Missing auth" | No Authorization header | Include Bearer token |
| "Invalid token" | Expired or malformed token | Get new token from login |

---

## 🧪 Testing

### Test Suite Location
`scripts/testLockAPI.js`

### Run Tests
```bash
npm run test:lock
# or
node scripts/testLockAPI.js
```

### Test Coverage
- ✓ Lock university (valid)
- ✓ Lock university (not in shortlist)
- ✓ Lock university (invalid ID)
- ✓ Replace existing lock
- ✓ Get lock status
- ✓ Unlock with warning
- ✓ Validate applications (with lock)
- ✓ Validate applications (no lock)
- ✓ Error handling (400, 403, 404, 401)

---

## 📈 Performance

### Database Indexes
```
idx_locked_university_user_id      - Fast user lookups
idx_locked_university_locked_at     - Fast chronological queries
```

### Query Performance
- Lock operations: O(1) - Direct UNIQUE constraint lookup
- Status check: O(1) - Index-based lookup
- All queries use indexes for optimal performance

### Load Capacity
- Supports millions of users
- Each user = 1 lock maximum (minimal storage)
- No N+1 query problems (explicit joins)

---

## 🔄 State Transitions

```
Initial (No Lock)
├─ Lock(X) ──→ Locked(X)
└─ Validate ──→ 403 Forbidden

Locked(X)
├─ Lock(Y) ──→ Locked(Y)  [Replace]
├─ Unlock() ──→ No Lock   [Show Warning]
├─ Validate ──→ 200 OK    [Allow Access]
└─ Status ──→ Return Details

No Lock (After Unlock)
├─ Lock(X) ──→ Locked(X)  [Re-lock]
├─ Validate ──→ 403 Forbidden
└─ Unlock() ──→ 404 Error [Nothing to Unlock]
```

---

## ✅ Compliance

### Requirements Met
- ✓ Only 1 locked university per user (UNIQUE constraint)
- ✓ Applications stage blocked unless locked (validation endpoint)
- ✓ Unlock warning system implemented
- ✓ Shortlist prerequisite enforced
- ✓ Full backend implementation (7 functions, 4 endpoints)
- ✓ Comprehensive error handling
- ✓ User isolation via JWT
- ✓ Production-ready code

---

## 📞 Support

For issues or questions:
1. Check error messages in API responses
2. Review test suite examples: `scripts/testLockAPI.js`
3. Check database constraints: `database/migrations/06-create-shortlist-tables.sql`
4. Review model functions: `src/models/lockModel.js`

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** January 27, 2026
