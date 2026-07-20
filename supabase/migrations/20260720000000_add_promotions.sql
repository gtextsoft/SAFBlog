-- Promoted placements ("ads") managed by admins from the dashboard.
--
-- Design notes:
--  * Scheduling lives in the row (starts_at/ends_at) so an admin can queue a
--    campaign without having to remember to switch it on.
--  * Impressions/clicks are counted through SECURITY DEFINER functions, so the
--    public never gets UPDATE rights on this table.
--  * The public SELECT policy filters to genuinely-live rows. Drafts, paused
--    and expired promotions are invisible to anonymous callers rather than
--    being filtered in application code, where a missed WHERE clause would
--    leak an unpublished campaign.

CREATE TYPE promotion_placement AS ENUM ('sidebar', 'in_feed', 'in_article');
CREATE TYPE promotion_status AS ENUM ('draft', 'active', 'paused', 'ended');

CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Creative
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Learn more',
  target_url TEXT NOT NULL,

  -- Disclosure. Required, not optional: every placement must name who paid
  -- for it, both for FTC/ASA compliance and so readers are never misled about
  -- what is editorial and what is not.
  sponsor_name TEXT NOT NULL,

  placement promotion_placement NOT NULL DEFAULT 'sidebar',
  status promotion_status NOT NULL DEFAULT 'draft',

  -- Higher wins when several promotions compete for one slot.
  priority INT NOT NULL DEFAULT 0,

  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,

  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT promotions_window_valid CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at),
  -- Reject javascript:/data: URLs at the database boundary rather than trusting
  -- the admin form to have validated them.
  CONSTRAINT promotions_target_url_http CHECK (target_url ~* '^https?://')
);

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_promotions_live
  ON public.promotions (placement, priority DESC)
  WHERE status = 'active';

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Anonymous readers see only live placements.
CREATE POLICY "Public can view live promotions"
  ON public.promotions FOR SELECT
  USING (
    status = 'active'
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at > NOW())
  );

CREATE POLICY "Admins can view all promotions"
  ON public.promotions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Counter increments. SECURITY DEFINER so the anon role can record a metric
-- without being granted UPDATE on the table (which would let anyone rewrite
-- a campaign's creative).
CREATE OR REPLACE FUNCTION public.record_promotion_impression(_promotion_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.promotions
  SET impressions = impressions + 1
  WHERE id = _promotion_id AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.record_promotion_click(_promotion_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target TEXT;
BEGIN
  UPDATE public.promotions
  SET clicks = clicks + 1
  WHERE id = _promotion_id
    AND status = 'active'
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at > NOW())
  RETURNING target_url INTO _target;

  -- NULL signals "no live promotion with that id"; the caller must not
  -- redirect to a caller-supplied URL, only to one stored here. Otherwise the
  -- click endpoint becomes an open redirect.
  RETURN _target;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_promotion_impression(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_promotion_click(UUID) TO anon, authenticated;
