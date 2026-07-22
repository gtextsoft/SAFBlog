-- The Blueprint publication topics for primary navigation.
-- Upsert by slug so re-runs are safe; existing Foundation-era categories remain.

INSERT INTO public.categories (name, slug, description) VALUES
  ('Business', 'business', 'Markets, strategy, and the companies shaping modern commerce.'),
  ('Entrepreneurship', 'entrepreneurship', 'Builders, startups, and the craft of creating companies.'),
  ('Real Estate', 'real-estate', 'Property, development, and investment across markets.'),
  ('Technology', 'technology', 'Innovation, digital platforms, and the tools transforming industry.'),
  ('Leadership', 'leadership', 'Executive insight, culture, and decision-making at scale.'),
  ('Lifestyle', 'lifestyle', 'Culture, taste, and how ambitious people live and work.'),
  ('Interviews', 'interviews', 'Conversations with founders, executives, and cultural leaders.'),
  ('Brand Spotlight', 'brand-spotlight', 'Sponsored brand features and partner stories.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = COALESCE(EXCLUDED.description, public.categories.description);
