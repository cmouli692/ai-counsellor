# Authentication API Documentation

## Overview

Complete JWT-based authentication system using bcrypt for password hashing and JWT for token management.

---

## 🔐 Endpoints

### 1. POST /api/auth/signup
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "created_at": "2026-01-26T10:30:00Z"
  }
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "error": "Validation Error",
  "message": "Email is required"
}
```

409 - Email Already Exists:
```json
{
  "error": "Conflict",
  "message": "Email is already registered"
}
```

**Validation Rules:**
- `name` - 2-255 characters, required
- `email` - Valid email format, required, must be unique
- `password` - Minimum 6 characters, required

---

### 2. POST /api/auth/login
Authenticate user and obtain JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "created_at": "2026-01-26T10:30:00Z"
  }
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "error": "Validation Error",
  "message": "Email and password are required"
}
```

401 - Invalid Credentials:
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email or password"
}
```

---

### 3. GET /api/auth/me
Get current authenticated user's profile (protected).

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5000/api/auth/me
```

**Response (200 OK) - Without Profile:**
```json
{
  "message": "User profile retrieved",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "created_at": "2026-01-26T10:30:00Z",
    "profile": null
  }
}
```

**Response (200 OK) - With Profile:**
```json
{
  "message": "User profile retrieved",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "created_at": "2026-01-26T10:30:00Z",
    "profile": {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "name": "John Doe",
      "grade": "12th",
      "stream": "Science",
      "interests": ["AI", "Engineering"],
      "career_aspirations": "Data Scientist",
      "created_at": "2026-01-26T10:35:00Z"
    }
  }
}
```

**Error Responses:**

401 - Missing Authorization Header:
```json
{
  "error": "Missing authorization header",
  "message": "Authorization header is required"
}
```

401 - Invalid Token:
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

401 - Token Expired:
```json
{
  "error": "Token expired",
  "message": "Your session has expired. Please login again."
}
```

---

## 🔑 JWT Token Structure

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "type": "access_token",
  "iat": 1643172600,
  "exp": 1643777400
}
```

**Expiry:** 7 days (configurable via JWT_EXPIRY in code)

---

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Get Profile (Protected)
```bash
# Replace TOKEN with actual token from signup/login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📝 Testing with Postman

### Create Collection
1. Open Postman
2. Create new Collection: "AI Counsellor Auth"

### Add Requests

#### Request 1: Signup
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/signup`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
- **Tests (Optional):**
```javascript
var jsonData = pm.response.json();
pm.environment.set("auth_token", jsonData.token);
pm.environment.set("user_id", jsonData.user.id);
```

#### Request 2: Login
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
- **Tests:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("auth_token", jsonData.token);
```

#### Request 3: Get Profile
- **Method:** GET
- **URL:** `http://localhost:5000/api/auth/me`
- **Headers:**
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("User has email", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user.email).to.exist;
});
```

---

## 🛠️ Implementation Details

### File Structure
```
server/src/
├── utils/
│   └── auth.js              # JWT + bcrypt utilities
├── middleware/
│   └── authenticate.js      # JWT verification middleware
├── models/
│   └── userModel.js         # Database queries
├── controllers/
│   └── authController.js    # Route handlers
├── routes/
│   └── authRoutes.js        # Route definitions
├── app.js                   # Main app (updated with routes)
└── index.js
```

### Key Functions

#### auth.js
- `signToken(payload)` - Generate JWT token
- `verifyToken(token)` - Verify JWT token
- `hashPassword(password)` - Hash password with bcrypt
- `comparePassword(plain, hashed)` - Verify password
- `extractToken(authHeader)` - Extract token from header
- `isValidEmail(email)` - Validate email format
- `isValidName(name)` - Validate name
- `validatePassword(password)` - Check password strength

#### authenticate.js Middleware
- `authenticate` - Verify JWT and attach user to request
- `authenticateOptional` - Optional JWT verification

#### authController.js
- `signup(req, res)` - Handle registration
- `login(req, res)` - Handle login
- `getMe(req, res)` - Handle profile retrieval

#### userModel.js
- `createUser(email, passwordHash)` - Create user in DB
- `findUserByEmail(email)` - Find user by email
- `findUserById(userId)` - Find user by ID
- `getUserWithProfile(userId)` - Get user + profile data

---

## 🔄 Complete User Flow

```
1. User fills signup form
   ↓
2. POST /api/auth/signup
   ├─ Validate inputs
   ├─ Check email not exists
   ├─ Hash password with bcrypt
   ├─ Insert user in DB
   ├─ Sign JWT token
   └─ Return {token, user}
   ↓
3. Frontend stores token (localStorage/sessionStorage)
   ↓
4. User navigates to protected route
   ↓
5. Frontend sends: GET /api/auth/me with "Authorization: Bearer <token>"
   ├─ Middleware extracts token
   ├─ Verifies JWT signature
   ├─ Decodes user ID
   ├─ Fetches user from DB
   └─ Attaches user to request
   ↓
6. Controller returns user data
   ↓
7. Frontend displays user profile
```

---

## ⚠️ Security Considerations

✅ **Implemented:**
- Password hashing with bcryptjs (10 salt rounds)
- JWT signing with HS256
- Token expiration (7 days)
- Authorization header validation
- Input validation and sanitization
- Unique email constraint in database

⚠️ **For Production, Add:**
- HTTPS only
- Secure HTTP-only cookies for tokens
- Refresh token rotation
- Rate limiting on auth endpoints
- Helmet middleware for security headers
- Environment-specific JWT secrets
- Password complexity requirements
- Account lockout after failed attempts
- 2FA/MFA support
- Audit logging for auth events

---

## 📊 Database Schema (Auth-related)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Profile table (linked to users)
CREATE TABLE profile (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  name VARCHAR(255),
  grade VARCHAR(50),
  stream VARCHAR(100),
  interests TEXT[],
  career_aspirations TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🚀 Deployment Notes

### Environment Variables Required
```env
JWT_SECRET=your_production_secret_key_min_32_chars
NODE_ENV=production
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=ai_counsellor
DB_USER=postgres
DB_PASSWORD=your_db_password
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com
```

### JWT Secret Generation
```bash
# Generate secure 32+ character secret
openssl rand -base64 32
```

---

## 🐛 Troubleshooting

### "Invalid token" error
- **Cause:** Token tampered with or signed with different secret
- **Fix:** Check JWT_SECRET matches on server
- **Debug:** `npm run dev` and check console

### "Token expired" error
- **Cause:** JWT token older than 7 days
- **Fix:** User must re-login
- **Solution:** Implement refresh tokens for production

### "Email already registered" error
- **Cause:** User with that email exists
- **Fix:** User should login instead
- **Check:** `SELECT * FROM users WHERE email = 'xxx';`

### "Missing authorization header" error
- **Cause:** Frontend not sending Authorization header
- **Fix:** Check frontend is using:
  ```javascript
  Authorization: Bearer <token>
  ```

### Password hashing takes too long
- **Cause:** SALT_ROUNDS = 10 is default
- **Solution:** Reduce to 8 for faster hashing (less secure)
- **File:** `src/utils/auth.js` line 20

---

## 📞 API Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | User/resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Internal error |

---

**Last Updated:** January 26, 2026  
**Status:** ✅ Production Ready (with noted security enhancements for deployment)
