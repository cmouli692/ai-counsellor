# Profile API Test Suite

## Test Scenarios & Validation

---

## 📋 Test Cases

### ✅ TC-P01: Get Profile - No Profile Yet
**Objective:** User logs in but hasn't completed onboarding yet

**Setup:**
1. Register user: `user1@test.com` / `Password123!`
2. Login to get token

**Test:**
```bash
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Response: `profileCompleted: false, profile: null`

**Validation:**
```json
{
  "message": "Profile retrieved successfully",
  "profileCompleted": false,
  "profile": null
}
```

---

### ✅ TC-P02: Create Profile - All Fields Valid
**Objective:** User completes full onboarding with all required fields

**Setup:**
1. User logged in with valid token

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI", "Engineering", "Robotics"],
    "career_aspirations": "I want to become a Data Scientist at Google working on cutting-edge AI research",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 201 Created
- `profileCompleted: true`
- Profile object returned with all fields

**Validation:**
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
    "career_aspirations": "I want to become a Data Scientist at Google working on cutting-edge AI research",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared",
    "profile_completed": true,
    "created_at": "2026-01-26T10:35:00Z",
    "updated_at": "2026-01-26T10:35:00Z"
  }
}
```

**Pass Criteria:**
- ✅ Status 201
- ✅ profileCompleted = true
- ✅ All fields present in response
- ✅ created_at and updated_at set

---

### ✅ TC-P03: Verify Profile After Creation
**Objective:** Confirm GET returns the created profile

**Setup:**
1. Profile created in TC-P02
2. Same user's token

**Test:**
```bash
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer <token>"
```

**Expected Result:**
- Status: 200 OK
- `profileCompleted: true`
- Returns exact profile created in TC-P02

---

### ❌ TC-P04: Create Profile - Missing Name
**Objective:** Validation catches missing required field

**Setup:**
1. User logged in

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI"],
    "career_aspirations": "Become a software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Error message includes: "name: Required"
- Database unchanged

**Validation:**
```json
{
  "error": "Validation Error",
  "message": "Profile data validation failed",
  "details": [
    "name: Required field"
  ]
}
```

---

### ❌ TC-P05: Create Profile - Name Too Short
**Objective:** Validation catches invalid name length

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "R",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI"],
    "career_aspirations": "Become a software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["name: Must be 2-255 characters"]`

---

### ❌ TC-P06: Create Profile - Invalid Grade
**Objective:** Validation rejects invalid grade value

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "PhD",
    "stream": "Science",
    "interests": ["AI"],
    "career_aspirations": "Become a software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["grade: Must be one of: 10th, 11th, 12th, Undergrad, Postgrad"]`

---

### ❌ TC-P07: Create Profile - Invalid Stream
**Objective:** Validation rejects invalid stream value

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Technology",
    "interests": ["AI"],
    "career_aspirations": "Become a software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["stream: Must be one of: Science, Commerce, Arts, Engineering"]`

---

### ❌ TC-P08: Create Profile - No Interests
**Objective:** Validation requires at least one interest

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": [],
    "career_aspirations": "Become a software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["interests: Must have at least 1 interest (max 10)"]`

---

### ❌ TC-P09: Create Profile - Too Many Interests
**Objective:** Validation limits interests to 10

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI", "Engineering", "Business", "Medicine", "Law", "Arts", "Sciences", "Technology", "Finance", "Management", "Psychology"],
    "career_aspirations": "Become a software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["interests: Must have at least 1 interest (max 10)"]`

---

### ❌ TC-P10: Create Profile - Invalid Interest Value
**Objective:** Validation checks interest values

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI", "InvalidInterest"],
    "career_aspirations": "Become a software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["interests: Invalid interests - InvalidInterest"]`

---

### ❌ TC-P11: Create Profile - Career Too Short
**Objective:** Validation checks min length for career aspirations

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI"],
    "career_aspirations": "Engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["career_aspirations: Must be 10-500 characters"]`

---

### ❌ TC-P12: Create Profile - Invalid Budget Range
**Objective:** Validation rejects invalid budget value

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI"],
    "career_aspirations": "I want to become a software engineer",
    "budget_range": "Expensive",
    "exam_readiness": "Prepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["budget_range: Must be one of: <25L, 25L-50L, 50L-1Cr, 1Cr-2Cr, >2Cr, Not Specified"]`

---

### ❌ TC-P13: Create Profile - Invalid Exam Readiness
**Objective:** Validation rejects invalid exam readiness value

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI"],
    "career_aspirations": "I want to become a software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "MaybePrepared"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Details: `["exam_readiness: Must be 'Prepared', 'Preparing', or 'Not Prepared'"]`

---

### ❌ TC-P14: Create Profile - Multiple Validation Errors
**Objective:** All validation errors returned together

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "grade": "PhD",
    "stream": "Invalid",
    "interests": [],
    "career_aspirations": "short",
    "budget_range": "Expensive",
    "exam_readiness": "Maybe"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Multiple errors in details array:
  ```json
  {
    "error": "Validation Error",
    "message": "Profile data validation failed",
    "details": [
      "name: Must be 2-255 characters",
      "grade: Must be one of: 10th, 11th, 12th, Undergrad, Postgrad",
      "stream: Must be one of: Science, Commerce, Arts, Engineering",
      "interests: Must have at least 1 interest (max 10)",
      "career_aspirations: Must be 10-500 characters",
      "budget_range: Must be one of: <25L, 25L-50L, 50L-1Cr, 1Cr-2Cr, >2Cr, Not Specified",
      "exam_readiness: Must be 'Prepared', 'Preparing', or 'Not Prepared'"
    ]
  }
  ```

---

### ✅ TC-P15: Update Profile - Partial Update
**Objective:** User can update profile partially

**Setup:**
1. Profile created in TC-P02
2. User updates some fields

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Patel",
    "grade": "11th",
    "stream": "Science",
    "interests": ["AI", "Engineering", "Robotics", "Data Science"],
    "career_aspirations": "I want to become a Machine Learning Engineer at Google",
    "budget_range": "1Cr-2Cr",
    "exam_readiness": "Preparing"
  }'
```

**Expected Result:**
- Status: 201 Created
- Message: "Profile updated successfully"
- All fields updated in response
- `updated_at` changed
- `created_at` unchanged

---

### ✅ TC-P16: Update Profile - Some Fields Only
**Objective:** User can update only certain fields

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Patel",
    "budget_range": ">2Cr",
    "exam_readiness": "Not Prepared"
  }'
```

**Expected Result:**
- Status: 201 Created
- Updated fields changed
- Other fields retain previous values
- `profile_completed` still true

---

### ❌ TC-P17: No Authorization Header
**Objective:** Endpoint requires authentication

**Test:**
```bash
curl -X GET http://localhost:5000/api/profile/me \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Missing authorization header"

---

### ❌ TC-P18: Invalid Token
**Objective:** System rejects invalid tokens

**Test:**
```bash
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Invalid token"

---

### ❌ TC-P19: Expired Token
**Objective:** System rejects expired tokens (after 7 days)

**Setup:**
1. Create token that will expire
2. Wait for expiration OR mock system time

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Token has expired"

---

### ✅ TC-P20: Valid Grades - All Values
**Objective:** Validate all grade options work

**Test Values:** `10th`, `11th`, `12th`, `Undergrad`, `Postgrad`

**Expected:** All accepted successfully

---

### ✅ TC-P21: Valid Streams - All Values
**Objective:** Validate all stream options work

**Test Values:** `Science`, `Commerce`, `Arts`, `Engineering`

**Expected:** All accepted successfully

---

### ✅ TC-P22: Valid Interests - All Values
**Objective:** Validate all interest values work

**Test Values:**
```
AI, Engineering, Business, Medicine, Law,
Arts, Sciences, Technology, Finance, Management,
Psychology, Biology, Physics, Chemistry, Mathematics,
History, Economics, Literature
```

**Expected:** All accepted successfully in any combination

---

### ✅ TC-P23: Valid Budget Ranges - All Values
**Objective:** Validate all budget values work

**Test Values:**
```
<25L, 25L-50L, 50L-1Cr, 1Cr-2Cr, >2Cr, Not Specified
```

**Expected:** All accepted successfully

---

### ✅ TC-P24: Valid Exam Readiness - All Values
**Objective:** Validate all exam readiness options work

**Test Values:** `Prepared`, `Preparing`, `Not Prepared`

**Expected:** All accepted successfully

---

### ✅ TC-P25: Name Edge Cases
**Objective:** Test name boundary values

**Test Cases:**
- 2 chars: `"Ra"` → ✅ Pass
- 255 chars: Long string → ✅ Pass
- 1 char: `"R"` → ❌ Fail
- 256 chars: Very long → ❌ Fail

---

### ✅ TC-P26: Career Aspiration Edge Cases
**Objective:** Test career aspiration boundary values

**Test Cases:**
- 10 chars: `"Engineer1"` → ✅ Pass
- 500 chars: Long text → ✅ Pass
- 9 chars: `"Engineer"` → ❌ Fail
- 501 chars: Too long → ❌ Fail

---

### ✅ TC-P27: Multiple Users - Separate Profiles
**Objective:** Each user has isolated profile

**Setup:**
1. Create 2 users: user1@test.com, user2@test.com
2. Each completes profile with different data

**Test:**
```bash
# User 1 gets their profile
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer <token1>"
  
# User 2 gets their profile
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer <token2>"
```

**Expected Result:**
- Each user sees only their own profile
- Data doesn't overlap
- No cross-user data leakage

---

### ✅ TC-P28: Database Consistency
**Objective:** Profile data persists correctly

**Setup:**
1. Create profile via API
2. Verify via GET
3. Restart server
4. Verify data still there

**Expected:** Data persists across server restarts

---

### ✅ TC-P29: Timestamp Accuracy
**Objective:** created_at and updated_at correct

**Setup:**
1. Create profile at time T1
2. Update profile at time T2
3. Verify timestamps

**Expected:**
- `created_at` = T1 (never changes)
- `updated_at` = T1 initially
- After update: `updated_at` = T2

---

### ✅ TC-P30: Empty String Handling
**Objective:** System validates empty strings

**Test:**
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "grade": "12th",
    ...
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Error about invalid name

---

## 🚀 Automated Test Script

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"
PASS_COUNT=0
FAIL_COUNT=0

# Helper function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local token=$4
  local data=$5
  local expected_status=$6
  
  echo -n "Testing $name... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}PASS${NC} (Status: $http_code)"
    ((PASS_COUNT++))
  else
    echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $http_code)"
    echo "Response: $body"
    ((FAIL_COUNT++))
  fi
}

# Run tests
echo "Starting Profile API Tests..."
echo "=============================="

# Get test token (signup and login first)
echo "Setting up test user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}')

TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Token obtained: $TOKEN"
echo ""

# Run tests
test_endpoint "Get Profile (empty)" "GET" "/api/profile/me" "$TOKEN" "" "200"

test_endpoint "Create Profile (valid)" "POST" "/api/profile" "$TOKEN" \
  '{"name":"Test User","grade":"12th","stream":"Science","interests":["AI"],"career_aspirations":"Become a software engineer","budget_range":"50L-1Cr","exam_readiness":"Prepared"}' \
  "201"

test_endpoint "Get Profile (complete)" "GET" "/api/profile/me" "$TOKEN" "" "200"

test_endpoint "Create Profile (missing name)" "POST" "/api/profile" "$TOKEN" \
  '{"grade":"12th","stream":"Science","interests":["AI"],"career_aspirations":"Become a software engineer","budget_range":"50L-1Cr","exam_readiness":"Prepared"}' \
  "400"

test_endpoint "Create Profile (invalid grade)" "POST" "/api/profile" "$TOKEN" \
  '{"name":"Test User","grade":"PhD","stream":"Science","interests":["AI"],"career_aspirations":"Become a software engineer","budget_range":"50L-1Cr","exam_readiness":"Prepared"}' \
  "400"

echo ""
echo "=============================="
echo -e "Results: ${GREEN}$PASS_COUNT passed${NC}, ${RED}$FAIL_COUNT failed${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
  exit 0
else
  exit 1
fi
```

---

## 📊 Test Summary

| Category | Count | Status |
|----------|-------|--------|
| Happy Path | 12 | ✅ |
| Validation | 13 | ✅ |
| Authorization | 3 | ✅ |
| Edge Cases | 2 | ✅ |
| **Total** | **30** | **✅** |

---

**Last Updated:** January 26, 2026  
**Status:** ✅ Complete & Ready for Execution
