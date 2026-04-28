import Link from 'next/link';
import { Building2, Mail } from 'lucide-react';

export default function SupportPage() {
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
          <h1 className="text-[42px] font-medium text-[#f2efe9] mb-6">Support</h1>
          <p className="text-[16px] text-[#5a5650] mb-12">Nous sommes là pour vous aider</p>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
              <Mail className="w-8 h-8 text-[#e8b420] mb-4" />
              <h3 className="text-[18px] font-medium text-[#f2efe9] mb-2">Email</h3>
              <a href="mailto:contact@permitai.eu" className="text-[#a07820] text-[14px] hover:underline">contact@permitai.eu</a>
            </div>
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
              <div className="text-[32px] mb-4">💬</div>
              <h3 className="text-[18px] font-medium text-[#f2efe9] mb-2">Chat en direct</h3>
              <p className="text-[14px] text-[#5a5650]">Réponse sous 24h</p>
            </div>
          </div>
          <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
            <h2 className="text-[20px] font-medium text-[#f2efe9] mb-6">Questions fréquentes</h2>
            <div className="space-y-4 text-[14px]">
              <div><strong className="text-[#f2efe9]">Comment créer un compte ?</strong><p className="text-[#5a5650] mt-1">Cliquez sur Essai gratuit en haut à droite, renseignez votre email.</p></div>
              <div><strong className="text-[#f2efe9]">Quels plans proposez-vous ?</strong><p className="text-[#5a5650] mt-1">Gratuit (1 analyse), Starter (8/mois), Pro (illimité), Cabinet (API incluse).</p></div>
              <div><strong className="text-[#f2efe9]">Puis-je annuler mon abonnement ?</strong><p className="text-[#5a5650] mt-1">Oui, à tout moment depuis votre dashboard.</p></div>
              <div><strong className="text-[#f2efe9]">Les données sont-elles sécurisées ?</strong><p className="text-[#5a5650] mt-1">Oui, hébergement sur infrastructure Vercel avec chiffrement SSL.</p></div>
              <div><strong className="text-[#f2efe9]">Combien de temps pour obtenir un résultat ?</strong><p className="text-[#5a5650] mt-1">3 minutes pour l'analyse PLU, génération CERFA instantanée.</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}