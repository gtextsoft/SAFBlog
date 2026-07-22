-- Comments publish immediately. Admins can still hide (rejected) or mark spam.
-- Public insert must allow status = 'approved' (was pending-only).

ALTER TABLE public.comments
  ALTER COLUMN status SET DEFAULT 'approved';

-- Existing queue: surface anything that was waiting on moderation.
UPDATE public.comments
SET status = 'approved'
WHERE status = 'pending';

DROP POLICY IF EXISTS "Public can insert pending comments" ON public.comments;

CREATE POLICY "Public can insert approved comments"
  ON public.comments FOR INSERT
  WITH CHECK (status = 'approved');
