'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-sand-50">
      <Navbar />
      <div className="page-container py-20 md:py-32">
        <div className="max-w-lg mx-auto text-center">
          {verifying ? (
            <div className="animate-fade-in">
              <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto mb-4" />
              <h1 className="font-display text-2xl text-slate-900 mb-2">Verifying Payment...</h1>
              <p className="text-slate-500">Please wait while we confirm your payment.</p>
            </div>
          ) : success ? (
            <div className="animate-fade-in">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="font-display text-3xl text-slate-900 mb-3">Payment Successful!</h1>
              <p className="text-slate-500 text-lg mb-8">
                Your listing has been updated. It will be reviewed and published shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/listings" className="btn-primary">
                  View My Listings <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/properties" className="btn-secondary">
                  Browse Properties
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">!</span>
              </div>
              <h1 className="font-display text-3xl text-slate-900 mb-3">Something Went Wrong</h1>
              <p className="text-slate-500 text-lg mb-8">
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
