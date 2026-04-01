'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { LayoutDashboard, Building, Heart, BarChart3, Settings, Plus, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/listings', label: 'My Listings', icon: Building, sellerOnly: true },
  { href: '/dashboard/saved', label: 'Saved', icon: Heart },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, sellerOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, initialized, router]);

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="py-6 md:py-8">
      <div className="page-container">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                {/* User info */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.full_name || 'User'}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {navItems
                    .filter((item) => !item.sellerOnly || user.role === 'seller' || user.role === 'admin')
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                          pathname === item.href
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                </nav>

                {/* Quick Actions */}
                {(user.role === 'seller' || user.role === 'admin') && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href="/dashboard/listings?new=true"
                      className="btn-primary w-full text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      New Listing
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
