'use client';

import { useState } from 'react';
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { PropertyFilters } from '@/types';

interface SearchFiltersProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  compact?: boolean;
  /** Hide sale/rent status when page is rentals-only */
  hideStatusFilter?: boolean;
}

export default function SearchFilters({ filters, onChange, compact, hideStatusFilter }: SearchFiltersProps) {
  const [showMore, setShowMore] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...filters, search: searchInput, page: 1 });
  };

  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const clearFilters = () => {
    setSearchInput('');
    onChange({ page: 1, limit: filters.limit });
  };

  const activeFiltersCount = [
    filters.min_price, filters.max_price, filters.bedrooms,
    filters.bathrooms, filters.property_type, filters.property_status,
  ].filter(Boolean).length;

  return (
    <div
      className={cn(
        'surface-cut border border-white/10 bg-zinc-900/90 shadow-sharp ring-1 ring-brand-500/20 backdrop-blur-xl',
        compact ? 'p-3' : 'p-4 md:p-5'
      )}
    >
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city, address, or keyword..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-10 !py-2.5"
          />
        </div>
        <button type="submit" className="btn-primary !py-2.5 !px-5 text-sm">
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={cn(
            'btn-secondary !py-2.5 !px-3.5 text-sm relative',
            showMore && 'bg-brand-50 border-brand-200 text-brand-700'
          )}
        >
          <FunnelIcon className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center border border-white/10 bg-brand-600 text-[10px] font-bold text-white shadow-sharp-sm">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </form>

      {/* Expanded Filters */}
      {showMore && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {!hideStatusFilter && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Status</label>
                <select
                  value={filters.property_status || ''}
                  onChange={(e) => updateFilter('property_status', e.target.value)}
                  className="input-field !py-2 text-sm"
                >
                  <option value="">Any</option>
                  <option value="for_sale">For Sale</option>
                  <option value="for_rent">For Rent</option>
                </select>
              </div>
            )}

            {/* Property Type */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Type</label>
              <select
                value={filters.property_type || ''}
                onChange={(e) => updateFilter('property_type', e.target.value)}
                className="input-field !py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Min Price</label>
              <input
                type="number"
                placeholder="No min"
                value={filters.min_price || ''}
                onChange={(e) => updateFilter('min_price', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field !py-2 text-sm"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Max Price</label>
              <input
                type="number"
                placeholder="No max"
                value={filters.max_price || ''}
                onChange={(e) => updateFilter('max_price', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field !py-2 text-sm"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Bedrooms</label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => updateFilter('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field !py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Bathrooms</label>
              <select
                value={filters.bathrooms || ''}
                onChange={(e) => updateFilter('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field !py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Sort & Clear */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Sort:</label>
              <select
                value={filters.sort_by || 'newest'}
                onChange={(e) => updateFilter('sort_by', e.target.value)}
                className="input-field !py-1.5 !px-3 text-sm w-auto"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                <XMarkIcon className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
