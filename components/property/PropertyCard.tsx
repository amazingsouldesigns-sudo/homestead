'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowsPointingOutIcon,
  HeartIcon,
  HomeIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { BathMetricIcon, BedMetricIcon } from '@/components/icons/property-metrics';
import { formatPrice, formatNumber, getPropertyTypeLabel, getStatusLabel, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-browser';
import { useAuthStore } from '@/lib/store';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  saved?: boolean;
  onUnsave?: () => void;
}

export default function PropertyCard({ property, saved: initialSaved = false, onUnsave }: PropertyCardProps) {
  const { user } = useAuthStore();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const primaryImage = property.images?.find((i) => i.is_primary) || property.images?.[0];

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save properties');
      return;
    }
    setSaving(true);
    const supabase = createClient();
    try {
      if (isSaved) {
        await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);
        setIsSaved(false);
        onUnsave?.();
        toast.success('Removed from saved');
      } else {
        await supabase
          .from('saved_properties')
          .insert({ user_id: user.id, property_id: property.id });
        setIsSaved(true);
        toast.success('Property saved!');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setSaving(false);
  };

  return (
    <Link href={`/properties/${property.slug}`} className="group block">
      <article className="card overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800">
              <HomeIcon className="h-12 w-12 text-zinc-500" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={cn(
                'badge shadow-sm',
                property.property_status === 'for_sale' ? 'bg-brand-600 text-white' : 'bg-emerald-700 text-white'
              )}
            >
              {getStatusLabel(property.property_status)}
            </span>
            {property.is_featured && (
              <span className="badge bg-amber-500 text-white shadow-sm">
                <SparklesIcon className="mr-1 h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'absolute top-3 right-3 flex h-9 w-9 items-center justify-center border border-white/10 bg-zinc-900/90 transition-all shadow-sharp-sm',
              isSaved
                ? 'bg-red-500 text-white'
                : 'gold-favorite-hover bg-zinc-900/90 text-slate-200 ring-1 ring-white/10 hover:bg-zinc-800'
            )}
          >
            <HeartIcon className={cn('w-4 h-4', isSaved && 'fill-current')} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
            <span className="text-2xl font-bold text-white font-display">
              {formatPrice(property.price)}
              {property.property_status === 'for_rent' && (
                <span className="text-sm font-body font-normal text-white/80">/mo</span>
              )}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="mb-1.5 line-clamp-1 text-[15px] font-semibold text-slate-100 transition-colors group-hover:text-[#E2C76D]">
            {property.title}
          </h3>
          <div className="mb-3 flex items-center gap-1.5 text-sm text-slate-400">
            <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
            <span className="truncate">
              {property.address}, {property.city}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <BedMetricIcon className="h-4 w-4 text-slate-500" />
              <span>{property.bedrooms} bd</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BathMetricIcon className="h-4 w-4 text-slate-500" />
              <span>{property.bathrooms} ba</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowsPointingOutIcon className="h-4 w-4 text-slate-500" />
              <span>{formatNumber(property.sqft)} sqft</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="badge bg-zinc-800 text-slate-300">
              {getPropertyTypeLabel(property.property_type)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
