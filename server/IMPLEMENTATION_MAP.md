# Auth System - Visual Implementation Map

## 📊 Complete File Map

```
server/
│
├── 📄 SETUP & CONFIGURATION
│   ├── package.json               ← Dependencies (express, bcryptjs, jsonwebtoken)
│   ├── .env                       ← Environment variables (JWT_SECRET, DB config)
│   ├── .env.example               ← Template for team
│   ├── .gitignore                 ← Exclude node_modules, .env, logs
│   │
│   └── DATABASE & SEEDS
│       ├── schema.sql             ← PostgreSQL DDL (6 tables, 30 universities)
│       ├── setup-db.bat           ← Automated setup (Windows)
│       ├── setup-db.sh            ← Automated setup (Linux/macOS)
│       └── QUERIES.sql            ← 100+ SQL examples
│
├── 🔧 SOURCE CODE
│   └── src/
│       ├── index.js               ← Server entry point (listens on port 5000)
│       ├── app.js                 ← Express configuration (middleware, routes)
│       ├── db.js                  ← PostgreSQL connection pool
│       │
│       ├── 🔐 AUTHENTICATION
│       │   ├── utils/
│       │   │   └── auth.js        ← JWT + bcryptjs utilities (82 lines)
│       │   │       ├─ signToken()
│       │   │       ├─ verifyToken()
│       │   │       ├─ hashPassword()
│       │   │       ├─ comparePassword()
│       │   │       └─ isValidEmail()
│       │   │
│       │   ├── middleware/
│       │   │   └── authenticate.js ← JWT verification (58 lines)
│       │   │       ├─ authenticate()      ← Required auth
│       │   │       └─ authenticateOptional() ← Optional auth
│       │   │
│       │   ├── models/
│       │   │   └── userModel.js   ← Database queries (120 lines)
│       │   │       ├─ createUser()
│       │   │       ├─ findUserByEmail()
│       │   │       ├─ getUserWithProfile()
│       │   │       └─ profileExists()
│       │   │
│       │   ├── controllers/
│       │   │   └── authController.js ← Request handlers (215 lines)
│       │   │       ├─ signup()     ← Register user
│       │   │       ├─ login()      ← Authenticate user
│       │   │       └─ getMe()      ← Get profile (protected)
│       │   │
│       │   └── routes/
│       │       └── authRoutes.js  ← Route definitions (23 lines)
│       │           ├─ POST /api/auth/signup
│       │           ├─ POST /api/auth/login
│       │           └─ GET  /api/auth/me [protected]
│       │
│       └── [Other routes - coming soon]
│           ├── profileRoutes.js  ← To be implemented
│           ├── universityRoutes.js
│           ├── shortlistRoutes.js
│           └── applicationRoutes.js
│
└── 📚 DOCUMENTATION
    ├── INDEX.md                  ← THIS FILE - Navigation hub
    │
    ├── 🚀 GETTING STARTED
    │   ├── README.md             ← Server setup & quick start
    │   └── AUTH_COMPLETE.md      ← Master summary
    │
    ├── 📖 API DOCUMENTATION
    │   ├── AUTH_API.md           ← Complete endpoint reference
    │   │   ├─ Endpoint details
    │   │   ├─ Request/response examples
    │   │   ├─ Postman collection
    │   │   └─ Error codes
    │   │
    │   └── AUTH_CODE_REFERENCE.md ← Code deep-dive
    │       ├─ Function details
    │       ├─ Data flow diagrams
    │       ├─ Response examples
    │       └─ Security features
    │
    ├── 🧪 TESTING GUIDES
    │   ├── AUTH_TESTS.md         ← 14+ test scenarios
    │   │   ├─ cURL commands
    │   │   ├─ Postman setup
    │   │   ├─ Automated test script
    │   │   └─ Manual checklist
    │   │
    │   └── AUTH_IMPLEMENTATION.md ← Integration guide
    │       ├─ File structure
    │       ├─ Component overview
    │       ├─ Setup instructions
    │       └─ Troubleshooting
    │
    ├── 🗄️ DATABASE DOCS
    │   ├── DATABASE.md           ← Complete schema reference
    │   │   ├─ Table definitions
    │   │   ├─ Constraints
    │   │   ├─ Query examples
    │   │   └─ Setup instructions
    │   │
    │   ├── SCHEMA_DIAGRAMS.md    ← Visual ERD & flows
    │   │   ├─ Entity diagram
    │   │   ├─ Data flow diagrams
    │   │   ├─ State transitions
    │   │   └─ Constraint examples
    │   │
    │   └── SCHEMA_SUMMARY.md     ← Quick reference
    │       ├─ Table overview
    │       ├─ Constraint matrix
    │       ├─ Verification checklist
    │       └─ Common operations
```

---

## 🔄 Request/Response Flow Map

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT REQUEST (Browser/Postman)                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  POST /api/auth/signup                                  │
│  {name, email, password}                                │
│                                                         │
│  OR                                                     │
│                                                         │
│  POST /api/auth/login                                   │
│  {email, password}                                      │
│                                                         │
│  OR                                                     │
│                                                         │
│  GET /api/auth/me                                       │
│  Headers: Authorization: Bearer <token>                 │
│                                                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ EXPRESS SERVER (src/app.js)                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ├─ CORS Middleware (allow localhost:5173)              │
│ ├─ Body Parser (JSON)                                  │
│ ├─ Request Logging                                     │
│ └─ Route Matching                                      │
│                                                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Route Matching │
        │ (authRoutes)   │
        └────────┬───────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
 signup()      login()       getMe()
    │            │            │
    │            │            ├─ authenticate middleware
    │            │            │  (verify JWT token)
    │            │            │
    │            │            ▼
    └────────────┴─────────────────────────┐
                 │                         │
                 ▼                         │
        ┌──────────────────┐               │
        │ Input Validation │               │
        │ (utils/auth.js)  │               │
        │                  │               │
        │ • Email format   │               │
        │ • Password length│               │
        │ • Whitespace trim               │
        └────────┬─────────┘               │
                 │                         │
                 ▼                         │
        ┌──────────────────┐               │
        │ Database Query   │               │
        │ (models/userModel)              │
        │                  │               │
        │ • Check exists   │               │
        │ • Hash password  │               │
        │ • Create user    │               │
        └────────┬─────────┘               │
                 │                         │
                 ▼                         │
        ┌──────────────────┐               │
        │ PostgreSQL DB    │               │
        │                  │               │
        │ INSERT/SELECT    │               │
        │ users table      │               │
        └────────┬─────────┘               │
                 │                         │
                 ▼                         │
        ┌──────────────────┐               │
        │ Token Generation │               │
        │ (utils/auth.js)  │               │
        │                  │               │
        │ jwt.sign()       │               │
        │ {id, email, ...} │               │
        └────────┬─────────┘               │
                 │                         │
                 │ ◄─────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ RESPONSE (200/201/400/401/409)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ {                                                       │
│   "message": "...",                                     │
│   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", │
│   "user": {                                             │
│     "id": "550e8400...",                                │
│     "email": "john@example.com",                        │
│     "name": "John Doe"                                  │
│   }                                                     │
│ }                                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Implementation Map

```
┌─────────────────────────────────────────────────────────┐
│ PASSWORD SECURITY                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ User Input: "SecurePass123"                             │
│     │                                                   │
│     ▼ (utils/auth.js → hashPassword)                   │
│                                                         │
│ bcryptjs.genSalt(10)                                    │
│     │ → 10 rounds (OWASP recommended)                   │
│                                                         │
│     ▼ (bcryptjs.hash)                                  │
│                                                         │
│ Hash: "$2b$10$N9qo8uLOicqj5..."                         │
│                                                         │
│     ▼ (models/userModel.js → createUser)               │
│                                                         │
│ Database: password_hash = "$2b$10$N9qo8uLOicqj5..."    │
│                                                         │
│ ✅ Never stored plaintext                              │
│ ✅ Different hash every time                           │
│ ✅ Secure comparison function                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TOKEN SECURITY                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Payload:                                                │
│ {                                                       │
│   "id": "550e8400...",                                  │
│   "email": "john@example.com",                          │
│   "type": "access_token"                                │
│ }                                                       │
│     │                                                   │
│     ▼ (utils/auth.js → signToken)                      │
│                                                         │
│ jwt.sign(payload, JWT_SECRET, {                         │
│   expiresIn: '7d',                                      │
│   algorithm: 'HS256'                                    │
│ })                                                      │
│     │                                                   │
│     ▼                                                   │
│                                                         │
│ Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.         │
│        eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNCI6                │
│        fGNzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJKb2huIERv  │
│        ZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQy  │
│        NjIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_ad  │
│        QssW5c"                                          │
│     │                                                   │
│     ▼ (middleware/authenticate.js → authenticate)      │
│                                                         │
│ Protected Request:                                      │
│ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6.   │
│     │                                                   │
│     ▼ (utils/auth.js → verifyToken)                    │
│                                                         │
│ jwt.verify(token, JWT_SECRET, {                         │
│   algorithms: ['HS256']                                 │
│ })                                                      │
│     │                                                   │
│     ├─ Verify signature                                 │
│     ├─ Check expiration                                 │
│     └─ Decode payload                                   │
│                                                         │
│     ▼                                                   │
│                                                         │
│ req.user = {                                            │
│   id: "550e8400...",                                    │
│   email: "john@example.com",                            │
│   type: "access_token",                                 │
│   iat: 1643172600,                                      │
│   exp: 1643777400                                       │
│ }                                                       │
│                                                         │
│ ✅ Token verified & decoded                            │
│ ✅ User attached to request                            │
│ ✅ Handler can access user data                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Database Schema Map

```
users (1) ──────────────────────────┐
  │                                 │
  ├─ id (UUID, PK)                 │
  ├─ email (VARCHAR, UNIQUE)       │
  ├─ password_hash (VARCHAR)       │
  ├─ created_at (TIMESTAMP)        │
  └─ updated_at (TIMESTAMP)        │
                                   │
  ├─────────────────┐              │
  │                 │              │
  ▼                 ▼              │
(1)           (1) profile   (1) locked_university ◄─┘
  │                │              │
  │                ▼              ▼
  │            user_id (UNIQUE)   universities (30 records)
  │            name, grade...     ├─ id (UUID, PK)
  │            interests[]        ├─ name
  │                               ├─ location
  │ shortlist (∞)                 ├─ stream_tags[]
  │   ├─ user_id (FK)             └─ application_deadline
  │   ├─ university_id (FK)
  │   └─ UNIQUE(user_id, univ_id) ◄────┐
  │                                     │
  ▼                                     │
applications (∞)                        │
  ├─ user_id (FK)                      │
  ├─ university_id (FK) ────────────────┘
  ├─ personal_statement
  ├─ resume_url
  ├─ status (CHECK: valid status)
  ├─ submitted_at
  └─ UNIQUE(user_id, university_id)
```

---

## 🧪 Test Coverage Map

```
┌─────────────────────────────────────────────────────────┐
│ 14+ TEST SCENARIOS (AUTH_TESTS.md)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ SIGNUP TESTS (5)                                        │
│ ├─ Test 1: Valid signup → 201 ✅                       │
│ ├─ Test 2: Duplicate email → 409 ✅                    │
│ ├─ Test 3: Invalid email → 400 ✅                      │
│ ├─ Test 4: Missing fields → 400 ✅                     │
│ └─ Test 5: Short password → 400 ✅                     │
│                                                         │
│ LOGIN TESTS (3)                                         │
│ ├─ Test 6: Valid login → 200 ✅                        │
│ ├─ Test 7: Wrong password → 401 ✅                     │
│ └─ Test 8: Nonexistent email → 401 ✅                  │
│                                                         │
│ PROTECTED ROUTE TESTS (3)                               │
│ ├─ Test 9: Valid token → 200 ✅                        │
│ ├─ Test 10: Missing header → 401 ✅                    │
│ ├─ Test 11: Invalid format → 401 ✅                    │
│ └─ Test 12: Malformed JWT → 401 ✅                     │
│                                                         │
│ EDGE CASES (2)                                          │
│ ├─ Test 13: Case-insensitive email ✅                  │
│ └─ Test 14: Whitespace trimming ✅                     │
│                                                         │
│ TOOLS: cURL | Postman | Automated Script               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Development Checklist

```
┌─────────────────────────────────────────────────────────┐
│ IMPLEMENTATION STATUS                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ✅ PHASE 1: INFRASTRUCTURE                             │
│    ├─ Express server setup                             │
│    ├─ PostgreSQL connection                            │
│    ├─ CORS configuration                               │
│    ├─ Error handling middleware                        │
│    └─ Health check endpoint                            │
│                                                         │
│ ✅ PHASE 2: AUTHENTICATION                             │
│    ├─ JWT utilities (sign/verify)                      │
│    ├─ bcryptjs utilities (hash/compare)                │
│    ├─ Middleware implementation                        │
│    ├─ Controller handlers (3)                          │
│    ├─ Database models (8 queries)                      │
│    ├─ Route definitions                                │
│    └─ App.js integration                               │
│                                                         │
│ ✅ PHASE 2B: VALIDATION & ERROR HANDLING               │
│    ├─ Input validation                                 │
│    ├─ Database constraint checks                       │
│    ├─ Error responses                                  │
│    └─ Security measures                                │
│                                                         │
│ ✅ PHASE 3: TESTING & DOCUMENTATION                    │
│    ├─ Test scenarios (14+)                             │
│    ├─ cURL examples                                    │
│    ├─ Postman setup                                    │
│    ├─ API documentation                                │
│    ├─ Implementation guide                             │
│    ├─ Code reference                                   │
│    ├─ Database documentation                           │
│    └─ Troubleshooting guide                            │
│                                                         │
│ 🔄 PHASE 4: ADDITIONAL FEATURES (NEXT)                 │
│    ├─ Profile creation endpoint                        │
│    ├─ University discovery                             │
│    ├─ Shortlist management                             │
│    └─ Application submission                           │
│                                                         │
│ 📋 PHASE 5: PRODUCTION (PLANNED)                        │
│    ├─ Rate limiting                                    │
│    ├─ Advanced logging                                 │
│    ├─ Error tracking                                   │
│    ├─ Performance optimization                         │
│    └─ Monitoring & alerting                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Navigation

| Need | File | Location |
|------|------|----------|
| **Setup** | [README.md](README.md) | Root |
| **API Docs** | [AUTH_API.md](AUTH_API.md) | Root |
| **Tests** | [AUTH_TESTS.md](AUTH_TESTS.md) | Root |
| **Code Details** | [AUTH_CODE_REFERENCE.md](AUTH_CODE_REFERENCE.md) | Root |
| **Integration** | [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md) | Root |
| **Summary** | [AUTH_COMPLETE.md](AUTH_COMPLETE.md) | Root |
| **Database** | [DATABASE.md](DATABASE.md) | Root |
| **Queries** | [QUERIES.sql](QUERIES.sql) | Root |
| **Utils** | [src/utils/auth.js](src/utils/auth.js) | src/ |
| **Middleware** | [src/middleware/authenticate.js](src/middleware/authenticate.js) | src/ |
| **Models** | [src/models/userModel.js](src/models/userModel.js) | src/ |
| **Controllers** | [src/controllers/authController.js](src/controllers/authController.js) | src/ |
| **Routes** | [src/routes/authRoutes.js](src/routes/authRoutes.js) | src/ |

---

**Status:** ✅ Complete Authentication System  
**Lines of Code:** 648  
**Documentation:** 8 files  
**Test Cases:** 14+  
**Ready for:** Frontend Integration

---

**Created:** January 26, 2026
