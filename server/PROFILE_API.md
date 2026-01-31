# Profile/Onboarding API Documentation

## Overview

Complete profile management system for user onboarding. Captures academic background, goals, budget, and exam readiness.

---

## 🔐 Endpoints

### 1. GET /api/profile/me
Get current user's profile with completion status.

**Request:**
```http
GET /api/profile/me
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK) - Profile Complete:**
```json
{
  "message": "Profile retrieved successfully",
  "profileCompleted": true,
  "profile": {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI", "Engineering", "Robotics"],
    "career_aspirations": "Data Scientist at Google working on AI research",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared",
    "created_at": "2026-01-26T10:35:00Z",
    "updated_at": "2026-01-26T10:35:00Z"
  }
}
```

**Response (200 OK) - Profile Incomplete:**
```json
{
  "message": "Profile retrieved successfully",
  "profileCompleted": false,
  "profile": null
}
```

**Error Responses:**

401 - Missing Authorization:
```json
{
  "error": "Missing authorization header",
  "message": "Authorization header is required"
}
```

---

### 2. POST /api/profile
Create or update user profile (onboarding).

**Request:**
```http
POST /api/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Raj Patel",
  "grade": "12th",
  "stream": "Science",
  "interests": ["AI", "Engineering", "Robotics"],
  "career_aspirations": "I want to become a Data Scientist at Google working on AI research and making a global impact",
  "budget_range": "50L-1Cr",
  "exam_readiness": "Prepared"
}
```

**Response (201 Created) - First Time:**
```json
{
  "message": "Profile created successfully",
  "profileCompleted": true,
  "profile": {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI", "Engineering", "Robotics"],
    "career_aspirations": "I want to become a Data Scientist at Google working on AI research and making a global impact",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared",
    "created_at": "2026-01-26T10:35:00Z",
    "updated_at": "2026-01-26T10:35:00Z"
  }
}
```

**Response (201 Created) - Update Existing:**
```json
{
  "message": "Profile updated successfully",
  "profileCompleted": true,
  "profile": {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Raj Patel",
    "grade": "11th",
    "stream": "Science",
    "interests": ["AI", "Engineering", "Robotics", "Data Science"],
    "career_aspirations": "Updated career aspiration",
    "budget_range": "1Cr-2Cr",
    "exam_readiness": "Preparing",
    "created_at": "2026-01-26T10:35:00Z",
    "updated_at": "2026-01-26T10:40:00Z"
  }
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "error": "Validation Error",
  "message": "Profile data validation failed",
  "details": [
    "name: Must be 2-255 characters",
    "grade: Required, must be one of: 10th, 11th, 12th, Undergrad, Postgrad",
    "interests: Must have at least 1 interest"
  ]
}
```

---

## 📋 Field Specifications

### name
- **Type:** String
- **Required:** Yes
- **Length:** 2-255 characters
- **Example:** "Raj Patel"

### grade
- **Type:** String (Enum)
- **Required:** Yes
- **Valid Values:** `10th`, `11th`, `12th`, `Undergrad`, `Postgrad`
- **Example:** "12th"

### stream
- **Type:** String (Enum)
- **Required:** Yes
- **Valid Values:** `Science`, `Commerce`, `Arts`, `Engineering`
- **Example:** "Science"

### interests
- **Type:** Array of Strings
- **Required:** Yes
- **Min Items:** 1
- **Max Items:** 10
- **Valid Values:** 
  - `AI`, `Engineering`, `Business`, `Medicine`, `Law`
  - `Arts`, `Sciences`, `Technology`, `Finance`, `Management`
  - `Psychology`, `Biology`, `Physics`, `Chemistry`, `Mathematics`
  - `History`, `Economics`, `Literature`
- **Example:** `["AI", "Engineering", "Robotics"]`

### career_aspirations
- **Type:** String
- **Required:** Yes
- **Length:** 10-500 characters
- **Description:** User's career goals and aspirations
- **Example:** "I want to become a Data Scientist at Google working on AI research"

### budget_range
- **Type:** String (Enum)
- **Required:** Yes
- **Valid Values:**
  - `<25L` - Less than 25 Lakhs
  - `25L-50L` - 25-50 Lakhs
  - `50L-1Cr` - 50 Lakhs to 1 Crore
  - `1Cr-2Cr` - 1-2 Crore
  - `>2Cr` - More than 2 Crore
  - `Not Specified`
- **Example:** "50L-1Cr"

### exam_readiness
- **Type:** String (Enum)
- **Required:** Yes
- **Valid Values:** 
  - `Prepared`
  - `Preparing`
  - `Not Prepared`
- **Example:** "Prepared"

---

## ✅ Validation Rules

| Field | Rules | Error |
|-------|-------|-------|
| name | 2-255 chars | "Must be 2-255 characters" |
| grade | One of enum | "Must be one of: ..." |
| stream | One of enum | "Must be one of: ..." |
| interests | Array, 1-10 items | "Must have at least 1 interest" |
| interests | Valid values only | "Invalid interests - ..." |
| career_aspirations | 10-500 chars | "Must be 10-500 characters" |
| budget_range | One of enum | "Must be one of: ..." |
| exam_readiness | One of enum | "Must be 'Prepared', 'Preparing', or 'Not Prepared'" |

---

## 🧪 Testing with cURL

### Test: Get Profile (Before Onboarding)
```bash
# Get token from login first
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:** `profileCompleted: false, profile: null`

---

### Test: Create Profile
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI", "Engineering", "Robotics"],
    "career_aspirations": "I want to become a Data Scientist at Google working on AI research",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Response:** Status 201, `profileCompleted: true`

---

### Test: Get Profile (After Onboarding)
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** `profileCompleted: true, profile: {...}`

---

### Test: Update Profile
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "11th",
    "stream": "Science",
    "interests": ["AI", "Engineering", "Robotics", "Data Science"],
    "career_aspirations": "Updated aspiration text",
    "budget_range": "1Cr-2Cr",
    "exam_readiness": "Preparing"
  }'
```

**Expected Response:** Status 201, `message: "Profile updated successfully"`

---

### Test: Validation Error
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "grade": "InvalidGrade",
    "stream": "Science",
    "interests": [],
    "career_aspirations": "short",
    "budget_range": "InvalidBudget",
    "exam_readiness": "Invalid"
  }'
```

**Expected Response:** Status 400, detailed validation errors

---

## 🔗 Complete User Flow

### Signup → Onboarding → Dashboard

```
1. User Signs Up
   POST /api/auth/signup
   ↓ Returns: {token, user}

2. Frontend Stores Token
   localStorage.setItem('token', token)

3. Check Profile Completion
   GET /api/profile/me
   ↓ If profileCompleted = false → Show Onboarding Form

4. User Fills Onboarding Form
   ↓ Frontend captures fields:
     - name, grade, stream, interests
     - career_aspirations, budget_range, exam_readiness

5. Submit Onboarding
   POST /api/profile
   ↓ Backend validates all fields
   ↓ Stores in profile table
   ↓ Returns: {profileCompleted: true, profile}

6. Frontend Check
   if (profileCompleted) {
     redirect('/dashboard')
   }

7. Dashboard
   Can now access:
   - AI Counsellor
   - University Discovery
   - Applications
```

---

## 💾 Database Schema

```sql
CREATE TABLE profile (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  name VARCHAR(255),
  grade VARCHAR(50),
  stream VARCHAR(100),
  interests TEXT[],
  career_aspirations TEXT,
  budget_range VARCHAR(50),        -- NEW
  exam_readiness VARCHAR(100),     -- NEW
  profile_completed BOOLEAN,       -- NEW
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  CONSTRAINT fk_profile_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_profile_completed ON profile(profile_completed);
```

---

## 🚀 Frontend Integration

### React Example

```javascript
// Signup
async function handleSignup(formData) {
  const response = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

// Check Profile
async function checkProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/profile/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.profileCompleted;
}

// Create Profile
async function submitOnboarding(formData) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  return data;
}

// Gate Logic
function ProtectedRoute({ children }) {
  const [isProfileComplete, setIsProfileComplete] = useState(null);

  useEffect(() => {
    checkProfile().then(completed => {
      setIsProfileComplete(completed);
      if (!completed) {
        navigate('/onboarding');
      }
    });
  }, []);

  return isProfileComplete ? children : <Onboarding />;
}
```

---

## ⚠️ Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | GET successful |
| 201 | Created | POST successful (create or update) |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 409 | Conflict | Profile already exists (shouldn't happen) |
| 500 | Server Error | Database/server error |

---

## 📊 profileCompleted Logic

Profile is marked complete when ALL fields are present:
- ✅ name
- ✅ grade
- ✅ stream
- ✅ interests (non-empty array)
- ✅ career_aspirations
- ✅ budget_range
- ✅ exam_readiness

If any field is missing → `profileCompleted: false`

---

## 🔄 Update Behavior

- **First POST:** Creates new profile
- **Subsequent POST:** Updates existing profile
- **GET /me:** Returns completion status based on field presence

---

## 📝 Error Handling

### Validation Errors (400)
All validation errors returned together:
```json
{
  "error": "Validation Error",
  "details": ["error1", "error2", "error3"]
}
```

### Authorization Errors (401)
```json
{
  "error": "Unauthorized",
  "message": "User not found in token"
}
```

### Server Errors (500)
```json
{
  "error": "Server Error",
  "message": "Failed to create/update profile"
}
```

---

## 🎯 Use Cases

### UC1: New User Onboarding
```
POST /api/auth/signup
→ GET /api/profile/me (returns null)
→ Show onboarding form
→ POST /api/profile (with all data)
→ GET /api/profile/me (returns complete profile)
→ Redirect to dashboard
```

### UC2: User Editing Profile
```
GET /api/profile/me
→ Show edit form with existing data
→ User modifies some fields
→ POST /api/profile (with updated data)
→ Backend validates and updates
→ Return updated profile
```

### UC3: Check Profile Before Access
```
GET /api/profile/me
if (!profileCompleted) {
  redirect to onboarding
}
```

---

## 🔐 Security

- ✅ All endpoints require JWT authentication
- ✅ Only authenticated user can access their profile
- ✅ Input validation on all fields
- ✅ SQL injection protection (parameterized queries)
- ✅ User can only modify their own profile

---

**Last Updated:** January 26, 2026  
**Status:** ✅ Complete & Ready for Integration
