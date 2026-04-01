import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Home className="w-10 h-10 text-brand-600" />
        </div>
        <h1 className="font-display text-5xl text-slate-900 mb-3">404</h1>
        <p className="text-xl text-slate-500 mb-8">
          This property seems to have moved to a different neighborhood.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/properties" className="btn-secondary">
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
