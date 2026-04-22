'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase-browser';
import Navbar from '@/components/layout/Navbar';
import {
  ArrowPathIcon,
  CheckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { formatPrice, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const PLANS = {
  publish: {
    name: 'Publish Listing',
    price: 29.99,
    icon: DocumentTextIcon,
    color: 'brand',
    features: [
      'List your property on Homestead',
      'Visible to all buyers and renters',
      'Up to 20 photos',
      'Contact form for inquiries',
      'Analytics dashboard',
    ],
  },
  featured: {
    name: 'Featured Listing',
    price: 99.99,
    icon: SparklesIcon,
    color: 'amber',
    features: [
      'Everything in Publish, plus:',
      'Featured badge on your listing',
      'Priority placement in search results',
      'Appear on the homepage',
      'Featured for 30 days',
      'Boosted visibility',
    ],
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const type = (searchParams.get('type') as 'publish' | 'featured') || 'publish';
  const propertyId = searchParams.get('property_id');
  const plan = PLANS[type];

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [user, initialized, router]);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          property_id: propertyId,
          user_id: user.id,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <div className="page-container py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display mb-3 text-3xl text-slate-100 md:text-4xl">
              {type === 'featured' ? 'Upgrade to Featured' : 'Publish Your Listing'}
            </h1>
            <p className="text-lg text-slate-400">
              {type === 'featured'
                ? 'Get maximum visibility for your property'
                : 'Make your property visible to thousands of buyers'}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {Object.entries(PLANS).map(([key, p]) => {
              const isSelected = key === type;
              const Icon = p.icon;
              return (
                <button
                  key={key}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('type', key);
                    router.push(`/checkout?${params.toString()}`);
                  }}
                  className={cn(
                    'card p-6 text-left transition-all',
                    isSelected
                      ? key === 'featured'
                        ? 'border-2 border-amber-400/90 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/25'
                        : 'border-2 border-brand-500 shadow-lg shadow-brand-500/15 ring-2 ring-brand-500/25'
                      : 'hover:shadow-md hover:shadow-black/20'
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      key === 'featured' ? 'bg-amber-500/15 text-amber-400' : 'bg-brand-500/15 text-brand-400'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {isSelected && (
                      <span className={cn(
                        'badge',
                        key === 'featured' ? 'bg-amber-500/20 text-amber-300' : 'bg-brand-500/20 text-brand-300'
                      )}>
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">{p.name}</h3>
                  <p className="font-display mt-2 text-3xl text-slate-100">
                    ${p.price}
                    <span className="ml-1 font-body text-sm text-slate-500">one-time</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckIcon
                          className={cn(
                            'mt-0.5 h-4 w-4 flex-shrink-0',
                            key === 'featured' ? 'text-amber-500' : 'text-brand-500'
                          )}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Checkout Button */}
          <div className="card-elevated p-6 text-center">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-slate-400">Total</span>
              <span className="font-display text-2xl text-slate-100">${plan.price}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full !py-4 text-lg"
            >
              {loading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <CreditCardIcon className="h-5 w-5" />
              )}
              {loading ? 'Redirecting to Stripe...' : `Pay $${plan.price}`}
            </button>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              Secure payment powered by Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
