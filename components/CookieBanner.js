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