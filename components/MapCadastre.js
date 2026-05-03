// components/MapCadastre.js
// Carte Leaflet pure — chargée uniquement côté client
'use client';
import { useEffect, useRef, useState } from 'react';

export default function MapCadastre({ lat, lon, onParcelSelect }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const selRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nb, setNb] = useState(0);

  useEffect(() => {
    if (!divRef.current || !lat || !lon) return;

    // Cleanup
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    selRef.current = null;

    let map;

    (async () => {
      // Charger Leaflet depuis node_modules
      const L = (await import('leaflet')).default;

      // Fix icônes cassées dans Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Créer la carte
      map = L.map(divRef.current, { center: [lat, lon], zoom: 18 });
      mapRef.current = map;

      // Fond clair
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB © OSM', maxZoom: 22,
      }).addTo(map);

      // Marqueur adresse rouge
      const icon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(239,68,68,.4),0 2px 8px rgba(0,0,0,.5)"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], className: '',
      });
      L.marker([lat, lon], { icon, zIndexOffset: 9999 })
        .addTo(map)
        .bindTooltip('📍 Votre adresse', { permanent: true, direction: 'top', offset: [0, -14] });

      // Charger les parcelles
      try {
        const res = await fetch(`/api/parcelles?lat=${lat}&lon=${lon}`);
        const json = await res.json();
        const features = json.features || [];
        setNb(features.length);

        let bestPoly = null, bestData = null, dMin = Infinity;

        features.forEach(f => {
          const g = f.geometry;
          const p = f.properties || {};
          if (!g) return;

          const pts = g.type === 'Polygon'
            ? g.coordinates[0].map(c => [c[1], c[0]])
            : g.type === 'MultiPolygon'
            ? g.coordinates[0][0].map(c => [c[1], c[0]])
            : null;
          if (!pts || pts.length < 3) return;

          const poly = L.polygon(pts, {
            color: '#94a3b8', weight: 1.5, fillColor: '#e2e8f0', fillOpacity: 0.45,
          }).addTo(map);

          const data = {
            reference: (p.section || '') + (p.numero || ''),
            section: p.section || '',
            numero: p.numero || '',
            surface: p.contenance ? Math.round(p.contenance) : null,
            commune_code: p.commune || '',
          };

          poly.on('mouseover', function() {
            if (this !== selRef.current)
              this.setStyle({ fillColor: '#fde68a', fillOpacity: 0.65, color: '#f59e0b', weight: 2.5 });
            this.bringToFront();
          });
          poly.on('mouseout', function() {
            if (this !== selRef.current)
              this.setStyle({ fillColor: '#e2e8f0', fillOpacity: 0.45, color: '#94a3b8', weight: 1.5 });
          });
          poly.on('click', function() {
            // Désélectionner l'ancien
            if (selRef.current && selRef.current !== this)
              selRef.current.setStyle({ fillColor: '#e2e8f0', fillOpacity: 0.45, color: '#94a3b8', weight: 1.5 });
            // Sélectionner le nouveau
            this.setStyle({ color: '#a07820', weight: 3.5, fillColor: '#fbbf24', fillOpacity: 0.6 });
            this.bringToFront();
            selRef.current = this;
            setSel(data);
            if (onParcelSelect) onParcelSelect(data);
          });

          // Trouver la plus proche de l'adresse
          try {
            const c = poly.getBounds().getCenter();
            const d = Math.abs(c.lat - lat) + Math.abs(c.lng - lon);
            if (d < dMin) { dMin = d; bestPoly = poly; bestData = data; }
          } catch {}
        });

        // Pré-sélectionner
        if (bestPoly && bestData) {
          bestPoly.setStyle({ color: '#a07820', weight: 3.5, fillColor: '#fbbf24', fillOpacity: 0.6 });
          bestPoly.bringToFront();
          selRef.current = bestPoly;
          setSel(bestData);
          if (onParcelSelect) onParcelSelect(bestData);
        }

      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [lat, lon]);

  return (
    <div>
      {/* Info bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 2px rgba(239,68,68,.3)', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#5a5650' }}>
          Votre adresse · <strong style={{ color: '#f2efe9' }}>Cliquez sur votre parcelle</strong> pour la sélectionner
        </span>
        {loading && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#a07820', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 11, height: 11, border: '2px solid rgba(160,120,32,.2)', borderTop: '2px solid #a07820', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
            Chargement parcelles IGN...
          </span>
        )}
        {!loading && nb > 0 && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#3e3a34' }}>{nb} parcelles</span>}
      </div>

      {/* Carte */}
      <div style={{ height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid #1c1c2a', boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
        <div ref={divRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#3e3a34' }}>
        {[['rgba(251,191,36,.6)','#a07820','Sélectionnée'],['rgba(253,230,138,.65)','#f59e0b','Survol'],['rgba(226,232,240,.45)','#94a3b8','Cliquables']].map(([bg,bd,label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 14, height: 10, background: bg, border: `2px solid ${bd}`, borderRadius: 2 }} />
            <span>{label}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto' }}>Cadastre IGN officiel</span>
      </div>

      {/* Résultat */}
      {sel ? (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'rgba(74,222,128,.05)', border: '0.5px solid rgba(74,222,128,.25)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            ✓ Parcelle sélectionnée — champs mis à jour automatiquement
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[['Référence cadastrale', sel.reference || '—'],['Surface terrain', sel.surface ? sel.surface + ' m²' : '—'],['Code INSEE', sel.commune_code || '—']].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f2efe9' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          Cliquez sur votre parcelle pour remplir automatiquement la référence cadastrale et la surface
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .leaflet-interactive{cursor:pointer!important}`}</style>
    </div>
  );
}
