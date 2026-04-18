import Link from 'next/link';
import { Building2, Search, MapPin } from 'lucide-react';

export const metadata = {
  title: '36 000 Communes Françaises - PLU Indexés | PermitAI',
  description: 'Consultez le Plan Local d\'Urbanisme (PLU) de toutes les communes de France. 36 000 PLU indexés et analysés par IA.',
};

export default function CommunesPage() {
  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/">
            <button className="btn-secondary">Accueil</button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="hero-title mb-6 text-center">
            36 000 <span className="text-[#e8b420] italic">Communes</span>
          </h1>
          <p className="hero-subtitle text-center mb-12 max-w-2xl mx-auto">
            Tous les Plans Locaux d'Urbanisme de France indexés et analysables en 3 minutes
          </p>

          <div className="card-premium max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a857d]" />
              <input
                type="text"
                placeholder="Rechercher une commune (ex: Lyon, Paris 15e, Bordeaux...)"
                className="input-premium w-full pl-12"
              />
            </div>
            <p className="text-[13px] text-[#8a857d] mt-4 text-center">
              Recherche parmi 36 000 communes françaises
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-premium text-center">
              <div className="text-[32px] mb-3">🏛️</div>
              <div className="text-[24px] font-medium text-[#e8b420] mb-2">36 000</div>
              <div className="text-[13px] text-[#8a857d]">Communes indexées</div>
            </div>
            <div className="card-premium text-center">
              <div className="text-[32px] mb-3">📋</div>
              <div className="text-[24px] font-medium text-[#e8b420] mb-2">100%</div>
              <div className="text-[13px] text-[#8a857d]">Couverture nationale</div>
            </div>
            <div className="card-premium text-center">
              <div className="text-[32px] mb-3">⚡</div>
              <div className="text-[24px] font-medium text-[#e8b420] mb-2">3 min</div>
              <div className="text-[13px] text-[#8a857d]">Analyse instantanée</div>
            </div>
          </div>

          <div className="card-premium bg-gradient-to-br from-[#14141f] to-[#0a0a14]">
            <h3 className="text-[20px] font-medium mb-4 text-[#f0ede8]">Analysez le PLU de votre commune</h3>
            <p className="text-[14px] text-[#8a857d] mb-6">
              Entrez l'adresse de votre projet pour obtenir une analyse complète du PLU applicable, avec citations exactes des articles.
            </p>
            <Link href="/analyse">
              <button className="btn-primary">Analyser mon terrain</button>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-[24px] font-medium text-[#f0ede8] mb-8">Principales communes couvertes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux', 'Lille', 'Rennes', 'Strasbourg', 'Montpellier', 'Grenoble'].map((city) => (
                <Link key={city} href={`/communes/${city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
                  <div className="card-premium cursor-pointer hover:border-[#a07820] group text-center py-4">
                    <MapPin className="w-5 h-5 text-[#e8b420] mx-auto mb-2" />
                    <div className="text-[14px] text-[#f0ede8]">{city}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
