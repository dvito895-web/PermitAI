import Link from 'next/link';
import { Building2, Search } from 'lucide-react';

export default function SuiviPage() {
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
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-[42px] font-medium text-[#f2efe9] mb-6 text-center">Suivi de dossier</h1>
          <p className="text-[16px] text-[#5a5650] mb-12 text-center">Suivez l'avancement de vos dossiers en temps réel</p>
          <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-8">
            <label className="block text-[13px] text-[#5a5650] mb-2">Numéro de dossier</label>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a5650]" />
              <input type="text" placeholder="Entrez votre numéro de dossier..." className="w-full pl-12 pr-4 py-3 bg-[#06060e] border border-[#1c1c2a] rounded-lg text-[#f2efe9] text-[14px]" />
            </div>
            <div className="text-center py-8">
              <p className="text-[14px] text-[#5a5650] mb-6">Connectez-vous pour suivre vos dossiers en temps réel</p>
              <Link href="/sign-in"><button className="px-6 py-3 bg-[#a07820] hover:bg-[#c4960a] text-white rounded-lg text-[14px] font-medium transition-colors">Se connecter</button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}