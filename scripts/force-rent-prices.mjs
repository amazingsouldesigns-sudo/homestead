/**
 * Force rental prices into a fixed range in Supabase.
 *
 * Purpose: demo/UX requirement where all rentals must be between $1500–$2500.
 *
 * Usage:
 *   node scripts/force-rent-prices.mjs
 *
 * Env:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 * Optional:
 *   - FORCE_RENT_PRICE_MIN (default 1500)
 *   - FORCE_RENT_PRICE_MAX (default 2500)
 *   - FORCE_RENT_PRICE_LISTING_STATUS (default active)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { existsSync } from 'fs';

if (existsSync('.env.local')) config({ path: '.env.local', override: false });
else if (existsSync('.env')) config({ path: '.env', override: false });

const MIN = Number(process.env.FORCE_RENT_PRICE_MIN || 1500);
const MAX = Number(process.env.FORCE_RENT_PRICE_MAX || 2500);
const LISTING_STATUS = (process.env.FORCE_RENT_PRICE_LISTING_STATUS || 'active').trim();

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (!Number.isFinite(MIN) || !Number.isFinite(MAX) || MIN >= MAX) {
  console.error('Invalid FORCE_RENT_PRICE_MIN/MAX. Ensure MIN < MAX and both are numbers.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function hashStringToInt(s) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function forcedPriceForId(id) {
  const span = MAX - MIN;
  const n = hashStringToInt(String(id));
  return MIN + (n % (span + 1));
}

async function main() {
  console.log(`Forcing rental prices into [$${MIN}, $${MAX}] for listing_status=${LISTING_STATUS}`);

  const pageSize = 500;
  let from = 0;
  let total = 0;
  let updated = 0;

  while (true) {
    const { data, error } = await supabase
      .from('properties')
      .select('id, price')
      .eq('property_status', 'for_rent')
      .eq('listing_status', LISTING_STATUS)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const rows = data || [];
    if (rows.length === 0) break;

    total += rows.length;

    for (const r of rows) {
      const next = forcedPriceForId(r.id);
      if (r.price === next) continue;
      const { error: upErr } = await supabase.from('properties').update({ price: next }).eq('id', r.id);
      if (upErr) throw upErr;
      updated += 1;
    }

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Done. Scanned ${total} rental(s). Updated ${updated}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

