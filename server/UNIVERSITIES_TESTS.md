# Universities Module - Test Scenarios

**Total Test Cases:** 25  
**Status:** Ready for Execution

---

## Test Setup

**Prerequisites:**
1. Database migration applied: `psql -U postgres -d assignment_db -f database/migrations/05-create-universities.sql`
2. Universities seeded: `node scripts/seedUniversities.js`
3. Server running: `npm run dev` (port 5000)

**Base URL:** `http://localhost:5000`

---

## Category 1: Get Universities (Basic Endpoints) - 4 Tests

### TC-U01: Get All Universities
**Objective:** Verify getting list of all universities  
**Method:** `GET /api/universities`

**Steps:**
1. Send GET request to `/api/universities`

**Expected Result:**
- Status: 200
- Response contains `success: true`
- Response contains `count: 20`
- Response contains `universities` array with 20 items
- Each university has: id, name, country, program, yearly_cost, tags, acceptance_rate, avg_gpa, avg_exam_score

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/universities \
  -H "Accept: application/json"
```

**Pass Criteria:** ✅ All 20 universities returned with complete data

---

### TC-U02: Get Single University by ID
**Objective:** Verify fetching a specific university  
**Method:** `GET /api/universities/:id`

**Steps:**
1. Send GET request to `/api/universities/1`

**Expected Result:**
- Status: 200
- Response contains `success: true`
- Response contains single `university` object
- University name is "Harvard University"
- University has all required fields

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/universities/1
```

**Pass Criteria:** ✅ Single university returned correctly

---

### TC-U03: Get Non-existent University
**Objective:** Verify error handling for invalid ID  
**Method:** `GET /api/universities/999`

**Steps:**
1. Send GET request to `/api/universities/999` (non-existent ID)

**Expected Result:**
- Status: 404
- Response contains `error: "University not found"`

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/universities/999
```

**Pass Criteria:** ✅ 404 error returned with appropriate message

---

### TC-U04: Get Statistics
**Objective:** Verify database statistics endpoint  
**Method:** `GET /api/universities/stats`

**Steps:**
1. Send GET request to `/api/universities/stats`

**Expected Result:**
- Status: 200
- Response contains `success: true`
- `stats.totalUniversities = 20`
- `stats.byCountry.USA = 8`
- `stats.byCountry.UK = 5`
- `stats.byCountry.Canada = 3`
- `stats.byCountry.Germany = 3`
- `stats.averageYearlyCost > 0`
- `stats.costRange.min < stats.costRange.max`

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/universities/stats
```

**Pass Criteria:** ✅ Stats match expected values (20 total, 8 USA, etc.)

---

## Category 2: Filter Universities - 5 Tests

### TC-U05: Filter by Country (USA)
**Objective:** Filter universities by country  
**Method:** `GET /api/universities?country=USA`

**Steps:**
1. Send GET request with country filter for USA

**Expected Result:**
- Status: 200
- Response contains 8 universities
- All universities have `country: "USA"`
- Universities include: Harvard, Stanford, MIT, Berkeley, CMU, Columbia, UChicago, Michigan

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/universities?country=USA"
```

**Pass Criteria:** ✅ Returns 8 USA universities only

---

### TC-U06: Filter by Country (UK)
**Objective:** Filter universities by UK  
**Method:** `GET /api/universities?country=UK`

**Steps:**
1. Send GET request with country filter for UK

**Expected Result:**
- Status: 200
- Response contains 5 universities
- All universities have `country: "UK"`
- Universities include: Oxford, Cambridge, Imperial, LSE, Edinburgh

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/universities?country=UK"
```

**Pass Criteria:** ✅ Returns 5 UK universities only

---

### TC-U07: Filter by Max Cost
**Objective:** Filter universities by maximum yearly cost  
**Method:** `GET /api/universities?maxCost=3000000`

**Steps:**
1. Send GET request with maxCost filter
2. Only universities costing ≤ 30L should be returned

**Expected Result:**
- Status: 200
- All returned universities have `yearly_cost <= 3000000`
- Should include: UK universities (32-36L excluded), Canada, Germany, no USA

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/universities?maxCost=3000000"
```

**Pass Criteria:** ✅ Only universities within cost limit returned

---

### TC-U08: Combine Filters (Country + Cost)
**Objective:** Apply multiple filters simultaneously  
**Method:** `GET /api/universities?country=USA&maxCost=5000000`

**Steps:**
1. Send GET request with both country and cost filters
2. Should only return USA universities costing ≤ 50L

**Expected Result:**
- Status: 200
- All returned universities have `country: "USA"`
- All returned universities have `yearly_cost <= 5000000`
- Only UC Berkeley (42L) and University of Michigan (38L) should match

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/universities?country=USA&maxCost=5000000"
```

**Pass Criteria:** ✅ Returns only UC Berkeley (42L) and University of Michigan (38L)

---

### TC-U09: Search Universities
**Objective:** Search universities by name/program/description  
**Method:** `GET /api/universities?search=stanford`

**Steps:**
1. Send GET request with search query
2. Should return universities matching the search term

**Expected Result:**
- Status: 200
- Returns "Stanford University"
- May also return other matches if search term appears in description/program

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/universities?search=stanford"
```

**Pass Criteria:** ✅ Search returns relevant results

---

## Category 3: Get Universities by Country - 2 Tests

### TC-U10: Get Universities by Country Route
**Objective:** Use dedicated country endpoint  
**Method:** `GET /api/universities/country/:country`

**Steps:**
1. Send GET request to `/api/universities/country/USA`

**Expected Result:**
- Status: 200
- Response includes `country: "USA"`
- Response includes `count: 8`
- All 8 USA universities returned

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/universities/country/USA
```

**Pass Criteria:** ✅ Returns correct country universities

---

### TC-U11: Get Universities - Invalid Country
**Objective:** Test error handling for non-existent country  
**Method:** `GET /api/universities/country/xyz`

**Steps:**
1. Send GET request to invalid country

**Expected Result:**
- Status: 404
- Response contains `error: "No universities found in this country"`

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/universities/country/xyz
```

**Pass Criteria:** ✅ 404 error returned appropriately

---

## Category 4: Recommendation Algorithm - 8 Tests

### TC-U12: Recommendations for High Scorer
**Objective:** Test recommendations for excellent student  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": true,
  "avgGPA": 4.0,
  "examScore": 1580,
  "budget": 9000000,
  "examReadiness": "Fully Prepared",
  "interests": ["AI", "Research"]
}
```

**Expected Result:**
- Status: 200
- Response contains `success: true`
- Response contains `recommendations` with dream/target/safe arrays
- Dream array includes highly selective universities
- Each university includes: fitReason, riskReason, costLevel, acceptanceChance

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/universities/recommended \
  -H "Content-Type: application/json" \
  -d '{
    "profileCompleted": true,
    "avgGPA": 4.0,
    "examScore": 1580,
    "budget": 9000000,
    "interests": ["AI", "Research"]
  }'
```

**Pass Criteria:** ✅ Dream schools include Ivy League, Target includes good matches, Safe includes reliable options

---

### TC-U13: Recommendations with Budget Constraint
**Objective:** Test recommendations respect user budget  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": true,
  "avgGPA": 3.5,
  "examScore": 1350,
  "budget": 2500000,
  "interests": ["Engineering"]
}
```

**Expected Result:**
- Status: 200
- All recommended universities have `yearly_cost <= 5000000` (2x budget)
- Most universities should be from Canada/Germany (budget-friendly)
- Safe schools should be within 80% of budget

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/universities/recommended \
  -H "Content-Type: application/json" \
  -d '{
    "profileCompleted": true,
    "avgGPA": 3.5,
    "examScore": 1350,
    "budget": 2500000,
    "interests": ["Engineering"]
  }'
```

**Pass Criteria:** ✅ Budget-conscious recommendations (Canada/Germany preferred)

---

### TC-U14: Cost Level Calculation
**Objective:** Verify cost levels are correctly assigned  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": true,
  "avgGPA": 3.7,
  "examScore": 1450,
  "budget": 5000000,
  "interests": []
}
```

**Expected Result:**
- Status: 200
- Universities with yearly_cost <= 4000000 have `costLevel: "Budget"`
- Universities with yearly_cost 4000000-6000000 have `costLevel: "Moderate"`
- Universities with yearly_cost > 6000000 have `costLevel: "Expensive"`

**Pass Criteria:** ✅ Cost levels correctly categorized

---

### TC-U15: Acceptance Chance Calculation
**Objective:** Verify acceptance chance is based on GPA/score  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": true,
  "avgGPA": 3.9,
  "examScore": 1520,
  "budget": 8000000,
  "interests": []
}
```

**Expected Result:**
- Status: 200
- Ivy League universities (high requirements) should show `acceptanceChance: "Fair"` or `"Good"`
- Budget-friendly universities should show `acceptanceChance: "Excellent"`
- Each recommendation includes one of: Excellent, Good, Fair, Low

**Pass Criteria:** ✅ Acceptance chances vary correctly based on student profile

---

### TC-U16: Fit Reason Generation
**Objective:** Verify fit reasons match user interests  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": true,
  "avgGPA": 3.8,
  "examScore": 1450,
  "budget": 6000000,
  "interests": ["AI", "Research"]
}
```

**Expected Result:**
- Status: 200
- Universities with matching tags include those tags in `fitReason`
- Example: If university has "AI" tag and user interested in "AI", fitReason includes "Strong match: AI"
- All universities include either matching tags or program name in fitReason

**Pass Criteria:** ✅ Fit reasons reflect interest matches

---

### TC-U17: Risk Reason Generation
**Objective:** Verify risk reasons are informative  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": true,
  "avgGPA": 3.2,
  "examScore": 1300,
  "budget": 3000000,
  "interests": []
}
```

**Expected Result:**
- Status: 200
- Universities with < 10% acceptance show `riskReason` including "Highly competitive"
- Expensive universities show `riskReason` including "Expensive than budget"
- If no risks identified, `riskReason: "None identified"`

**Pass Criteria:** ✅ Risk reasons are relevant and helpful

---

### TC-U18: Dream/Target/Safe Categorization
**Objective:** Verify universities are categorized correctly  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": true,
  "avgGPA": 3.7,
  "examScore": 1450,
  "budget": 6000000,
  "interests": ["Engineering"]
}
```

**Expected Result:**
- Status: 200
- Dream array contains universities with lower acceptance chances
- Target array contains universities with good/excellent acceptance chances
- Safe array contains universities with highest acceptance chances
- Each array is non-empty (distribution logic works)

**Pass Criteria:** ✅ Universities correctly distributed across 3 categories

---

### TC-U19: Incomplete Profile Handling
**Objective:** Test behavior when profile not complete  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": false,
  "avgGPA": 3.8,
  "examScore": 1450,
  "budget": 6000000
}
```

**Expected Result:**
- Status: 400
- Response contains `error: "Profile incomplete"`
- Response contains `message: "Please complete your profile to get recommendations"`
- Response contains empty recommendations array

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/universities/recommended \
  -H "Content-Type: application/json" \
  -d '{
    "profileCompleted": false,
    "avgGPA": 3.8,
    "examScore": 1450,
    "budget": 6000000
  }'
```

**Pass Criteria:** ✅ Returns 400 with appropriate error message

---

## Category 5: Error Handling - 3 Tests

### TC-U20: Missing Required Fields
**Objective:** Test validation of required fields  
**Method:** `POST /api/universities/recommended`

**Request Body:**
```json
{
  "profileCompleted": true
  // Missing avgGPA, examScore, budget
}
```

**Expected Result:**
- Status: 400
- Response contains error message
- Response contains `required` array listing missing fields

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/universities/recommended \
  -H "Content-Type: application/json" \
  -d '{
    "profileCompleted": true
  }'
```

**Pass Criteria:** ✅ Returns 400 with validation error

---

### TC-U21: Invalid Country in Filter
**Objective:** Test handling of invalid country parameter  
**Method:** `GET /api/universities?country=InvalidCountry`

**Steps:**
1. Send GET request with non-existent country

**Expected Result:**
- Status: 200
- Response contains `count: 0`
- Response contains empty `universities` array

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/universities?country=InvalidCountry"
```

**Pass Criteria:** ✅ Returns empty result gracefully

---

### TC-U22: Invalid Cost Parameter
**Objective:** Test handling of negative or invalid cost  
**Method:** `GET /api/universities?maxCost=-5000`

**Steps:**
1. Send GET request with negative cost

**Expected Result:**
- Status: 200 (or 400 with validation error)
- Response either empty or filtered appropriately

**Pass Criteria:** ✅ Handles gracefully

---

## Category 6: Data Validation - 2 Tests

### TC-U23: University Data Structure
**Objective:** Verify all returned universities have correct structure  
**Method:** `GET /api/universities`

**Steps:**
1. Get all universities
2. Verify each university has all required fields

**Expected Result:**
- All universities have: id, name, country, program, yearly_cost, tags, acceptance_rate, avg_gpa, avg_exam_score
- Tags is an array
- Acceptance_rate is a decimal between 0-100
- Yearly_cost is a positive integer
- avg_gpa is between 2.0-4.0
- avg_exam_score is between 0-1600

**Pass Criteria:** ✅ All universities have complete, valid data

---

### TC-U24: University Count Consistency
**Objective:** Verify all counting mechanisms are consistent  
**Method:** Multiple endpoints

**Steps:**
1. Count total from GET /api/universities
2. Sum counts from GET /api/universities by country
3. Count from database: SELECT COUNT(*) FROM universities
4. Count total from recommendations algorithm

**Expected Result:**
- All counts equal 20
- Sum of country counts = 20
- Database count = 20
- Recommendation algorithm considers all 20

**Pass Criteria:** ✅ All counts consistent (20 total)

---

## Category 7: Performance - 1 Test

### TC-U25: Response Time Verification
**Objective:** Verify API responses are performant  
**Method:** Multiple endpoints

**Steps:**
1. Time GET /api/universities
2. Time POST /api/universities/recommended
3. Time GET /api/universities/stats

**Expected Result:**
- GET /api/universities: < 100ms
- POST /api/universities/recommended: < 200ms
- GET /api/universities/stats: < 100ms

**Pass Criteria:** ✅ All responses within acceptable time limits

---

## Test Execution Script

```bash
#!/bin/bash

echo "========================================="
echo "Universities API - Test Execution"
echo "========================================="

PASS=0
FAIL=0

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5

  echo -e "\n▶ Testing: $name"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "$endpoint" -H "Content-Type: application/json" -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "$expected_status" ]; then
    echo "✅ PASS (HTTP $http_code)"
    ((PASS++))
  else
    echo "❌ FAIL (Expected $expected_status, got $http_code)"
    echo "Response: $body"
    ((FAIL++))
  fi
}

# Run tests
test_endpoint "TC-U01: Get All Universities" "GET" "http://localhost:5000/api/universities" "" "200"
test_endpoint "TC-U02: Get Single University" "GET" "http://localhost:5000/api/universities/1" "" "200"
test_endpoint "TC-U03: Get Invalid University" "GET" "http://localhost:5000/api/universities/999" "" "404"
test_endpoint "TC-U04: Get Statistics" "GET" "http://localhost:5000/api/universities/stats" "" "200"
test_endpoint "TC-U05: Filter USA" "GET" "http://localhost:5000/api/universities?country=USA" "" "200"
test_endpoint "TC-U07: Filter by Cost" "GET" "http://localhost:5000/api/universities?maxCost=3000000" "" "200"
test_endpoint "TC-U10: Get USA by Country" "GET" "http://localhost:5000/api/universities/country/USA" "" "200"

# Recommendation tests
test_endpoint "TC-U12: Recommendations" "POST" "http://localhost:5000/api/universities/recommended" \
  '{"profileCompleted":true,"avgGPA":3.8,"examScore":1450,"budget":6000000,"interests":["AI"]}' "200"

test_endpoint "TC-U19: Incomplete Profile" "POST" "http://localhost:5000/api/universities/recommended" \
  '{"profileCompleted":false,"avgGPA":3.8,"examScore":1450,"budget":6000000}' "400"

echo -e "\n========================================="
echo "Test Results: $PASS PASS, $FAIL FAIL"
echo "========================================="
```

---

## Summary

**Total Tests:** 25  
**Categories:** 7  
- Basic Endpoints: 4 tests
- Filtering: 5 tests
- Country Endpoint: 2 tests
- Recommendations: 8 tests
- Error Handling: 3 tests
- Data Validation: 2 tests
- Performance: 1 test

**All tests are ready for execution!** ✅
