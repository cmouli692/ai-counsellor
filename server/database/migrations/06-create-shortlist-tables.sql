-- Shortlist Tables Migration
-- Tables for tracking user shortlists and locked universities

-- ============================================
-- SHORTLIST TABLE
-- ============================================
-- Track universities added to shortlist (before lock)
-- Unique constraint: user can only shortlist each university once
CREATE TABLE IF NOT EXISTS shortlist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  university_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_shortlist_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_shortlist_university FOREIGN KEY (university_id) 
    REFERENCES universities(id) ON DELETE CASCADE,
  CONSTRAINT unique_shortlist_per_user_university 
    UNIQUE(user_id, university_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlist_user_id ON shortlist(user_id);
CREATE INDEX IF NOT EXISTS idx_shortlist_university_id ON shortlist(university_id);
CREATE INDEX IF NOT EXISTS idx_shortlist_created_at ON shortlist(created_at);

-- ============================================
-- LOCKED_UNIVERSITY TABLE
-- ============================================
-- Track which university was locked by user
-- One locked university per user (enforced by unique constraint)
CREATE TABLE IF NOT EXISTS locked_university (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  university_id INTEGER NOT NULL,
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_locked_university_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_locked_university_ref FOREIGN KEY (university_id) 
    REFERENCES universities(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_locked_university_user_id ON locked_university(user_id);
CREATE INDEX IF NOT EXISTS idx_locked_university_locked_at ON locked_university(locked_at);
