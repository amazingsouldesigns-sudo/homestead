import type { RentalPreviewListing } from '@/components/home/RentalDealsSection';
import {
  primaryUrlFromJoinedImages,
  type PropertyRowWithImages,
} from '@/lib/browse-type-card-media';

/** Max rentals in homepage preview carousel (slideshow still capped separately). */
export const RENTAL_DEALS_PREVIEW_MAX = 500;

/** Comma-separated property slugs from /properties/[slug] — order is preserved in the preview. */
const SLUGS_ENV_KEYS = ['RENTAL_DEALS_PREVIEW_SLUGS', 'NEXT_PUBLIC_RENTAL_DEALS_PREVIEW_SLUGS'] as const;

export function parseRentalDealsPreviewSlugs(): string[] {
  for (const key of SLUGS_ENV_KEYS) {
    const raw = process.env[key]?.trim();
    if (!raw) continue;
    const slugs = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (slugs.length > 0) return slugs;
  }
  return [];
}

export type RentalDealsPropertyRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  city: string;
  created_at: string;
  images: PropertyRowWithImages['images'];
};

/** Keep only rows that match the env list, in the same order as configured. */
export function orderRowsByCuratedSlugs<T extends { slug: string }>(
  rows: T[],
  slugs: string[]
): T[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs.flatMap((slug) => {
    const row = bySlug.get(slug);
    return row ? [row] : [];
  });
}

export function mapRowToRentalPreview(row: RentalDealsPropertyRow): RentalPreviewListing {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: row.price,
    city: row.city,
    imageUrl: primaryUrlFromJoinedImages(row.images),
  };
}
