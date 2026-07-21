-- Comments (moderated) + donations

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'spam', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_status
  ON public.comments (post_id, status);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved comments"
  ON public.comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Public can insert pending comments"
  ON public.comments FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Admins manage comments"
  ON public.comments FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ngn',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read donations"
  ON public.donations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Editor role: allow editors to manage posts/taxonomy like admins (existing
-- policies already check admin only; add parallel editor policies where needed)

DO $$
BEGIN
  -- Posts: editors can manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Editors can manage posts'
  ) THEN
    CREATE POLICY "Editors can manage posts"
      ON public.posts FOR ALL
      USING (public.has_role(auth.uid(), 'editor'))
      WITH CHECK (public.has_role(auth.uid(), 'editor'));
  END IF;
END $$;
