-- =============================================================================
-- Run this ONCE in Supabase: SQL Editor → New query → paste → Run
-- Fixes "Withdraw open applications" (RLS delete + optional RPC fallback)
-- =============================================================================

-- 1) Let responders DELETE their own non-final applications from the table
DROP POLICY IF EXISTS "Responders can delete own pending applications" ON public.connections;
DROP POLICY IF EXISTS "Responders can withdraw own open applications" ON public.connections;

CREATE POLICY "Responders can withdraw own open applications"
  ON public.connections
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = responder_id
    AND status IS DISTINCT FROM 'accepted'
    AND status IS DISTINCT FROM 'declined'
  );

-- 2) RPC fallback when table DELETE is still blocked or behaves oddly
CREATE OR REPLACE FUNCTION public.withdraw_my_open_connections()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE deleted_count integer;
BEGIN
  DELETE FROM public.connections c
  WHERE c.responder_id = auth.uid()
    AND c.status IS DISTINCT FROM 'accepted'
    AND c.status IS DISTINCT FROM 'declined';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.withdraw_my_open_connections() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.withdraw_my_open_connections() TO authenticated;

-- Hint PostgREST to reload (works on self-hosted; hosted Supabase usually updates within ~1 min)
NOTIFY pgrst, 'reload schema';
