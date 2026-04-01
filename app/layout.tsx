import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/layout/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'Homestead — Find Your Perfect Home',
    template: '%s | Homestead',
  },
  description: 'Discover your dream property on Homestead. Browse homes for sale and rent with our modern real estate marketplace.',
  keywords: ['real estate', 'homes for sale', 'rent', 'property', 'marketplace'],
  openGraph: {
    title: 'Homestead — Find Your Perfect Home',
    description: 'Discover your dream property on Homestead.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-sand-50 text-slate-900 min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'font-body',
              style: {
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
