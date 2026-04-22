import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import HeroListingSlideshow from '@/components/home/HeroListingSlideshow';
import PropertyTypeBrowseCard from '@/components/home/PropertyTypeBrowseCard';
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import type { PropertyType } from '@/types';
import {
  pickDualPropertyPrimaryImages,
  primaryUrlsInRichnessOrder,
  rankListingsForPromotedSurfaces,
  type PropertyRowWithImages,
} from '@/lib/browse-type-card-media';

export const revalidate = 60;

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

/** Browse card: top two distinct properties by image count (front / hover back). */
async function getBrowseTypeCardImages(
  propertyType: PropertyType
): Promise<{ front: string | null; back: string | null }> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('properties')
    .select('id, created_at, images:property_images(url, is_primary, display_order)')
    .eq('listing_status', 'active')
    .eq('property_type', propertyType)
    .order('created_at', { ascending: false })
    .limit(56);

  const ranked = rankListingsForPromotedSurfaces((data || []) as PropertyRowWithImages[]);
  return pickDualPropertyPrimaryImages(ranked);
}

const BROWSE_TYPES = ['house', 'apartment', 'condo', 'townhouse'] as const satisfies readonly PropertyType[];

export default async function HomePage() {
  const [featured, recent, stats, heroImages, ...browseCardSets] = await Promise.all([
    getFeaturedProperties(),
    getRecentProperties(),
    getStats(),
    getHeroSlideImages(),
    ...BROWSE_TYPES.map((t) => getBrowseTypeCardImages(t)),
  ]);

  const browseCardByType = Object.fromEntries(
    BROWSE_TYPES.map((t, i) => [t, browseCardSets[i] as { front: string | null; back: string | null }])
  ) as Record<(typeof BROWSE_TYPES)[number], { front: string | null; back: string | null }>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px] bg-slate-950 text-white">
        <HeroListingSlideshow images={heroImages} />
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-br from-slate-950/70 via-slate-900/45 to-brand-950/55 pointer-events-none"
          aria-hidden
        />
        {/* Liquid glass: left emphasis; mask fades blur + tint seamlessly into the image (no hard edge) */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none bg-slate-950/35 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)] md:inset-y-0 md:-left-[8%] md:h-full md:w-[78%] md:right-auto md:bg-gradient-to-r md:from-white/[0.14] md:via-white/[0.06] md:to-white/[0.02] md:backdrop-blur-2xl md:backdrop-saturate-150 md:[mask-image:linear-gradient(90deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.92)_18%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0)_82%)] md:[-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.92)_18%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0)_82%)]"
          aria-hidden
        />
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none md:z-[4]">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative z-10 py-24 md:py-36 lg:py-44">
          <div className="relative max-w-3xl">
            {/* Mobile: glass capsule behind copy so text reads on busy slides */}
            <div
              className="absolute -inset-x-4 -inset-y-3 rounded-3xl bg-white/[0.1] backdrop-blur-xl backdrop-saturate-150 border border-white/20 shadow-xl md:hidden pointer-events-none"
              aria-hidden
            />
            <div className="relative z-10">
            <div className="gold-chip inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full animate-pulse-soft bg-[#C9A227]" />
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
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/10 max-w-2xl">
              <form action="/properties" method="GET" className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <MapPinIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Enter city, neighborhood, or address..."
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/90 py-4 pl-12 pr-4 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button type="submit" className="btn-primary !py-4 !px-8 !rounded-xl whitespace-nowrap">
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
                  { label: 'For Rent', href: '/properties?property_status=for_rent' },
                ] as const
              ).map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="gold-outline-chip px-4 py-2 rounded-full text-sm transition-all hover:bg-white/20 hover:text-white"
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
                <span className="label-future gold-label">Curated Selection</span>
                <h2 className="section-title mt-2">Featured Properties</h2>
              </div>
              <Link href="/properties?featured=true" className="btn-ghost gold-accent-link hidden text-sm md:flex">
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

      {/* Property Types */}
      <section className="border-y border-white/10 bg-zinc-900/50 py-16 backdrop-blur-xl md:py-24">
        <div className="page-container">
          <div className="text-center mb-12">
                <span className="label-future gold-label">Browse By Type</span>
            <h2 className="section-title mt-2">Explore Property Types</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(
              [
                {
                  title: 'Houses',
                  browseLabel: 'Browse houses',
                  type: 'house' as const,
                  href: '/properties?property_type=house',
                },
                {
                  title: 'Apartments',
                  browseLabel: 'Browse apartments',
                  type: 'apartment' as const,
                  href: '/properties?property_type=apartment',
                },
                {
                  title: 'Condos',
                  browseLabel: 'Browse condos',
                  type: 'condo' as const,
                  href: '/properties?property_type=condo',
                },
                {
                  title: 'Townhouses',
                  browseLabel: 'Browse townhouses',
                  type: 'townhouse' as const,
                  href: '/properties?property_type=townhouse',
                },
              ] as const
            ).map((item) => {
              const { front, back } = browseCardByType[item.type];
              return (
                <PropertyTypeBrowseCard
                  key={item.type}
                  href={item.href}
                  title={item.title}
                  browseLabel={item.browseLabel}
                  imageFront={front}
                  imageBack={back}
                  fallbackVariant={item.type}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      {recent.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="label-future gold-label">Just Listed</span>
                <h2 className="section-title mt-2">Recent Properties</h2>
              </div>
              <Link href="/properties" className="btn-ghost gold-accent-link hidden text-sm md:flex">
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
      <section className="py-16 md:py-24 bg-brand-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-700 rounded-full blur-3xl opacity-50" />
        </div>
        <div className="page-container relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
            Ready to list your property?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of sellers who trust Homestead to showcase their properties to qualified buyers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/85 px-8 py-4 font-semibold text-brand-700 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:shadow-xl">
              Get Started Free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/properties" className="gold-btn inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all border">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
