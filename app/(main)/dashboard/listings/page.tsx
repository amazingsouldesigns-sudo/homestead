'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase-browser';
import PropertyForm from '@/components/property/PropertyForm';
import { formatPrice, getListingStatusColor, timeAgo } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import type { Property } from '@/types';

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const showNew = searchParams.get('new') === 'true';
  const editId = searchParams.get('edit');
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Property[]>([]);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(showNew);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchListings();
  }, [user]);

  useEffect(() => {
    if (editId && listings.length > 0) {
      const found = listings.find((l) => l.id === editId);
      if (found) {
        setEditProperty(found);
        setShowForm(true);
      }
    }
  }, [editId, listings]);

  const fetchListings = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from('properties').delete().eq('id', id);
    setListings(listings.filter((l) => l.id !== id));
    toast.success('Listing deleted');
    setDeleting(null);
  };

  const handlePublish = async (property: Property) => {
    // Redirect to checkout to pay for publishing
    window.location.href = `/checkout?type=publish&property_id=${property.id}`;
  };

  const handleFeature = async (property: Property) => {
    window.location.href = `/checkout?type=featured&property_id=${property.id}`;
  };

  if (showForm) {
    return (
      <div>
        <button
          onClick={() => { setShowForm(false); setEditProperty(null); }}
          className="btn-ghost text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>
        <div className="card-elevated p-6 md:p-8">
          <h1 className="text-2xl font-semibold mb-6">
            {editProperty ? 'Edit Listing' : 'Create New Listing'}
          </h1>
          <PropertyForm
            property={editProperty || undefined}
            mode={editProperty ? 'edit' : 'create'}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">My Listings</h1>
          <p className="text-slate-500 text-sm mt-1">{listings.length} properties</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          New Listing
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 card-elevated">
          <p className="text-xl font-semibold text-slate-600 mb-2">No listings yet</p>
          <p className="text-slate-400 mb-6">Create your first property listing</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Create Listing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const primaryImage = listing.images?.find((i) => i.is_primary) || listing.images?.[0];
            return (
              <div key={listing.id} className="card p-4 flex flex-col sm:flex-row gap-4">
                {/* Thumbnail */}
                <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                  {primaryImage ? (
                    <Image src={primaryImage.url} alt={listing.title} fill className="object-cover" sizes="128px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No image</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
                      <p className="text-sm text-slate-500 truncate">{listing.address}, {listing.city}</p>
                    </div>
                    <span className={`badge ${getListingStatusColor(listing.listing_status)} flex-shrink-0 capitalize`}>
                      {listing.listing_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="font-semibold text-brand-600">{formatPrice(listing.price)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{listing.views_count} views</span>
                    <span>{timeAgo(listing.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/dashboard/listings?edit=${listing.id}`}
                    className="btn-ghost text-xs p-2"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  {listing.listing_status === 'draft' && (
                    <button onClick={() => handlePublish(listing)} className="btn-ghost text-xs p-2 text-brand-600">
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {listing.listing_status === 'active' && !listing.is_featured && (
                    <button onClick={() => handleFeature(listing)} className="btn-ghost text-xs p-2 text-amber-600" title="Promote to featured">
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleting === listing.id}
                    className="btn-ghost text-xs p-2 text-red-500"
                  >
                    {deleting === listing.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
