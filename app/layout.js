import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
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
          colorPrimary: '#A07820',
          colorText: '#FFFFFF',
          colorBackground: '#06060e',
        },
      }}
    >
      <html lang="fr" className={fraunces.variable}>
        <head>
          <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        </head>
        <body className="antialiased font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}