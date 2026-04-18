'use client';
import Link from 'next/link';
 
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 52px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 120, fontWeight: 500, color: 'rgba(160,120,32,.12)', lineHeight: 1, marginBottom: 8, letterSpacing: -4 }}>404</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, color: '#f2efe9', letterSpacing: -.5, lineHeight: 1.1, marginBottom: 12 }}>
          Cette page n'existe pas.
        </h1>
        <p style={{ fontSize: 14, color: '#5a5650', fontWeight: 300, lineHeight: 1.7, marginBottom: 32 }}>
          La page que vous cherchez a été déplacée ou n'existe plus. Revenez à l'accueil ou analysez directement votre projet.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/">
            <button style={{ padding: '12px 24px', background: 'transparent', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 10, color: '#c4960a', fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
              ← Accueil
            </button>
          </Link>
          <Link href="/analyse">
            <button style={{ padding: '12px 24px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Analyser mon terrain →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
 
 
// ═══════════════════════════════════════════════════════════════
// FICHIER 2 : Composant Cookie RGPD
// Emplacement : app/components/CookieBanner.js
// Puis importer dans app/app/layout.js
// ═══════════════════════════════════════════════════════════════
 
// Colle ce contenu dans app/components/CookieBanner.js
 
'use client';
import { useState, useEffect } from 'react';
 
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    const consent = localStorage.getItem('permitai_cookie_consent');
    if (!consent) setVisible(true);
  }, []);
 
  const accept = () => {
    localStorage.setItem('permitai_cookie_consent', 'accepted');
    setVisible(false);
  };
 
  const decline = () => {
    localStorage.setItem('permitai_cookie_consent', 'declined');
    setVisible(false);
  };
 
  if (!visible) return null;
 
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 999,
      maxWidth: 520, margin: '0 auto',
      background: '#0e0e1a',
      border: '0.5px solid #1c1c2a',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      boxShadow: '0 8px 40px rgba(0,0,0,.4)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 4 }}>Cookies & confidentialité</div>
        <div style={{ fontSize: 12, color: '#5a5650', lineHeight: 1.55 }}>
          Nous utilisons des cookies analytiques (Plausible) pour améliorer PermitAI.
          Aucune donnée vendue à des tiers.{' '}
          <a href="/politique-confidentialite" style={{ color: '#a07820', textDecoration: 'none' }}>En savoir plus</a>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={decline} style={{ padding: '8px 14px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 8, color: '#5a5650', fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
          Refuser
        </button>
        <button onClick={accept} style={{ padding: '8px 14px', background: '#a07820', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
          Accepter
        </button>
      </div>
    </div>
  );
}