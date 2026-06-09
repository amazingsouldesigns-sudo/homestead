'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HeartIcon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Squares2X2Icon },
  { href: '/dashboard/listings', label: 'My Listings', icon: BuildingOfficeIcon, sellerOnly: true },
  { href: '/dashboard/saved', label: 'Saved', icon: HeartIcon },
  { href: '/dashboard/analytics', label: 'Analytics', icon: ChartBarIcon, sellerOnly: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Cog6ToothIcon },
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
              <div className="surface-cut border border-white/10 bg-zinc-900/80 p-4 shadow-sharp backdrop-blur-xl backdrop-saturate-150">
                {/* User info */}
                <div className="surface-cut-sm mb-6 flex items-center gap-3 border border-white/10 bg-zinc-950/80 p-3">
                  <UserAvatar avatarUrl={user.avatar_url} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">{user.full_name || 'User'}</p>
                    <p className="text-xs capitalize text-slate-500">{user.role}</p>
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
                          'flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium uppercase tracking-widecaps transition-colors',
                          pathname === item.href
                            ? 'border-brand-500/30 bg-brand-500/15 text-brand-300 shadow-sharp-sm'
                            : 'text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-200'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                </nav>

                {/* Quick Actions */}
                {(user.role === 'seller' || user.role === 'admin') && (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <Link
                      href="/dashboard/listings?new=true"
                      className="btn-primary w-full text-sm"
                    >
                      <PlusIcon className="h-4 w-4" />
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
