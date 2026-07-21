-- CMS depth: SEO/GEO fields, author slugs, schedule/preview

-- Posts: SEO + GEO + scheduling
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS focus_keyword TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS key_takeaways TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reading_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS noindex BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preview_token TEXT;

-- Drop status check if present and allow scheduled
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_status_check
  CHECK (status IN ('draft', 'published', 'scheduled'));

CREATE UNIQUE INDEX IF NOT EXISTS posts_preview_token_key
  ON public.posts (preview_token)
  WHERE preview_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_published_at
  ON public.posts (published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at
  ON public.posts (scheduled_at)
  WHERE status = 'scheduled';

-- Authors: slug + socials
ALTER TABLE public.authors
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Backfill slugs from full_name
UPDATE public.authors
SET slug = lower(
  regexp_replace(
    regexp_replace(trim(full_name), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Ensure uniqueness with id suffix on collisions
WITH ranked AS (
  SELECT id, slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM public.authors
  WHERE slug IS NOT NULL
)
UPDATE public.authors a
SET slug = a.slug || '-' || substring(a.id::text, 1, 8)
FROM ranked r
WHERE a.id = r.id AND r.rn > 1;

ALTER TABLE public.authors ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS authors_slug_key ON public.authors (slug);
