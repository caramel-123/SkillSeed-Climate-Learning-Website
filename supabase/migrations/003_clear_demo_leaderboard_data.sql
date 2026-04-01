-- SkillSeed: Clear Demo Leaderboard Data
-- This migration removes fake/demo user participation data
-- Run this to have an honest beta leaderboard (empty until real users complete challenges)
-- =============================================================================

-- Delete demo challenge participants (fake leaderboard entries)
-- These are the seeded participation records that create fake leaderboard data
DELETE FROM public.challenge_participants
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111', -- Dr. Sarah Chen (demo)
  '11111111-1111-1111-1111-111111111112', -- Marcus Johnson (demo)
  '11111111-1111-1111-1111-111111111113', -- Aisha Patel (demo)
  '11111111-1111-1111-1111-111111111114', -- Dr. James Okonkwo (demo)
  '11111111-1111-1111-1111-111111111115', -- Emma Rodriguez (demo)
  '11111111-1111-1111-1111-111111111116', -- Tyler Brooks (demo)
  '11111111-1111-1111-1111-111111111117', -- Sofia Andersen (demo)
  '11111111-1111-1111-1111-111111111118', -- Alex Kim (demo)
  '11111111-1111-1111-1111-111111111119', -- Priya Sharma (demo)
  '11111111-1111-1111-1111-111111111120', -- Jordan Williams (demo)
  '11111111-1111-1111-1111-111111111121'  -- Michael Torres (demo)
);

-- Verify the leaderboard is now empty (only real users will appear)
-- SELECT * FROM public.leaderboard;
