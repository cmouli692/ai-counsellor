# Stage Engine API Documentation

## Overview

Strict stage engine that tracks user progression through 4 distinct stages:

1. **Stage 1: Onboarding** - Profile incomplete
2. **Stage 2: Onboarding Complete** - Profile done, shortlist empty
3. **Stage 3: Shortlist Created** - Shortlist has items, not locked
4. **Stage 4: University Locked** - Final university choice locked

---

## 🎯 Stages Explained

### Stage 1: Onboarding
**Condition:** `profileCompleted = false`

**What's Available:**
- ❌ AI Counsellor
- ❌ University Discovery
- ❌ Shortlist
- ❌ Applications

**Next Step:** "Fill out your academic background, interests, and goals"

**Endpoint Response:**
```json
{
  "stageNumber": 1,
  "stageLabel": "Onboarding",
  "description": "Complete your profile to get started",
  "nextStep": "Fill out your academic background, interests, and goals",
  "isComplete": false
}
```

---

### Stage 2: Onboarding Complete
**Condition:** `profileCompleted = true AND shortlist.count = 0`

**What's Available:**
- ✅ AI Counsellor
- ✅ University Discovery
- ❌ Shortlist Management
- ❌ Applications

**Next Step:** "Explore universities and build your shortlist"

**Endpoint Response:**
```json
{
  "stageNumber": 2,
  "stageLabel": "Onboarding Complete",
  "description": "Your profile is complete and ready for university discovery",
  "nextStep": "Explore universities and build your shortlist",
  "isComplete": false
}
```

---

### Stage 3: Shortlist Created
**Condition:** `profileCompleted = true AND shortlist.count >= 1 AND locked.count = 0`

**What's Available:**
- ✅ AI Counsellor
- ✅ University Discovery
- ✅ Shortlist Management
- ❌ Applications

**Next Step:** "Compare universities and lock your final choice"

**Endpoint Response:**
```json
{
  "stageNumber": 3,
  "stageLabel": "Shortlist Created",
  "description": "You have added universities to your shortlist",
  "nextStep": "Compare universities and lock your final choice",
  "isComplete": false
}
```

---

### Stage 4: University Locked
**Condition:** `profileCompleted = true AND locked.count >= 1`

**What's Available:**
- ✅ AI Counsellor
- ✅ University Discovery
- ✅ Shortlist Management
- ✅ Applications

**Next Step:** "View your locked university and complete applications"

**Endpoint Response:**
```json
{
  "stageNumber": 4,
  "stageLabel": "University Locked",
  "description": "You have locked in your university choice",
  "nextStep": "View your locked university and complete applications",
  "isComplete": true
}
```

---

## 📍 Endpoints

### 1. GET /api/stage
Get current user's stage.

**Request:**
```http
GET /api/stage
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Stage retrieved successfully",
  "stage": {
    "stageNumber": 2,
    "stageLabel": "Onboarding Complete",
    "description": "Your profile is complete and ready for university discovery",
    "nextStep": "Explore universities and build your shortlist",
    "isComplete": false,
    "gateFeatures": {
      "onboarding": true,
      "counsellor": true,
      "universities": true,
      "shortlist": false,
      "lockedUniversity": false,
      "applications": false
    },
    "data": {
      "profileCompleted": true,
      "shortlistCount": 0,
      "lockedCount": 0
    }
  }
}
```

---

### 2. GET /api/stage/all
Get all stage definitions (public endpoint).

**Request:**
```http
GET /api/stage/all
```

**Response (200 OK):**
```json
{
  "message": "All stages retrieved successfully",
  "stages": [
    {
      "stageNumber": 1,
      "stageLabel": "Onboarding",
      "description": "Complete your profile to get started",
      "requirements": [],
      "nextStep": "Fill out your academic background, interests, and goals"
    },
    {
      "stageNumber": 2,
      "stageLabel": "Onboarding Complete",
      "description": "Your profile is complete and ready for university discovery",
      "requirements": ["profileCompleted = true"],
      "nextStep": "Explore universities and build your shortlist"
    },
    {
      "stageNumber": 3,
      "stageLabel": "Shortlist Created",
      "description": "You have added universities to your shortlist",
      "requirements": ["profileCompleted = true", "shortlist.count >= 1"],
      "nextStep": "Compare universities and lock your final choice"
    },
    {
      "stageNumber": 4,
      "stageLabel": "University Locked",
      "description": "You have locked in your university choice",
      "requirements": ["profileCompleted = true", "locked_university.count >= 1"],
      "nextStep": "View your locked university and complete applications"
    }
  ],
  "total": 4
}
```

---

### 3. GET /api/stage/progress
Get detailed user progress.

**Request:**
```http
GET /api/stage/progress
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Progress retrieved successfully",
  "progress": {
    "currentStage": 3,
    "stageLabel": "Shortlist Created",
    "progressPercentage": 75,
    "completionStatus": {
      "onboardingComplete": true,
      "shortlistCreated": true,
      "universityLocked": false
    },
    "details": {
      "profile": {
        "name": "Raj Patel",
        "grade": "12th",
        "stream": "Science",
        "completedAt": "2026-01-26T10:35:00Z"
      },
      "shortlist": {
        "count": 5
      },
      "lockedUniversity": null
    },
    "nextStep": "Compare universities and lock your final choice",
    "isComplete": false
  }
}
```

---

### 4. GET /api/stage/gates
Get available features based on current stage.

**Request:**
```http
GET /api/stage/gates
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Feature gates retrieved successfully",
  "stageNumber": 2,
  "stageLabel": "Onboarding Complete",
  "features": {
    "onboarding": {
      "available": true,
      "description": "Complete your profile with academic details and goals"
    },
    "counsellor": {
      "available": true,
      "description": "Get AI-powered counselling and recommendations"
    },
    "universities": {
      "available": true,
      "description": "Search and explore universities"
    },
    "shortlist": {
      "available": false,
      "description": "Save universities to your shortlist"
    },
    "lockedUniversity": {
      "available": false,
      "description": "Lock in your final university choice"
    },
    "applications": {
      "available": false,
      "description": "Submit applications to your locked university"
    }
  }
}
```

---

## 🧪 Testing with cURL

### Test: Get Current Stage (Stage 2)
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:**
- stageNumber: 2
- stageLabel: "Onboarding Complete"
- profileCompleted: true
- shortlistCount: 0

---

### Test: Get All Stages (Public)
```bash
curl -X GET http://localhost:5000/api/stage/all \
  -H "Content-Type: application/json"
```

**Expected:** Array of 4 stage definitions

---

### Test: Get Progress with Shortlist (Stage 3)
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Add items to shortlist first, then:
curl -X GET http://localhost:5000/api/stage/progress \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- stageNumber: 3
- progressPercentage: 75
- shortlistCreated: true
- universityLocked: false

---

### Test: Get Feature Gates (Stage 4)
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Lock a university first, then:
curl -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- applications.available: true
- All other features: true

---

## 🔄 Stage Transitions

### Progression Flow

```
Stage 1
├─ User fills out profile (name, grade, stream, interests, budget, exam_readiness)
├─ System marks profile_completed = true
└─ Auto-transitions to Stage 2
   
Stage 2
├─ User explores universities (GET /api/universities)
├─ User adds universities to shortlist (POST /api/shortlist)
├─ System counts shortlist items
└─ Auto-transitions to Stage 3 when shortlist.count >= 1
   
Stage 3
├─ User compares universities
├─ User locks final choice (POST /api/locked-university)
├─ System counts locked universities
└─ Auto-transitions to Stage 4 when locked.count >= 1
   
Stage 4
├─ User views locked university
├─ User completes applications
└─ Journey complete (isComplete = true)
```

### Automatic Transitions
- ✅ Stage 1 → 2: Automatic when profile_completed = true
- ✅ Stage 2 → 3: Automatic when shortlist.count >= 1
- ✅ Stage 3 → 4: Automatic when locked_university.count >= 1

### Backward Compatibility
- If user removes all shortlist items: Stage 3 → 2
- If user unlocks choice: Stage 4 → 3
- Profile completion never reverts: Stage 2+ never goes back to Stage 1

---

## 🔐 Authorization

All endpoints except `/api/stage/all` require JWT authentication:

```http
Authorization: Bearer <token>
```

Token must be obtained from `/api/auth/signup` or `/api/auth/login`.

---

## 📊 Feature Gating by Stage

| Feature | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
|---------|---------|---------|---------|---------|
| Onboarding | ❌ | ✅ | ✅ | ✅ |
| AI Counsellor | ❌ | ✅ | ✅ | ✅ |
| University Discovery | ❌ | ✅ | ✅ | ✅ |
| Shortlist | ❌ | ❌ | ✅ | ✅ |
| Lock University | ❌ | ❌ | ✅ | ✅ |
| Applications | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Frontend Integration

### Check Stage on App Load
```javascript
async function initializeApp() {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:5000/api/stage', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { stage } = await response.json();
  
  // Route based on stage
  if (stage.stageNumber === 1) {
    navigate('/onboarding');
  } else if (stage.stageNumber === 2) {
    navigate('/universities');
  } else if (stage.stageNumber === 3) {
    navigate('/shortlist');
  } else if (stage.stageNumber === 4) {
    navigate('/applications');
  }
}
```

### Gate Features
```javascript
async function checkFeatureAccess(feature) {
  const response = await fetch('http://localhost:5000/api/stage/gates', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { features } = await response.json();
  
  return features[feature]?.available || false;
}

// Usage
if (await checkFeatureAccess('universities')) {
  showUniversitiesPage();
} else {
  showMessage('Complete onboarding first');
}
```

### Display Progress
```javascript
async function displayProgress() {
  const response = await fetch('http://localhost:5000/api/stage/progress', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { progress } = await response.json();
  
  console.log(`Progress: ${progress.progressPercentage}%`);
  console.log(`Next step: ${progress.nextStep}`);
}
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "error": "Missing authorization header",
  "message": "Authorization header is required"
}
```

### 500 Server Error
```json
{
  "error": "Server Error",
  "message": "Failed to retrieve stage information"
}
```

---

## 📈 Stage Statistics

### Example Queries
```sql
-- Count users by stage
SELECT 
  CASE 
    WHEN profile_completed = false THEN 1
    WHEN (SELECT COUNT(*) FROM shortlist s WHERE s.user_id = u.id) = 0 THEN 2
    WHEN (SELECT COUNT(*) FROM locked_university lu WHERE lu.user_id = u.id) = 0 THEN 3
    ELSE 4
  END as stage,
  COUNT(*) as users
FROM users u
GROUP BY stage;

-- Average days to reach Stage 3
SELECT AVG(EXTRACT(DAY FROM (NOW() - s.created_at))) as avg_days_to_stage3
FROM shortlist s
GROUP BY s.user_id;
```

---

## 🔄 State Machine Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Stage 1: Onboarding                    │
│            profile_completed = false                        │
│  Available: Onboarding form                                 │
│  Progress: 0/4 (0%)                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ Complete profile
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Stage 2: Onboarding Complete                      │
│         profile_completed = true                            │
│         shortlist.count = 0                                 │
│  Available: Counsellor, Universities                        │
│  Progress: 1/4 (25%)                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ Add to shortlist
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Stage 3: Shortlist Created                        │
│         profile_completed = true                            │
│         shortlist.count >= 1                                │
│         locked.count = 0                                    │
│  Available: Counsellor, Universities, Shortlist             │
│  Progress: 2/4 (50%)                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ Lock university
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          Stage 4: University Locked                         │
│         locked.count >= 1                                   │
│  Available: All features + Applications                     │
│  Progress: 4/4 (100%)                                       │
│  isComplete: true                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Related Endpoints

- `POST /api/auth/signup` - Create account
- `GET /api/auth/me` - Get authenticated user
- `POST /api/profile` - Complete onboarding (Stage 1→2)
- `GET /api/universities` - Explore universities (Stage 2+)
- `POST /api/shortlist` - Add to shortlist (Stage 2→3)
- `POST /api/locked-university` - Lock choice (Stage 3→4)
- `GET /api/applications` - View applications (Stage 4)

---

## 🎓 Learning Path

1. **Understand Stages:** Read this document
2. **Test Stage Endpoints:** Use cURL examples
3. **Implement Frontend:** Follow integration examples
4. **Deploy:** Use stage engine for feature gating
5. **Monitor:** Track user progression through stages

---

**Last Updated:** January 27, 2026  
**Status:** ✅ Complete & Production Ready
