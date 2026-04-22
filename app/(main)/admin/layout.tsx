'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import {
  BuildingOfficeIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin', label: 'Overview', icon: Squares2X2Icon },
  { href: '/admin/listings', label: 'Listings', icon: BuildingOfficeIcon },
  { href: '/admin/users', label: 'Users', icon: UsersIcon },
  { href: '/admin/payments', label: 'Payments', icon: CreditCardIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, initialized, router]);

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="py-6 md:py-8">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
            <ShieldCheckIcon className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Admin Panel</h1>
            <p className="text-sm text-slate-500">Manage your marketplace</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80 p-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-brand-500/20 text-brand-200 shadow-sm ring-1 ring-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
