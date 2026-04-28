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
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://plausible.io https://clerk.permitai.eu https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.neon.tech https://*.clerk.accounts.dev https://api.stripe.com https://plausible.io",
              "frame-src 'self' https://*.stripe.com https://*.clerk.accounts.dev",
            ].join('; '),
          },
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