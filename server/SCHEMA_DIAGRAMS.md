# Database Schema Diagram & Data Flow

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│      USERS          │
├─────────────────────┤
│ id (UUID) PK        │
│ email UNIQUE        │◄────────────────────────────────┐
│ password_hash       │                                 │
│ created_at          │                                 │
│ updated_at          │                                 │
└──────────┬──────────┘                                 │
           │ (1:1)                                      │
           │                                            │
           ├──────────────┬──────────────┬──────────────┤
           │              │              │              │
      ┌────▼────┐    ┌────▼────┐   ┌────▼─────┐   ┌───▼────┐
      │ PROFILE │    │ SHORTLIST│   │ LOCKED_  │   │APPLIC- │
      │         │    │          │   │UNIVERSITY│   │ATIONS  │
      ├─────────┤    ├──────────┤   ├──────────┤   ├────────┤
      │id (PK)  │    │id (PK)   │   │id (PK)   │   │id (PK) │
      │user_id  │    │user_id FK│   │user_id FK│   │user_idFK
      │(UNIQUE) │    │univ_id FK│   │univ_id FK│   │univ_idFK
      │name     │    │created_at│   │locked_at │   │stmnt   │
      │grade    │    │          │   │          │   │resume  │
      │stream   │    │UNIQUE    │   │UNIQUE    │   │status  │
      │interests│    │(user,    │   │(user)    │   │submit..│
      │aspir... │    │univ)     │   │          │   │created │
      └────┬────┘    └────┬─────┘   └────┬─────┘   └───┬────┘
           │              │              │             │
           │ (all 1:∞)    │              │             │
           │              │              │             │
           │              └──────┬───────┴─────────────┤
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 │ (∞:∞)
                         ┌───────▼──────────┐
                         │  UNIVERSITIES    │
                         ├──────────────────┤
                         │ id (UUID) PK     │
                         │ name             │
                         │ location         │
                         │ description      │
                         │ stream_tags[]    │
                         │ app_deadline     │
                         │ created_at       │
                         └──────────────────┘
```

---

## 🔄 User Journey Data Flow

### Stage 1: Landing → Auth

```
Landing Page
    ↓
User clicks "Get Started"
    ↓
Auth Form (Email + Password)
    ↓
Validation:
  - Email format valid
  - Password length ≥ 6
  - Email not already registered (if signup)
    ↓
INSERT INTO users (email, password_hash)
    ↓
✅ User created, JWT token issued
```

### Stage 2: Auth → Onboarding

```
Auth Success (Session)
    ↓
Check profile exists:
  SELECT * FROM profile WHERE user_id = $1
    ↓
IF profile NOT found:
  → Show Onboarding Form
ELSE:
  → Skip to Dashboard
```

### Stage 3: Onboarding → Dashboard

```
Onboarding Form Submission:
  - Name (required)
  - Grade (required)
  - Stream (required)
  - Interests (array, 2-5 items)
  - Career Aspirations (text)
    ↓
INSERT INTO profile (user_id, name, grade, stream, interests, career_aspirations)
    ↓
✅ Profile created (UNIQUE constraint ensures only 1 per user)
    ↓
Redirect to Dashboard
```

### Stage 4: Dashboard → University Discovery

```
Dashboard Hub:
  - Display: "Welcome, [Name]"
  - 4 Action Cards
    ↓
User clicks "University Discovery"
    ↓
SELECT * FROM universities ORDER BY name
    ↓
Display 30 universities with filters:
  - Location (dropdown)
  - Stream (dropdown)
    ↓
User can browse and click "Add to Shortlist"
```

### Stage 5: University Discovery → Shortlist

```
User clicks "Add to Shortlist" button:
  - University: MIT
  - User: user_123
    ↓
INSERT INTO shortlist (user_id, university_id)
  ON CONFLICT (user_id, university_id) DO NOTHING
    ↓
✅ Added (UNIQUE constraint prevents duplicates)
    ↓
Button changes to "✓ Added"
Counter: "2 of 5 universities shortlisted"
    ↓
User can add up to 5 total
```

### Stage 6: Shortlist → University Lock

```
User clicks "View Shortlist" / "Proceed to Lock"
    ↓
SELECT s.university_id FROM shortlist s
WHERE s.user_id = $1 ORDER BY created_at
    ↓
Display all shortlisted universities
    ↓
User clicks "🔒 LOCK THIS LIST" button
    ↓
Confirmation Dialog:
  "You cannot change this after locking. Confirm?"
    ↓
IF User Confirms:
  INSERT INTO locked_university (user_id, university_id)
  SELECT user_id, university_id FROM shortlist
  WHERE user_id = $1
  LIMIT 1  ← Only one can be locked (UNIQUE constraint)
    ↓
✅ Locked
    ↓
Display "🔒 LOCKED" badge on each university
    ↓
Disable removal/editing of shortlist
```

### Stage 7: Locked List → Applications

```
User clicks "Proceed to Applications"
    ↓
FOR EACH locked_university:
  INSERT INTO applications (user_id, university_id, status)
  VALUES ($user_id, $university_id, 'not_started')
    ↓
✅ Applications created
    ↓
Display Application Dashboard:
  For each university:
  - Name
  - Deadline
  - Status: "Not Started"
  - Button: "Start Application"
```

### Stage 8: Applications → Submission

```
User clicks "Start Application" for MIT
    ↓
UPDATE applications SET status = 'in_progress'
WHERE user_id = $1 AND university_id = $2
    ↓
Show Application Form:
  - Personal Statement (textarea)
  - Resume Upload (file input)
  - Submit Button
    ↓
User fills form and clicks Submit:
  - personal_statement: "I aspire to..."
  - resume_url: "s3://bucket/resume.pdf"
    ↓
UPDATE applications SET
  status = 'submitted',
  submitted_at = NOW(),
  updated_at = NOW()
WHERE user_id = $1 AND university_id = $2
    ↓
✅ Submitted
    ↓
Status changes to "✓ Submitted"
Button disabled
    ↓
Repeat for other universities...
    ↓
FINAL: All applications submitted
```

---

## 🔐 Constraint Enforcement Examples

### Example 1: Duplicate Email Fails

```sql
-- First signup
INSERT INTO users (email, password_hash) 
VALUES ('student@university.com', 'hash123');
✅ Success

-- Second signup with same email
INSERT INTO users (email, password_hash) 
VALUES ('student@university.com', 'hash456');
❌ ERROR: duplicate key value violates unique constraint "users_email_key"
```

### Example 2: Duplicate Profile Fails

```sql
-- First profile
INSERT INTO profile (user_id, name, grade, stream, interests)
VALUES ('user-123', 'John Doe', '12th', 'Science', ARRAY['AI']);
✅ Success

-- Try second profile for same user
INSERT INTO profile (user_id, name, grade, stream, interests)
VALUES ('user-123', 'Jane Doe', '12th', 'Science', ARRAY['AI']);
❌ ERROR: duplicate key value violates unique constraint "profile_user_id_key"
```

### Example 3: Duplicate Shortlist Fails

```sql
-- Add MIT to shortlist
INSERT INTO shortlist (user_id, university_id)
VALUES ('user-123', 'univ-mit');
✅ Success

-- Try to add MIT again
INSERT INTO shortlist (user_id, university_id)
VALUES ('user-123', 'univ-mit');
❌ ERROR: duplicate key value violates unique constraint "unique_shortlist_per_user_university"
```

### Example 4: Duplicate Lock Fails

```sql
-- Lock first university
INSERT INTO locked_university (user_id, university_id)
VALUES ('user-123', 'univ-mit');
✅ Success

-- Try to lock another (only 1 per user allowed)
INSERT INTO locked_university (user_id, university_id)
VALUES ('user-123', 'univ-stanford');
❌ ERROR: duplicate key value violates unique constraint "locked_university_user_id_key"
```

### Example 5: Invalid Status Fails

```sql
-- Create application with valid status
INSERT INTO applications (user_id, university_id, status)
VALUES ('user-123', 'univ-mit', 'not_started');
✅ Success

-- Try to create with invalid status
INSERT INTO applications (user_id, university_id, status)
VALUES ('user-123', 'univ-stanford', 'accepted');
❌ ERROR: new row for relation "applications" violates check constraint "valid_status"
   Valid values: 'not_started', 'in_progress', 'submitted'
```

---

## 📈 Data State Transitions

### Shortlist State Machine

```
  ┌─────────────────────────────────────────┐
  │  SHORTLIST (Mutable, Before Lock)       │
  ├─────────────────────────────────────────┤
  │ Actions:                                │
  │  ✓ Add university (max 5)               │
  │  ✓ Remove university                    │
  │  ✓ View list                            │
  │  ✓ Lock entire list (→ LOCKED)          │
  └─────────────────────────────────────────┘
           │
           │ Lock Action
           ▼
  ┌─────────────────────────────────────────┐
  │  LOCKED_UNIVERSITY (Immutable, Final)   │
  ├─────────────────────────────────────────┤
  │ Actions:                                │
  │  ✓ View list (read-only)                │
  │  ✗ Add university (blocked)             │
  │  ✗ Remove university (blocked)          │
  │  ✗ Modify (blocked)                     │
  │  ✓ Create applications (→ APPLICATIONS) │
  └─────────────────────────────────────────┘
           │
           │ Create Applications
           ▼
  ┌─────────────────────────────────────────┐
  │  APPLICATIONS (Status-based)            │
  ├─────────────────────────────────────────┤
  │ Initial: 'not_started'                  │
  │   ↓ Update → 'in_progress'              │
  │   ↓ Submit → 'submitted' (final)        │
  │                                         │
  │ Once submitted: immutable               │
  └─────────────────────────────────────────┘
```

### Application Status Flow

```
CREATE application
      ↓
status = 'not_started'
      ↓
User clicks "Start Application"
      ↓
UPDATE: status = 'in_progress'
      ↓
User fills form
      ↓
User clicks "Submit"
      ↓
UPDATE: status = 'submitted', submitted_at = NOW()
      ↓
Application locked (no changes allowed)
```

---

## 🔗 Foreign Key Relationships

### Cascade Delete Behavior

```
DELETE FROM users WHERE id = 'user-123'
           │
           ├→ DELETE FROM profile WHERE user_id = 'user-123'
           │
           ├→ DELETE FROM shortlist WHERE user_id = 'user-123'
           │
           ├→ DELETE FROM locked_university WHERE user_id = 'user-123'
           │
           └→ DELETE FROM applications WHERE user_id = 'user-123'
```

### Foreign Key Restrictions

```
DELETE FROM universities WHERE id = 'univ-mit'
           │
           ├→ IF locked_university.university_id = 'univ-mit'
           │   └→ RESTRICT (cannot delete)
           │
           ├→ shortlist.university_id = 'univ-mit'
           │   └→ CASCADE (delete)
           │
           └→ applications.university_id = 'univ-mit'
               └→ CASCADE (delete)
```

---

## 📊 Typical Database State During Application

### After User Registration + Onboarding

```
users (1 row)
├─ id: user-123
├─ email: student@university.com
└─ password_hash: bcrypted...

profile (1 row)
├─ id: profile-456
├─ user_id: user-123  ← UNIQUE KEY
├─ name: John Doe
├─ grade: 12th
├─ stream: Science
└─ interests: ['AI', 'Engineering']

universities (30 rows - pre-seeded)
├─ id: univ-mit, name: MIT, ...
├─ id: univ-stanford, name: Stanford, ...
└─ ... (28 more)
```

### After User Adds 5 Universities to Shortlist

```
shortlist (5 rows)
├─ user_id: user-123, university_id: univ-mit
├─ user_id: user-123, university_id: univ-stanford
├─ user_id: user-123, university_id: univ-harvard
├─ user_id: user-123, university_id: univ-caltech
└─ user_id: user-123, university_id: univ-oxford
```

### After User Locks Shortlist

```
locked_university (1 row)
└─ user_id: user-123  ← UNIQUE KEY (only 1 allowed)
   university_id: univ-mit
   locked_at: 2026-01-26T11:30:00Z

shortlist (5 rows - still exist for reference)
└─ (unchanged - lock doesn't delete, just marks)
```

### After Applications Created from Locked List

```
applications (5 rows)
├─ user_id: user-123, university_id: univ-mit,
   status: 'not_started', submitted_at: NULL
├─ user_id: user-123, university_id: univ-stanford,
   status: 'not_started', submitted_at: NULL
├─ user_id: user-123, university_id: univ-harvard,
   status: 'not_started', submitted_at: NULL
├─ user_id: user-123, university_id: univ-caltech,
   status: 'not_started', submitted_at: NULL
└─ user_id: user-123, university_id: univ-oxford,
   status: 'not_started', submitted_at: NULL
```

### After User Submits Some Applications

```
applications (5 rows)
├─ user_id: user-123, university_id: univ-mit,
   status: 'submitted', submitted_at: 2026-01-26T12:00:00Z
├─ user_id: user-123, university_id: univ-stanford,
   status: 'submitted', submitted_at: 2026-01-26T12:15:00Z
├─ user_id: user-123, university_id: univ-harvard,
   status: 'in_progress', submitted_at: NULL
├─ user_id: user-123, university_id: univ-caltech,
   status: 'not_started', submitted_at: NULL
└─ user_id: user-123, university_id: univ-oxford,
   status: 'not_started', submitted_at: NULL
```

---

## ✅ Constraint Coverage Summary

| Requirement | Implementation | Enforcement |
|-------------|---|---|
| One account per email | `UNIQUE(email)` | Database constraint |
| One profile per user | `UNIQUE(user_id)` | Database constraint |
| No duplicate shortlists | `UNIQUE(user_id, university_id)` | Database constraint |
| One lock per user | `UNIQUE(user_id)` | Database constraint |
| One app per university | `UNIQUE(user_id, university_id)` | Database constraint |
| Valid app status | `CHECK(status IN (...))` | Database constraint |
| User cascade delete | `FK ... ON DELETE CASCADE` | Database trigger |
| University restrict delete | `FK ... ON DELETE RESTRICT` | Database trigger |

---

**Diagram Version:** 1.0  
**Last Updated:** January 26, 2026  
**Status:** ✅ Complete
