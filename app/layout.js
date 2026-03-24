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
  title: 'PermitAI - Votre permis de construire sans les mauvaises surprises',
  description: 'PermitAI indexe les 36 000 Plans Locaux d\'Urbanisme de France, génère vos CERFA officiels et dépose votre dossier directement en mairie. Résultat en 3 minutes.',
  keywords: 'permis de construire, PLU, urbanisme, CERFA, déclaration préalable, France',
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
          <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        </head>
        <body className="antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}