'use client';
import { useEffect, useRef, useState } from 'react';

// Composant carte cadastrale — Leaflet dans iframe, communication via postMessage
// Zéro conflit React, parcelles cliquables garanties
export default function CadastreMap({ lat, lon, onParcelSelect }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('Chargement...');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!lat || !lon) return;

    // Écouter les messages de l'iframe Leaflet
    function handleMessage(event) {
      const msg = event.data;
      if (!msg || !msg.type) return;

      if (msg.type === 'PARCELLE_SELECTED') {
        const p = msg.data;
        setSelected(p);
        setStatus('Parcelle sélectionnée');
        // Remplir les champs du wizard
        if (onParcelSelect) onParcelSelect(p);
      }
      if (msg.type === 'PARCELLES_LOADED') {
        setCount(msg.count);
        setStatus(msg.count + ' parcelles chargées — cliquez sur la vôtre');
      }
      if (msg.type === 'NO_PARCELLES') {
        setStatus('Aucune parcelle trouvée à cette adresse');
      }
      if (msg.type === 'ERROR') {
        setStatus('Erreur: ' + msg.message);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [lat, lon, onParcelSelect]);

  if (!lat || !lon) return null;

  const iframeSrc = `/api/carte-cadastrale?lat=${lat}&lon=${lon}`;

  return (
    <div>
      {/* Barre de statut */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#5a5650', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 2px rgba(239,68,68,.3)', flexShrink: 0 }} />
          <span style={{ color: '#f2efe9', fontWeight: 500 }}>Votre adresse</span>
          <span style={{ color: '#3e3a34' }}>·</span>
          <span><strong style={{ color: '#f2efe9' }}>Cliquez sur votre parcelle</strong> pour la sélectionner</span>
        </div>
        <div style={{ fontSize: 10, color: '#3e3a34' }}>{status}</div>
      </div>

      {/* Carte Leaflet dans iframe */}
      <div style={{ position: 'relative', height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid #1c1c2a', boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
        <iframe
          src={iframeSrc}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Carte cadastrale"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#3e3a34', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 10, background: 'rgba(251,191,36,.6)', border: '2.5px solid #a07820', borderRadius: 2 }} />
          <span>Sélectionnée</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 10, background: 'rgba(226,232,240,.4)', border: '1.5px solid #94a3b8', borderRadius: 2 }} />
          <span>Cliquable</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 10, background: 'rgba(253,230,138,.6)', border: '2px solid #f59e0b', borderRadius: 2 }} />
          <span>Survol</span>
        </div>
        <span style={{ marginLeft: 'auto', color: '#2a2a38' }}>Cadastre IGN officiel</span>
      </div>

      {/* Résultat sélection */}
      {selected ? (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'rgba(74,222,128,.05)', border: '0.5px solid rgba(74,222,128,.25)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            ✓ Parcelle sélectionnée — champs mis à jour automatiquement
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              ['Référence cadastrale', selected.reference || '—'],
              ['Surface terrain', selected.surface ? `${selected.surface} m²` : '—'],
              ['Code INSEE', selected.commune_code || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f2efe9' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : count > 0 && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          {count} parcelles disponibles — cliquez sur la vôtre pour remplir la référence cadastrale et la surface
        </div>
      )}
    </div>
  );
}
