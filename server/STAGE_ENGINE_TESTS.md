# Stage Engine Test Scenarios

## Complete Test Suite for Stage Engine

---

## 📋 Test Categories

### Stage Detection Tests (4)
### Feature Gating Tests (6)
### Progress Tracking Tests (3)
### Error Handling Tests (4)

**Total: 17 Test Cases**

---

## ✅ Stage Detection Tests

### TC-S01: Stage 1 - User Not Onboarded
**Objective:** Verify Stage 1 when profile incomplete

**Setup:**
1. Signup new user
2. Don't fill profile

**Test:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"Test123!"}' | jq -r '.token')

curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- Status: 200 OK
- stageNumber: 1
- stageLabel: "Onboarding"
- isComplete: false
- profileCompleted: false
- shortlistCount: 0
- lockedCount: 0

**Pass Criteria:**
- ✅ Exact stage number 1
- ✅ Correct label
- ✅ nextStep defined
- ✅ All feature gates false

---

### TC-S02: Stage 2 - Profile Complete, No Shortlist
**Objective:** Verify Stage 2 when onboarding done

**Setup:**
1. Signup user
2. Complete profile
3. Don't add to shortlist

**Test:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"stage2@test.com","password":"Test123!"}' | jq -r '.token')

curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "grade": "12th",
    "stream": "Science",
    "interests": ["AI"],
    "career_aspirations": "Software engineer",
    "budget_range": "50L-1Cr",
    "exam_readiness": "Prepared"
  }'

curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- stageNumber: 2
- stageLabel: "Onboarding Complete"
- profileCompleted: true
- shortlistCount: 0
- lockedCount: 0

**Pass Criteria:**
- ✅ Stage 2 auto-detected
- ✅ Counsellor available
- ✅ Universities available
- ✅ Shortlist not available

---

### TC-S03: Stage 3 - Shortlist Has Items
**Objective:** Verify Stage 3 when shortlist created

**Setup:**
1. User in Stage 2
2. Add university to shortlist (using database INSERT for now)

**Test:**
```bash
# For now, manually insert shortlist via database:
# psql -U postgres -d ai_counsellor_dev -c \
# "INSERT INTO shortlist (id, user_id, university_id, created_at) VALUES \
#  ('uuid', 'user-id', 'univ-id', NOW());"

curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- stageNumber: 3
- stageLabel: "Shortlist Created"
- shortlistCount: 1 (or more)
- lockedCount: 0

**Pass Criteria:**
- ✅ Stage 3 auto-detected
- ✅ Shortlist management available
- ✅ Applications not available yet

---

### TC-S04: Stage 4 - University Locked
**Objective:** Verify Stage 4 when university locked

**Setup:**
1. User in Stage 3 with shortlist
2. Lock a university (using database INSERT for now)

**Test:**
```bash
# For now, manually insert locked_university via database:
# psql -U postgres -d ai_counsellor_dev -c \
# "INSERT INTO locked_university (id, user_id, university_id, created_at) VALUES \
#  ('uuid', 'user-id', 'univ-id', NOW());"

curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- stageNumber: 4
- stageLabel: "University Locked"
- lockedCount: 1 (or more)
- isComplete: true

**Pass Criteria:**
- ✅ Stage 4 auto-detected
- ✅ Applications available
- ✅ All features available
- ✅ isComplete = true

---

## 🔐 Feature Gating Tests

### TC-S05: Stage 1 - No Features Available
**Objective:** Verify all features gated in Stage 1

**Test:**
```bash
curl -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result (Stage 1):**
```json
{
  "features": {
    "onboarding": { "available": false },
    "counsellor": { "available": false },
    "universities": { "available": false },
    "shortlist": { "available": false },
    "lockedUniversity": { "available": false },
    "applications": { "available": false }
  }
}
```

**Pass Criteria:**
- ✅ All features unavailable
- ✅ Descriptions provided for all

---

### TC-S06: Stage 2 - Partial Features Available
**Objective:** Verify correct features in Stage 2

**Test:**
```bash
# User in Stage 2
curl -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result (Stage 2):**
- onboarding: true ✅
- counsellor: true ✅
- universities: true ✅
- shortlist: false ❌
- lockedUniversity: false ❌
- applications: false ❌

**Pass Criteria:**
- ✅ Exactly 3 features available
- ✅ Correct features available
- ✅ All others unavailable

---

### TC-S07: Stage 3 - More Features Available
**Objective:** Verify correct features in Stage 3

**Test:**
```bash
# User in Stage 3
curl -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result (Stage 3):**
- onboarding: true ✅
- counsellor: true ✅
- universities: true ✅
- shortlist: true ✅
- lockedUniversity: true ✅
- applications: false ❌

**Pass Criteria:**
- ✅ Exactly 5 features available
- ✅ Applications still gated

---

### TC-S08: Stage 4 - All Features Available
**Objective:** Verify all features available in Stage 4

**Test:**
```bash
# User in Stage 4
curl -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result (Stage 4):**
- onboarding: true ✅
- counsellor: true ✅
- universities: true ✅
- shortlist: true ✅
- lockedUniversity: true ✅
- applications: true ✅

**Pass Criteria:**
- ✅ All 6 features available
- ✅ isComplete = true

---

### TC-S09: Stage 1 vs 2 Gating Difference
**Objective:** Verify gating changes between Stage 1 and 2

**Test:**
```bash
# Get gates for Stage 1 user
GATES_S1=$(curl -s -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN_S1" | jq '.features')

# Get gates for Stage 2 user
GATES_S2=$(curl -s -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN_S2" | jq '.features')

# Compare
diff <(echo $GATES_S1 | sort) <(echo $GATES_S2 | sort)
```

**Expected Result:**
- Stage 1: onboarding false
- Stage 2: onboarding true
- Other differences as per stage specs

**Pass Criteria:**
- ✅ Differences correct
- ✅ No unexpected changes

---

### TC-S10: Stage 3 vs 4 Gating Difference
**Objective:** Verify applications gating between Stage 3 and 4

**Test:**
```bash
# Get gates for Stage 3 user
GATES_S3=$(curl -s -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN_S3" | jq '.features.applications.available')

# Get gates for Stage 4 user
GATES_S4=$(curl -s -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN_S4" | jq '.features.applications.available')

echo "Stage 3 applications: $GATES_S3"
echo "Stage 4 applications: $GATES_S4"
```

**Expected Result:**
- Stage 3: applications = false
- Stage 4: applications = true

**Pass Criteria:**
- ✅ Exact transition
- ✅ Only applications changes

---

## 📊 Progress Tracking Tests

### TC-S11: Progress - Stage 1 (0%)
**Objective:** Verify progress percentage for Stage 1

**Test:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"prog1@test.com","password":"Test123!"}' | jq -r '.token')

curl -X GET http://localhost:5000/api/stage/progress \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- currentStage: 1
- progressPercentage: 25
- onboardingComplete: false
- shortlistCreated: false
- universityLocked: false

**Pass Criteria:**
- ✅ 25% progress (1/4)
- ✅ All booleans false
- ✅ Profile null

---

### TC-S12: Progress - Stage 2 (25%)
**Objective:** Verify progress percentage for Stage 2

**Setup:**
1. Complete onboarding (moves to Stage 2)

**Test:**
```bash
curl -X GET http://localhost:5000/api/stage/progress \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- currentStage: 2
- progressPercentage: 50
- onboardingComplete: true
- shortlistCreated: false
- profile.name: "User name"
- profile.grade: "12th"

**Pass Criteria:**
- ✅ 50% progress (2/4)
- ✅ Profile populated
- ✅ Shortlist still null

---

### TC-S13: Progress - Stage 3 (75%)
**Objective:** Verify progress percentage for Stage 3

**Setup:**
1. Add to shortlist (moves to Stage 3)

**Test:**
```bash
curl -X GET http://localhost:5000/api/stage/progress \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- currentStage: 3
- progressPercentage: 75
- shortlistCreated: true
- shortlist.count: 1
- universityLocked: false

**Pass Criteria:**
- ✅ 75% progress (3/4)
- ✅ Shortlist count correct
- ✅ Locked still null

---

## ❌ Error Handling Tests

### TC-S14: Missing Authorization Header
**Objective:** Verify 401 when header missing

**Test:**
```bash
curl -X GET http://localhost:5000/api/stage
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Missing authorization header"

---

### TC-S15: Invalid Token
**Objective:** Verify 401 with invalid token

**Test:**
```bash
curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Invalid token"

---

### TC-S16: Expired Token
**Objective:** Verify 401 with expired token

**Test:**
```bash
# Create token that will expire (after 7 days)
# Or mock system time to test expiration
curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer <expired-token>"
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Token has expired"

---

### TC-S17: Database Error Handling
**Objective:** Verify 500 on database errors

**Test:**
```bash
# Stop PostgreSQL temporarily
curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $VALID_TOKEN"
```

**Expected Result:**
- Status: 500 Server Error
- Error: "Failed to retrieve stage information"
- No database details leaked

**Pass Criteria:**
- ✅ 500 status
- ✅ Generic error message
- ✅ No sensitive info

---

## 🔄 Transition Tests

### TC-S18: Auto-Transition S1 → S2
**Objective:** Verify automatic transition when profile complete

**Setup:**
1. User in Stage 1
2. Complete profile

**Test:**
```bash
# Before profile
curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN" | jq '.stage.stageNumber'
# Expected: 1

# Complete profile
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...all fields...}'

# After profile
curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN" | jq '.stage.stageNumber'
# Expected: 2
```

**Expected Result:**
- Before: stageNumber = 1
- After: stageNumber = 2
- Automatic, no explicit action needed

---

## 🧪 All Stages Endpoint Test

### TC-S19: Get All Stage Definitions
**Objective:** Verify /api/stage/all returns all stages

**Test:**
```bash
curl -X GET http://localhost:5000/api/stage/all
```

**Expected Result:**
```json
{
  "message": "All stages retrieved successfully",
  "stages": [
    { "stageNumber": 1, ... },
    { "stageNumber": 2, ... },
    { "stageNumber": 3, ... },
    { "stageNumber": 4, ... }
  ],
  "total": 4
}
```

**Pass Criteria:**
- ✅ All 4 stages returned
- ✅ No authentication required
- ✅ Correct requirements listed

---

## 📊 Test Summary

| Category | Count | Status |
|----------|-------|--------|
| Stage Detection | 4 | ✅ |
| Feature Gating | 6 | ✅ |
| Progress Tracking | 3 | ✅ |
| Error Handling | 4 | ✅ |
| Transitions | 1 | ✅ |
| Definitions | 1 | ✅ |
| **Total** | **19** | **✅** |

---

## 🚀 Automated Test Script

```bash
#!/bin/bash

# Stage Engine Test Suite
BASE_URL="http://localhost:5000"
PASS=0
FAIL=0

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local token=$4
  local expected_status=$5
  
  echo -n "Testing $name... "
  
  if [ -z "$token" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $token")
  fi
  
  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$status" = "$expected_status" ]; then
    echo "✅ PASS"
    ((PASS++))
  else
    echo "❌ FAIL (Expected: $expected_status, Got: $status)"
    ((FAIL++))
  fi
}

echo "Stage Engine Tests"
echo "=================="

# Get tokens
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$RANDOM@test.com\",\"password\":\"Test123!\"}" | jq -r '.token')

# Run tests
test_endpoint "Get Stage" "GET" "/api/stage" "$TOKEN" "200"
test_endpoint "Get All Stages" "GET" "/api/stage/all" "" "200"
test_endpoint "Get Progress" "GET" "/api/stage/progress" "$TOKEN" "200"
test_endpoint "Get Gates" "GET" "/api/stage/gates" "$TOKEN" "200"
test_endpoint "Missing Token" "GET" "/api/stage" "" "401"
test_endpoint "Invalid Token" "GET" "/api/stage" "invalid" "401"

echo ""
echo "Results: ✅ $PASS passed, ❌ $FAIL failed"
```

---

**Last Updated:** January 27, 2026  
**Status:** ✅ Complete & Ready for Testing
