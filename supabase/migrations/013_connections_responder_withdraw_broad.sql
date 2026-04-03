-- Broaden responder DELETE: UI shows "Pending" for anything that is not accepted/declined,
-- but some rows may not be exactly status = 'pending'. Also rely on delete-by-id without
-- needing RETURNING rows from PostgREST.

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
