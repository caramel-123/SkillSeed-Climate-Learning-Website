-- =============================================================================
-- Migration: 011_expired_challenges.sql
-- Adds 'expired' status to challenges, auto-archives past-deadline challenges,
-- and ensures stats/feed exclude expired entries.
-- =============================================================================

-- Step 1: Extend status check to include 'expired'
ALTER TABLE public.challenges
  DROP CONSTRAINT IF EXISTS challenges_status_check;

ALTER TABLE public.challenges
  ADD CONSTRAINT challenges_status_check
    CHECK (status IN ('active', 'completed', 'draft', 'expired'));

-- Step 2: Immediately archive all currently-active challenges past their deadline
UPDATE public.challenges
SET
  status = 'expired',
  updated_at = NOW()
WHERE
  status = 'active'
  AND deadline IS NOT NULL
  AND deadline < NOW();

-- Step 3: Function to archive expired challenges (call on-demand or via cron)
CREATE OR REPLACE FUNCTION public.archive_expired_challenges()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE public.challenges
  SET
    status = 'expired',
    updated_at = NOW()
  WHERE
    status = 'active'
    AND deadline IS NOT NULL
    AND deadline < NOW();

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$;

-- Allow authenticated users to trigger archival (safe — only updates expired ones)
GRANT EXECUTE ON FUNCTION public.archive_expired_challenges() TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_expired_challenges() TO anon;

-- Step 4: Update the featured_challenge view to exclude expired challenges
-- (already filters deadline > NOW(), but adding explicit status guard)
DROP VIEW IF EXISTS public.featured_challenge;

CREATE OR REPLACE VIEW public.featured_challenge AS
SELECT
  *,
  (
    (participant_count * 3)
    + CASE
        WHEN deadline IS NOT NULL AND deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days'  THEN 80
        WHEN deadline IS NOT NULL AND deadline BETWEEN NOW() AND NOW() + INTERVAL '14 days' THEN 40
        ELSE 0
      END
    + CASE
        WHEN created_at > NOW() - INTERVAL '3 days' THEN 60
        WHEN created_at > NOW() - INTERVAL '7 days' THEN 30
        ELSE 0
      END
    + FLOOR(points_reward / 10)
  ) AS activity_score
FROM public.challenges
WHERE
  status = 'active'
  AND (deadline IS NULL OR deadline > NOW())
ORDER BY
  is_pinned DESC,
  activity_score DESC,
  deadline ASC NULLS LAST
LIMIT 1;

GRANT SELECT ON public.featured_challenge TO authenticated;
GRANT SELECT ON public.featured_challenge TO anon;

-- Step 5: Index for efficient expiry queries
CREATE INDEX IF NOT EXISTS idx_challenges_deadline ON public.challenges(deadline)
  WHERE status = 'active';