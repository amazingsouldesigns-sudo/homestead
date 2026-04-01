'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Bed, Bath, Maximize, MapPin, Sparkles } from 'lucide-react';
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
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Home className="w-12 h-12 text-slate-300" />
            </div>
          )}

          {/* Overlays */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={cn(
              'badge shadow-sm',
              property.property_status === 'for_sale'
                ? 'bg-brand-600 text-white'
                : 'bg-blue-600 text-white'
            )}>
              {getStatusLabel(property.property_status)}
            </span>
            {property.is_featured && (
              <span className="badge bg-amber-500 text-white shadow-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm',
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
          </button>

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
            <span className="text-2xl font-bold text-white font-display">
              {formatPrice(property.price)}
              {property.property_status === 'for_rent' && (
                <span className="text-sm font-body font-normal text-white/80">/mo</span>
              )}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 text-[15px] mb-1.5 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>{property.bedrooms} bd</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-slate-400" />
              <span>{property.bathrooms} ba</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-slate-400" />
              <span>{formatNumber(property.sqft)} sqft</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="badge bg-slate-100 text-slate-600">
              {getPropertyTypeLabel(property.property_type)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Home(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
