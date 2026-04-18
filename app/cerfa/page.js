'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, FileText, ArrowRight, Clock } from 'lucide-react';

export const metadata = {
  title: 'Formulaires CERFA — 13 types de permis et déclarations',
  description: 'Tous les formulaires CERFA pour permis de construire, déclaration préalable, certificat d\'urbanisme. Guides complets et génération automatique.',
};

export default function CerfaListPage() {
  const [cerfas, setCerfas] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCerfas();
  }, []);

  const fetchCerfas = async () => {
    try {
      const res = await fetch('/api/cerfa/all');
      const data = await res.json();
      setCerfas(data);
    } catch (error) {
      console.error('Error fetching CERFAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCerfas = cerfas.filter(c => {
    const matchesSearch = c.nom.toLowerCase().includes(search.toLowerCase()) ||
                         c.numero.includes(search);
    const matchesFilter = filter === 'all' || c.categorie === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['all', 'Permis de construire', 'Déclaration préalable', 'Certificat', 'Modificatif', 'ERP', 'Suivi de chantier'];

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/dashboard">
            <button className="btn-secondary">Dashboard</button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="hero-title mb-6 text-center">
            Formulaires <span className="text-[#e8b420] italic">CERFA</span>
          </h1>
          <p className="hero-subtitle text-center mb-12">
            13 formulaires officiels pour vos projets de construction
          </p>

          <div className="card-premium mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a857d]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un CERFA par numéro ou nom..."
                className="input-premium w-full pl-12"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-[8px] text-[13px] transition-all ${
                    filter === cat
                      ? 'bg-[#a07820] text-white'
                      : 'bg-[#14141f] text-[#8a857d] hover:bg-[#1e1e2c]'
                  }`}
                >
                  {cat === 'all' ? 'Tous' : cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#8a857d]">Chargement...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCerfas.map(cerfa => (
                <Link key={cerfa.numero} href={`/cerfa/${cerfa.slug}`}>
                  <div className="card-premium cursor-pointer hover:border-[#a07820] group h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="badge-premium">CERFA {cerfa.numero}</div>
                      <FileText className="w-6 h-6 text-[#e8b420] transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-[16px] font-medium mb-3 text-[#f0ede8]">{cerfa.nom}</h3>
                    <p className="text-[13px] text-[#8a857d] mb-4 line-clamp-2">{cerfa.description}</p>
                    <div className="flex items-center gap-2 text-[12px] text-[#8a857d]">
                      <Clock className="w-4 h-4" />
                      {cerfa.delaiInstruction}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#1c1c2a] flex items-center justify-between">
                      <span className="text-[12px] text-[#8a857d]">{cerfa.categorie}</span>
                      <ArrowRight className="w-4 h-4 text-[#e8b420]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredCerfas.length === 0 && (
            <div className="card-premium text-center py-12">
              <FileText className="w-12 h-12 text-[#8a857d] mx-auto mb-4" />
              <p className="text-[14px] text-[#8a857d]">Aucun CERFA trouvé pour cette recherche</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
