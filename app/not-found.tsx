import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/15">
          <HomeIcon className="h-10 w-10 text-brand-400" />
        </div>
        <h1 className="font-display mb-3 text-5xl text-slate-100">404</h1>
        <p className="mb-8 text-xl text-slate-400">
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
