import { Suspense } from 'react';

export default function RentalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin border-[3px] border-brand-600 border-t-transparent" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
