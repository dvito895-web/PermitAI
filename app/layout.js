import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://permitai.eu'),
  title: {
    default: 'PermitAI — Analyse PLU & Permis de construire en 3 minutes',
    template: '%s | PermitAI'
  },
  description: 'Analysez votre PLU en 3 minutes. 34 970 communes indexées. CERFA auto-rempli. Dépôt mairie inclus.',
  keywords: ['permis de construire', 'PLU', 'urbanisme', 'CERFA', 'déclaration préalable', 'France', 'IA urbanisme', 'Plan Local Urbanisme'],
  authors: [{ name: 'PermitAI' }],
  creator: 'PermitAI',
  publisher: 'PermitAI',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://permitai.eu',
    siteName: 'PermitAI',
    title: 'PermitAI — Analyse PLU & Permis de construire en 3 minutes',
    description: 'Analysez votre PLU en 3 minutes. 34 970 communes indexées. CERFA auto-rempli. Dépôt mairie inclus.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PermitAI - Urbanisme intelligent',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PermitAI — Analyse PLU & Permis de construire en 3 minutes',
    description: 'PermitAI indexe les 34 970 Plans Locaux d\'Urbanisme de France.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'PLACEHOLDER_GOOGLE_VERIFICATION',
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#a07820',
          colorText: '#f0ede8',
          colorBackground: '#06060e',
        },
      }}
    >
      <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
        <head>
          <meta charSet="utf-8" />
          <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'PermitAI',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'EUR',
                  lowPrice: '0',
                  highPrice: '199',
                  offerCount: '4',
                },
                description: 'PermitAI indexe les 34 970 Plans Locaux d\'Urbanisme de France, génère vos CERFA officiels et dépose votre dossier directement en mairie.',
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  reviewCount: '127',
                },
                author: {
                  '@type': 'Organization',
                  name: 'PermitAI',
                  url: 'https://permitai.eu',
                },
              }),
            }}
          />
          {/* Plausible Analytics */}
          <script defer data-domain="permitai.eu" src="https://plausible.io/js/script.js"></script>
        </head>
        <body className="antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
          {children}
          <footer style={{ borderTop: '0.5px solid #1c1c2a', padding: '20px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#06060e', fontFamily: 'sans-serif', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#3e3a34' }}>© 2025 PermitAI · contact@permitai.eu</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href="/cgu" style={{ fontSize: 11, color: '#3e3a34', textDecoration: 'none' }}>CGU</a>
              <a href="/politique-confidentialite" style={{ fontSize: 11, color: '#3e3a34', textDecoration: 'none' }}>Confidentialité</a>
              <a href="/mentions-legales" style={{ fontSize: 11, color: '#3e3a34', textDecoration: 'none' }}>Mentions légales</a>
              <a href="/tarifs" style={{ fontSize: 11, color: '#3e3a34', textDecoration: 'none' }}>Tarifs</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }}></div>
              <span style={{ fontSize: 11, color: '#3e3a34' }}>Systèmes opérationnels</span>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}