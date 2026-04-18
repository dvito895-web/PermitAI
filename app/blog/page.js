'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ARTICLES = [
  { slug: 'analyser-plu',               title: 'Comment analyser son PLU en 3 minutes',                           desc: 'Guide complet pour comprendre votre Plan Local d\'Urbanisme et vérifier la faisabilité de votre projet.', date: '15 jan. 2025', readTime: '5 min', category: 'Guide PLU', featured: true },
  { slug: 'cerfa-permis-construire',     title: 'CERFA 13406 : remplir votre permis automatiquement',              desc: 'Guide complet du formulaire CERFA 13406 pour le permis de construire maison individuelle.',               date: '22 jan. 2025', readTime: '7 min', category: 'CERFA',     featured: true },
  { slug: 'delais-instruction',          title: 'Délais d\'instruction : accord tacite et recours',                 desc: 'Délais légaux, accord tacite, recours — tout ce que vous devez savoir sur les délais d\'instruction.',    date: '5 fév. 2025',  readTime: '6 min', category: 'Juridique', featured: true },
  { slug: 'extension-maison-regles',     title: 'Extension maison : règles PLU à vérifier avant',                  desc: 'Hauteur, emprise, reculs — les règles PLU qui s\'appliquent à votre extension de maison.',                date: '12 fév. 2025', readTime: '6 min', category: 'Extensions' },
  { slug: 'piscine-declaration-permis',  title: 'Piscine : déclaration préalable ou permis de construire ?',        desc: 'Faut-il une déclaration préalable ou un permis de construire pour votre piscine ? Les règles selon la taille.', date: '20 fév. 2025', readTime: '4 min', category: 'Piscines' },
];

const CATEGORIES = ['Tous', 'Guide PLU', 'CERFA', 'Juridique', 'Extensions', 'Piscines'];

export default function BlogPage() {
  const featured = ARTICLES.filter(a => a.featured);
  const others = ARTICLES.filter(a => !a.featured);

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
          <div style={{ display: 'flex', gap: 2 }}>
            <Link href="/analyse" style={{ padding: '7px 13px', fontSize: 12, color: '#8d887f', textDecoration: 'none' }}>Analyse PLU</Link>
            <Link href="/tarifs" style={{ padding: '7px 13px', fontSize: 12, color: '#8d887f', textDecoration: 'none' }}>Tarifs</Link>
            <Link href="/blog" style={{ padding: '7px 13px', fontSize: 12, color: '#f2efe9', textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
          </div>
          <Link href="/sign-up">
            <button style={{ padding: '8px 18px', background: '#a07820', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>Essai gratuit</button>
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ padding: '56px 52px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1.4px', fontWeight: 600, marginBottom: 10 }}>Blog</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 500, color: '#f2efe9', letterSpacing: -1, lineHeight: 1.08, marginBottom: 12 }}>
          Guides urbanisme<br /><em style={{ fontStyle: 'italic', color: '#e8b420' }}>& permis de construire.</em>
        </h1>
        <p style={{ fontSize: 14, color: '#5a5650', fontWeight: 300, maxWidth: 520, lineHeight: 1.7 }}>
          Tout ce que vous devez savoir sur les PLU, CERFA, délais d'instruction et permis de construire en France.
        </p>
      </div>

      {/* ARTICLES FEATURED */}
      <div style={{ padding: '0 52px 52px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          {featured.map((a, i) => (
            <Link key={i} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: '22px 20px', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 10, padding: '2px 9px', background: 'rgba(160,120,32,.08)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 20, color: '#a07820', fontWeight: 600 }}>{a.category}</span>
                  <span style={{ fontSize: 10, color: '#3e3a34' }}>{a.readTime}</span>
                </div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: '#f2efe9', lineHeight: 1.3, marginBottom: 10, letterSpacing: -.2, flex: 1 }}>{a.title}</h2>
                <p style={{ fontSize: 12, color: '#5a5650', lineHeight: 1.6, fontWeight: 300, marginBottom: 16 }}>{a.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#3e3a34' }}>{a.date}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#a07820', fontWeight: 500 }}>
                    Lire <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* AUTRES ARTICLES */}
        {others.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {others.map((a, i) => (
              <Link key={i} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }}>
                  <span style={{ fontSize: 10, padding: '2px 9px', background: 'rgba(160,120,32,.08)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 20, color: '#a07820', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.category}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#f2efe9', fontWeight: 400, marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: '#3e3a34' }}>{a.date} · {a.readTime}</div>
                  </div>
                  <ArrowRight size={13} color="#a07820" style={{ flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ margin: '0 52px 60px', maxWidth: 1200 - 104, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#0c0c1c,rgba(160,120,32,.05))', border: '0.5px solid rgba(160,120,32,.15)', borderRadius: 16, padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: '#f2efe9', letterSpacing: -.3, marginBottom: 6 }}>Prêt à analyser votre PLU ?</h2>
            <p style={{ fontSize: 13, color: '#3e3a34', fontWeight: 300 }}>1 analyse gratuite · 3 minutes · 36 000 communes</p>
          </div>
          <Link href="/analyse">
            <button style={{ padding: '12px 24px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
              Analyser gratuitement <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '0.5px solid #111118', padding: '20px 52px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>© 2025 PermitAI</span>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>contact@permitai.eu</span>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Blog Urbanisme — Guides permis de construire & PLU | PermitAI',
  description: 'Guides complets sur les PLU, CERFA, délais d\'instruction et permis de construire en France. Par les experts PermitAI.',
};