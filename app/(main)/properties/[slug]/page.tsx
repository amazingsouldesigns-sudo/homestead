import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { formatPrice, formatNumber, getPropertyTypeLabel, getStatusLabel, timeAgo } from '@/lib/utils';
import ImageGallery from '@/components/property/ImageGallery';
import PropertyMap from '@/components/maps/PropertyMap';
import PropertyDetailActions from '@/components/property/PropertyDetailActions';
import { Bed, Bath, Maximize, Calendar, Car, Ruler, MapPin, Eye } from 'lucide-react';
import type { Metadata } from 'next';

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`badge ${property.property_status === 'for_sale' ? 'bg-brand-100 text-brand-700' : 'bg-blue-100 text-blue-700'}`}>
                  {getStatusLabel(property.property_status)}
                </span>
                <span className="badge bg-slate-100 text-slate-600">
                  {getPropertyTypeLabel(property.property_type)}
                </span>
                {property.is_featured && (
                  <span className="badge bg-amber-100 text-amber-700">Featured</span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-slate-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.city}, {property.state} {property.zip_code}</span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <span className="font-display text-3xl text-brand-600">
                  {formatPrice(property.price)}
                  {property.property_status === 'for_rent' && <span className="text-lg font-body text-slate-400">/mo</span>}
                </span>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Bed, label: 'Bedrooms', value: property.bedrooms },
                { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
                { icon: Maximize, label: 'Square Feet', value: formatNumber(property.sqft) },
                { icon: Calendar, label: 'Year Built', value: property.year_built || 'N/A' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                  <stat.icon className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About This Property</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description || 'No description provided.'}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  { label: 'Property Type', value: getPropertyTypeLabel(property.property_type) },
                  { label: 'Status', value: getStatusLabel(property.property_status) },
                  { label: 'Lot Size', value: property.lot_size ? `${formatNumber(property.lot_size)} sqft` : 'N/A' },
                  { label: 'Parking', value: property.parking || 'N/A' },
                  { label: 'Views', value: formatNumber(property.views_count) },
                  { label: 'Listed', value: timeAgo(property.created_at) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-sm font-medium text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {property.latitude && property.longitude && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <PropertyMap
                  properties={[property]}
                  center={{ lat: property.latitude, lng: property.longitude }}
                  zoom={15}
                  height="350px"
                  singleMarker
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PropertyDetailActions property={property} seller={property.seller} />
          </div>
        </div>
      </div>
    </div>
  );
}
