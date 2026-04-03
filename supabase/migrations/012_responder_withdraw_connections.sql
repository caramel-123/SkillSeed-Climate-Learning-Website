-- Allow responders to withdraw (delete) their own pending mission applications.
-- Without this policy, DELETE on connections is denied by RLS.

DROP POLICY IF EXISTS "Responders can delete own pending applications" ON public.connections;

CREATE POLICY "Responders can delete own pending applications"
  ON public.connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = responder_id AND status = 'pending');
