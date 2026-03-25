-- ============================================================================
-- Verifier Portal with AI Screening - Database Setup
-- ============================================================================

-- Add is_verifier column to profiles (if not exists)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_verifier BOOLEAN DEFAULT FALSE;

-- Add AI screening columns to quest_progress (if not exist)
ALTER TABLE quest_progress
  ADD COLUMN IF NOT EXISTS ai_confidence INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_reasoning TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_recommendation TEXT DEFAULT NULL;

-- ============================================================================
-- Row Level Security (RLS) Policies for Verifiers
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Verifier reads submissions" ON quest_progress;
DROP POLICY IF EXISTS "Verifier updates submissions" ON quest_progress;

-- Verifiers can read all submissions
CREATE POLICY "Verifier reads submissions" ON quest_progress 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() AND profiles.is_verifier = true
    )
  );

-- Verifiers can update submissions (for verification/rejection)
CREATE POLICY "Verifier updates submissions" ON quest_progress 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() AND profiles.is_verifier = true
    )
  );

-- ============================================================================
-- Grant Verifier Access (Run manually in Supabase SQL editor)
-- ============================================================================
-- 
-- To grant verifier access to a user:
-- 
-- 1. Find the profile:
--    SELECT id, name, user_id FROM profiles WHERE name ILIKE '%verifier name%';
-- 
-- 2. Grant verifier role:
--    UPDATE profiles SET is_verifier = true WHERE id = 'uuid-here';
-- 
-- 3. Confirm:
--    SELECT name, is_verifier FROM profiles WHERE is_verifier = true;
--
-- ============================================================================
