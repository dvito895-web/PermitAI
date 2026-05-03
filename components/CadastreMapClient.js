'use client';
import { useEffect, useRef, useState } from 'react';

export default function CadastreMapClient({ lat, lon, onParcelSelect }) {
  const containerRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const mapRef = useRef(null);
  const selectedLayerRef = useRef(null);

  useEffect(() => {
    if (!lat || !lon) return;

    // Nettoyer la carte précédente
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    selectedLayerRef.current = null;

    // Injecter CSS + JS Leaflet via script tags classiques
    const loadLeaflet = async () => {
      // CSS
      if (!document.getElementById('lf-css')) {
        await new Promise(resolve => {
          const link = document.createElement('link');
          link.id = 'lf-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.onload = resolve;
          document.head.appendChild(link);
        });
      }

      // JS
      if (!window.L) {
        await new Promise(resolve => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (!containerRef.current) return;

      const L = window.L;

      // Créer la carte
      const map = L.map(containerRef.current, {
        center: [lat, lon],
        zoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      // Fond clair
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB',
        maxZoom: 22,
      }).addTo(map);

      // Marqueur rouge
      const pin = L.divIcon({
        html: '<div style="width:14px;height:14px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(239,68,68,.35),0 2px 8px rgba(0,0,0,.5)"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7], className: '',
      });
      L.marker([lat, lon], { icon: pin, zIndexOffset: 99999 })
        .addTo(map)
        .bindTooltip('📍 Votre adresse', { permanent: true, direction: 'top', offset: [0, -14] });

      // Charger parcelles
      setLoading(true);
      try {
        const r = await fetch(`/api/parcelles?lat=${lat}&lon=${lon}`);
        const data = await r.json();
        const features = data.features || [];
        setCount(features.length);
        if (features.length === 0) { setLoading(false); return; }

        let bestLayer = null, bestParcelle = null, distMin = Infinity;

        features.forEach(feature => {
          const props = feature.properties || {};
          const geom = feature.geometry;
          if (!geom) return;

          const coords = geom.type === 'Polygon'
            ? geom.coordinates[0].map(c => [c[1], c[0]])
            : geom.type === 'MultiPolygon'
            ? geom.coordinates[0][0].map(c => [c[1], c[0]])
            : null;
          if (!coords || coords.length < 3) return;

          const poly = L.polygon(coords, {
            color: '#94a3b8', weight: 1.5,
            fillColor: '#e2e8f0', fillOpacity: 0.4,
          }).addTo(map);

          const parcelle = {
            reference: (props.section || '') + (props.numero || ''),
            section: props.section || '',
            numero: props.numero || '',
            surface: props.contenance ? Math.round(props.contenance) : null,
            commune_code: props.commune || '',
          };

          poly.on('mouseover', function() {
            if (this !== selectedLayerRef.current)
              this.setStyle({ fillColor: '#fde68a', fillOpacity: 0.6, color: '#f59e0b', weight: 2.5 });
            this.bringToFront();
          });
          poly.on('mouseout', function() {
            if (this !== selectedLayerRef.current)
              this.setStyle({ fillColor: '#e2e8f0', fillOpacity: 0.4, color: '#94a3b8', weight: 1.5 });
          });
          poly.on('click', function() {
            // Reset ancien
            if (selectedLayerRef.current && selectedLayerRef.current !== this)
              selectedLayerRef.current.setStyle({ fillColor: '#e2e8f0', fillOpacity: 0.4, color: '#94a3b8', weight: 1.5 });
            // Sélectionner
            this.setStyle({ color: '#a07820', weight: 3.5, fillColor: '#fbbf24', fillOpacity: 0.6 });
            this.bringToFront();
            selectedLayerRef.current = this;
            setSelected(parcelle);
            if (onParcelSelect) onParcelSelect(parcelle);
          });

          // Chercher la plus proche
          try {
            const c = poly.getBounds().getCenter();
            const d = Math.abs(c.lat - lat) + Math.abs(c.lng - lon);
            if (d < distMin) { distMin = d; bestLayer = poly; bestParcelle = parcelle; }
          } catch {}
        });

        // Pré-sélectionner
        if (bestLayer && bestParcelle) {
          bestLayer.setStyle({ color: '#a07820', weight: 3.5, fillColor: '#fbbf24', fillOpacity: 0.6 });
          bestLayer.bringToFront();
          selectedLayerRef.current = bestLayer;
          setSelected(bestParcelle);
          if (onParcelSelect) onParcelSelect(bestParcelle);
        }

      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [lat, lon]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#5a5650', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 2px rgba(239,68,68,.3)', flexShrink: 0 }} />
          <span>Votre adresse · <strong style={{ color: '#f2efe9' }}>Cliquez sur votre parcelle</strong></span>
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a07820' }}>
            <div style={{ width: 11, height: 11, border: '2px solid rgba(160,120,32,.2)', borderTop: '2px solid #a07820', borderRadius: '50%', animation: 'cs .7s linear infinite' }} />
            Chargement parcelles IGN...
          </div>
        )}
        {!loading && count > 0 && (
          <div style={{ fontSize: 10, color: '#3e3a34' }}>{count} parcelles disponibles</div>
        )}
      </div>

      {/* Container de la carte */}
      <div style={{ position: 'relative', height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid #1c1c2a', boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#3e3a34', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 10, background: 'rgba(251,191,36,.6)', border: '2.5px solid #a07820', borderRadius: 2 }} />
          <span>Sélectionnée</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 10, background: 'rgba(226,232,240,.4)', border: '1.5px solid #94a3b8', borderRadius: 2 }} />
          <span>Cliquables</span>
        </div>
        <span style={{ marginLeft: 'auto', color: '#2a2a38' }}>Cadastre IGN officiel</span>
      </div>

      {/* Résultat */}
      {selected ? (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'rgba(74,222,128,.05)', border: '0.5px solid rgba(74,222,128,.25)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            ✓ Parcelle sélectionnée — champs mis à jour
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
      ) : !loading && count > 0 && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          Cliquez sur votre parcelle — référence et surface se rempliront automatiquement
        </div>
      )}
      <style>{`@keyframes cs{to{transform:rotate(360deg)}} .leaflet-interactive{cursor:pointer!important}`}</style>
    </div>
  );
}
