-- AI Counsellor Database - Quick Reference Queries
-- Use these for development, testing, and debugging

-- ============================================
-- SETUP & VERIFICATION
-- ============================================

-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check universities seeded
SELECT COUNT(*) as total_universities FROM universities;

-- View database size
SELECT pg_size_pretty(pg_database_size('ai_counsellor_dev'));

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Create test user (password should be bcrypted by app)
INSERT INTO users (email, password_hash) 
VALUES ('test@example.com', '$2b$10$salt_and_hash_here');

-- Get user by email
SELECT * FROM users WHERE email = 'test@example.com';

-- List all users
SELECT id, email, created_at FROM users ORDER BY created_at DESC;

-- Delete user and cascade everything
DELETE FROM users WHERE email = 'test@example.com';

-- ============================================
-- PROFILE / ONBOARDING
-- ============================================

-- Create profile for user
INSERT INTO profile (user_id, name, grade, stream, interests, career_aspirations)
VALUES (
  (SELECT id FROM users WHERE email = 'test@example.com'),
  'John Doe',
  '12th',
  'Science',
  ARRAY['AI', 'Engineering', 'Physics'],
  'Software Engineer at Google'
);

-- Get user's profile
SELECT p.* FROM profile p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'test@example.com';

-- Update profile
UPDATE profile SET career_aspirations = 'Data Scientist' 
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Check if profile exists
SELECT EXISTS(
  SELECT 1 FROM profile 
  WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
) as profile_exists;

-- ============================================
-- UNIVERSITIES
-- ============================================

-- List all universities
SELECT id, name, location, stream_tags FROM universities ORDER BY name;

-- Search universities by name
SELECT * FROM universities WHERE name ILIKE '%MIT%';

-- Filter by location
SELECT name, location FROM universities WHERE location ILIKE '%India%' ORDER BY name;

-- Filter by stream tag
SELECT name, location, stream_tags FROM universities 
WHERE stream_tags && ARRAY['Science', 'Engineering']
ORDER BY name;

-- Get university by ID
SELECT * FROM universities WHERE id = 'uuid-here';

-- Add new university (for testing)
INSERT INTO universities (name, location, description, stream_tags, application_deadline)
VALUES ('Test University', 'Test City', 'Test Description', ARRAY['Science'], '2026-12-31');

-- ============================================
-- SHORTLIST MANAGEMENT
-- ============================================

-- Add university to shortlist
INSERT INTO shortlist (user_id, university_id)
SELECT 
  u.id,
  un.id
FROM users u, universities un
WHERE u.email = 'test@example.com' AND un.name = 'MIT';

-- Get user's shortlist
SELECT u.id, u.name, u.location, s.created_at
FROM shortlist s
JOIN universities u ON s.university_id = u.id
WHERE s.user_id = (SELECT id FROM users WHERE email = 'test@example.com')
ORDER BY s.created_at;

-- Count shortlist items
SELECT COUNT(*) as shortlist_count
FROM shortlist
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Check if university is in shortlist
SELECT EXISTS(
  SELECT 1 FROM shortlist
  WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
  AND university_id = (SELECT id FROM universities WHERE name = 'MIT')
) as is_shortlisted;

-- Remove from shortlist (before lock)
DELETE FROM shortlist
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
AND university_id = (SELECT id FROM universities WHERE name = 'MIT');

-- ============================================
-- LOCK MANAGEMENT
-- ============================================

-- Lock shortlist for user
INSERT INTO locked_university (user_id, university_id)
SELECT user_id, university_id FROM shortlist
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
LIMIT 1;

-- Check if user has locked their list
SELECT EXISTS(
  SELECT 1 FROM locked_university
  WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
) as is_locked;

-- Get locked university for user
SELECT u.name, u.location, l.locked_at
FROM locked_university l
JOIN universities u ON l.university_id = u.id
WHERE l.user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Clear locked status (admin use only)
DELETE FROM locked_university
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- ============================================
-- APPLICATIONS / TASKS
-- ============================================

-- Create application for each locked university
INSERT INTO applications (user_id, university_id, status)
SELECT lu.user_id, lu.university_id, 'not_started'
FROM locked_university lu
WHERE lu.user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Get user's applications
SELECT a.id, u.name as university, a.status, a.submitted_at, a.created_at
FROM applications a
JOIN universities u ON a.university_id = u.id
WHERE a.user_id = (SELECT id FROM users WHERE email = 'test@example.com')
ORDER BY a.created_at;

-- Update application status
UPDATE applications SET status = 'in_progress'
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
AND university_id = (SELECT id FROM universities WHERE name = 'MIT');

-- Add personal statement
UPDATE applications 
SET personal_statement = 'I am passionate about AI and want to contribute...'
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
AND university_id = (SELECT id FROM universities WHERE name = 'MIT');

-- Add resume URL
UPDATE applications
SET resume_url = 'https://storage.example.com/resumes/john-doe.pdf'
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
AND university_id = (SELECT id FROM universities WHERE name = 'MIT');

-- Submit application
UPDATE applications
SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
AND university_id = (SELECT id FROM universities WHERE name = 'MIT');

-- Get submitted applications
SELECT u.name, a.submitted_at, a.personal_statement
FROM applications a
JOIN universities u ON a.university_id = u.id
WHERE a.status = 'submitted'
ORDER BY a.submitted_at DESC;

-- Count applications by status
SELECT status, COUNT(*) as count
FROM applications
GROUP BY status
ORDER BY count DESC;

-- Get pending applications (not submitted)
SELECT u.name, a.status, a.created_at
FROM applications a
JOIN universities u ON a.university_id = u.id
WHERE a.status != 'submitted'
ORDER BY a.created_at;

-- ============================================
-- ANALYTICS / REPORTING
-- ============================================

-- Total registered users
SELECT COUNT(*) as total_users FROM users;

-- Users with completed profile
SELECT COUNT(*) as profiles_completed FROM profile;

-- Users who locked shortlist
SELECT COUNT(DISTINCT user_id) as users_locked FROM locked_university;

-- Applications submitted
SELECT COUNT(*) as applications_submitted FROM applications WHERE status = 'submitted';

-- Popular universities (most shortlisted)
SELECT u.name, COUNT(*) as shortlist_count
FROM shortlist s
JOIN universities u ON s.university_id = u.id
GROUP BY u.id, u.name
ORDER BY shortlist_count DESC
LIMIT 10;

-- User journey status
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT p.user_id) as completed_onboarding,
  COUNT(DISTINCT l.user_id) as locked_shortlist,
  COUNT(DISTINCT a.user_id) as submitted_applications
FROM users u
LEFT JOIN profile p ON u.id = p.user_id
LEFT JOIN locked_university l ON u.id = l.user_id
LEFT JOIN applications a ON u.id = a.user_id AND a.status = 'submitted';

-- ============================================
-- DATA CLEANUP (USE WITH CAUTION)
-- ============================================

-- Reset test data (keeps users, clears dependent data)
DELETE FROM applications;
DELETE FROM locked_university;
DELETE FROM shortlist;
DELETE FROM profile;

-- Remove specific user and all data
DELETE FROM users WHERE email = 'test@example.com';

-- Clear all data (DANGEROUS!)
-- DELETE FROM applications;
-- DELETE FROM locked_university;
-- DELETE FROM shortlist;
-- DELETE FROM universities;
-- DELETE FROM profile;
-- DELETE FROM users;

-- ============================================
-- CONSTRAINT VALIDATION
-- ============================================

-- Check constraints by table
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;

-- View all indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- PERFORMANCE
-- ============================================

-- Show table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Analyze query performance (use EXPLAIN)
-- EXPLAIN ANALYZE SELECT * FROM applications WHERE user_id = 'uuid-here';

-- ============================================
-- BACKUP & RESTORE
-- ============================================

-- Backup (run from terminal, not psql)
-- pg_dump -U postgres ai_counsellor_dev > backup.sql

-- Restore (run from terminal, not psql)
-- psql -U postgres ai_counsellor_dev < backup.sql

-- Export to CSV
-- \COPY (SELECT * FROM universities) TO 'universities.csv' CSV HEADER;

-- ============================================
-- USEFUL PSQL COMMANDS
-- ============================================

-- List all databases
-- \l

-- Connect to database
-- \c ai_counsellor_dev

-- List all tables
-- \dt

-- Describe table
-- \d universities

-- List functions
-- \df

-- Get help
-- \h SELECT

-- Quit psql
-- \q
