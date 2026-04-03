-- RPC to withdraw (delete) the caller's non-final mission applications.
-- Runs as SECURITY DEFINER so it works even when clients struggle with DELETE + RLS.
-- Still restricted to auth.uid() = responder_id and non-final statuses only.

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
