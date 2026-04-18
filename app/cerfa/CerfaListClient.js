'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Search, ArrowRight, Clock } from 'lucide-react';

export default function CerfaListClient({ initialCerfas }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredCerfas = initialCerfas.filter(c => {
    const matchesSearch = c.nom.toLowerCase().includes(search.toLowerCase()) ||
                         c.numero.includes(search);
    const matchesFilter = filter === 'all' || c.categorie === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['all', 'Permis de construire', 'Déclaration préalable', 'Certificat', 'Modificatif', 'ERP', 'Suivi de chantier'];

  return (
    <>
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

      {filteredCerfas.length === 0 ? (
        <div className="card-premium text-center py-12">
          <FileText className="w-12 h-12 text-[#8a857d] mx-auto mb-4" />
          <p className="text-[14px] text-[#8a857d]">Aucun CERFA trouvé pour cette recherche</p>
        </div>
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
    </>
  );
}
