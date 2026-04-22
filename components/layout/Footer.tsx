'use client';

import Link from 'next/link';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { HomesteadMark } from '@/components/ui/HomesteadMark';

function normalizeContactEmail(raw: string): string {
  return raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/^mailto:/i, '');
}

export default function Footer() {
  const supportEmail = normalizeContactEmail(
    process.env.NEXT_PUBLIC_CONTACT_AGENT_EMAIL ?? 'support@homestead.com'
  );

  return (
    <footer className="mt-auto border-t border-brand-500/20 bg-zinc-950/95 text-slate-400 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <HomesteadMark className="w-9 h-9" iconClassName="w-5 h-5" />
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
                <EnvelopeIcon className="h-4 w-4 text-brand-400" />
                {supportEmail}
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <PhoneIcon className="h-4 w-4 text-brand-400" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <MapPinIcon className="h-4 w-4 text-brand-400" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Homestead. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-slate-500 transition-colors hover:text-brand-400">
              Privacy
            </Link>
            <Link href="#" className="text-xs text-slate-500 transition-colors hover:text-brand-400">
              Terms
            </Link>
            <Link href="#" className="text-xs text-slate-500 transition-colors hover:text-brand-400">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
