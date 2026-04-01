'use client';

import Link from 'next/link';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-925 text-slate-400 mt-auto">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl text-white">Homestead</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              Discover your dream home with Homestead. The modern marketplace for buying, selling, and renting properties.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: 'Browse Properties', href: '/properties' },
                { label: 'Houses for Sale', href: '/properties?type=house&status=for_sale' },
                { label: 'Apartments for Rent', href: '/properties?type=apartment&status=for_rent' },
                { label: 'Featured Listings', href: '/properties?featured=true' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">For Sellers</h4>
            <ul className="space-y-3">
              {[
                { label: 'List Your Property', href: '/signup' },
                { label: 'Seller Dashboard', href: '/dashboard' },
                { label: 'Pricing', href: '/checkout' },
                { label: 'Featured Listings', href: '/checkout?type=featured' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-brand-500" />
                support@homestead.com
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-brand-500" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-brand-500" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Homestead. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
