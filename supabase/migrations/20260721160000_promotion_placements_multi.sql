-- Allow one promotion to appear in multiple slots.
ALTER TYPE promotion_placement ADD VALUE IF NOT EXISTS 'footer';
ALTER TYPE promotion_placement ADD VALUE IF NOT EXISTS 'home_feed';

ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS placements promotion_placement[] NOT NULL DEFAULT ARRAY['sidebar']::promotion_placement[];

-- Copy the legacy single placement into the new array.
UPDATE public.promotions
SET placements = ARRAY[placement];

ALTER TABLE public.promotions
  DROP CONSTRAINT IF EXISTS promotions_placements_nonempty;

ALTER TABLE public.promotions
  ADD CONSTRAINT promotions_placements_nonempty
  CHECK (cardinality(placements) >= 1);

DROP INDEX IF EXISTS idx_promotions_live;

CREATE INDEX idx_promotions_live
  ON public.promotions (priority DESC, created_at DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_promotions_placements
  ON public.promotions USING GIN (placements);

-- Keep legacy `placement` column in sync with the first selected slot
-- so older code paths and admin filters keep working during the transition.
CREATE OR REPLACE FUNCTION public.sync_promotion_primary_placement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.placements IS NULL OR cardinality(NEW.placements) = 0 THEN
    NEW.placements := ARRAY[COALESCE(NEW.placement, 'sidebar'::promotion_placement)];
  END IF;
  NEW.placement := NEW.placements[1];
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_promotion_primary_placement ON public.promotions;
CREATE TRIGGER sync_promotion_primary_placement
  BEFORE INSERT OR UPDATE OF placements, placement
  ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_promotion_primary_placement();
