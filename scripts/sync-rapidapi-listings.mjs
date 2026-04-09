/**
 * Sync for-sale listings from RapidAPI US Real Estate into public.properties.
 *
 * Prerequisites:
 *   - Run migration 002_imported_listings.sql
 *   - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - RAPIDAPI_KEY + RAPIDAPI_HOST (from the API's RapidAPI page)
 *
 * Usage:
 *   node scripts/sync-rapidapi-listings.mjs
 *
 * Search is driven by env (see below). Adjust RAPIDAPI_FOR_SALE_PATH if requests 404
 * (some docs use /api/v3/for-sale, others /v3/for-sale).
 *
 * RAPIDAPI_MAX_PHOTOS_PER_LISTING — cap on images stored per listing (default 2000).
 *
 * RAPIDAPI_FETCH_DETAIL_PHOTOS — when not "false", calls /v3/property-detail per listing
 * to merge a full photo gallery (search often returns only 1–2 previews). Uses extra API quota.
 * RAPIDAPI_DETAIL_DELAY_MS — pause between detail calls to reduce throttling (default 120).
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  join(process.cwd(), '.env.local'),
  join(__dirname, '..', '.env.local'),
  join(process.cwd(), '.env'),
  join(__dirname, '..', '.env'),
];
const envFile = envCandidates.find((p) => existsSync(p));
if (envFile) config({ path: envFile, override: true });

/** Line-based parse (handles BOM; complements dotenv if a line is skipped) */
function loadEnvPlain(path) {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}
if (envFile) loadEnvPlain(envFile);

const EXTERNAL_SOURCE = 'rapidapi_us_real_estate';

function slugifyPart(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function makeSlug({ line, city, externalId }) {
  const base = slugifyPart(`${line}-${city}-${externalId}`);
  return base ? `${base}-${Date.now().toString(36)}` : `listing-${externalId}`;
}

function looksLikeListing(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (
    obj.property_id != null ||
    obj.propertyId != null ||
    obj.zpid != null ||
    obj.listing_id != null ||
    obj.listingId != null
  ) {
    return true;
  }
  const hasPrice =
    obj.list_price != null ||
    obj.listPrice != null ||
    obj.price != null ||
    obj.unformattedPrice != null;
  if (hasPrice && (obj.location || obj.address)) return true;
  return false;
}

/** Find first array whose elements look like MLS-style listing objects */
function findListingArrayHeuristic(root, depth = 0) {
  if (depth > 12 || root == null) return [];
  if (typeof root !== 'object') return [];
  if (Array.isArray(root)) {
    if (!root.length) return [];
    const hits = root.slice(0, Math.min(8, root.length)).filter(looksLikeListing).length;
    if (hits >= 1 && root.length <= 2000) return root;
    for (const item of root) {
      const inner = findListingArrayHeuristic(item, depth + 1);
      if (inner.length) return inner;
    }
    return [];
  }
  for (const k of Object.keys(root)) {
    const inner = findListingArrayHeuristic(root[k], depth + 1);
    if (inner.length) return inner;
  }
  return [];
}

/** GraphQL-style edges -> nodes, or pass through plain listing arrays */
function flattenEdges(arr) {
  if (!Array.isArray(arr) || !arr.length) return [];
  const first = arr[0];
  if (
    first &&
    typeof first === 'object' &&
    (first.node != null || first.cursor?.node != null)
  ) {
    return arr.map((e) => e?.node ?? e?.cursor?.node ?? e).filter(Boolean);
  }
  return arr;
}

/** home_search is often { results: { homes: [...] } } or { homes: [...] } — not a bare array */
function extractFromHomeSearch(hs) {
  if (!hs || typeof hs !== 'object' || Array.isArray(hs)) return [];

  const tryBranch = (val) => {
    if (val == null) return [];
    if (Array.isArray(val)) return flattenEdges(val);
    if (typeof val === 'object' && looksLikeListing(val)) return [val];
    return [];
  };

  const topLevelBranches = [
    hs.homes,
    hs.properties,
    hs.listings,
    hs.items,
    hs.home,
    hs.property,
    hs.search_results,
    hs.searchResults,
    hs.results,
  ];
  for (const branch of topLevelBranches) {
    const arr = tryBranch(branch);
    if (arr.length) return arr;
  }

  const res = hs.results;
  if (res && typeof res === 'object' && !Array.isArray(res)) {
    const nested = [
      res.homes,
      res.properties,
      res.listings,
      res.results,
      res.home,
      res.property,
      res.edges,
      res.nodes,
    ];
    for (const branch of nested) {
      const arr = tryBranch(branch);
      if (arr.length) return arr;
    }
  }

  return [];
}

/** Walk common response shapes from US Real Estate / for-sale style APIs */
function extractResultArray(json) {
  if (!json || typeof json !== 'object') return [];
  const fromHomeSearch = extractFromHomeSearch(json?.data?.home_search);
  if (fromHomeSearch.length) return fromHomeSearch;

  const paths = [
    json?.data?.home_search?.results,
    json?.data?.homeSearch?.results,
    json?.data?.search?.results,
    json?.data?.for_sale?.results,
    json?.data?.results,
    json?.data?.properties,
    json?.data?.listings,
    json?.data?.homes,
    json?.results,
    json?.properties,
    json?.listings,
    Array.isArray(json) ? json : null,
  ];
  for (const p of paths) {
    if (Array.isArray(p) && p.length) return p;
  }
  const edges =
    json?.data?.home_search?.results?.edges ||
    json?.data?.homeSearch?.results?.edges ||
    json?.data?.search?.edges;
  if (Array.isArray(edges) && edges.length) {
    const nodes = edges.map((e) => e?.node ?? e?.cursor?.node ?? e).filter(Boolean);
    if (nodes.length) return nodes;
  }
  return findListingArrayHeuristic(json);
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pickAddress(r) {
  const a =
    r?.location?.address ||
    r?.address ||
    r?.listing?.location?.address ||
    {};
  const line =
    a.line ||
    a.street_address ||
    r?.street_address ||
    r?.address_line ||
    'Address on request';
  const city = a.city || r?.city || '';
  const state = a.state_code || a.state || r?.state || '';
  const zip = a.postal_code || a.zip || r?.postal_code || r?.zip || '';
  const coord = a.coordinate || r?.coordinate || r?.lat_lon || {};
  const lat = num(coord.lat ?? r?.latitude ?? r?.lat, NaN);
  const lon = num(coord.lon ?? coord.lng ?? r?.longitude ?? r?.lon ?? r?.lng, NaN);
  return { line, city, state, zip, lat, lon };
}

function pickDescription(r) {
  const d = r?.description;
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object' && typeof d.text === 'string') return d.text;
  return r?.remarks || r?.public_remarks || 'Imported listing.';
}

function pickBedsBathsSqft(r) {
  const d = r?.description;
  const beds = num(
    d?.beds ?? r?.beds ?? r?.bedrooms ?? r?.br ?? 0,
    0
  );
  const baths = num(
    d?.baths ?? d?.baths_full ?? r?.baths ?? r?.bathrooms ?? r?.ba ?? 0,
    0
  );
  const sqft = num(d?.sqft ?? r?.sqft ?? r?.living_area ?? r?.area ?? 0, 0);
  return { beds, baths, sqft };
}

function pickPrice(r) {
  return num(
    r?.list_price ?? r?.listPrice ?? r?.price ?? r?.unformattedPrice ?? 0,
    0
  );
}

function pickExternalId(r) {
  const id =
    r?.property_id ??
    r?.propertyId ??
    r?.listing_id ??
    r?.listingId ??
    r?.id ??
    r?.zpid;
  return id != null ? String(id) : '';
}

/** Upper bound so one bad payload cannot insert huge row sets; raise via env if needed */
function maxPhotosPerListing() {
  const raw = process.env.RAPIDAPI_MAX_PHOTOS_PER_LISTING;
  if (raw === undefined || raw === '') return 2000;
  const n = parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n < 1) return 2000;
  return Math.min(n, 5000);
}

function asPhotoArray(maybe) {
  if (maybe == null) return [];
  if (Array.isArray(maybe)) return maybe;
  return [maybe];
}

/** Same logical image may appear as http/https or multiple widths — dedupe by host+path */
function normalizePhotoUrlForDedupe(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim();
  if (!t) return '';
  try {
    const u = new URL(t);
    const path = u.pathname.replace(/\/$/, '');
    return `${u.hostname.toLowerCase()}${path}`;
  } catch {
    return t;
  }
}

function dedupePhotoUrls(urls) {
  const seen = new Set();
  const out = [];
  for (const u of urls) {
    const k = normalizePhotoUrlForDedupe(u);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(u);
  }
  return out;
}

function pickLargestSourceUrl(sources) {
  if (!Array.isArray(sources) || !sources.length) return '';
  const withUrl = sources.filter((x) => x && typeof x.url === 'string');
  if (!withUrl.length) return '';
  withUrl.sort((a, b) => (Number(b.width) || 0) - (Number(a.width) || 0));
  return withUrl[0].url;
}

/** One URL per photo object (Zillow-style responsivePhotos use mixedSources, not always top-level url) */
function urlFromPhotoObject(p) {
  if (p == null) return '';
  if (typeof p === 'string') return p;
  if (typeof p !== 'object') return '';
  if (typeof p.href === 'string' && p.href) return p.href;
  const mixed = p.mixed_sources || p.mixedSources;
  if (mixed && typeof mixed === 'object') {
    const fromMixed =
      pickLargestSourceUrl(mixed.jpeg) ||
      pickLargestSourceUrl(mixed.jpg) ||
      pickLargestSourceUrl(mixed.webp) ||
      pickLargestSourceUrl(mixed.jpegSources) ||
      pickLargestSourceUrl(mixed.sources);
    if (fromMixed) return fromMixed;
  }
  if (typeof p.url === 'string' && p.url) return p.url;
  return '';
}

function urlsFromPhotoArray(raw) {
  if (!Array.isArray(raw)) return [];
  const urls = [];
  for (const p of raw) {
    const u = typeof p === 'string' ? p : urlFromPhotoObject(p);
    if (u) urls.push(u);
  }
  return urls.filter(Boolean);
}

/** Merge responsivePhotos + photos (search often only fills photos with 1–2 previews). */
function pickPhotos(r) {
  if (!r || typeof r !== 'object') return [];
  const cap = maxPhotosPerListing();
  const fields = [
    r.responsivePhotos,
    r.responsive_photos,
    r.galleryPhotos,
    r.gallery_photos,
    r.photos,
    r.photo,
    r.images,
  ];
  const out = [];
  const seen = new Set();
  for (const field of fields) {
    for (const u of urlsFromPhotoArray(asPhotoArray(field))) {
      const k = normalizePhotoUrlForDedupe(u);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(u);
      if (out.length >= cap) return out;
    }
  }
  return out;
}

/** Property-detail responses vary; take the longest photo list we find */
function extractPhotosFromDetailPayload(json) {
  if (!json || typeof json !== 'object') return [];
  const home = json?.data?.home;
  const prop = json?.data?.property;
  const candidates = [
    home?.responsivePhotos,
    home?.responsive_photos,
    prop?.responsivePhotos,
    prop?.responsive_photos,
    json?.data?.home?.photos,
    json?.data?.property?.photos,
    json?.data?.home?.property?.photos,
    home?.photos,
    prop?.photos,
    json?.home?.photos,
    json?.property?.photos,
    json?.photos,
    json?.data?.photos,
    json?.listing?.photos,
    json?.data?.listing?.photos,
  ];
  let best = [];
  for (const raw of candidates) {
    const u = urlsFromPhotoArray(asPhotoArray(raw));
    if (u.length > best.length) best = u;
  }
  if (home && typeof home === 'object' && !Array.isArray(home)) {
    for (const raw of [home.responsivePhotos, home.responsive_photos, home.photos]) {
      const u = urlsFromPhotoArray(asPhotoArray(raw));
      if (u.length > best.length) best = u;
    }
  }
  return dedupePhotoUrls(best);
}

async function fetchDetailPhotoUrls(propertyId, key, host) {
  const base = (process.env.RAPIDAPI_BASE_URL || 'https://us-real-estate.p.rapidapi.com').replace(
    /\/$/,
    ''
  );
  const path = process.env.RAPIDAPI_PROPERTY_DETAIL_PATH || '/v3/property-detail';
  const u = new URL(path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`);
  u.searchParams.set('property_id', String(propertyId));
  const res = await fetch(u.toString(), {
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': host,
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return [];
  }
  if (!res.ok) return [];
  return extractPhotosFromDetailPayload(json);
}

function mapPropertyType(r) {
  const t = String(
    r?.description?.type ||
      r?.property_type ||
      r?.prop_type ||
      ''
  ).toLowerCase();
  if (t.includes('condo') || t.includes('coop')) return 'condo';
  if (t.includes('town')) return 'townhouse';
  if (t.includes('land') || t.includes('lot')) return 'land';
  if (t.includes('apartment') || t.includes('multi')) return 'apartment';
  return 'house';
}

function mapListing(raw) {
  const external_id = pickExternalId(raw);
  if (!external_id) return null;

  const addr = pickAddress(raw);
  const { beds, baths, sqft } = pickBedsBathsSqft(raw);
  const price = pickPrice(raw);
  const description = pickDescription(raw);
  const title =
    [addr.line, addr.city].filter(Boolean).join(' · ') || `Listing ${external_id}`;

  return {
    listing_origin: 'imported',
    external_id,
    external_source: EXTERNAL_SOURCE,
    seller_id: null,
    title: title.slice(0, 200),
    slug: makeSlug({ line: addr.line, city: addr.city, externalId: external_id }),
    description: description.slice(0, 20000),
    price: price > 0 ? price : 1,
    address: addr.line.slice(0, 500),
    city: (addr.city || 'Unknown').slice(0, 120),
    state: (addr.state || '').slice(0, 2),
    zip_code: (addr.zip || '').slice(0, 20),
    latitude: Number.isFinite(addr.lat) ? addr.lat : null,
    longitude: Number.isFinite(addr.lon) ? addr.lon : null,
    bedrooms: Math.max(0, Math.min(50, beds)),
    bathrooms: Math.max(0, Math.min(50, baths)),
    sqft: Math.max(0, sqft),
    property_type: mapPropertyType(raw),
    property_status: 'for_sale',
    listing_status: 'active',
    is_featured: false,
    year_built: num(raw?.description?.year_built ?? raw?.year_built, null) || null,
    lot_size: null,
    parking: null,
    amenities: [],
    photo_urls: pickPhotos(raw),
  };
}

async function replaceImages(supabase, propertyId, photoUrls) {
  await supabase.from('property_images').delete().eq('property_id', propertyId);
  const unique = dedupePhotoUrls(photoUrls);
  if (!unique.length) return;

  const rows = unique.map((url, i) => ({
    property_id: propertyId,
    url,
    storage_path: `external:${url.slice(0, 500)}`,
    is_primary: i === 0,
    display_order: i,
  }));

  const { error } = await supabase.from('property_images').insert(rows);
  if (error) throw error;
}

async function upsertListing(supabase, row) {
  const { photo_urls, ...propertyRow } = row;

  const { data: existing } = await supabase
    .from('properties')
    .select('id, slug')
    .eq('listing_origin', 'imported')
    .eq('external_source', EXTERNAL_SOURCE)
    .eq('external_id', propertyRow.external_id)
    .maybeSingle();

  if (existing?.id) {
    const { slug, ...updateRest } = propertyRow;
    const { error: upErr } = await supabase
      .from('properties')
      .update({
        ...updateRest,
        slug: existing.slug,
      })
      .eq('id', existing.id);
    if (upErr) throw upErr;
    await replaceImages(supabase, existing.id, photo_urls);
    return { id: existing.id, updated: true };
  }

  const { data: inserted, error: insErr } = await supabase
    .from('properties')
    .insert(propertyRow)
    .select('id')
    .single();
  if (insErr) throw insErr;
  await replaceImages(supabase, inserted.id, photo_urls);
  return { id: inserted.id, updated: false };
}

function buildForSaleUrl() {
  const base = (process.env.RAPIDAPI_BASE_URL || 'https://us-real-estate.p.rapidapi.com').replace(
    /\/$/,
    ''
  );
  const path = process.env.RAPIDAPI_FOR_SALE_PATH || '/v3/for-sale';
  const u = new URL(path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`);
  const city = process.env.RAPIDAPI_SYNC_CITY || '';
  const stateCode = process.env.RAPIDAPI_SYNC_STATE_CODE || '';
  const location = process.env.RAPIDAPI_SYNC_LOCATION || '';
  const limit = process.env.RAPIDAPI_SYNC_LIMIT || '42';
  const offset = process.env.RAPIDAPI_SYNC_OFFSET || '0';
  const sort = process.env.RAPIDAPI_SYNC_SORT || 'newest';

  if (city) u.searchParams.set('city', city);
  if (stateCode) u.searchParams.set('state_code', stateCode);
  if (location) u.searchParams.set('location', location);
  u.searchParams.set('limit', String(limit));
  u.searchParams.set('offset', String(offset));
  u.searchParams.set('sort', sort);

  return u.toString();
}

async function main() {
  const url = process.env.RAPIDAPI_FOR_SALE_URL || buildForSaleUrl();
  const key = process.env.RAPIDAPI_KEY;
  const host =
    process.env.RAPIDAPI_HOST || 'us-real-estate.p.rapidapi.com';

  if (!key) {
    console.error(
      'Missing RAPIDAPI_KEY. Add RAPIDAPI_KEY=... to homestead/.env.local (no spaces around =).'
    );
    console.error('Resolved env file:', envFile || '(none — create homestead/.env.local)');
    process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('Fetching:', url.replace(key, '***'));

  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': host,
    },
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error('Non-JSON response:', text.slice(0, 500));
    process.exit(1);
  }

  if (!res.ok) {
    console.error('HTTP', res.status, json);
    process.exit(1);
  }

  const results = extractResultArray(json);
  console.log(`Parsed ${results.length} listing(s) from API response.`);

  if (results.length === 0) {
    console.warn(
      'No listings extracted — empty search, plan limit, or JSON shape not recognized.'
    );
    console.warn('Top-level keys:', Object.keys(json));
    if (json.data && typeof json.data === 'object') {
      console.warn('data keys:', Object.keys(json.data));
      const hs = json.data.home_search;
      if (hs && typeof hs === 'object' && !Array.isArray(hs)) {
        console.warn('home_search keys:', Object.keys(hs));
        const r = hs.results;
        if (r != null) {
          if (Array.isArray(r)) console.warn(`home_search.results: array, length ${r.length}`);
          else if (typeof r === 'object') console.warn('home_search.results keys:', Object.keys(r));
        }
      }
    }
    if (json.status != null) console.warn('API status field:', json.status);
    if (json.message != null) console.warn('message:', json.message);
    if (process.env.RAPIDAPI_DEBUG_JSON === '1') {
      console.warn('Response (truncated):\n', JSON.stringify(json, null, 2).slice(0, 5000));
    } else {
      console.warn('Add RAPIDAPI_DEBUG_JSON=1 to .env.local to print a truncated JSON body.');
    }
  }

  const fetchDetailPhotos = process.env.RAPIDAPI_FETCH_DETAIL_PHOTOS !== 'false';
  const detailDelayMs = Math.max(0, Number(process.env.RAPIDAPI_DETAIL_DELAY_MS ?? 120) || 0);
  if (fetchDetailPhotos && results.length > 0) {
    console.log(
      `Fetching full photo sets via property-detail (${detailDelayMs}ms between calls). Set RAPIDAPI_FETCH_DETAIL_PHOTOS=false to skip.`
    );
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let detailPhotoBoost = 0;

  for (const raw of results) {
    const row = mapListing(raw);
    if (!row) {
      skipped += 1;
      continue;
    }
    try {
      if (fetchDetailPhotos && row.external_id) {
        const searchCount = row.photo_urls.length;
        const detailUrls = await fetchDetailPhotoUrls(row.external_id, key, host);
        if (detailUrls.length > searchCount) detailPhotoBoost += 1;
        if (detailUrls.length) {
          const cap = maxPhotosPerListing();
          row.photo_urls = dedupePhotoUrls([...detailUrls, ...row.photo_urls]).slice(0, cap);
        }
        if (detailDelayMs > 0) await new Promise((r) => setTimeout(r, detailDelayMs));
      }
      const r = await upsertListing(supabase, row);
      if (r.updated) updated += 1;
      else inserted += 1;
    } catch (e) {
      console.error('Row failed', row.external_id, e.message || e);
    }
  }

  console.log(
    `Done. Inserted ${inserted}, updated ${updated}, skipped ${skipped}.` +
      (fetchDetailPhotos ? ` Listings with more photos after detail fetch: ${detailPhotoBoost}.` : '')
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
