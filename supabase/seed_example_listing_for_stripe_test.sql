-- ============================================================
-- One-time: example DRAFT listing for Stripe publish checkout
-- ============================================================
-- 1. Replace the email below with the same email you use to log into Homestead.
-- 2. Supabase → SQL Editor → New query → paste → Run.
-- 3. In the app: Dashboard → My Listings → sparkles button on the draft → pay in Stripe test mode.

DO $$
DECLARE
  v_email TEXT := 'you@example.com';  -- <-- CHANGE THIS
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM public.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No public.users row for email %. Sign up in the app first.', v_email;
  END IF;

  -- Lets you open Dashboard → My Listings if you signed up as buyer
  UPDATE public.users SET role = 'seller' WHERE id = v_user_id AND role = 'buyer';

  INSERT INTO public.properties (
    seller_id,
    title,
    slug,
    description,
    price,
    address,
    city,
    state,
    zip_code,
    latitude,
    longitude,
    bedrooms,
    bathrooms,
    sqft,
    property_type,
    property_status,
    listing_status
  ) VALUES (
    v_user_id,
    'Stripe test listing — Demo cottage',
    'stripe-test-demo-cottage-test-' || replace(gen_random_uuid()::text, '-', ''),
    'Example listing for testing the publish payment flow. Not a real property.',
    399000.00,
    '123 Test Payment Street',
    'Austin',
    'TX',
    '78701',
    30.2672,
    -97.7431,
    3,
    2,
    1450,
    'house',
    'for_sale',
    'draft'
  );
END $$;
