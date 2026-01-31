# Database Schema - Implementation Summary

## ✅ Created Files

| File | Purpose |
|------|---------|
| `schema.sql` | Complete PostgreSQL schema with 6 tables + 30 seeded universities |
| `DATABASE.md` | Comprehensive documentation with examples and queries |
| `QUERIES.sql` | 100+ ready-to-use SQL queries for development |
| `setup-db.sh` | Automated setup script (macOS/Linux) |
| `setup-db.bat` | Automated setup script (Windows) |

---

## 📊 Database Architecture

### Tables (6 Total)

```
users                   (Authentication)
  ├─ profile           (Onboarding - ONE per user)
  ├─ shortlist         (Universities added - before lock)
  ├─ locked_university (Final locked list - ONE per user)
  └─ applications      (Submissions with status tracking)

universities           (Reference data - 30 seeded)
```

### Constraints

| Table | Constraint | Type | Purpose |
|-------|-----------|------|---------|
| `users` | `email` UNIQUE | Database | One account per email |
| `profile` | `user_id` UNIQUE | Database | Exactly one profile per user |
| `shortlist` | `UNIQUE(user_id, university_id)` | Database | Cannot shortlist twice |
| `locked_university` | `user_id` UNIQUE | Database | Only one lock per user |
| `applications` | `UNIQUE(user_id, university_id)` | Database | One app per university |
| `applications` | `status` CHECK | Database | Valid status only |

---

## 🚀 Quick Setup

### Windows:
```powershell
cd server
.\setup-db.bat
```

### macOS/Linux:
```bash
cd server
chmod +x setup-db.sh
./setup-db.sh
```

### Manual:
```bash
# Create database
createdb -U postgres ai_counsellor_dev

# Load schema
psql -U postgres -d ai_counsellor_dev -f schema.sql
```

---

## 🗂️ Table Reference

### users
- **Purpose:** User authentication
- **Columns:** id (UUID), email (UNIQUE), password_hash, timestamps
- **Constraint:** email UNIQUE

### profile
- **Purpose:** Onboarding data (name, grade, stream, interests, career goals)
- **Columns:** id, user_id (UNIQUE), name, grade, stream, interests (array), career_aspirations
- **Constraint:** user_id UNIQUE (one per user)

### universities
- **Purpose:** Available universities (pre-seeded 30)
- **Columns:** id, name, location, description, stream_tags (array), application_deadline
- **Pre-seeded:** 30 universities from MIT to Princeton

### shortlist
- **Purpose:** Track universities before final lock
- **Columns:** id, user_id, university_id, created_at
- **Constraint:** UNIQUE(user_id, university_id) - no duplicates

### locked_university
- **Purpose:** Final locked list (ONE per user)
- **Columns:** id, user_id (UNIQUE), university_id, locked_at
- **Constraint:** user_id UNIQUE (enforces one lock per user)

### applications
- **Purpose:** Application submissions and status
- **Columns:** id, user_id, university_id, personal_statement, resume_url, status, submitted_at, timestamps
- **Constraints:** 
  - `UNIQUE(user_id, university_id)` - one app per university
  - `CHECK(status IN ('not_started', 'in_progress', 'submitted'))` - valid status only

---

## 📋 Key Queries

### User Journey Flow

```sql
-- 1. Create user
INSERT INTO users (email, password_hash) VALUES (...);

-- 2. Create profile (onboarding)
INSERT INTO profile (user_id, name, grade, stream, interests, career_aspirations) VALUES (...);

-- 3. Add to shortlist (can add max 5)
INSERT INTO shortlist (user_id, university_id) VALUES (...);

-- 4. Lock shortlist (one-way, can't change after)
INSERT INTO locked_university (user_id, university_id) VALUES (...);

-- 5. Create applications for locked universities
INSERT INTO applications (user_id, university_id, status) VALUES (..., 'not_started');

-- 6. Submit applications
UPDATE applications SET status = 'submitted', submitted_at = NOW() WHERE ...;
```

### Check Constraints

```sql
-- Get shortlist count (should be max 5)
SELECT COUNT(*) FROM shortlist WHERE user_id = $1;

-- Check if locked (should return 0 or 1 row due to UNIQUE)
SELECT * FROM locked_university WHERE user_id = $1;

-- Verify no duplicate shortlists (constraint enforced)
SELECT DISTINCT user_id, university_id FROM shortlist;

-- Ensure valid application statuses (CHECK enforced)
SELECT DISTINCT status FROM applications;
```

---

## 🔒 Data Integrity Features

✅ **Unique Constraints:**
- One account per email
- One profile per user
- One locked list per user
- No duplicate shortlists per (user, university)
- No duplicate applications per (user, university)

✅ **Check Constraints:**
- Application status must be one of: 'not_started', 'in_progress', 'submitted'

✅ **Foreign Keys with CASCADE:**
- Deleting user cascades to profile, shortlist, applications
- Deleting university cascades to shortlist, applications

✅ **Indexes for Performance:**
- Email lookups: `idx_users_email`
- User queries: `idx_profile_user_id`, `idx_shortlist_user_id`, `idx_applications_user_id`
- Filter queries: `idx_universities_name`, `idx_universities_location`
- Status queries: `idx_applications_status`

---

## 📈 Pre-seeded Data

**30 Universities:**
- North America: MIT, Stanford, Harvard, Caltech, Yale, Princeton, Toronto, McGill
- Europe: Oxford, Cambridge, UCL, Imperial College London, ETH Zurich, Sorbonne, Berlin University, Bocconi, IE University
- Asia-Pacific: University of Tokyo, NUS, IIT Delhi, IISc, Delhi University, Ashoka, FLAME, Christ, Peking, Tsinghua, KAIST, Melbourne, ANU

Each university includes:
- Name, Location, Description
- Stream tags (Science, Engineering, Commerce, Arts)
- Application deadline

---

## 🛠️ Common Operations

### Add University to Shortlist
```sql
INSERT INTO shortlist (user_id, university_id) 
SELECT $1, $2 
ON CONFLICT (user_id, university_id) DO NOTHING;
```

### Lock Shortlist
```sql
INSERT INTO locked_university (user_id, university_id)
SELECT user_id, university_id FROM shortlist
WHERE user_id = $1 LIMIT 1;
```

### Create Applications from Locked List
```sql
INSERT INTO applications (user_id, university_id, status)
SELECT user_id, university_id, 'not_started'
FROM locked_university
WHERE user_id = $1;
```

### Submit Application
```sql
UPDATE applications 
SET status = 'submitted', submitted_at = NOW(), updated_at = NOW()
WHERE user_id = $1 AND university_id = $2;
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Database created: `createdb -l | grep ai_counsellor_dev`
- [ ] All tables exist: `psql -d ai_counsellor_dev -c "\dt"`
- [ ] 30 universities: `psql -d ai_counsellor_dev -c "SELECT COUNT(*) FROM universities;"`
- [ ] Constraints enforced: Try duplicate email, it should fail
- [ ] Try duplicate shortlist, it should fail
- [ ] Try invalid status in applications, it should fail
- [ ] Foreign keys work: Delete user, data cascades

---

## 📚 Documentation Files

- **[DATABASE.md](DATABASE.md)** - Full schema documentation with examples
- **[QUERIES.sql](QUERIES.sql)** - 100+ ready-to-use queries
- **[schema.sql](schema.sql)** - Complete PostgreSQL DDL

---

## 🚨 Important Notes

1. **Unique Constraints Enforced:**
   - Cannot shortlist same university twice
   - Cannot lock shortlist twice
   - Cannot have duplicate applications

2. **CASCADE Delete:**
   - Deleting user deletes all their data
   - Deleting university deletes from shortlist/applications

3. **Status Flow:**
   - Applications start as 'not_started'
   - Can move to 'in_progress'
   - Finally 'submitted' with timestamp

4. **Production Ready:**
   - Proper indexes for queries
   - Foreign key integrity
   - Check constraints for data validation
   - UUIDs for distributed systems

---

## 📝 Next Steps (Integration)

1. **Install dependencies:** `npm install` (already done)
2. **Setup database:** Run setup script or manual commands
3. **Connect in Node.js:** Use `server/src/db.js` pool for queries
4. **Implement routes:** Use QUERIES.sql as reference
5. **Test endpoints:** Verify full user flow

---

**Status:** ✅ Database Schema Ready for Development  
**Last Updated:** January 26, 2026  
**Version:** 1.0 MVP
