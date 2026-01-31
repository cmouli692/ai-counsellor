# Profile API Implementation Guide

## 📚 Overview

Complete guide for implementing, testing, and integrating the Profile/Onboarding API with the AI Counsellor backend.

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         API Routes Layer                │
│    src/routes/profileRoutes.js          │
│  (GET /me, POST /)                      │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     Controllers Layer                   │
│  src/controllers/profileController.js   │
│  (Business Logic, Validation)           │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│      Database Layer                     │
│  src/models/userModel.js                │
│  (SQL Queries, Data Access)             │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│      Database (PostgreSQL)              │
│  profile table with 9 columns           │
└─────────────────────────────────────────┘
```

---

## 📁 File Structure

```
server/
├── src/
│   ├── controllers/
│   │   ├── authController.js          (existing)
│   │   └── profileController.js       (NEW)
│   │
│   ├── routes/
│   │   ├── authRoutes.js              (existing)
│   │   └── profileRoutes.js           (NEW)
│   │
│   ├── models/
│   │   └── userModel.js               (extended with profile functions)
│   │
│   ├── middleware/
│   │   └── authenticate.js            (existing)
│   │
│   ├── utils/
│   │   └── auth.js                    (existing)
│   │
│   ├── db.js                          (existing)
│   └── app.js                         (updated to include profile routes)
│
├── migrations/
│   └── 001_add_profile_fields.sql     (NEW - schema updates)
│
├── PROFILE_API.md                     (NEW - endpoint documentation)
├── PROFILE_TESTS.md                   (NEW - test scenarios)
├── PROFILE_IMPLEMENTATION.md          (THIS FILE)
└── ...
```

---

## ✅ Setup Instructions

### Step 1: Run Database Migration

Execute the migration to add profile fields to the database:

**On Linux/Mac:**
```bash
cd server
psql -U postgres -d ai_counsellor < migrations/001_add_profile_fields.sql
```

**On Windows (CMD):**
```cmd
cd server
psql -U postgres -d ai_counsellor < migrations/001_add_profile_fields.sql
```

**Or Manually (if psql not available):**
1. Open pgAdmin or psql terminal
2. Connect to `ai_counsellor` database
3. Run queries from `migrations/001_add_profile_fields.sql`

**Verify Migration:**
```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profile';

-- Expected columns: id, user_id, name, grade, stream, interests, 
--                   career_aspirations, budget_range, exam_readiness, 
--                   profile_completed, created_at, updated_at
```

### Step 2: Verify Backend Files

Ensure these files exist:
- ✅ `src/controllers/profileController.js`
- ✅ `src/routes/profileRoutes.js`
- ✅ `src/models/userModel.js` (extended)
- ✅ `src/app.js` (updated)

### Step 3: Start Backend Server

```bash
cd server
node src/index.js
```

Expected output:
```
Server running on http://localhost:5000
PostgreSQL connected: ai_counsellor
```

### Step 4: Run Tests

See [PROFILE_TESTS.md](PROFILE_TESTS.md) for comprehensive test scenarios.

Quick smoke test:
```bash
# Signup
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Get empty profile
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer $TOKEN"

# Create profile
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","grade":"12th","stream":"Science","interests":["AI"],"career_aspirations":"I want to become a software engineer at Google","budget_range":"50L-1Cr","exam_readiness":"Prepared"}'
```

---

## 🔌 Integration Points

### With Frontend

The frontend needs to implement:

#### 1. Check Profile Completion After Login
```javascript
async function checkProfile() {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:5000/api/profile/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { profileCompleted } = await response.json();
  
  if (!profileCompleted) {
    redirect('/onboarding');
  } else {
    redirect('/dashboard');
  }
}
```

#### 2. Show Onboarding Form When Profile Incomplete
```javascript
function OnboardingPage() {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    stream: '',
    interests: [],
    career_aspirations: '',
    budget_range: '',
    exam_readiness: ''
  });
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.profileCompleted) {
      redirect('/dashboard');
    } else {
      setErrors(result.details || [result.message]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields matching API spec */}
    </form>
  );
}
```

#### 3. Protect Dashboard Routes
```javascript
function ProtectedRoute({ children }) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    checkProfile();
  }, []);

  async function checkProfile() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:5000/api/profile/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { profileCompleted } = await response.json();
    
    if (!profileCompleted) {
      redirect('/onboarding');
    } else {
      setIsComplete(true);
    }
  }

  return isComplete ? children : <LoadingSpinner />;
}
```

### With Other Backend Features

#### University Discovery (Next Phase)
```javascript
// GET /api/universities should require complete profile
async function getUniversities() {
  const token = localStorage.getItem('authToken');
  
  // Check profile first
  const profileResp = await fetch('/api/profile/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { profileCompleted } = await profileResp.json();
  
  if (!profileCompleted) {
    return { error: 'Complete profile first' };
  }
  
  // Then fetch universities
  const response = await fetch('/api/universities', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

#### AI Counsellor Chat (Next Phase)
```javascript
// POST /api/counsellor should require complete profile
async function startCounselling(message) {
  const token = localStorage.getItem('authToken');
  
  // Check profile first
  const profileResp = await fetch('/api/profile/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { profileCompleted, profile } = await profileResp.json();
  
  if (!profileCompleted) {
    return { error: 'Complete profile first' };
  }
  
  // Use profile data to enhance counselling
  const response = await fetch('/api/counsellor/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      userContext: {
        grade: profile.grade,
        stream: profile.stream,
        budget: profile.budget_range,
        interests: profile.interests
      }
    })
  });
  return response.json();
}
```

---

## 🐛 Troubleshooting

### Issue: Migration Fails

**Error:** `ERROR: relation "profile" does not exist`

**Solution:**
1. Ensure database schema is created: Run `schema.sql` first
2. Check database connection in `.env`
3. Manually verify table exists:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'profile';
   ```

---

### Issue: POST /api/profile Returns 409 Conflict

**Error:** `duplicate key value violates unique constraint "profile_user_id_key"`

**Solution:**
- User already has a profile
- This is expected - should use the same endpoint to update
- Check code to ensure we're handling 409 as update, not error

---

### Issue: Validation Errors Not Clear

**Error:** Received generic "Validation Error" without details

**Solution:**
1. Check response has `details` array
2. Verify all field names match exactly
3. Check field values against valid enums:
   - grade: 10th, 11th, 12th, Undergrad, Postgrad
   - stream: Science, Commerce, Arts, Engineering
   - budget_range: <25L, 25L-50L, 50L-1Cr, 1Cr-2Cr, >2Cr, Not Specified
   - exam_readiness: Prepared, Preparing, Not Prepared

---

### Issue: Token Not Found in Request

**Error:** `401 User not found in token`

**Solution:**
1. Ensure token is obtained from `/api/auth/signup` or `/api/auth/login`
2. Token format: `Bearer <token>` (case-sensitive)
3. Token expires after 7 days - re-login if needed
4. Verify JWT_SECRET in `.env` matches between requests

---

### Issue: CORS Error in Browser

**Error:** `Access to XMLHttpRequest from 'http://localhost:5173' blocked by CORS`

**Solution:**
1. Verify FRONTEND_URL in `.env`: Should be `http://localhost:5173`
2. Server has CORS enabled: Ensure `app.use(cors())` in app.js
3. Browser cache: Clear and try again
4. Try from incognito window

---

### Issue: Database Timestamps Wrong

**Error:** `created_at` and `updated_at` are NULL

**Solution:**
1. Database triggers should auto-set timestamps
2. If not: Manually set in controller
3. Check PostgreSQL timezone setting

---

## 🔍 Data Validation Deep Dive

### Validation Flow

```
1. Controller Receives Request
   ↓
2. Check All Fields Present & Valid
   - Collect ALL errors
   - Don't exit early
   ↓
3. If Errors Found
   - Return 400 with all errors
   - Don't touch database
   ↓
4. If Valid
   - Call Model Layer
   - Model does INSERT or UPDATE
   ↓
5. Return Success Response
```

### Validation Rules Implementation

Each field checked in `profileController.js`:

```javascript
const errors = [];

// name: 2-255 chars
if (!profileData.name || profileData.name.length < 2 || profileData.name.length > 255) {
  errors.push('name: Must be 2-255 characters');
}

// grade: enum
const validGrades = ['10th', '11th', '12th', 'Undergrad', 'Postgrad'];
if (!profileData.grade || !validGrades.includes(profileData.grade)) {
  errors.push('grade: Must be one of: 10th, 11th, 12th, Undergrad, Postgrad');
}

// ... etc for other fields

// Only proceed if no errors
if (errors.length > 0) {
  return res.status(400).json({
    error: 'Validation Error',
    message: 'Profile data validation failed',
    details: errors
  });
}
```

---

## 📊 Data Flow Diagrams

### Profile Creation Flow

```
┌─────────────────┐
│   User Signup   │
└────────┬────────┘
         │
         ▼
┌────────────────────────┐
│ POST /api/auth/signup  │
│ Returns: {token, user} │
└────────┬───────────────┘
         │ (store token)
         ▼
┌────────────────────────┐
│  GET /api/profile/me   │
│  Returns: {profile: null}
└────────┬───────────────┘
         │ (profileCompleted: false)
         ▼
┌────────────────────────┐
│ Show Onboarding Form   │
└────────┬───────────────┘
         │ (user fills form)
         ▼
┌────────────────────────┐
│ POST /api/profile      │
│ Validate All Fields    │
└────────┬───────────────┘
         │
    ┌────▼────┐
    │ Valid?  │
    └────┬────┘
         │
    ┌────┴──────────────┐
    │                   │
 No │                   │ Yes
    ▼                   ▼
┌────────┐        ┌──────────────────┐
│ 400    │        │ INSERT profile   │
│ Errors │        │ Set completed=true
└────────┘        └────────┬─────────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │ 201 Success         │
                  │ profile_completed=true
                  │ Return profile data │
                  └─────────────────────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │ Redirect /dashboard │
                  └─────────────────────┘
```

### Profile Completion Check

```
┌───────────────────────┐
│ Any Feature Request   │
│ (University, Counsellor)
└────────┬──────────────┘
         │
         ▼
┌───────────────────────────┐
│ Extract User from Token   │
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────────┐
│ Call getUserProfile()         │
└────────┬──────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check Profile Exists & Complete │
└────────┬────────────────────────┘
         │
    ┌────▼────────────────┐
    │                     │
 Yes│                     │ No
    ▼                     ▼
┌─────────────┐    ┌─────────────────┐
│ Proceed     │    │ 403 Forbidden   │
│ with Logic  │    │ "Complete       │
│             │    │ onboarding      │
│             │    │ first"          │
└─────────────┘    └─────────────────┘
```

---

## 🚀 Performance Considerations

### Query Optimization

1. **Index on profile_completed:**
   - Created in migration for fast gating checks
   - Query: `SELECT * FROM profile WHERE user_id = ? AND profile_completed = true`

2. **One profile per user (UNIQUE constraint):**
   - Prevents duplicate profiles
   - Allows quick lookup by user_id

3. **Array columns for interests:**
   - PostgreSQL native array type
   - Indexed for fast queries

### Caching Strategy (Future)

```javascript
// Could cache profile completion status
const cache = new Map();

async function getProfileCompletionStatus(userId) {
  const cached = cache.get(userId);
  if (cached) return cached;
  
  const result = await userModel.getProfileCompletionStatus(userId);
  cache.set(userId, result, { ttl: 5 * 60 * 1000 }); // 5 min cache
  
  return result;
}
```

---

## 📝 Code Examples

### Minimal Working Example

```javascript
// frontend/pages/OnboardingPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  
  const [profile, setProfile] = useState({
    name: '',
    grade: '',
    stream: '',
    interests: [],
    career_aspirations: '',
    budget_range: '',
    exam_readiness: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (response.ok && data.profileCompleted) {
        navigate('/dashboard');
      } else {
        setErrors(data.details || [data.message]);
      }
    } catch (error) {
      setErrors(['Network error: ' + error.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={profile.name}
        onChange={(e) => setProfile({...profile, name: e.target.value})}
      />
      {/* More fields... */}
      <button disabled={loading}>
        {loading ? 'Saving...' : 'Complete Onboarding'}
      </button>
      {errors.map((err, i) => <div key={i} className="error">{err}</div>)}
    </form>
  );
}
```

---

## ✨ Best Practices

### For Backend Development

1. **Always validate before database operations**
   - Collect all errors, return together
   - Never partially save invalid data

2. **Use transactions for multi-step operations**
   - Ensure data consistency
   - Rollback on any error

3. **Handle edge cases**
   - Empty strings
   - Null values
   - Very long inputs
   - Special characters

4. **Log operations**
   - DEBUG: Input validation steps
   - INFO: Successful operations
   - ERROR: Failed operations with context

### For Frontend Integration

1. **Always check profile completion**
   - Before accessing protected features
   - After login/signup
   - Before redirecting to dashboard

2. **Handle validation errors gracefully**
   - Show all errors to user
   - Highlight problematic fields
   - Suggest fixes

3. **Provide good UX**
   - Real-time field validation
   - Clear error messages
   - Loading indicators
   - Success confirmations

4. **Store token securely**
   - Use httpOnly cookies (not localStorage)
   - Or encrypted localStorage with short TTL
   - Never log token to console

---

## 🔐 Security Checklist

- ✅ All endpoints require authentication
- ✅ User can only access own profile (JWT subject verification)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (JSON responses, no user input in HTML)
- ✅ CSRF prevention (SameSite cookie policy for future)
- ✅ Input validation on all fields
- ✅ Rate limiting recommended for production
- ✅ HTTPS enforced in production

---

## 📈 Monitoring

### Metrics to Track

```javascript
// Example monitoring setup
const metrics = {
  signups: 0,
  profilesCreated: 0,
  profilesCompleted: 0,
  validationErrors: 0,
  authErrors: 0
};

// After successful profile creation
metrics.profilesCreated++;
if (result.profileCompleted) {
  metrics.profilesCompleted++;
}
```

### Logs to Check

```javascript
// In src/controllers/profileController.js
console.log(`User ${userId} started onboarding`);
console.log(`User ${userId} validation errors:`, errors);
console.log(`User ${userId} completed profile`);
```

---

## 🚢 Deployment Checklist

- [ ] Database migration executed
- [ ] All files copied to server
- [ ] Environment variables set (.env)
- [ ] JWT_SECRET updated
- [ ] Database credentials verified
- [ ] FRONTEND_URL set correctly
- [ ] CORS configured for production domain
- [ ] Server started without errors
- [ ] Health check works: `GET /health`
- [ ] Auth endpoints work: signup, login, me
- [ ] Profile endpoints work: GET /me, POST /
- [ ] All tests pass
- [ ] Database backups configured
- [ ] Monitoring/logging enabled
- [ ] Error handling verified

---

**Last Updated:** January 26, 2026  
**Status:** ✅ Complete & Ready for Integration
