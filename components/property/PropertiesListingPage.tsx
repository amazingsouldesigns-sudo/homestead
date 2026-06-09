'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import PropertyCard from '@/components/property/PropertyCard';
import SearchFilters from '@/components/property/SearchFilters';
import PropertyMap from '@/components/maps/PropertyMap';
import { ArrowPathIcon, MapIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { Property, PropertyFilters } from '@/types';

type PropertiesListingPageProps = {
  title: string;
  basePath: '/properties' | '/rentals';
  /** When set, only this listing status is shown and the status filter is hidden. */
  lockedPropertyStatus?: PropertyFilters['property_status'];
  pageSize?: number;
  resultLabel?: string;
  emptyTitle?: string;
};

export default function PropertiesListingPage({
  title,
  basePath,
  lockedPropertyStatus,
  pageSize = 24,
  resultLabel = 'properties',
  emptyTitle = 'No properties found',
}: PropertiesListingPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<'grid' | 'map'>('grid');

  const getFiltersFromParams = useCallback((): PropertyFilters => {
    const statusFromUrl = searchParams.get('property_status') as PropertyFilters['property_status'] | null;
    return {
      search: searchParams.get('search') || undefined,
      property_type: (searchParams.get('property_type') as PropertyFilters['property_type']) || undefined,
      property_status: lockedPropertyStatus || statusFromUrl || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
      sort_by: (searchParams.get('sort_by') as PropertyFilters['sort_by']) || 'newest',
      is_featured: searchParams.get('featured') === 'true' ? true : undefined,
      page: Number(searchParams.get('page') || 1),
      limit: pageSize,
    };
  }, [searchParams, lockedPropertyStatus, pageSize]);

  const [filters, setFilters] = useState<PropertyFilters>(getFiltersFromParams());

  const fetchProperties = useCallback(
    async (f: PropertyFilters) => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from('properties')
        .select('*, images:property_images(*), seller:users(full_name, avatar_url)', { count: 'exact' })
        .eq('listing_status', 'active');

      if (f.search) {
        query = query.or(`title.ilike.%${f.search}%,city.ilike.%${f.search}%,address.ilike.%${f.search}%`);
      }
      if (f.property_type) query = query.eq('property_type', f.property_type);
      const status = lockedPropertyStatus || f.property_status;
      if (status) query = query.eq('property_status', status);
      if (f.min_price) query = query.gte('price', f.min_price);
      if (f.max_price) query = query.lte('price', f.max_price);
      if (f.bedrooms) query = query.gte('bedrooms', f.bedrooms);
      if (f.bathrooms) query = query.gte('bathrooms', f.bathrooms);
      if (f.is_featured) query = query.eq('is_featured', true);

      switch (f.sort_by) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        default:
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      const page = f.page || 1;
      const limit = f.limit || pageSize;
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, count } = await query;
      setProperties((data || []) as Property[]);
      setTotal(count || 0);
      setLoading(false);
    },
    [lockedPropertyStatus, pageSize]
  );

  useEffect(() => {
    const f = getFiltersFromParams();
    setFilters(f);
    fetchProperties(f);
  }, [searchParams, getFiltersFromParams, fetchProperties]);

  const handleFilterChange = (newFilters: PropertyFilters) => {
    const merged: PropertyFilters = {
      ...newFilters,
      property_status: lockedPropertyStatus || newFilters.property_status,
      limit: pageSize,
    };
    setFilters(merged);
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'limit') {
        if (key === 'is_featured' && value) params.set('featured', 'true');
        else if (key !== 'is_featured' && key !== 'property_status') params.set(key, String(value));
      }
    });
    router.push(`${basePath}?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / (filters.limit || pageSize));
  const currentPage = filters.page || 1;

  return (
    <div className="py-6 md:py-8">
      <div className="page-container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="section-title">{title}</h1>
            <p className="mt-1 text-slate-400">
              {loading ? 'Loading…' : `${total.toLocaleString()} ${resultLabel} found`}
            </p>
          </div>
          <div className="surface-cut-sm flex items-center gap-1 border border-white/10 bg-zinc-900/80 p-1 ring-1 ring-brand-500/20 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={cn(
                'border border-transparent p-2 transition-colors',
                view === 'grid'
                  ? 'bg-zinc-800 text-slate-100 shadow-inner ring-1 ring-brand-500/30'
                  : 'text-slate-400 hover:bg-white/5'
              )}
            >
              <TableCellsIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('map')}
              className={cn(
                'border border-transparent p-2 transition-colors',
                view === 'map'
                  ? 'bg-zinc-800 text-slate-100 shadow-inner ring-1 ring-brand-500/30'
                  : 'text-slate-400 hover:bg-white/5'
              )}
            >
              <MapIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <SearchFilters
          filters={filters}
          onChange={handleFilterChange}
          hideStatusFilter={Boolean(lockedPropertyStatus)}
        />

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : properties.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-2 text-xl font-semibold text-slate-300">{emptyTitle}</p>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : view === 'map' ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto pr-2">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              <div className="sticky top-24">
                <PropertyMap properties={properties} height="calc(100vh - 200px)" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, page })}
                  className={cn(
                    'surface-cut-sm h-10 w-10 text-sm font-semibold uppercase tracking-widecaps transition-colors',
                    page === currentPage
                      ? 'bg-brand-600 text-white'
                      : 'border border-white/10 bg-zinc-800/90 text-slate-300 shadow-sm ring-1 ring-brand-500/15 hover:border-brand-400/40 hover:bg-zinc-800'
                  )}
                >
                  {page}
                </button>
              ))}
              {totalPages > 8 && <span className="text-slate-400">…</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
