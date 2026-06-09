/**
 * Import specific Zillow listings by ZPID (via RapidAPI property-detail).
 *
 * 1. Put ZPIDs in scripts/zpids.txt (one per line) or RAPIDAPI_IMPORT_ZPIDS in .env.local
 * 2. Ensure RAPIDAPI_KEY, Supabase keys, migration 002 are set
 * 3. Run: npm run import:zpids
 *
 * Prints RENTAL_DEALS_PREVIEW_SLUGS=... when finished (copy into .env.local).
 */

import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envLocal = join(root, '.env.local');

if (existsSync(envLocal)) config({ path: envLocal, override: false });

const defaultZpidsFile = join(__dirname, 'zpids.txt');
if (!process.env.RAPIDAPI_IMPORT_ZPIDS?.trim() && existsSync(defaultZpidsFile)) {
  process.env.RAPIDAPI_IMPORT_ZPIDS_FILE = process.env.RAPIDAPI_IMPORT_ZPIDS_FILE || defaultZpidsFile;
}

process.env.RAPIDAPI_ZPID_IMPORT_ONLY = '1';

await import('./sync-rapidapi-listings.mjs');
