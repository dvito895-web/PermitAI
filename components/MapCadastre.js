// components/MapCadastre.js
// Carte cadastrale officielle — tuiles cadastre.data.gouv.fr + apicarto IGN
'use client';
import { useEffect, useRef, useState } from 'react';

export default function MapCadastre({ lat, lon, onParcelSelect }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const highlightRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!divRef.current || !lat || !lon) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    if (highlightRef.current) { highlightRef.current = null; }

    (async () => {
      const L = (await import('leaflet')).default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(divRef.current, {
        center: [lat, lon],
        zoom: 18,
        zoomControl: true,
      });
      mapRef.current = map;

      // 1. Fond plan IGN officiel
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB © OSM',
        maxZoom: 22,
        opacity: 1,
      }).addTo(map);

      // 2. Overlay cadastre officiel — tuiles cadastre.data.gouv.fr
      // C'est exactement ce qu'utilise cadastre.gouv.fr
      L.tileLayer(
        'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0' +
        '&LAYER=CADASTRALPARCELS.PARCELLAIRE_EXPRESS&STYLE=PCI vecteur' +
        '&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        {
          attribution: '© IGN — Parcelles cadastrales',
          maxZoom: 22,
          opacity: 0.9,
        }
      ).addTo(map);

      // 3. Marqueur adresse
      const pin = L.divIcon({
        html: `<div style="
          width:16px;height:16px;
          background:#ef4444;
          border:3px solid #fff;
          border-radius:50%;
          box-shadow:0 0 0 3px rgba(239,68,68,.35),0 2px 8px rgba(0,0,0,.6);
        "></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], className: '',
      });
      L.marker([lat, lon], { icon: pin, zIndexOffset: 9999 })
        .addTo(map)
        .bindTooltip('📍 Votre adresse', { permanent: true, direction: 'top', offset: [0, -14] });

      // 4. Clic sur la carte → identifier la parcelle via apicarto IGN
      map.on('click', async (e) => {
        const { lat: cLat, lng: cLon } = e.latlng;
        setLoading(true);
        try {
          // API apicarto — retourne la parcelle exacte au point cliqué
          const r = await fetch(
            `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${cLon}&lat=${cLat}&_limit=1`
          );
          const data = await r.json();
          const feature = data.features?.[0];
          if (!feature) { setLoading(false); return; }

          const props = feature.properties || {};
          const geom = feature.geometry;

          // Supprimer l'ancien highlight
          if (highlightRef.current) {
            map.removeLayer(highlightRef.current);
            highlightRef.current = null;
          }

          // Dessiner la parcelle sélectionnée
          if (geom) {
            const coords = geom.type === 'Polygon'
              ? geom.coordinates[0].map(c => [c[1], c[0]])
              : geom.type === 'MultiPolygon'
              ? geom.coordinates[0][0].map(c => [c[1], c[0]])
              : null;

            if (coords) {
              const highlight = L.polygon(coords, {
                color: '#a07820',
                weight: 3,
                fillColor: '#fbbf24',
                fillOpacity: 0.45,
                dashArray: null,
              }).addTo(map);
              highlightRef.current = highlight;
            }
          }

          const parcelle = {
            reference: (props.section || '') + (props.numero || ''),
            section: props.section || '',
            numero: props.numero || '',
            surface: props.contenance ? Math.round(props.contenance) : null,
            commune_code: props.commune || '',
          };

          setSel(parcelle);
          if (onParcelSelect) onParcelSelect(parcelle);

        } catch (e) {
          // Fallback: notre proxy API
          try {
            const r2 = await fetch(`/api/parcelles?lat=${cLat}&lon=${cLon}`);
            const d2 = await r2.json();
            const f2 = d2.features?.[0];
            if (f2) {
              const p = f2.properties || {};
              const parcelle = {
                reference: (p.section || '') + (p.numero || ''),
                section: p.section || '',
                numero: p.numero || '',
                surface: p.contenance ? Math.round(p.contenance) : null,
                commune_code: p.commune || '',
              };
              setSel(parcelle);
              if (onParcelSelect) onParcelSelect(parcelle);
            }
          } catch {}
        } finally {
          setLoading(false);
        }
      });

      // 5. Auto-identifier la parcelle de l'adresse au chargement
      setLoading(true);
      try {
        const r = await fetch(
          `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}&_limit=1`
        );
        const data = await r.json();
        const feature = data.features?.[0];
        if (feature) {
          const props = feature.properties || {};
          const geom = feature.geometry;

          if (geom) {
            const coords = geom.type === 'Polygon'
              ? geom.coordinates[0].map(c => [c[1], c[0]])
              : geom.type === 'MultiPolygon'
              ? geom.coordinates[0][0].map(c => [c[1], c[0]])
              : null;

            if (coords) {
              const highlight = L.polygon(coords, {
                color: '#a07820', weight: 3,
                fillColor: '#fbbf24', fillOpacity: 0.45,
              }).addTo(map);
              highlightRef.current = highlight;
              try { map.fitBounds(highlight.getBounds(), { padding: [60, 60], maxZoom: 19 }); } catch {}
            }
          }

          const parcelle = {
            reference: (props.section || '') + (props.numero || ''),
            section: props.section || '',
            numero: props.numero || '',
            surface: props.contenance ? Math.round(props.contenance) : null,
            commune_code: props.commune || '',
          };
          setSel(parcelle);
          if (onParcelSelect) onParcelSelect(parcelle);
        }
      } catch {}
      finally { setLoading(false); }

    })();

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [lat, lon]);

  return (
    <div>
      {/* Barre */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <div style={{ fontSize: 11, color: '#5a5650', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 2px rgba(239,68,68,.3)', flexShrink: 0 }} />
          <span>Cadastre officiel IGN · <strong style={{ color: '#f2efe9' }}>Cliquez sur votre parcelle</strong></span>
        </div>
        {loading && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a07820' }}>
            <div style={{ width: 11, height: 11, border: '2px solid rgba(160,120,32,.2)', borderTop: '2px solid #a07820', borderRadius: '50%', animation: 'cs .7s linear infinite' }} />
            Identification de la parcelle...
          </div>
        )}
      </div>

      {/* Carte */}
      <div style={{ height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid #1c1c2a', boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
        <div ref={divRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Résultat */}
      {sel ? (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'rgba(74,222,128,.05)', border: '0.5px solid rgba(74,222,128,.25)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            ✓ Parcelle sélectionnée — champs mis à jour
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              ['Référence cadastrale', sel.reference || '—'],
              ['Surface terrain', sel.surface ? `${sel.surface} m²` : '—'],
              ['Code INSEE', sel.commune_code || '—'],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f2efe9' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          Cliquez sur votre parcelle pour récupérer la référence cadastrale et la surface officielles
        </div>
      )}

      <style>{`
        @keyframes cs { to { transform: rotate(360deg); } }
        .leaflet-interactive { cursor: crosshair !important; }
        .leaflet-container { cursor: crosshair !important; }
      `}</style>
    </div>
  );
}
