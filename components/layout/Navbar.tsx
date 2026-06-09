'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  Cog6ToothIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HomesteadMark } from '@/components/ui/HomesteadMark';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50">
      <div className="page-container">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <HomesteadMark className="h-9 w-9" iconClassName="w-5 h-5" />
            <span className="font-display hidden text-xl text-slate-100 sm:block">Homestead</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/properties" className="btn-ghost text-sm">
              <MagnifyingGlassIcon className="h-4 w-4" />
              Browse
            </Link>
            {user?.role === 'seller' && (
              <Link href="/dashboard/listings?new=true" className="btn-ghost text-sm">
                <PlusIcon className="h-4 w-4" />
                List Property
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="btn-ghost text-sm">
                <ShieldCheckIcon className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard/saved" className="btn-ghost text-sm">
                  <HeartIcon className="h-4 w-4" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="surface-cut-sm flex items-center gap-2 border border-white/10 bg-zinc-900/80 py-1.5 pl-2 pr-3 transition-colors hover:border-white/20"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/10 bg-zinc-800 text-slate-300"
                      aria-hidden
                    >
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="max-w-[120px] truncate text-sm font-medium text-slate-100">
                      {user.full_name || 'Account'}
                    </span>
                    <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="surface-cut-sm absolute right-0 z-50 mt-2 w-56 origin-top-right animate-scale-in border border-white/10 bg-zinc-900 py-2 shadow-sharp ring-1 ring-brand-500/25 backdrop-blur-xl">
                        <div className="border-b border-white/10 px-4 py-2.5">
                          <p className="truncate text-sm font-semibold text-slate-100">{user.full_name || 'User'}</p>
                          <p className="truncate text-xs text-slate-400">{user.email}</p>
                          <span className="badge mt-1.5 bg-brand-900/50 capitalize text-[10px] text-brand-200 ring-1 ring-brand-500/30">
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Squares2X2Icon className="h-4 w-4 text-slate-500" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/saved"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <HeartIcon className="h-4 w-4 text-slate-500" />
                            Saved Properties
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Cog6ToothIcon className="h-4 w-4 text-slate-500" />
                            Settings
                          </Link>
                        </div>
                        <div className="border-t border-white/10 pt-1">
                          <button
                            onClick={() => {
                              signOut();
                              setProfileOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/40"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="panel-glow text-sm no-underline">
                  <span className="panel-glow-inner !px-4 text-sm">Log In</span>
                </Link>
                <Link href="/signup" className="btn-primary text-sm !px-5 !py-2.5">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="surface-cut-sm border border-white/10 p-2 text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="animate-fade-in border-t border-white/10 pb-4 pt-3 md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                href="/properties"
                className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium uppercase tracking-widecaps text-slate-200 transition-colors hover:border-white/10 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-slate-500" />
                Browse Properties
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium uppercase tracking-widecaps text-slate-200 transition-colors hover:border-white/10 hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Squares2X2Icon className="h-4 w-4 text-slate-500" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/saved"
                    className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium uppercase tracking-widecaps text-slate-200 transition-colors hover:border-white/10 hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    <HeartIcon className="h-4 w-4 text-slate-500" />
                    Saved
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium uppercase tracking-widecaps text-slate-200 transition-colors hover:border-white/10 hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Cog6ToothIcon className="h-4 w-4 text-slate-500" />
                    Settings
                  </Link>
                  {user.role === 'seller' && (
                    <Link
                      href="/dashboard/listings?new=true"
                      className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium uppercase tracking-widecaps text-slate-200 transition-colors hover:border-white/10 hover:bg-white/5"
                      onClick={() => setMobileOpen(false)}
                    >
                      <PlusIcon className="h-4 w-4 text-slate-500" />
                      List Property
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium uppercase tracking-widecaps text-slate-200 transition-colors hover:border-white/10 hover:bg-white/5"
                      onClick={() => setMobileOpen(false)}
                    >
                      <ShieldCheckIcon className="h-4 w-4 text-slate-500" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium uppercase tracking-widecaps text-red-400 transition-colors hover:border-red-500/20 hover:bg-red-950/40"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Link href="/login" className="btn-secondary flex-1 text-sm" onClick={() => setMobileOpen(false)}>Log In</Link>
                  <Link href="/signup" className="btn-primary flex-1 text-sm" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
