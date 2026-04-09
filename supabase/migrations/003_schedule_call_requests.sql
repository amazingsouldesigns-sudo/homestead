-- ============================================
-- SCHEDULE A CALL (lead capture for agent follow-up)
-- ============================================

CREATE TABLE public.schedule_call_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties (id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  listing_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedule_call_property ON public.schedule_call_requests (property_id);
CREATE INDEX idx_schedule_call_created ON public.schedule_call_requests (created_at DESC);

ALTER TABLE public.schedule_call_requests ENABLE ROW LEVEL SECURITY;

-- Inserts go through Next.js API using the service role (bypasses RLS).
-- Optional: add admin SELECT policies later if you surface this in the app.

COMMENT ON TABLE public.schedule_call_requests IS 'Buyer phone numbers requesting an agent callback on a listing';
