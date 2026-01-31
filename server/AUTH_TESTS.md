# Authentication Testing Guide

## 🧪 Test Scenarios

### Test 1: Valid Signup

**Scenario:** New user registers with valid credentials

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@university.com",
    "password": "AlicePass123"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@university.com",
    "name": "Alice Johnson",
    "created_at": "2026-01-26T10:30:00Z"
  }
}
```

**Status Code:** 201

**Verification:**
- [ ] Response contains token
- [ ] Token is JWT format (3 parts separated by dots)
- [ ] User object has id, email, name
- [ ] Status code is 201

---

### Test 2: Duplicate Email Signup

**Scenario:** User tries to register with existing email

**Prerequisites:** Complete Test 1 first

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson Duplicate",
    "email": "alice@university.com",
    "password": "DifferentPass456"
  }'
```

**Expected Response:**
```json
{
  "error": "Conflict",
  "message": "Email is already registered"
}
```

**Status Code:** 409

**Verification:**
- [ ] Status code is 409 (Conflict)
- [ ] Error message indicates duplicate email

---

### Test 3: Invalid Email Format

**Scenario:** User provides malformed email

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "email": "not-an-email",
    "password": "BobPass123"
  }'
```

**Expected Response:**
```json
{
  "error": "Validation Error",
  "message": "Invalid email format"
}
```

**Status Code:** 400

**Verification:**
- [ ] Status code is 400
- [ ] Message indicates email validation failed

---

### Test 4: Missing Required Fields

**Scenario:** User submits form without email

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Brown",
    "password": "CharliePass123"
  }'
```

**Expected Response:**
```json
{
  "error": "Validation Error",
  "message": "Name, email, and password are required"
}
```

**Status Code:** 400

---

### Test 5: Short Password

**Scenario:** Password is less than 6 characters

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "David Lee",
    "email": "david@university.com",
    "password": "Pass"
  }'
```

**Expected Response:**
```json
{
  "error": "Validation Error",
  "message": "Password must be at least 6 characters"
}
```

**Status Code:** 400

---

### Test 6: Valid Login

**Scenario:** User logs in with correct credentials

**Prerequisites:** Complete Test 1 (signup with alice@university.com)

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@university.com",
    "password": "AlicePass123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@university.com",
    "created_at": "2026-01-26T10:30:00Z"
  }
}
```

**Status Code:** 200

**Verification:**
- [ ] Response contains token
- [ ] Token is different from signup token (new JWT)
- [ ] User email matches login email
- [ ] Status code is 200

---

### Test 7: Invalid Password

**Scenario:** User logs in with wrong password

**Prerequisites:** Complete Test 1

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@university.com",
    "password": "WrongPassword123"
  }'
```

**Expected Response:**
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email or password"
}
```

**Status Code:** 401

**Verification:**
- [ ] Status code is 401
- [ ] No token returned
- [ ] Error message is generic (doesn't reveal if email/password wrong)

---

### Test 8: Nonexistent Email Login

**Scenario:** User tries to login with email not in system

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@university.com",
    "password": "SomePassword123"
  }'
```

**Expected Response:**
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email or password"
}
```

**Status Code:** 401

---

### Test 9: Get User Profile (Protected Route)

**Scenario:** Authenticated user retrieves their profile

**Prerequisites:** Complete Test 6 (get token from login)

**cURL Command:**
```bash
# Save token from Test 6
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "message": "User profile retrieved",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@university.com",
    "created_at": "2026-01-26T10:30:00Z",
    "profile": null
  }
}
```

**Status Code:** 200

**Verification:**
- [ ] Status code is 200
- [ ] User ID matches
- [ ] User email matches
- [ ] profile is null (no onboarding yet)

---

### Test 10: Missing Authorization Header

**Scenario:** User tries to access protected route without token

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "error": "Missing authorization header",
  "message": "Authorization header is required"
}
```

**Status Code:** 401

**Verification:**
- [ ] Status code is 401
- [ ] Error indicates missing header

---

### Test 11: Invalid Token Format

**Scenario:** Token doesn't follow "Bearer <token>" format

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: InvalidToken12345" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "error": "Invalid authorization header format",
  "message": "Expected format: \"Authorization: Bearer <token>\""
}
```

**Status Code:** 401

---

### Test 12: Malformed/Invalid JWT Token

**Scenario:** Token is malformed or not properly signed

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid.token.here" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

**Status Code:** 401

---

### Test 13: Mixed Case Email Handling

**Scenario:** Email should be case-insensitive

**Test 13a - Signup with lowercase:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emma White",
    "email": "emma@university.com",
    "password": "EmmaPass123"
  }'
```

**Test 13b - Login with uppercase:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "EMMA@UNIVERSITY.COM",
    "password": "EmmaPass123"
  }'
```

**Expected:** Should succeed (emails are lowercased internally)

**Status Code:** 200

---

### Test 14: Whitespace Trimming

**Scenario:** Input with leading/trailing spaces

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "  Frank Miller  ",
    "email": "  frank@university.com  ",
    "password": "  FrankPass123  "
  }'
```

**Expected:** Should succeed (spaces are trimmed)

**Verification:**
- [ ] User created successfully
- [ ] Email stored without spaces
- [ ] Name stored without leading/trailing spaces

---

## 📋 Automated Test Script

Save as `test-auth.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5000"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_${TIMESTAMP}@university.com"

echo "🧪 Running Authentication Tests..."
echo ""

# Test 1: Signup
echo "Test 1: Valid Signup"
SIGNUP_RESPONSE=$(curl -s -X POST $API_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123\"
  }")

echo "$SIGNUP_RESPONSE" | jq '.'
TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.user.id')

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo "✅ Token received"
else
  echo "❌ No token received"
  exit 1
fi

echo ""

# Test 2: Login
echo "Test 2: Valid Login"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$LOGIN_TOKEN" != "null" ] && [ ! -z "$LOGIN_TOKEN" ]; then
  echo "✅ Login token received"
else
  echo "❌ No login token received"
  exit 1
fi

echo ""

# Test 3: Get Profile
echo "Test 3: Get User Profile (Protected)"
ME_RESPONSE=$(curl -s -X GET $API_URL/api/auth/me \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -H "Content-Type: application/json")

echo "$ME_RESPONSE" | jq '.'
RETURNED_ID=$(echo "$ME_RESPONSE" | jq -r '.user.id')

if [ "$RETURNED_ID" = "$USER_ID" ]; then
  echo "✅ User ID matches"
else
  echo "❌ User ID doesn't match"
  exit 1
fi

echo ""

# Test 4: Duplicate Email
echo "Test 4: Duplicate Email Registration"
DUP_RESPONSE=$(curl -s -X POST $API_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Duplicate User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"DupPass123\"
  }")

echo "$DUP_RESPONSE" | jq '.'
ERROR=$(echo "$DUP_RESPONSE" | jq -r '.error')

if [ "$ERROR" = "Conflict" ]; then
  echo "✅ Duplicate email correctly rejected"
else
  echo "❌ Duplicate email not handled correctly"
fi

echo ""

# Test 5: Missing Authorization
echo "Test 5: Missing Authorization Header"
NO_AUTH=$(curl -s -X GET $API_URL/api/auth/me \
  -H "Content-Type: application/json")

echo "$NO_AUTH" | jq '.'
NO_AUTH_ERROR=$(echo "$NO_AUTH" | jq -r '.error')

if [ "$NO_AUTH_ERROR" = "Missing authorization header" ]; then
  echo "✅ Missing auth correctly rejected"
else
  echo "❌ Missing auth not handled correctly"
fi

echo ""
echo "✅ All tests completed!"
```

**Run tests:**
```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## 🔍 Manual Test Checklist

### Pre-Flight Checks
- [ ] Server running: `npm run dev`
- [ ] Database connected
- [ ] Port 5000 accessible

### Signup Tests
- [ ] Valid signup creates user
- [ ] Duplicate email rejected (409)
- [ ] Invalid email rejected (400)
- [ ] Missing fields rejected (400)
- [ ] Short password rejected (400)
- [ ] Response includes token
- [ ] Response includes user data

### Login Tests
- [ ] Correct credentials login succeeds
- [ ] Wrong password rejected (401)
- [ ] Nonexistent email rejected (401)
- [ ] Missing fields rejected (400)
- [ ] Response includes token
- [ ] Token is different from signup

### Protected Route Tests
- [ ] Valid token grants access
- [ ] Missing auth header rejected (401)
- [ ] Invalid token format rejected (401)
- [ ] Malformed JWT rejected (401)
- [ ] Response includes user data

### Data Integrity Tests
- [ ] Password properly hashed (compare in DB)
- [ ] Same password produces different hashes
- [ ] User email is unique in database
- [ ] User ID is UUID format

---

## 🐛 Debugging Tips

### Check Database User
```sql
-- Connect to database
psql -U postgres -d ai_counsellor_dev

-- View users
SELECT id, email, password_hash, created_at FROM users LIMIT 5;

-- View specific user
SELECT * FROM users WHERE email = 'alice@university.com';
```

### Decode JWT Token
```bash
# Online: https://jwt.io/

# Or using Node.js:
node
> const jwt = require('jsonwebtoken');
> jwt.decode('your-token-here')
```

### Check Server Logs
```bash
# Terminal should show:
# [2026-01-26T10:30:00.000Z] POST /api/auth/signup
# [2026-01-26T10:30:05.000Z] POST /api/auth/login
```

### Test Database Connection
```bash
# From server directory
psql -h localhost -U postgres -d ai_counsellor_dev -c "SELECT COUNT(*) FROM users;"
```

---

**Last Updated:** January 26, 2026  
**Test Coverage:** 14 core scenarios + automated script
