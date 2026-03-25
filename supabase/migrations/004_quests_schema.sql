-- ============================================================================
-- Quests System Schema
-- Hands-on Tab: Quests, AI Coach, Badges & Certificates
-- ============================================================================

-- Quests master table (seeded, not user-created)
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('beginner', 'advanced')),
  category TEXT,
  badge_name TEXT,
  badge_icon TEXT,
  certificate_name TEXT, -- only for advanced
  steps JSONB, -- array of step objects
  points_reward INT DEFAULT 100,
  estimated_days INT DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User quest progress
CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'verified', 'rejected')),
  current_step INT DEFAULT 0,
  photo_url TEXT,
  reflection TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quest_id, user_id)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  quest_id UUID REFERENCES quests(id),
  tier TEXT CHECK (tier IN ('beginner', 'advanced'))
);

-- User badges (awarded after verification)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id),
  quest_id UUID REFERENCES quests(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Verifier role — add column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verifier BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Quests: Public read
CREATE POLICY "Public read quests" ON quests FOR SELECT USING (true);

-- Badges: Public read
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);

-- Quest Progress: Auth can start quest
CREATE POLICY "Auth start quest" ON quest_progress FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Quest Progress: User reads own progress
CREATE POLICY "User reads own progress" ON quest_progress FOR SELECT USING (
  user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Quest Progress: User updates own progress
CREATE POLICY "User updates own progress" ON quest_progress FOR UPDATE USING (
  user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Quest Progress: Verifier reads all submissions
CREATE POLICY "Verifier reads all submissions" ON quest_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_verifier = true)
);

-- Quest Progress: Verifier can verify
CREATE POLICY "Verifier can verify" ON quest_progress FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_verifier = true)
);

-- User Badges: Read own badges
CREATE POLICY "Read own badges" ON user_badges FOR SELECT USING (
  user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- User Badges: Insert (for awarding badges)
CREATE POLICY "Award badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quest_progress_user ON quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_quest ON quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_status ON quest_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_quest ON badges(quest_id);
