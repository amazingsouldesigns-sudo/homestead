'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { formatPrice, formatNumber } from '@/lib/utils';
import { Building, Users, CreditCard, Eye, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingProperties: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      const [
        { count: totalProperties },
        { count: pendingProperties },
        { count: totalUsers },
        { data: payments },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('listing_status', 'pending'),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
      ]);

      const totalRevenue = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);

      setStats({
        totalProperties: totalProperties || 0,
        pendingProperties: pendingProperties || 0,
        totalUsers: totalUsers || 0,
        totalRevenue,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Properties', value: stats.totalProperties, icon: Building, color: 'text-brand-600 bg-brand-50' },
          { label: 'Pending Approval', value: stats.pendingProperties, icon: Eye, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
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
    </div>
  );
}
