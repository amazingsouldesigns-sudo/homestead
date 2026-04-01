'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import PropertyCard from '@/components/property/PropertyCard';
import SearchFilters from '@/components/property/SearchFilters';
import PropertyMap from '@/components/maps/PropertyMap';
import { Map, Grid3X3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property, PropertyFilters } from '@/types';

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<'grid' | 'map'>('grid');

  const getFiltersFromParams = useCallback((): PropertyFilters => ({
    search: searchParams.get('search') || undefined,
    property_type: (searchParams.get('property_type') as any) || undefined,
    property_status: (searchParams.get('property_status') as any) || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
    sort_by: (searchParams.get('sort_by') as any) || 'newest',
    is_featured: searchParams.get('featured') === 'true' ? true : undefined,
    page: Number(searchParams.get('page') || 1),
    limit: 24,
  }), [searchParams]);

  const [filters, setFilters] = useState<PropertyFilters>(getFiltersFromParams());

  const fetchProperties = useCallback(async (f: PropertyFilters) => {
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
    if (f.property_status) query = query.eq('property_status', f.property_status);
    if (f.min_price) query = query.gte('price', f.min_price);
    if (f.max_price) query = query.lte('price', f.max_price);
    if (f.bedrooms) query = query.gte('bedrooms', f.bedrooms);
    if (f.bathrooms) query = query.gte('bathrooms', f.bathrooms);
    if (f.is_featured) query = query.eq('is_featured', true);

    switch (f.sort_by) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'oldest': query = query.order('created_at', { ascending: true }); break;
      default: query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    const page = f.page || 1;
    const limit = f.limit || 24;
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, count } = await query;
    setProperties(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    const f = getFiltersFromParams();
    setFilters(f);
    fetchProperties(f);
  }, [searchParams, getFiltersFromParams, fetchProperties]);

  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'limit') {
        if (key === 'is_featured' && value) params.set('featured', 'true');
        else if (key !== 'is_featured') params.set(key, String(value));
      }
    });
    router.push(`/properties?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / (filters.limit || 24));
  const currentPage = filters.page || 1;

  return (
    <div className="py-6 md:py-8">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">Properties</h1>
            <p className="text-slate-500 mt-1">{total.toLocaleString()} properties found</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={cn('p-2 rounded-lg transition-colors', view === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('map')}
              className={cn('p-2 rounded-lg transition-colors', view === 'map' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400')}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <SearchFilters filters={filters} onChange={handleFilterChange} />

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-slate-600 mb-2">No properties found</p>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </div>
          ) : view === 'map' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              <div className="sticky top-24">
                <PropertyMap properties={properties} height="calc(100vh - 200px)" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handleFilterChange({ ...filters, page })}
                  className={cn(
                    'w-10 h-10 rounded-xl text-sm font-semibold transition-colors',
                    page === currentPage
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {page}
                </button>
              ))}
              {totalPages > 5 && <span className="text-slate-400">...</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
