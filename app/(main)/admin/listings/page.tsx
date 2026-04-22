'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { formatPrice, getListingStatusColor, timeAgo } from '@/lib/utils';
import {
  ArrowPathIcon,
  CheckIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    const supabase = createClient();
    let query = supabase
      .from('properties')
      .select('*, images:property_images(*), seller:users(full_name, email)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('listing_status', filter);
    }

    const { data } = await query;
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('properties').update({ listing_status: status }).eq('id', id);
    if (error) {
      toast.error('Failed to update');
      return;
    }
    toast.success(`Listing ${status === 'active' ? 'approved' : status}`);
    fetchListings();
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    const supabase = createClient();
    await supabase.from('properties').delete().eq('id', id);
    toast.success('Listing deleted');
    fetchListings();
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'pending', 'active', 'draft', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setLoading(true); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'border border-white/10 bg-zinc-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 card-elevated">
          <p className="text-slate-400">No listings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const primaryImage = listing.images?.find((i: any) => i.is_primary) || listing.images?.[0];
            return (
              <div key={listing.id} className="card p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative h-20 w-full flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800 sm:w-28">
                  {primaryImage ? (
                    <Image src={primaryImage.url} alt={listing.title} fill className="object-cover" sizes="112px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No image</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-100">{listing.title}</h3>
                      <p className="text-xs text-slate-500">{listing.address}, {listing.city}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        By {listing.seller?.full_name || listing.seller?.email} · {timeAgo(listing.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge ${getListingStatusColor(listing.listing_status)} capitalize text-xs`}>
                        {listing.listing_status}
                      </span>
                      <span className="text-sm font-semibold text-brand-400">{formatPrice(listing.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link href={`/properties/${listing.slug}`} className="btn-ghost p-2 text-xs" title="View">
                    <EyeIcon className="h-3.5 w-3.5" />
                  </Link>
                  {listing.listing_status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(listing.id, 'active')}
                        className="btn-ghost p-2 text-xs text-emerald-600"
                        title="Approve"
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateStatus(listing.id, 'rejected')}
                        className="btn-ghost p-2 text-xs text-red-500"
                        title="Reject"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {listing.listing_status !== 'pending' && listing.listing_status !== 'active' && (
                    <button
                      onClick={() => updateStatus(listing.id, 'active')}
                      className="btn-ghost p-2 text-xs text-emerald-600"
                      title="Activate"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteProperty(listing.id)}
                    className="btn-ghost p-2 text-xs text-red-500"
                    title="Delete"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
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
