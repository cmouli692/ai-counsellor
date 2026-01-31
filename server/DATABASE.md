# Database Schema Documentation

## 📋 Overview

PostgreSQL database schema for AI Counsellor MVP with 6 tables, proper constraints, and 30 seeded universities.

**Tables:**
- `users` - Authentication and user accounts
- `profile` - User onboarding data
- `universities` - Available universities
- `shortlist` - Universities added to shortlist (before lock)
- `locked_university` - Final locked universities per user
- `applications` - Application submissions with status tracking

---

## 🗂️ Table Schemas

### 1. **users** Table
Stores authentication and user account information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints:**
- `id` - Primary key, auto-generated UUID
- `email` - **UNIQUE** (enforces one account per email)
- `password_hash` - Store bcrypted passwords, never plaintext

**Indexes:**
- `idx_users_email` - Fast email lookups for login

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@university.com",
  "password_hash": "$2b$10$...",
  "created_at": "2026-01-26T10:30:00Z",
  "updated_at": "2026-01-26T10:30:00Z"
}
```

---

### 2. **profile** Table
Stores onboarding/profile information (one per user).

```sql
CREATE TABLE profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  stream VARCHAR(100) NOT NULL,
  interests TEXT[] NOT NULL,
  career_aspirations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);
```

**Constraints:**
- `user_id` - **UNIQUE** (enforces exactly one profile per user)
- Foreign key to `users` - cascades on user delete
- `interests` - Array of strings (e.g., `['Engineering', 'AI']`)

**Indexes:**
- `idx_profile_user_id` - Quick profile lookup by user

**Example:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440111",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Raj Patel",
  "grade": "12th",
  "stream": "Science",
  "interests": ["AI", "Engineering", "Robotics"],
  "career_aspirations": "Data Scientist at Google",
  "created_at": "2026-01-26T10:35:00Z",
  "updated_at": "2026-01-26T10:35:00Z"
}
```

---

### 3. **universities** Table
Stores available universities (seeded with 30 records).

```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  stream_tags TEXT[],
  application_deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `stream_tags` - Array for filtering (e.g., `['Science', 'Engineering']`)
- `application_deadline` - Date for task tracking

**Indexes:**
- `idx_universities_name` - Search by name
- `idx_universities_location` - Filter by location

**Example:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "name": "MIT",
  "location": "Cambridge, MA",
  "description": "Top-ranked STEM research university",
  "stream_tags": ["Science", "Engineering"],
  "application_deadline": "2026-01-15",
  "created_at": "2026-01-26T10:00:00Z"
}
```

**Pre-seeded Universities (30 total):**
- MIT, Stanford, Harvard, Caltech
- Oxford, Cambridge
- University of Tokyo, NUS
- IIT Delhi, IISc, Delhi University, Ashoka, FLAME, Christ
- Bocconi, IE University
- ETH Zurich
- Melbourne, ANU
- Peking, Tsinghua
- UCL, Imperial College London
- Berlin University, Sorbonne
- KAIST
- Toronto, McGill
- Yale, Princeton

---

### 4. **shortlist** Table
Tracks universities added to shortlist (before final lock).

```sql
CREATE TABLE shortlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  university_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_shortlist_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_shortlist_university FOREIGN KEY (university_id) 
    REFERENCES universities(id) ON DELETE CASCADE,
  CONSTRAINT unique_shortlist_per_user_university 
    UNIQUE(user_id, university_id)
);
```

**Constraints:**
- `UNIQUE(user_id, university_id)` - **Cannot shortlist same university twice**
- Foreign keys with CASCADE delete

**Indexes:**
- `idx_shortlist_user_id` - Get all shortlisted by user
- `idx_shortlist_university_id` - Get all users who shortlisted

**Example:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440333",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "university_id": "770e8400-e29b-41d4-a716-446655440222",
  "created_at": "2026-01-26T11:00:00Z"
}
```

**Query Examples:**
```sql
-- Get all universities shortlisted by user
SELECT u.name FROM shortlist s
JOIN universities u ON s.university_id = u.id
WHERE s.user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Count shortlisted for user (max 5)
SELECT COUNT(*) FROM shortlist WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Prevent duplicate: constraint will reject
-- INSERT INTO shortlist (user_id, university_id) VALUES (..., ...);
-- INSERT INTO shortlist (user_id, university_id) VALUES (..., ...);
-- Second insert will fail with UNIQUE constraint violation
```

---

### 5. **locked_university** Table
Tracks the final locked universities (one per user).

```sql
CREATE TABLE locked_university (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  university_id UUID NOT NULL,
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_locked_university_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_locked_university_ref FOREIGN KEY (university_id) 
    REFERENCES universities(id) ON DELETE RESTRICT
);
```

**Constraints:**
- `user_id` - **UNIQUE** (only one locked list per user)
- Foreign key with RESTRICT (prevents deleting universities with locked lists)

**Indexes:**
- `idx_locked_university_user_id` - Quick lookup of locked status
- `idx_locked_university_locked_at` - Track lock timestamps

**Example:**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440444",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "university_id": "770e8400-e29b-41d4-a716-446655440222",
  "locked_at": "2026-01-26T11:30:00Z"
}
```

**Query Examples:**
```sql
-- Check if user has locked their list
SELECT COUNT(*) FROM locked_university WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Get locked status with university info
SELECT u.name, l.locked_at FROM locked_university l
JOIN universities u ON l.university_id = u.id
WHERE l.user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Once locked, trying to insert second entry fails (UNIQUE constraint)
```

---

### 6. **applications** Table
Stores application submissions and status tracking.

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  university_id UUID NOT NULL,
  personal_statement TEXT,
  resume_url VARCHAR(512),
  status VARCHAR(50) DEFAULT 'not_started',
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_university FOREIGN KEY (university_id) 
    REFERENCES universities(id) ON DELETE CASCADE,
  CONSTRAINT unique_application_per_user_university 
    UNIQUE(user_id, university_id),
  CONSTRAINT valid_status CHECK (
    status IN ('not_started', 'in_progress', 'submitted')
  )
);
```

**Constraints:**
- `UNIQUE(user_id, university_id)` - One application per user per university
- `CHECK status` - Only allows valid status values
- `submitted_at` - NULL until actually submitted

**Indexes:**
- `idx_applications_user_id` - Get user's applications
- `idx_applications_university_id` - Get university's applications
- `idx_applications_status` - Filter by status
- `idx_applications_submitted_at` - Timeline queries

**Status Flow:**
```
not_started → in_progress → submitted
```

**Example:**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440555",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "university_id": "770e8400-e29b-41d4-a716-446655440222",
  "personal_statement": "I aspire to advance AI research...",
  "resume_url": "https://storage.example.com/resumes/student-123.pdf",
  "status": "submitted",
  "submitted_at": "2026-01-26T12:00:00Z",
  "created_at": "2026-01-26T11:45:00Z",
  "updated_at": "2026-01-26T12:00:00Z"
}
```

**Query Examples:**
```sql
-- Get all applications for user
SELECT a.*, u.name FROM applications a
JOIN universities u ON a.university_id = u.id
WHERE a.user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Get submitted applications
SELECT * FROM applications WHERE status = 'submitted' AND submitted_at IS NOT NULL;

-- Count applications by status
SELECT status, COUNT(*) FROM applications GROUP BY status;

-- Find pending applications (not submitted)
SELECT * FROM applications WHERE status != 'submitted';
```

---

## 🔗 Relationships (Entity Diagram)

```
users (1) ────── (1) profile
  │
  ├─────────────── (∞) shortlist ──────────────── (∞) universities
  │
  ├─────────────── (∞) locked_university ──────────── (∞) universities
  │
  └─────────────── (∞) applications ──────────────── (∞) universities
```

---

## 🚀 Setup Instructions

### On macOS/Linux:

```bash
cd server

# Make setup script executable
chmod +x setup-db.sh

# Run setup
./setup-db.sh
```

### On Windows:

```powershell
cd server

# Run setup (requires PostgreSQL in PATH)
.\setup-db.bat
```

### Manual Setup:

```bash
# Create database
createdb -U postgres ai_counsellor_dev

# Load schema
psql -U postgres -d ai_counsellor_dev -f schema.sql
```

---

## ✅ Verification Queries

### Check all tables created:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

**Expected output:**
```
applications
locked_university
profile
shortlist
universities
users
```

### Check universities seeded:
```sql
SELECT COUNT(*) FROM universities;
```

**Expected:** 30

### Check indexes:
```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

### View table structure:
```sql
\d users
\d profile
\d universities
\d shortlist
\d locked_university
\d applications
```

---

## 🔐 Data Integrity Constraints

| Constraint | Table | Enforcement | Reason |
|-----------|-------|-------------|--------|
| UNIQUE(email) | users | Database | One account per email |
| UNIQUE(user_id) | profile | Database | Exactly one profile per user |
| UNIQUE(user_id, university_id) | shortlist | Database | Cannot shortlist same university twice |
| UNIQUE(user_id) | locked_university | Database | Only one locked list per user |
| UNIQUE(user_id, university_id) | applications | Database | One application per user per university |
| CHECK(status) | applications | Database | Valid status only ('not_started', 'in_progress', 'submitted') |

---

## 📊 Data Statistics

**Pre-seeded Data:**
- Universities: 30 records
- Users: 0 (to be created on signup)
- Profiles: 0 (created during onboarding)
- Shortlists: 0 (created when users add universities)
- Locked Universities: 0 (created when users lock shortlist)
- Applications: 0 (created when users submit applications)

---

## 🛠️ Common Queries

### Get user's full profile:
```sql
SELECT u.*, p.* FROM users u
LEFT JOIN profile p ON u.id = p.user_id
WHERE u.email = 'student@example.com';
```

### Get user's shortlist universities:
```sql
SELECT u.name, u.location FROM shortlist s
JOIN universities u ON s.university_id = u.id
WHERE s.user_id = $1
ORDER BY s.created_at;
```

### Check if user has locked their shortlist:
```sql
SELECT CASE 
  WHEN COUNT(*) > 0 THEN true 
  ELSE false 
END AS is_locked
FROM locked_university 
WHERE user_id = $1;
```

### Get user's application status:
```sql
SELECT u.name, a.status, a.submitted_at 
FROM applications a
JOIN universities u ON a.university_id = u.id
WHERE a.user_id = $1
ORDER BY a.created_at;
```

---

## 🔄 Schema Updates (Future)

To modify the schema:

1. **Add column:**
   ```sql
   ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
   ```

2. **Add constraint:**
   ```sql
   ALTER TABLE profile ADD CONSTRAINT chk_grade 
     CHECK (grade IN ('10th', '11th', '12th', 'Undergrad'));
   ```

3. **Add index:**
   ```sql
   CREATE INDEX idx_users_created_at ON users(created_at);
   ```

4. **Drop column (with backup first!):**
   ```sql
   ALTER TABLE users DROP COLUMN phone_number;
   ```

---

## 🗑️ Reset Database (Caution!)

```sql
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS locked_university CASCADE;
DROP TABLE IF EXISTS shortlist CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS profile CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then re-run `schema.sql`.

---

**Last Updated:** January 26, 2026  
**Schema Version:** 1.0  
**Status:** MVP Ready ✅
