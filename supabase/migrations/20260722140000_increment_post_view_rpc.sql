-- Let the public anon key bump view counts without a service-role client.
CREATE OR REPLACE FUNCTION public.increment_post_view(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_post_id
    AND status = 'published';
END;
$$;

REVOKE ALL ON FUNCTION public.increment_post_view(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_post_view(UUID) TO anon, authenticated;
