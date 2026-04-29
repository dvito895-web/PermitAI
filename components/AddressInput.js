'use client';
import { useState, useRef, useEffect } from 'react';

export default function AddressInput({ value, onChange, placeholder = '47 avenue Victor Hugo, 69003 Lyon' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setShow(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function handleInput(e) {
    const q = e.target.value;
    onChange(q);
    clearTimeout(timer.current);
    if (q.length < 1) { setSuggestions([]); setShow(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=6&autocomplete=1`);
        const d = await r.json();
        const s = d.features?.map(f => ({ label: f.properties.label, context: f.properties.context })) || [];
        setSuggestions(s); setShow(s.length > 0);
      } catch { setSuggestions([]); }
    }, 200);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 14, zIndex: 1 }}>📍</span>
      <input type="text" value={value} onChange={handleInput} placeholder={placeholder} autoComplete="off"
        style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 16px 13px 42px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }} />
      {show && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999, background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.7)' }}>
          {suggestions.map((s, i) => (
            <button key={i} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(s.label); setShow(false); setSuggestions([]); }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: i < suggestions.length-1 ? '0.5px solid #111118' : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 12.5, color: '#f2efe9', fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 10, color: '#3e3a34', marginTop: 2 }}>{s.context}</span>
            </button>
          ))}
          <div style={{ padding: '5px 14px', fontSize: 10, color: '#1c1c2a', borderTop: '0.5px solid #111118' }}>api-adresse.data.gouv.fr · Données officielles</div>
        </div>
      )}
    </div>
  );
}
