'use client';

import { useState, useEffect, useRef } from 'react';

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

export default function AddressAutocomplete({ value, onChange, placeholder = "Entrez une adresse...", className = "" }) {
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value.length >= 2) {
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`);
          const data = await res.json();
          const apiSuggestions = data.features.map(f => ({
            label: f.properties.label,
            icon: '📍',
          }));
          setSuggestions(apiSuggestions.length > 0 ? apiSuggestions : DEFAULT_SUGGESTIONS);
        } catch (error) {
          setSuggestions(DEFAULT_SUGGESTIONS);
        } finally {
          setLoading(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions(DEFAULT_SUGGESTIONS);
    }
  }, [value]);

  const handleSelect = (suggestion) => {
    onChange(suggestion.label);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className={className}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#0c0c18',
          border: '0.5px solid #1c1c2a',
          borderRadius: 8,
          color: '#f2efe9',
          fontSize: 14,
          outline: 'none',
        }}
      />
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: '#0c0c18',
          border: '0.5px solid #1c1c2a',
          borderRadius: 8,
          maxHeight: 300,
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {loading ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#5a5650', fontSize: 13 }}>
              Recherche...
            </div>
          ) : (
            suggestions.map((sug, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(sug)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: idx < suggestions.length - 1 ? '0.5px solid #1c1c2a' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#14141f'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 18 }}>{sug.icon}</span>
                <span style={{ fontSize: 14, color: '#f2efe9' }}>{sug.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
