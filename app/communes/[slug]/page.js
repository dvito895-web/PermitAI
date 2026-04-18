'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, FileText, CheckCircle2 } from 'lucide-react';

// Données types par zone PLU
const ZONE_DATA = {
  UA: { label: 'Zone UA — Urbain dense', desc: 'Centre-ville, immeubles collectifs, commerces', hauteur: '12 à 18m', emprise: '80%', recul: '0 à 3m' },
  UB: { label: 'Zone UB — Urbain résidentiel', desc: 'Pavillonnaire, maisons individuelles', hauteur: '7 à 10m', emprise: '40%', recul: '3 à 5m' },
  UC: { label: 'Zone UC — Péri-urbain', desc: 'Quartiers résidentiels en extension', hauteur: '6 à 9m', emprise: '30%', recul: '5m' },
  AU: { label: 'Zone AU — À urbaniser', desc: 'Futures zones constructibles', hauteur: 'Variable', emprise: 'Variable', recul: 'Variable' },
  N:  { label: 'Zone N — Naturelle', desc: 'Espaces naturels, forêts, milieux protégés', hauteur: 'Limité', emprise: '5%', recul: '10m' },
};

const TYPES_PROJETS = [
  { type: 'Extension maison', cerfa: 'CERFA 13406', delai: '2 mois', icone: '🏠' },
  { type: 'Construction neuve', cerfa: 'CERFA 13406', delai: '3 mois', icone: '🏗' },
  { type: 'Piscine', cerfa: 'CERFA 13703', delai: '2 mois', icone: '🏊' },
  { type: 'Garage / Annexe', cerfa: 'CERFA 13703', delai: '1 mois', icone: '🏪' },
  { type: 'Clôture / Portail', cerfa: 'CERFA 13703', delai: '1 mois', icone: '🚪' },
  { type: 'Façade / Ravalement', cerfa: 'CERFA 13703', delai: '1 mois', icone: '🎨' },
];

const ARTICLES_BLOG = [
  { title: 'Comment analyser son PLU en 3 minutes', slug: 'analyser-plu' },
  { title: 'CERFA permis de construire : guide complet', slug: 'cerfa-permis-construire' },
  { title: 'Délais d\'instruction : vos droits', slug: 'delais-instruction' },
];

// Génère les données de la commune depuis le slug
function getCommune(slug) {
  const parts = slug.split('-');
  const dept = parts[parts.length - 1];
  const name = parts.slice(0, -1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { name, dept, slug };
}

export default function CommunePage({ params }) {
  const commune = getCommune(params.slug);
  const zone = ZONE_DATA['UB']; // Zone type par défaut (sera dynamique avec la vraie DB)

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
          <Link href="/tarifs" style={{ fontSize: 12, color: '#a07820', textDecoration: 'none', border: '0.5px solid rgba(160,120,32,.3)', padding: '7px 16px', borderRadius: 8 }}>
            Analyser mon terrain →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: '56px 52px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Link href="/" style={{ fontSize: 12, color: '#3e3a34', textDecoration: 'none' }}>Accueil</Link>
          <span style={{ fontSize: 12, color: '#3e3a34' }}>→</span>
          <Link href="/communes" style={{ fontSize: 12, color: '#3e3a34', textDecoration: 'none' }}>Communes</Link>
          <span style={{ fontSize: 12, color: '#3e3a34' }}>→</span>
          <span style={{ fontSize: 12, color: '#f2efe9' }}>{commune.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 56, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px', background: 'rgba(74,222,128,.07)', border: '0.5px solid rgba(74,222,128,.18)', borderRadius: 20, fontSize: 11, color: '#4ade80', fontWeight: 500, marginBottom: 20 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
              PLU indexé · Données officielles
            </div>

            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 500, color: '#f2efe9', letterSpacing: -1, lineHeight: 1.1, marginBottom: 16 }}>
              Permis de construire à<br />
              <em style={{ fontStyle: 'italic', color: '#e8b420' }}>{commune.name}</em>
            </h1>

            <p style={{ fontSize: 14, color: '#8d887f', fontWeight: 300, lineHeight: 1.74, marginBottom: 28, maxWidth: 520 }}>
              Analysez votre PLU à {commune.name} ({commune.dept}) en 3 minutes. 
              Vérifiez la faisabilité de votre projet, obtenez vos CERFA pré-remplis 
              et déposez en mairie directement depuis PermitAI.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/analyse">
                <button style={{ padding: '13px 24px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Analyser mon projet à {commune.name}
                  <ArrowRight size={14} />
                </button>
              </Link>
              <button style={{ padding: '13px 20px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 10, color: '#8d887f', fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                Voir le PLU officiel →
              </button>
            </div>
          </div>

          {/* CARD INFO PLU */}
          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MapPin size={14} color="#a07820" />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9' }}>PLU de {commune.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', background: 'rgba(74,222,128,.08)', color: '#4ade80', border: '0.5px solid rgba(74,222,128,.18)', borderRadius: 20 }}>Indexé</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                ['Département', `(${commune.dept})`],
                ['Zone principale', 'UB — Résidentiel'],
                ['Hauteur max', zone.hauteur],
                ['Emprise sol', zone.emprise],
                ['Recul min', zone.recul],
                ['Délai instruction', '2 mois'],
              ].map(([l, v]) => (
                <div key={l} style={{ background: '#131320', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 12, color: '#f2efe9', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px 12px', background: 'rgba(160,120,32,.05)', border: '0.5px solid rgba(160,120,32,.15)', borderRadius: 8, fontSize: 11, color: '#a07820', fontStyle: 'italic' }}>
              Analyse complète en 3 min · CERFA auto-rempli · Dépôt mairie inclus
            </div>
          </div>
        </div>
      </div>

      {/* TYPES DE PROJETS */}
      <div style={{ padding: '0 52px 52px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 600, marginBottom: 8 }}>TYPES DE TRAVAUX</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 500, color: '#f2efe9', letterSpacing: -.4, marginBottom: 24 }}>
          Vos projets à {commune.name}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {TYPES_PROJETS.map((p, i) => (
            <Link key={i} href="/analyse" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: '18px 20px', cursor: 'pointer', transition: 'border-color .2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{p.icone}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9' }}>{p.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#3e3a34' }}>{p.cerfa}</span>
                  <span style={{ fontSize: 11, color: '#a07820' }}>Délai : {p.delai}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* PROCESS */}
      <div style={{ padding: '0 52px 52px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 500, color: '#f2efe9', letterSpacing: -.4, marginBottom: 24 }}>
          Comment déposer votre dossier à {commune.name}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            ['01', 'Entrez votre adresse', `Précisez votre adresse à ${commune.name} et décrivez votre projet en langage naturel.`],
            ['02', 'Analyse PLU en 3 min', `PermitAI vérifie toutes les règles du PLU de ${commune.name} applicables à votre terrain.`],
            ['03', 'CERFA auto-rempli', 'Tous vos formulaires sont générés automatiquement avec vos données cadastrales.'],
            ['04', 'Dépôt en mairie', `Dépôt numérique via PLAT'AU directement à la mairie de ${commune.name}.`],
          ].map(([n, t, d]) => (
            <div key={n} style={{ background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: 'rgba(160,120,32,.3)', fontWeight: 500, marginBottom: 10 }}>{n}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 11, color: '#5a5650', lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 52px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#0c0c1c,rgba(160,120,32,.05))', border: '0.5px solid rgba(160,120,32,.15)', borderRadius: 16, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, color: '#f2efe9', letterSpacing: -.4, marginBottom: 6 }}>
              Analysez votre projet à {commune.name}
            </h2>
            <p style={{ fontSize: 13, color: '#3e3a34', fontWeight: 300 }}>1 analyse gratuite · PLU indexé · Résultat en 3 minutes</p>
          </div>
          <Link href="/analyse">
            <button style={{ padding: '13px 28px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
              Analyser gratuitement <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>

      {/* ARTICLES LIÉS */}
      <div style={{ padding: '0 52px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 600, marginBottom: 8 }}>GUIDES</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: '#f2efe9', marginBottom: 16 }}>Articles utiles</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {ARTICLES_BLOG.map((a, i) => (
            <Link key={i} href={`/blog/${a.slug}`} style={{ flex: 1, background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '14px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#8d887f', lineHeight: 1.4 }}>{a.title}</span>
              <ArrowRight size={12} color="#a07820" style={{ flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

      {/* FOOTER MINI */}
      <div style={{ borderTop: '0.5px solid #111118', padding: '20px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>© 2025 PermitAI</span>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>Données PLU officielles Géoportail Urbanisme</span>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>contact@permitai.eu</span>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const commune = getCommune(params.slug);
  return {
    title: `Permis de construire à ${commune.name} (${commune.dept}) — Analyse PLU en 3 min | PermitAI`,
    description: `Analysez votre PLU à ${commune.name} en 3 minutes. Vérifiez la faisabilité de votre projet, obtenez vos CERFA automatiques et déposez en mairie. Données officielles Géoportail.`,
    openGraph: {
      title: `Permis de construire à ${commune.name} — PermitAI`,
      description: `Analyse PLU à ${commune.name} en 3 minutes. CERFA auto-rempli. Dépôt mairie inclus.`,
      url: `https://permitai.eu/communes/${params.slug}`,
    },
  };
}