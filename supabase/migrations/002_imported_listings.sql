-- ============================================
-- IMPORTED LISTINGS (e.g. RapidAPI sync)
-- Nullable seller_id when listing_origin = 'imported'
-- ============================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS listing_origin TEXT NOT NULL DEFAULT 'user'
    CHECK (listing_origin IN ('user', 'imported'));

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS external_id TEXT;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS external_source TEXT;

ALTER TABLE public.properties
  ALTER COLUMN seller_id DROP NOT NULL;

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_user_or_imported_seller;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_user_or_imported_seller CHECK (
    (listing_origin = 'user' AND seller_id IS NOT NULL)
    OR (listing_origin = 'imported' AND seller_id IS NULL)
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_import_external
  ON public.properties (external_source, external_id)
  WHERE listing_origin = 'imported' AND external_id IS NOT NULL AND external_source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_listing_origin ON public.properties (listing_origin);
