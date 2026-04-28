'use client';
import { useState, useRef, useEffect } from 'react';

const DEFAULT_SUGGESTIONS = [
  { label: '12 rue des Lilas, Lyon 69006', icon: '🏘' },
  { label: '45 avenue des Champs-Élysées, Paris 75008', icon: '🏙' },
  { label: '8 place de la Victoire, Bordeaux 33000', icon: '🏡' },
  { label: '23 rue Paradis, Marseille 13006', icon: '🌊' },
  { label: '15 allée des Roses, Toulouse 31000', icon: '🌹' },
  { label: '7 rue du Faubourg, Nice 06000', icon: '☀️' },
  { label: '34 boulevard de la Liberté, Lille 59000', icon: '🏗' },
  { label: '2 quai du Nouveau Bassin, Nantes 44000', icon: '⚓' },
  { label: '89 rue de la République, Strasbourg 67000', icon: '🏰' },
  { label: '3 rue Albert Dupeyron, Cenon 33150', icon: '🍷' },
];

export default function AddressAutocomplete({ value, onChange, placeholder = 'Entrez votre adresse...' }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleChange(e) {
    const q = e.target.value;
    onChange(q);
    if (q.length < 2) { setSuggestions(DEFAULT_SUGGESTIONS); setOpen(true); return; }
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      if (data.features?.length) {
        setSuggestions(data.features.map(f => ({ label: f.properties.label, icon: '📍' })));
      }
    } catch { setSuggestions(DEFAULT_SUGGESTIONS); }
    setOpen(true);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a07820', fontSize: 14, pointerEvents: 'none' }}>📍</span>
        <input
          type="text" value={value} onChange={handleChange}
          onFocus={() => { setSuggestions(value.length < 2 ? DEFAULT_SUGGESTIONS : suggestions); setOpen(true); }}
          placeholder={placeholder} autoComplete="off"
          style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 16px 13px 40px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 999, background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
          {suggestions.map((s, i) => (
            <button key={i}
              onMouseDown={e => { e.preventDefault(); onChange(s.label); setOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: i < suggestions.length - 1 ? '0.5px solid #111118' : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span>
              <span style={{ fontSize: 12, color: '#f2efe9' }}>{s.label}</span>
            </button>
          ))}
          <div style={{ padding: '6px 14px', fontSize: 10, color: '#2a2a38', borderTop: '0.5px solid #111118' }}>
            34 970 communes indexées · Données officielles
          </div>
        </div>
      )}
    </div>
  );
}
