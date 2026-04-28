'use client';
import { useState, useRef, useEffect } from 'react';

export default function AddressInput({ value, onChange, placeholder = '47 avenue Victor Hugo, 69003 Lyon' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  async function handleChange(e) {
    const q = e.target.value;
    onChange(q);
    if (q.length < 1) { setSuggestions([]); setOpen(false); return; }
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      setSuggestions(data.features?.map(f => f.properties.label) || []);
      setOpen(true);
    } catch { setSuggestions([]); }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input type="text" value={value} onChange={handleChange} placeholder={placeholder} autoComplete="off"
        style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 16px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }} />
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 999, background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
          {suggestions.map((s, i) => (
            <button key={i} type="button" onMouseDown={e => { e.preventDefault(); onChange(s); setOpen(false); }}
              style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: i < suggestions.length-1 ? '0.5px solid #111118' : 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: '#f2efe9', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: '#a07820' }}>📍</span> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
