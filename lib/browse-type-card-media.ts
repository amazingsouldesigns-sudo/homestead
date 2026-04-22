/**
 * Rank listings for hero + browse-by-type cards: no zero-image rows; “top” prefers
 * listings with at least {@link MIN_PHOTOS_FOR_TOP_SURFACES} photos when any qualify.
 */

/** Listings below this image count are excluded from the top tier when enough richer listings exist. */
export const MIN_PHOTOS_FOR_TOP_SURFACES = 10;

export type JoinedImageRow = { url: string; is_primary: boolean; display_order: number };

export type PropertyRowWithImages = {
  id: string;
  created_at: string;
  images: JoinedImageRow[] | null;
};

export type RankedListingImage = {
  propertyId: string;
  imageCount: number;
  primaryUrl: string;
  createdAt: string;
};

export function primaryUrlFromJoinedImages(imgs: JoinedImageRow[] | null | undefined): string | null {
  if (!imgs?.length) return null;
  const sorted = [...imgs].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });
  return sorted[0]?.url ?? null;
}

/** Drops listings with no usable image; sorts by image count (desc), then recency. */
export function rankListingsByImageRichness(rows: PropertyRowWithImages[]): RankedListingImage[] {
  const ranked: RankedListingImage[] = [];
  for (const row of rows) {
    const imgs = row.images;
    const imageCount = imgs?.length ?? 0;
    if (imageCount === 0) continue;
    const primaryUrl = primaryUrlFromJoinedImages(imgs);
    if (!primaryUrl) continue;
    ranked.push({
      propertyId: row.id,
      imageCount,
      primaryUrl,
      createdAt: row.created_at,
    });
  }
  ranked.sort((a, b) => {
    if (b.imageCount !== a.imageCount) return b.imageCount - a.imageCount;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return ranked;
}

/**
 * Same as {@link rankListingsByImageRichness}, but only listings with
 * {@link MIN_PHOTOS_FOR_TOP_SURFACES}+ images appear when at least one exists.
 * If none have that many, falls back to all ranked listings with ≥1 photo (newest-rich order).
 */
export function rankListingsForPromotedSurfaces(rows: PropertyRowWithImages[]): RankedListingImage[] {
  const ranked = rankListingsByImageRichness(rows);
  const topTier = ranked.filter((r) => r.imageCount >= MIN_PHOTOS_FOR_TOP_SURFACES);
  return topTier.length > 0 ? topTier : ranked;
}

/** First surface = richest listing; second = next distinct property (fewer photos than first when possible). */
export function pickDualPropertyPrimaryImages(ranked: RankedListingImage[]): {
  front: string | null;
  back: string | null;
} {
  if (ranked.length === 0) return { front: null, back: null };
  if (ranked.length === 1) return { front: ranked[0].primaryUrl, back: null };
  return { front: ranked[0].primaryUrl, back: ranked[1].primaryUrl };
}

/** Ordered URLs for slideshows — richer listings first; sparse listings trail and may be omitted if capped. */
export function primaryUrlsInRichnessOrder(ranked: RankedListingImage[], max: number): string[] {
  return ranked.slice(0, max).map((r) => r.primaryUrl);
}
