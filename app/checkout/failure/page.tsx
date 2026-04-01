'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { XCircle, ArrowRight } from 'lucide-react';

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <Navbar />
      <div className="page-container py-20 md:py-32">
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="font-display text-3xl text-slate-900 mb-3">Payment Cancelled</h1>
          <p className="text-slate-500 text-lg mb-8">
            Your payment was cancelled. No charges were made. You can try again whenever you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/listings" className="btn-primary">
              Back to Listings <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/checkout" className="btn-secondary">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
