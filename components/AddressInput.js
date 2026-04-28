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
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=8&autocomplete=1`
      );
      const data = await res.json();
      const results = data.features?.map(f => ({
        label: f.properties.label,
        city: f.properties.city,
        postcode: f.properties.postcode,
        context: f.properties.context,
      })) || [];
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', flexShrink: 0 }}
          width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7 1C3.7 1 1 3.7 1 7C1 10.3 3.7 13 7 13C10.3 13 13 10.3 13 7C13 3.7 10.3 1 7 1Z"
            stroke="#a07820" strokeWidth="1.2"/>
          <path d="M11.5 11.5L14 14" stroke="#a07820" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => value.length >= 1 && setOpen(suggestions.length > 0)}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: '100%',
            background: '#0a0a14',
            border: '0.5px solid #1c1c2a',
            borderRadius: 10,
            padding: '14px 16px 14px 42px',
            fontSize: 13,
            color: '#f2efe9',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color .2s',
          }}
          onMouseEnter={e => e.target.style.borderColor = 'rgba(160,120,32,.4)'}
          onMouseLeave={e => e.target.style.borderColor = '#1c1c2a'}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          zIndex: 999,
          background: '#0e0e1a',
          border: '0.5px solid #1c1c2a',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,.6)',
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {suggestions.map((s, i) => (
            <button key={i} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(s.label); setOpen(false); setSuggestions([]); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '11px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: i < suggestions.length - 1 ? '0.5px solid #111118' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 14, color: '#a07820', flexShrink: 0, marginTop: 1 }}>📍</span>
              <div>
                <div style={{ fontSize: 12.5, color: '#f2efe9', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: '#3e3a34', marginTop: 2 }}>{s.context}</div>
              </div>
            </button>
          ))}
          <div style={{ padding: '6px 14px', fontSize: 10, color: '#2a2a38', borderTop: '0.5px solid #111118' }}>
            Données adresses officielles · api-adresse.data.gouv.fr
          </div>
        </div>
      )}
    </div>
  );
}
