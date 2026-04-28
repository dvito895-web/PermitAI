import Link from 'next/link';
import { Building2, FileText, Upload, CheckCircle2 } from 'lucide-react';

export default function DepotPage() {
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
          <h1 className="text-[42px] font-medium text-[#f2efe9] mb-6">Dépôt en mairie</h1>
          <p className="text-[16px] text-[#5a5650] mb-12">PermitAI dépose votre dossier directement en mairie via PLAT'AU ou LRAR La Poste</p>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6 text-center">
              <div className="text-[32px] mb-3">1️⃣</div>
              <h3 className="text-[16px] font-medium text-[#f2efe9] mb-2">Analyse PLU</h3>
              <p className="text-[13px] text-[#5a5650]">Vérification de la conformité de votre projet</p>
            </div>
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6 text-center">
              <div className="text-[32px] mb-3">2️⃣</div>
              <h3 className="text-[16px] font-medium text-[#f2efe9] mb-2">CERFA généré</h3>
              <p className="text-[13px] text-[#5a5650]">Génération automatique du formulaire officiel</p>
            </div>
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6 text-center">
              <div className="text-[32px] mb-3">3️⃣</div>
              <h3 className="text-[16px] font-medium text-[#f2efe9] mb-2">Dépôt via PLAT'AU</h3>
              <p className="text-[13px] text-[#5a5650]">Envoi numérique ou LRAR selon votre mairie</p>
            </div>
          </div>
          <Link href="/analyse"><button className="px-6 py-3 bg-[#a07820] hover:bg-[#c4960a] text-white rounded-lg text-[14px] font-medium transition-colors">Analyser mon terrain</button></Link>
        </div>
      </section>
    </div>
  );
}