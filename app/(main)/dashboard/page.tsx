'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase-browser';
import { Building, Eye, Heart, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import { formatPrice, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import PropertyCard from '@/components/property/PropertyCard';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ listings: 0, views: 0, saves: 0, revenue: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [savedProps, setSavedProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const supabase = createClient();

      if (user.role === 'seller' || user.role === 'admin') {
        const { data: listings, count } = await supabase
          .from('properties')
          .select('*, images:property_images(*)', { count: 'exact' })
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4);

        const totalViews = (listings || []).reduce((sum: number, p: any) => sum + p.views_count, 0);
        const totalSaves = (listings || []).reduce((sum: number, p: any) => sum + p.saves_count, 0);

        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        const totalRevenue = (payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);

        setStats({
          listings: count || 0,
          views: totalViews,
          saves: totalSaves,
          revenue: totalRevenue,
        });
        setRecentListings(listings || []);
      }

      const { data: saved } = await supabase
        .from('saved_properties')
        .select('*, property:properties(*, images:property_images(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      setSavedProps(saved || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your properties.</p>
      </div>

      {/* Stats */}
      {(user?.role === 'seller' || user?.role === 'admin') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Listings', value: stats.listings, icon: Building, color: 'text-brand-600 bg-brand-50' },
            { label: 'Total Views', value: formatNumber(stats.views), icon: Eye, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Saves', value: formatNumber(stats.saves), icon: Heart, color: 'text-red-600 bg-red-50' },
            { label: 'Spent', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Listings */}
      {recentListings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Recent Listings</h2>
            <Link href="/dashboard/listings" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:text-brand-700">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentListings.map((p: any) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      {/* Saved Properties */}
      {savedProps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Saved Properties</h2>
            <Link href="/dashboard/saved" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:text-brand-700">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedProps.map((s: any) => (
              <PropertyCard key={s.id} property={s.property} saved />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
