'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import {
  Home,
  Search,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Heart,
  LayoutDashboard,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
      <div className="page-container">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/25 group-hover:shadow-brand-600/40 transition-shadow">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl text-slate-900 hidden sm:block">
              Homestead
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/properties" className="btn-ghost text-sm">
              <Search className="w-4 h-4" />
              Browse
            </Link>
            {user?.role === 'seller' && (
              <Link href="/dashboard/listings?new=true" className="btn-ghost text-sm">
                <Plus className="w-4 h-4" />
                List Property
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="btn-ghost text-sm">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard/saved" className="btn-ghost text-sm">
                  <Heart className="w-4 h-4" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                      {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                      {user.full_name || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-in origin-top-right">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name || 'User'}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <span className="badge mt-1.5 bg-brand-100 text-brand-700 capitalize text-[10px]">
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/saved"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Heart className="w-4 h-4 text-slate-400" />
                            Saved Properties
                          </Link>
                        </div>
                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => {
                              signOut();
                              setProfileOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <LogOut className="w-4 h-4" />
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
                <Link href="/login" className="btn-ghost text-sm">
                  Log In
                </Link>
                <Link href="/signup" className="btn-primary text-sm !py-2.5 !px-5">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 pt-3 animate-fade-in">
            <div className="flex flex-col gap-1">
              <Link
                href="/properties"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                <Search className="w-4 h-4 text-slate-400" />
                Browse Properties
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-sm font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/saved"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-sm font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Heart className="w-4 h-4 text-slate-400" />
                    Saved
                  </Link>
                  {user.role === 'seller' && (
                    <Link
                      href="/dashboard/listings?new=true"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-sm font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Plus className="w-4 h-4 text-slate-400" />
                      List Property
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-sm font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
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
