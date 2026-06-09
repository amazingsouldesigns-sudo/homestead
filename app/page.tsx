import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import HeroListingSlideshow from '@/components/home/HeroListingSlideshow';
import RentalDealsSection, { type RentalPreviewListing } from '@/components/home/RentalDealsSection';
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  primaryUrlsInRichnessOrder,
  rankListingsByImageRichness,
  rankListingsForPromotedSurfaces,
  type PropertyRowWithImages,
} from '@/lib/browse-type-card-media';
import {
  mapRowToRentalPreview,
  orderRowsByCuratedSlugs,
  parseRentalDealsPreviewSlugs,
  RENTAL_DEALS_PREVIEW_MAX,
  type RentalDealsPropertyRow,
} from '@/lib/rental-deals-curated';

/** Always load fresh rentals after RapidAPI sync (avoid stale empty homepage). */
export const dynamic = 'force-dynamic';

/** Background slideshow: one primary photo per listing, up to this many rentals. */
const RENTAL_DEALS_BG_MAX = 48;

/** Public homepage “Happy Users” never shows below this (marketing baseline). */
const DISPLAY_USERS_MIN = 10_365;

async function getFeaturedProperties() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('properties')
    .select('*, images:property_images(*), seller:users(full_name, avatar_url)')
    .eq('listing_status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

/**
 * Recent Properties: same rules as hero / browse cards — no zero-image listings;
 * when any listing has 10+ photos, only those qualify for this strip (up to 8).
 * Otherwise falls back to richest among listings with ≥1 photo.
 * Fetches 48 newest actives, then re-orders by promoted ranking (image count, then date).
 */
async function getRecentProperties() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('properties')
    .select('*, images:property_images(*), seller:users(full_name, avatar_url)')
    .eq('listing_status', 'active')
    .order('created_at', { ascending: false })
    .limit(48);

  const rows = data || [];
  if (rows.length === 0) return [];

  const forRank: PropertyRowWithImages[] = rows.map((r: { id: string; created_at: string; images: unknown }) => ({
    id: r.id,
    created_at: r.created_at,
    images: r.images as PropertyRowWithImages['images'],
  }));

  const ranked = rankListingsForPromotedSurfaces(forRank);
  const byId = new Map(rows.map((r: { id: string }) => [r.id, r]));
  return ranked
    .slice(0, 8)
    .map((r) => byId.get(r.propertyId))
    .filter((row): row is NonNullable<typeof row> => row != null);
}

async function getStats() {
  const supabase = createServerSupabaseClient();
  const { count: totalProperties } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('listing_status', 'active');
  const { count: totalUsersRaw } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const totalUsers = Math.max(DISPLAY_USERS_MIN, totalUsersRaw || 0);
  return { totalProperties: totalProperties || 0, totalUsers };
}

/** Hero slides: only listings with photos; more images first; sparse listings trail. */
async function getHeroSlideImages(): Promise<string[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('properties')
    .select('id, created_at, images:property_images(url, is_primary, display_order)')
    .eq('listing_status', 'active')
    .order('created_at', { ascending: false })
    .limit(48);

  const ranked = rankListingsForPromotedSurfaces((data || []) as PropertyRowWithImages[]);
  return primaryUrlsInRichnessOrder(ranked, 28);
}

const RENTAL_DEALS_SELECT =
  'id, slug, title, price, city, created_at, images:property_images(url, is_primary, display_order)';

async function getRentalDealsSectionData(): Promise<{
  backgroundImages: string[];
  previewListings: RentalPreviewListing[];
}> {
  const supabase = createServerSupabaseClient();
  const curatedSlugs = parseRentalDealsPreviewSlugs();

  if (curatedSlugs.length > 0) {
    const { data } = await supabase
      .from('properties')
      .select(RENTAL_DEALS_SELECT)
      .eq('listing_status', 'active')
      .in('slug', curatedSlugs);

    const ordered = orderRowsByCuratedSlugs(
      (data || []) as RentalDealsPropertyRow[],
      curatedSlugs
    );
    const previewListings = ordered.map(mapRowToRentalPreview);

    const forRank: PropertyRowWithImages[] = ordered.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      images: r.images,
    }));
    const ranked = rankListingsByImageRichness(forRank);
    const backgroundImages = primaryUrlsInRichnessOrder(ranked, RENTAL_DEALS_BG_MAX);

    return { backgroundImages, previewListings };
  }

  const { data } = await supabase
    .from('properties')
    .select(RENTAL_DEALS_SELECT)
    .eq('listing_status', 'active')
    .eq('property_status', 'for_rent')
    .order('created_at', { ascending: false })
    .limit(RENTAL_DEALS_PREVIEW_MAX);

  const rows = (data || []) as RentalDealsPropertyRow[];
  const forRank: PropertyRowWithImages[] = rows.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    images: r.images,
  }));

  const ranked = rankListingsByImageRichness(forRank);
  const backgroundImages = primaryUrlsInRichnessOrder(ranked, RENTAL_DEALS_BG_MAX);

  const rowById = new Map(rows.map((r) => [r.id, r]));
  const previewListings: RentalPreviewListing[] = ranked.flatMap((entry) => {
    const r = rowById.get(entry.propertyId);
    return r ? [mapRowToRentalPreview(r)] : [];
  });

  return { backgroundImages, previewListings };
}

export default async function HomePage() {
  const [featured, recent, stats, heroImages, rentalDeals] = await Promise.all([
    getFeaturedProperties(),
    getRecentProperties(),
    getStats(),
    getHeroSlideImages(),
    getRentalDealsSectionData(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px] bg-slate-950 text-white">
        <HeroListingSlideshow images={heroImages} />
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-br from-slate-950/75 via-slate-900/50 to-slate-950/40 pointer-events-none"
          aria-hidden
        />
        {/* Liquid glass: left emphasis; mask fades blur + tint seamlessly into the image (no hard edge) */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none bg-slate-950/35 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)] md:inset-y-0 md:-left-[8%] md:h-full md:w-[78%] md:right-auto md:bg-gradient-to-r md:from-white/[0.14] md:via-white/[0.06] md:to-white/[0.02] md:backdrop-blur-2xl md:backdrop-saturate-150 md:[mask-image:linear-gradient(90deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.92)_18%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0)_82%)] md:[-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.92)_18%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0)_82%)]"
          aria-hidden
        />
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none md:z-[4]">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="page-container relative z-10 py-24 md:py-36 lg:py-44">
          <div className="relative max-w-3xl">
            {/* Mobile: glass capsule behind copy so text reads on busy slides */}
            <div
              className="surface-cut-sm absolute -inset-x-4 -inset-y-3 border border-white/20 bg-white/[0.1] shadow-xl backdrop-blur-xl backdrop-saturate-150 md:hidden pointer-events-none"
              aria-hidden
            />
            <div className="relative z-10">
            <div className="gold-chip mb-8 inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse-soft bg-[#C9A227]" />
              <span className="text-sm font-medium text-[#F2E2A8]">
                {stats.totalProperties.toLocaleString()} properties available
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
              Find your place
              <br />
              <span className="gold-label [text-shadow:0_2px_28px_rgba(0,0,0,0.5)]">in the world</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-200 max-w-xl mb-10 leading-relaxed">
              Discover exceptional properties curated for modern living. Your dream home is just a search away.
            </p>

            {/* Search Bar */}
            <div className="surface-cut max-w-2xl border border-white/10 bg-white/10 p-2 shadow-sharp-sm backdrop-blur-xl">
              <form action="/properties" method="GET" className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <MapPinIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Enter city, neighborhood, or address..."
                    className="input-field !py-4 !pl-12 !pr-4 text-[15px]"
                  />
                </div>
                <button type="submit" className="btn-primary !px-8 !py-4 whitespace-nowrap">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Search
                </button>
              </form>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mt-6">
              {(
                [
                  { label: 'Houses', href: '/properties?property_type=house' },
                  { label: 'Apartments', href: '/properties?property_type=apartment' },
                  { label: 'Condos', href: '/properties?property_type=condo' },
                  { label: 'For Rent', href: '/rentals' },
                ] as const
              ).map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="gold-outline-chip px-4 py-2 text-sm transition-all hover:bg-white/20 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-white/10 bg-zinc-900/60 backdrop-blur-xl">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Active Listings', value: stats.totalProperties.toLocaleString(), icon: BuildingOffice2Icon },
              { label: 'Happy Users', value: stats.totalUsers.toLocaleString(), icon: HomeIcon },
              { label: 'Cities Covered', value: '50+', icon: MapPinIcon },
              { label: 'Trusted Agents', value: '200+', icon: ShieldCheckIcon },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="gold-stat-icon mx-auto mb-2 h-6 w-6" />
                <p className="font-display text-2xl text-slate-100 md:text-3xl">{stat.value}</p>
                <p className="mt-0.5 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="label-future text-brand-400/90">Curated Selection</span>
                <h2 className="section-title mt-2">Featured Properties</h2>
              </div>
              <Link href="/properties?featured=true" className="btn-ghost hidden text-sm text-brand-400 md:flex">
                View All <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      <RentalDealsSection
        backgroundImages={rentalDeals.backgroundImages}
        previewListings={rentalDeals.previewListings}
      />

      {/* Recent Listings */}
      {recent.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="label-future text-brand-400/90">Just Listed</span>
                <h2 className="section-title mt-2">Recent Properties</h2>
              </div>
              <Link href="/properties" className="btn-ghost hidden text-sm text-brand-400 md:flex">
                Browse All <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recent.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden border-y border-white/10 bg-zinc-900/80 py-16 md:py-24">
        <div className="page-container relative z-10 text-center">
          <h2 className="font-display mb-4 text-3xl text-slate-50 md:text-5xl">
            Ready to list your property?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-400">
            Join thousands of sellers who trust Homestead to showcase their properties to qualified buyers.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary !px-8 !py-4">
              Get Started Free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/properties" className="btn-secondary !px-8 !py-4">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
