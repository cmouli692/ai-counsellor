-- AI Counsellor MVP Database Schema
-- PostgreSQL 12+
-- Created: January 26, 2026

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- PROFILE TABLE (Onboarding Data)
-- ============================================
-- One profile per user (enforced by unique constraint)
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

CREATE INDEX idx_profile_user_id ON profile(user_id);

-- ============================================
-- UNIVERSITIES TABLE
-- ============================================
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  stream_tags TEXT[],
  application_deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_location ON universities(location);

-- ============================================
-- SHORTLIST TABLE
-- ============================================
-- Track universities added to shortlist (before lock)
-- Unique constraint: user can only shortlist each university once
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

CREATE INDEX idx_shortlist_user_id ON shortlist(user_id);
CREATE INDEX idx_shortlist_university_id ON shortlist(university_id);

-- ============================================
-- LOCKED_UNIVERSITY TABLE
-- ============================================
-- Track which universities were locked by user
-- One locked list per user (enforced by unique constraint)
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

CREATE INDEX idx_locked_university_user_id ON locked_university(user_id);
CREATE INDEX idx_locked_university_locked_at ON locked_university(locked_at);

-- ============================================
-- APPLICATIONS TABLE (Tasks)
-- ============================================
-- One application per user+university combination
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

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_university_id ON applications(university_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);

-- ============================================
-- SEEDED DATA (Demo Universities)
-- ============================================

INSERT INTO universities (name, location, description, stream_tags, application_deadline) VALUES
  ('Massachusetts Institute of Technology (MIT)', 'Cambridge, MA', 'Top-ranked STEM research university', ARRAY['Science', 'Engineering'], '2026-01-15'),
  ('Stanford University', 'Palo Alto, CA', 'Leading tech and business school', ARRAY['Science', 'Commerce'], '2026-02-01'),
  ('Harvard University', 'Cambridge, MA', 'Prestigious Ivy League institution', ARRAY['Science', 'Commerce', 'Arts'], '2026-01-20'),
  ('California Institute of Technology (Caltech)', 'Pasadena, CA', 'Excellence in engineering and physics', ARRAY['Science', 'Engineering'], '2026-02-15'),
  ('University of Oxford', 'Oxford, UK', 'Historic university with strong programs', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-01'),
  ('University of Cambridge', 'Cambridge, UK', 'Premier research and teaching university', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-05'),
  ('University of Tokyo', 'Tokyo, Japan', 'Leading Asian university', ARRAY['Science', 'Engineering'], '2026-02-28'),
  ('National University of Singapore (NUS)', 'Singapore', 'Top Asia-Pacific research university', ARRAY['Science', 'Commerce'], '2026-02-20'),
  ('Indian Institute of Technology Delhi (IIT-D)', 'New Delhi, India', 'Top Indian engineering institute', ARRAY['Science', 'Engineering'], '2026-01-31'),
  ('Indian Institute of Science (IISc)', 'Bangalore, India', 'Premier research institution', ARRAY['Science', 'Engineering'], '2026-02-10'),
  ('Delhi University', 'New Delhi, India', 'Largest central university in India', ARRAY['Science', 'Commerce', 'Arts'], '2026-02-05'),
  ('Ashoka University', 'Sonipat, India', 'Liberal arts university', ARRAY['Commerce', 'Arts'], '2026-02-15'),
  ('FLAME University', 'Pune, India', 'Business and economics focus', ARRAY['Commerce'], '2026-02-12'),
  ('Christ University', 'Bangalore, India', 'Multi-stream private university', ARRAY['Science', 'Commerce', 'Arts'], '2026-02-18'),
  ('Bocconi University', 'Milan, Italy', 'Economics and business excellence', ARRAY['Commerce'], '2026-03-15'),
  ('IE University', 'Madrid, Spain', 'Global business and tech programs', ARRAY['Commerce'], '2026-03-10'),
  ('ETH Zurich', 'Zurich, Switzerland', 'Leading engineering school', ARRAY['Science', 'Engineering'], '2026-02-25'),
  ('University of Melbourne', 'Melbourne, Australia', 'Top-ranked Australian university', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-20'),
  ('National University of Australia (ANU)', 'Canberra, Australia', 'Research-intensive university', ARRAY['Science', 'Arts'], '2026-03-25'),
  ('Peking University', 'Beijing, China', 'Leading Chinese university', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-01'),
  ('Tsinghua University', 'Beijing, China', 'Top engineering and tech university', ARRAY['Science', 'Engineering', 'Commerce'], '2026-03-05'),
  ('University College London (UCL)', 'London, UK', 'Russell Group research university', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-10'),
  ('Imperial College London', 'London, UK', 'Science, engineering, medicine focus', ARRAY['Science', 'Engineering'], '2026-03-08'),
  ('Universität Berlin', 'Berlin, Germany', 'Multidisciplinary research university', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-15'),
  ('Sorbonne University', 'Paris, France', 'Historic and prestigious university', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-20'),
  ('Korean Advanced Institute of Science and Technology (KAIST)', 'Daejeon, South Korea', 'Leading engineering and science school', ARRAY['Science', 'Engineering'], '2026-02-28'),
  ('University of Toronto', 'Toronto, Canada', 'Top Canadian research university', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-15'),
  ('McGill University', 'Montreal, Canada', 'Research-intensive institution', ARRAY['Science', 'Commerce', 'Arts'], '2026-03-20'),
  ('Yale University', 'New Haven, CT', 'Ivy League research university', ARRAY['Science', 'Commerce', 'Arts'], '2026-02-01'),
  ('Princeton University', 'Princeton, NJ', 'Top liberal arts research university', ARRAY['Science', 'Commerce', 'Arts'], '2026-01-31');

-- ============================================
-- VERIFY SCHEMA
-- ============================================
-- Run this query to verify the schema is created:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- ============================================
-- CLEANUP (Optional - For Fresh Start)
-- ============================================
-- DROP TABLE IF EXISTS applications CASCADE;
-- DROP TABLE IF EXISTS locked_university CASCADE;
-- DROP TABLE IF EXISTS shortlist CASCADE;
-- DROP TABLE IF EXISTS universities CASCADE;
-- DROP TABLE IF EXISTS profile CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
