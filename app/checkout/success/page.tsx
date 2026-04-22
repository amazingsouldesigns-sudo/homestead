'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ArrowPathIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/payments/verify?session_id=${sessionId}`);
        const data = await res.json();
        setSuccess(data.success);
      } catch {
        setSuccess(false);
      }
      setVerifying(false);
    };

    verify();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <div className="page-container py-20 md:py-32">
        <div className="max-w-lg mx-auto text-center">
          {verifying ? (
            <div className="animate-fade-in">
              <ArrowPathIcon className="mx-auto mb-4 h-12 w-12 animate-spin text-brand-600" />
              <h1 className="font-display mb-2 text-2xl text-slate-100">Verifying Payment...</h1>
              <p className="text-slate-400">Please wait while we confirm your payment.</p>
            </div>
          ) : success ? (
            <div className="animate-fade-in">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
              </div>
              <h1 className="font-display mb-3 text-3xl text-slate-100">Payment Successful!</h1>
              <p className="mb-8 text-lg text-slate-400">
                Your listing has been updated. It will be reviewed and published shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/listings" className="btn-primary">
                  View My Listings <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link href="/properties" className="btn-secondary">
                  Browse Properties
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15">
                <span className="text-3xl text-red-300">!</span>
              </div>
              <h1 className="font-display mb-3 text-3xl text-slate-100">Something Went Wrong</h1>
              <p className="mb-8 text-lg text-slate-400">
                We couldn&apos;t verify your payment. Please contact support if you were charged.
              </p>
              <Link href="/dashboard/listings" className="btn-primary">
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
