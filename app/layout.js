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
          <footer style={{ borderTop: '0.5px solid #1c1c2a', padding: '40px 52px 24px', background: '#06060e', fontFamily: 'var(--font-inter)' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f2efe9', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Produit</div>
                {[['Analyse PLU', '/analyse'], ['CERFA', '/cerfa'], ['Démo live', '/demo'], ['Tarifs', '/tarifs'], ['Comment ça marche', '/#comment-ca-marche']].map(([label, href]) => (
                  <a key={href} href={href} style={{ display: 'block', fontSize: 12, color: '#3e3a34', textDecoration: 'none', marginBottom: 7, transition: 'color .15s' }}>{label}</a>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f2efe9', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Métiers</div>
                {[['Agents immobiliers', '/agent-immobilier'], ['Architectes', '/architecte'], ['Promoteurs', '/promoteur'], ['Particuliers', '/particulier'], ['Enterprise', '/enterprise']].map(([label, href]) => (
                  <a key={href} href={href} style={{ display: 'block', fontSize: 12, color: '#3e3a34', textDecoration: 'none', marginBottom: 7 }}>{label}</a>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f2efe9', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Ressources</div>
                {[['Blog', '/blog'], ['Témoignages', '/temoignages'], ['Affiliation', '/affiliation'], ['Documentation', '/documentation'], ['Support', '/support']].map(([label, href]) => (
                  <a key={href} href={href} style={{ display: 'block', fontSize: 12, color: '#3e3a34', textDecoration: 'none', marginBottom: 7 }}>{label}</a>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f2efe9', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Légal</div>
                {[['Mentions légales', '/mentions-legales'], ['Confidentialité', '/politique-confidentialite'], ['Cookies', '/cookies'], ['CGU', '/cgu']].map(([label, href]) => (
                  <a key={href} href={href} style={{ display: 'block', fontSize: 12, color: '#3e3a34', textDecoration: 'none', marginBottom: 7 }}>{label}</a>
                ))}
              </div>
            </div>
            <div style={{ maxWidth: 1280, margin: '0 auto', borderTop: '0.5px solid #111118', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 11, color: '#2a2a38' }}>© 2025 PermitAI · contact@permitai.eu · 34 970 communes indexées</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }}></div>
                <span style={{ fontSize: 11, color: '#2a2a38' }}>Systèmes opérationnels</span>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}