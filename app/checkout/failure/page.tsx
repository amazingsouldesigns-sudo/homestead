'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ArrowRightIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <div className="page-container py-20 md:py-32">
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15">
            <XCircleIcon className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="font-display mb-3 text-3xl text-slate-100">Payment Cancelled</h1>
          <p className="mb-8 text-lg text-slate-400">
            Your payment was cancelled. No charges were made. You can try again whenever you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/listings" className="btn-primary">
              Back to Listings <ArrowRightIcon className="h-4 w-4" />
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
