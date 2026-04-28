import Link from 'next/link';
import { Building2, BookOpen } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
        </div>
      </nav>
      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-[42px] font-medium text-[#f2efe9] mb-6">Documentation</h1>
          <p className="text-[16px] text-[#5a5650] mb-12">Tout ce qu'il faut savoir pour utiliser PermitAI</p>
          <div className="space-y-6">
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
              <h2 className="text-[20px] font-medium text-[#f2efe9] mb-4">Guide de démarrage rapide</h2>
              <ol className="space-y-2 text-[14px] text-[#5a5650] list-decimal list-inside">
                <li>Créez votre compte gratuit</li>
                <li>Entrez l'adresse de votre projet</li>
                <li>Lancez l'analyse PLU en 1 clic</li>
                <li>Recevez votre résultat en 3 minutes</li>
                <li>Générez votre CERFA pré-rempli</li>
              </ol>
            </div>
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
              <h2 className="text-[20px] font-medium text-[#f2efe9] mb-4">API Reference</h2>
              <p className="text-[14px] text-[#5a5650]">Documentation complète de l'API PermitAI disponible sur les plans Pro et Cabinet.</p>
              <Link href="/api-docs" className="inline-block mt-4 text-[#a07820] text-[13px] hover:underline">Voir la documentation API →</Link>
            </div>
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
              <h2 className="text-[20px] font-medium text-[#f2efe9] mb-4">FAQ</h2>
              <div className="space-y-4 text-[14px]">
                <div><strong className="text-[#f2efe9]">Combien de temps prend l'analyse ?</strong><p className="text-[#5a5650] mt-1">L'analyse PLU prend en moyenne 3 minutes.</p></div>
                <div><strong className="text-[#f2efe9]">Les CERFA sont-ils officiels ?</strong><p className="text-[#5a5650] mt-1">Oui, nous utilisons les formulaires Cerfa officiels du ministère.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}