/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'geoportail-urbanisme.gouv.fr' },
      { protocol: 'https', hostname: 'api.gouv.fr' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
 
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
 
  // Redirections
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/pricing', destination: '/tarifs', permanent: true },
      { source: '/prices', destination: '/tarifs', permanent: true },
    ];
  },
 
  // Compression
  compress: true,
 
  // Powered by header désactivé
  poweredByHeader: false,
 
  // Strict mode React
  reactStrictMode: true,
 
  // Variables d'env publiques
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  },
};
 
module.exports = nextConfig;