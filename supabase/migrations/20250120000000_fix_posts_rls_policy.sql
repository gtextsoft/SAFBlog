-- Fix RLS policy for posts to ensure anonymous users can view published posts
-- Drop the existing policy
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;

-- Create a more explicit policy that handles anonymous users correctly
-- This ensures that:
-- 1. Anyone (including anonymous users) can read posts with status = 'published'
-- 2. Authenticated admins can read all posts (including drafts)
CREATE POLICY "Public can view published posts"
  ON public.posts FOR SELECT
  USING (
    status = 'published' 
    OR (
      auth.uid() IS NOT NULL 
      AND public.has_role(auth.uid(), 'admin')
    )
  );

