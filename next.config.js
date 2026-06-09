/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // RapidAPI / MLS-style listing photo CDNs (API often returns http:// — pattern must match protocol)
      { protocol: 'http', hostname: 'nh.rdcpix.com', pathname: '/**' },
      { protocol: 'https', hostname: 'nh.rdcpix.com', pathname: '/**' },
      { protocol: 'http', hostname: 'ap.rdcpix.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ap.rdcpix.com', pathname: '/**' },
      { protocol: 'http', hostname: 'ar.rdcpix.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ar.rdcpix.com', pathname: '/**' },
      { protocol: 'http', hostname: '*.rdcpix.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.rdcpix.com', pathname: '/**' },
      { protocol: 'https', hostname: 'photos.zillowstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ssl.cdn-redfin.com', pathname: '/**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/properties',
        has: [{ type: 'query', key: 'property_status', value: 'for_rent' }],
        destination: '/rentals',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
