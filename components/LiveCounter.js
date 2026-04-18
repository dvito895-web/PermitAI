'use client';

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 10 — Compteur live landing
// Emplacement : app/components/LiveCounter.js
//
// COMMENT L'UTILISER dans ta landing page :
// import LiveCounter from '@/components/LiveCounter';
// Puis dans ton JSX : <LiveCounter />
//
// Ce composant affiche un compteur qui s'incrémente en temps réel
// pour donner une preuve sociale dynamique sur la landing.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';

// Nombre de base réaliste (ajuste selon ta vraie progression)
const BASE_COUNT = 4847;
// Vitesse d'incrémentation : 1 analyse toutes les X secondes
const INCREMENT_EVERY_MS = 7000;

export default function LiveCounter() {
  const [count, setCount] = useState(BASE_COUNT);
  const [delta, setDelta] = useState(null); // flash "+1" animé
  const intervalRef = useRef(null);

  useEffect(() => {
    // Simule des analyses en temps réel
    intervalRef.current = setInterval(() => {
      setCount(prev => prev + 1);
      setDelta('+1');
      setTimeout(() => setDelta(null), 1200);
    }, INCREMENT_EVERY_MS);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      background: 'rgba(74,222,128,.06)',
      border: '0.5px solid rgba(74,222,128,.15)',
      borderRadius: 20,
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
    }}>
      {/* DOT PULSE */}
      <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#4ade80',
          position: 'absolute',
        }} />
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#4ade80',
          position: 'absolute',
          opacity: 0.4,
          animation: 'lc-pulse 2s ease-out infinite',
        }} />
      </div>

      {/* COMPTEUR */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 16,
          fontWeight: 500,
          color: '#f2efe9',
          letterSpacing: -.3,
          minWidth: 44,
          textAlign: 'right',
          transition: 'all .15s',
        }}>
          {count.toLocaleString('fr-FR')}
        </span>
        <span style={{ fontSize: 12, color: '#5a5650' }}>analyses effectuées aujourd'hui</span>
      </div>

      {/* FLASH +1 */}
      {delta && (
        <span style={{
          position: 'absolute',
          right: -8,
          top: -10,
          fontSize: 11,
          fontWeight: 600,
          color: '#4ade80',
          animation: 'lc-float 1.2s ease forwards',
          pointerEvents: 'none',
        }}>
          {delta}
        </span>
      )}

      <style>{`
        @keyframes lc-pulse {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes lc-float {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-14px); }
        }
      `}</style>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// VERSION GRANDE — pour zone hero avec chiffre prominent
// Usage : <LiveCounterHero />
// ═══════════════════════════════════════════════════════════════

export function LiveCounterHero() {
  const [count, setCount] = useState(BASE_COUNT);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setCount(p => p + 1);
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    }, INCREMENT_EVERY_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'lc-pulse 2s ease-out infinite' }} />
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 36,
          fontWeight: 500,
          color: flash ? '#e8b420' : '#f2efe9',
          letterSpacing: -1,
          transition: 'color .15s',
        }}>
          {count.toLocaleString('fr-FR')}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#5a5650', fontWeight: 300 }}>
        analyses PLU effectuées · en direct
      </div>
      <style>{`
        @keyframes lc-pulse {
          0% { transform: scale(1); opacity: .4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}