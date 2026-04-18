'use client';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
 
const REGIONS = [
  {
    name: 'Île-de-France',
    communes: [
      { name: 'Paris', slug: 'paris-75', dept: '75' },
      { name: 'Boulogne-Billancourt', slug: 'boulogne-billancourt-92', dept: '92' },
      { name: 'Versailles', slug: 'versailles-78', dept: '78' },
      { name: 'Argenteuil', slug: 'argenteuil-95', dept: '95' },
    ],
  },
  {
    name: 'Auvergne-Rhône-Alpes',
    communes: [
      { name: 'Lyon', slug: 'lyon-69', dept: '69' },
      { name: 'Grenoble', slug: 'grenoble-38', dept: '38' },
      { name: 'Annecy', slug: 'annecy-74', dept: '74' },
      { name: 'Clermont-Ferrand', slug: 'clermont-ferrand-63', dept: '63' },
    ],
  },
  {
    name: 'Provence-Alpes-Côte d\'Azur',
    communes: [
      { name: 'Marseille', slug: 'marseille-13', dept: '13' },
      { name: 'Nice', slug: 'nice-06', dept: '06' },
      { name: 'Toulon', slug: 'toulon-83', dept: '83' },
      { name: 'Aix-en-Provence', slug: 'aix-en-provence-13', dept: '13' },
    ],
  },
  {
    name: 'Occitanie',
    communes: [
      { name: 'Toulouse', slug: 'toulouse-31', dept: '31' },
      { name: 'Montpellier', slug: 'montpellier-34', dept: '34' },
      { name: 'Nîmes', slug: 'nimes-30', dept: '30' },
      { name: 'Perpignan', slug: 'perpignan-66', dept: '66' },
    ],
  },
  {
    name: 'Nouvelle-Aquitaine',
    communes: [
      { name: 'Bordeaux', slug: 'bordeaux-33', dept: '33' },
      { name: 'Limoges', slug: 'limoges-87', dept: '87' },
      { name: 'Pau', slug: 'pau-64', dept: '64' },
      { name: 'Poitiers', slug: 'poitiers-86', dept: '86' },
    ],
  },
  {
    name: 'Grand Est',
    communes: [
      { name: 'Strasbourg', slug: 'strasbourg-67', dept: '67' },
      { name: 'Metz', slug: 'metz-57', dept: '57' },
      { name: 'Reims', slug: 'reims-51', dept: '51' },
      { name: 'Mulhouse', slug: 'mulhouse-68', dept: '68' },
    ],
  },
  {
    name: 'Pays de la Loire',
    communes: [
      { name: 'Nantes', slug: 'nantes-44', dept: '44' },
      { name: 'Angers', slug: 'angers-49', dept: '49' },
      { name: 'Le Mans', slug: 'le-mans-72', dept: '72' },
      { name: 'Saint-Nazaire', slug: 'saint-nazaire-44', dept: '44' },
    ],
  },
  {
    name: 'Bretagne',
    communes: [
      { name: 'Rennes', slug: 'rennes-35', dept: '35' },
      { name: 'Brest', slug: 'brest-29', dept: '29' },
      { name: 'Quimper', slug: 'quimper-29', dept: '29' },
      { name: 'Lorient', slug: 'lorient-56', dept: '56' },
    ],
  },
];
 
export default function CommunesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
 
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.2" /><rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white" /></svg>
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: '#f2efe9' }}>PermitAI</span>
          </Link>
          <Link href="/analyse" style={{ fontSize: 12, color: '#a07820', textDecoration: 'none', border: '0.5px solid rgba(160,120,32,.3)', padding: '7px 16px', borderRadius: 8 }}>
            Analyser mon terrain →
          </Link>
        </div>
      </nav>
 
      {/* HEADER */}
      <div style={{ padding: '56px 52px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px', background: 'rgba(74,222,128,.07)', border: '0.5px solid rgba(74,222,128,.18)', borderRadius: 20, fontSize: 11, color: '#4ade80', fontWeight: 500, marginBottom: 20 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
          36 000 communes indexées · France entière
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 500, color: '#f2efe9', letterSpacing: -1, lineHeight: 1.08, marginBottom: 12 }}>
          Permis de construire<br />
          <em style={{ fontStyle: 'italic', color: '#e8b420' }}>par commune.</em>
        </h1>
        <p style={{ fontSize: 14, color: '#5a5650', fontWeight: 300, maxWidth: 520, lineHeight: 1.7 }}>
          Analysez le PLU de n'importe quelle commune de France en 3 minutes. Vérifiez la faisabilité de votre projet, obtenez vos CERFA et déposez en mairie.
        </p>
      </div>
 
      {/* STATS */}
      <div style={{ padding: '0 52px 52px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 13, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', overflow: 'hidden', marginBottom: 48 }}>
          {[['36 000', 'Communes indexées', '#e8b420'], ['100%', 'France couverte', '#4ade80'], ['3 min', 'Analyse PLU', '#e8b420'], ['94%', 'Dossiers accordés', '#4ade80']].map(([v, l, c], i) => (
            <div key={i} style={{ padding: '18px 20px', borderRight: i < 3 ? '0.5px solid #1c1c2a' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: c, fontWeight: 500, marginBottom: 3 }}>{v}</div>
              <div style={{ fontSize: 11, color: '#3e3a34' }}>{l}</div>
            </div>
          ))}
        </div>
 
        {/* RÉGIONS */}
        {REGIONS.map((region, ri) => (
          <div key={ri} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <MapPin size={14} color="#a07820" />
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, color: '#f2efe9', letterSpacing: -.2 }}>{region.name}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {region.communes.map((c, ci) => (
                <Link key={ci} href={`/communes/${c.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#3e3a34' }}>Dép. {c.dept}</div>
                    </div>
                    <ArrowRight size={12} color="#a07820" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
 
      {/* CTA */}
      <div style={{ margin: '0 52px 60px', maxWidth: 1200 - 104, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#0c0c1c,rgba(160,120,32,.05))', border: '0.5px solid rgba(160,120,32,.15)', borderRadius: 16, padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 500, color: '#f2efe9', letterSpacing: -.3, marginBottom: 6 }}>Votre commune n'est pas listée ?</h2>
            <p style={{ fontSize: 13, color: '#3e3a34', fontWeight: 300 }}>Toutes les 36 000 communes de France sont indexées. Entrez votre adresse directement.</p>
          </div>
          <Link href="/analyse">
            <button style={{ padding: '13px 28px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
              Analyser mon adresse <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
 
      {/* FOOTER */}
      <div style={{ borderTop: '0.5px solid #111118', padding: '20px 52px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>© 2025 PermitAI</span>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>Données PLU officielles Géoportail Urbanisme</span>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>contact@permitai.eu</span>
      </div>
    </div>
  );
}
 
export const metadata = {
  title: 'Permis de construire par commune — Analyse PLU France | PermitAI',
  description: 'Analysez le PLU de votre commune en 3 minutes. 36 000 communes de France indexées. CERFA auto-rempli. Dépôt en mairie inclus.',
};