'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase-browser';
import { formatPrice, formatNumber, getListingStatusColor } from '@/lib/utils';
import { Eye, Heart, TrendingUp, BarChart3, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('properties')
        .select('id, title, slug, views_count, saves_count, price, listing_status, is_featured, created_at')
        .eq('seller_id', user.id)
        .order('views_count', { ascending: false });
      setListings(data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const totalViews = listings.reduce((sum, l) => sum + l.views_count, 0);
  const totalSaves = listings.reduce((sum, l) => sum + l.saves_count, 0);
  const activeCount = listings.filter((l) => l.listing_status === 'active').length;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Views', value: formatNumber(totalViews), icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Saves', value: formatNumber(totalSaves), icon: Heart, color: 'text-red-600 bg-red-50' },
          { label: 'Active Listings', value: activeCount, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Performance Table */}
      <div className="card-elevated overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            Listing Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Views</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Saves</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, i) => (
                <tr key={listing.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-sm text-slate-900 truncate max-w-[250px]">{listing.title}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-medium text-slate-700">{formatNumber(listing.views_count)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-medium text-slate-700">{formatNumber(listing.saves_count)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-semibold text-brand-600">{formatPrice(listing.price)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`badge ${getListingStatusColor(listing.listing_status)} capitalize text-xs`}>
                      {listing.listing_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
