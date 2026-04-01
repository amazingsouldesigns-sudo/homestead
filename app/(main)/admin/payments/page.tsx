'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Loader2, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('payments')
        .select('*, user:users(full_name, email), property:properties(title, slug)')
        .order('created_at', { ascending: false });
      setPayments(data || []);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Successful</p>
          <p className="text-2xl font-bold text-slate-900">
            {payments.filter((p) => p.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, i) => (
                <tr key={payment.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-900">{payment.user?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{payment.user?.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-slate-700 truncate max-w-[200px]">
                      {payment.property?.title || 'N/A'}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge bg-slate-100 text-slate-600 text-xs capitalize">
                      {payment.payment_type.replace('listing_', '')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-semibold text-slate-900">{formatPrice(payment.amount)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`badge ${statusColor(payment.status)} capitalize text-xs`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs text-slate-500">{timeAgo(payment.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No payments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
