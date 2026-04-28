'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Clock } from 'lucide-react';

const EMOJI_MAP = {
  '13406': '🏠',
  '13409': '🏗',
  '13410': '🌍',
  '13411': '🔨',
  '13703': '📋',
  '13404': '📝',
  '13702': '📜',
  '13408': '🔄',
  '14023': '✏️',
  '13412': '🏢',
  '15483': '🚧',
  '13407': '✅',
  '13736': '⏳',
};

const CATEGORY_COLORS = {
  'Permis de construire': { bg: '#4ade8022', text: '#4ade80' },
  'Déclaration préalable': { bg: '#60a5fa22', text: '#60a5fa' },
  'Certificat': { bg: '#a0782022', text: '#a07820' },
  'Modificatif': { bg: '#f59e0b22', text: '#f59e0b' },
  'ERP': { bg: '#ef444422', text: '#ef4444' },
  'Suivi de chantier': { bg: '#8b5cf622', text: '#8b5cf6' },
  'Transfert': { bg: '#ec489922', text: '#ec4899' },
  'Démolition': { bg: '#78716c22', text: '#78716c' },
  'Aménagement': { bg: '#10b98122', text: '#10b981' },
};

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
      <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#5a5650' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un CERFA par numéro ou nom..."
            style={{
              width: '100%',
              paddingLeft: 48,
              padding: '12px 16px',
              background: '#06060e',
              border: '0.5px solid #1c1c2a',
              borderRadius: 8,
              color: '#f2efe9',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                background: filter === cat ? '#a07820' : '#14141f',
                color: filter === cat ? 'white' : '#5a5650',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredCerfas.length === 0 ? (
        <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#5a5650' }}>Aucun CERFA trouvé pour cette recherche</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredCerfas.map(cerfa => {
            const emoji = EMOJI_MAP[cerfa.numero] || '📄';
            const catColors = CATEGORY_COLORS[cerfa.categorie] || { bg: '#5a565022', text: '#5a5650' };
            
            return (
              <Link key={cerfa.numero} href={`/cerfa/${cerfa.slug}`}>
                <div
                  style={{
                    background: '#0c0c18',
                    border: '0.5px solid #1c1c2a',
                    borderRadius: 12,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a07820'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1c1c2a'; }}
                >
                  {/* Header avec émoji et badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div style={{ fontSize: 32, lineHeight: 1 }}>{emoji}</div>
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      background: catColors.bg,
                      color: catColors.text,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {cerfa.categorie}
                    </div>
                  </div>

                  {/* Badge numéro */}
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: '#a0782022',
                    color: '#a07820',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 12,
                    width: 'fit-content',
                  }}>
                    CERFA {cerfa.numero}
                  </div>

                  {/* Titre */}
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#f2efe9',
                    marginBottom: 12,
                    lineHeight: 1.4,
                    minHeight: 42,
                  }}>
                    {cerfa.nom}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 13,
                    color: '#5a5650',
                    marginBottom: 16,
                    lineHeight: 1.5,
                    flex: 1,
                  }}>
                    {cerfa.description}
                  </p>

                  {/* Footer avec délai et flèche */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 16,
                    borderTop: '0.5px solid #1c1c2a',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock style={{ width: 14, height: 14, color: '#5a5650' }} />
                      <span style={{ fontSize: 12, color: '#5a5650' }}>{cerfa.delaiInstruction}</span>
                    </div>
                    <ArrowRight style={{ width: 16, height: 16, color: '#a07820' }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
