-- Profile Table Migration
-- Add budget and exam readiness fields to profile table
-- Run this to update the schema

-- Add new columns if they don't exist
ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS budget_range VARCHAR(50),
ADD COLUMN IF NOT EXISTS exam_readiness VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Create index for profile_completed for faster queries
CREATE INDEX IF NOT EXISTS idx_profile_completed ON profile(profile_completed);

-- Update existing profiles to mark as completed if they have essential data
UPDATE profile 
SET profile_completed = true 
WHERE name IS NOT NULL 
  AND grade IS NOT NULL 
  AND stream IS NOT NULL 
  AND interests IS NOT NULL 
  AND career_aspirations IS NOT NULL;

-- Verify the migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profile' 
ORDER BY ordinal_position;
