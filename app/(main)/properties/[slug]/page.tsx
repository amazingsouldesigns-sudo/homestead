import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { formatPrice, formatNumber, getPropertyTypeLabel, getStatusLabel, timeAgo } from '@/lib/utils';
import ImageGallery from '@/components/property/ImageGallery';
import PropertyMap from '@/components/maps/PropertyMap';
import PropertyDetailActions from '@/components/property/PropertyDetailActions';
import ContactAgentCta from '@/components/property/ContactAgentCta';
import {
  ArrowsPointingOutIcon,
  CalendarDaysIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { BathMetricIcon, BedMetricIcon } from '@/components/icons/property-metrics';
import type { Metadata } from 'next';
import type { Property } from '@/types';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, price, city')
    .eq('slug', params.slug)
    .single();

  if (!property) return { title: 'Property Not Found' };

  return {
    title: `${property.title} - ${formatPrice(property.price)}`,
    description: property.description?.slice(0, 160) || `Property for sale in ${property.city}`,
    openGraph: {
      title: property.title,
      description: property.description?.slice(0, 160),
    },
  };
}

async function getProperty(slug: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('properties')
    .select('*, images:property_images(*), seller:users(id, full_name, email, avatar_url, phone, bio)')
    .eq('slug', slug)
    .single();

  if (data) {
    // Increment views
    await supabase.rpc('increment_views', { prop_id: data.id });
  }

  return data;
}

export default async function PropertyPage({ params }: Props) {
  const property = await getProperty(params.slug);

  if (!property || (property.listing_status !== 'active' && property.listing_status !== 'pending')) {
    notFound();
  }

  const sortedImages = (property.images || []).sort((a: any, b: any) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  return (
    <div className="py-6 md:py-8">
      <div className="page-container">
        {/* Image Gallery */}
        <ImageGallery images={sortedImages} title={property.title} />

        <div className="mt-4 lg:hidden">
          <ContactAgentCta property={property as Property} variant="inline" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`badge ${property.property_status === 'for_sale' ? 'bg-brand-900/50 text-brand-200 ring-1 ring-brand-500/30' : 'bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-500/30'}`}
                >
                  {getStatusLabel(property.property_status)}
                </span>
                <span className="badge bg-zinc-800 text-slate-300 ring-1 ring-white/10">
                  {getPropertyTypeLabel(property.property_type)}
                </span>
                {property.is_featured && (
                  <span className="badge bg-amber-950/50 text-amber-200 ring-1 ring-amber-500/30">Featured</span>
                )}
              </div>
              <h1 className="font-display mb-2 text-3xl text-slate-100 md:text-4xl">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPinIcon className="h-4 w-4" />
                <span>{property.address}, {property.city}, {property.state} {property.zip_code}</span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <span className="font-display text-3xl text-brand-400">
                  {formatPrice(property.price)}
                  {property.property_status === 'for_rent' && <span className="text-lg font-body text-slate-400">/mo</span>}
                </span>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: BedMetricIcon, label: 'Bedrooms', value: property.bedrooms },
                { icon: BathMetricIcon, label: 'Bathrooms', value: property.bathrooms },
                { icon: ArrowsPointingOutIcon, label: 'Square Feet', value: formatNumber(property.sqft) },
                { icon: CalendarDaysIcon, label: 'Year Built', value: property.year_built || 'N/A' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-zinc-900/90 p-4 text-center shadow-md shadow-black/40 ring-1 ring-brand-500/20 backdrop-blur-md"
                >
                  <stat.icon className="mx-auto mb-2 h-5 w-5 text-brand-400" />
                  <p className="text-xl font-bold text-slate-100">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="mb-3 text-xl font-semibold text-slate-100">About This Property</h2>
              <div className="max-w-none whitespace-pre-line leading-relaxed text-slate-300">
                {property.description || 'No description provided.'}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-slate-100">Property Details</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  { label: 'Property Type', value: getPropertyTypeLabel(property.property_type) },
                  { label: 'Status', value: getStatusLabel(property.property_status) },
                  { label: 'Lot Size', value: property.lot_size ? `${formatNumber(property.lot_size)} sqft` : 'N/A' },
                  { label: 'Parking', value: property.parking || 'N/A' },
                  { label: 'Views', value: formatNumber(property.views_count) },
                  { label: 'Listed', value: timeAgo(property.created_at) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-white/10 py-2">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-sm font-medium text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {property.latitude && property.longitude && (
              <div>
                <h2 className="mb-4 text-xl font-semibold text-slate-100">Location</h2>
                <PropertyMap
                  properties={[property]}
                  center={{ lat: property.latitude, lng: property.longitude }}
                  zoom={15}
                  height="500px"
                  singleMarker
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PropertyDetailActions property={property} seller={property.seller ?? null} />
          </div>
        </div>
      </div>
    </div>
  );
}
