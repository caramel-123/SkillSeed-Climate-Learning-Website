-- One-off cleanup: remove the two test feed proofs (Carlo solar joke + Julia test/testtest).
-- Run in Supabase SQL Editor as a project owner (bypasses RLS). submission_likes CASCADE with submission.
--
-- Preview rows first:
-- SELECT cs.id, p.name AS profile_name, c.title AS challenge_title, cs.reflection, cs.impact_summary
-- FROM public.challenge_submissions cs
-- JOIN public.profiles p ON p.id = cs.user_id
-- JOIN public.challenges c ON c.id = cs.challenge_id
-- WHERE cs.reflection ILIKE '%sleeping and doing nothing%'
--    OR (c.title = 'test' AND cs.impact_summary = 'testtest');

DELETE FROM public.challenge_submissions cs
USING public.challenges c
WHERE cs.challenge_id = c.id
  AND (
    cs.reflection ILIKE '%sleeping and doing nothing%'
    OR (c.title = 'test' AND cs.impact_summary = 'testtest')
  );
