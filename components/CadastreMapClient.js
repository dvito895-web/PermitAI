'use client';
import { useEffect, useRef, useState } from 'react';

export default function CadastreMapClient({ lat, lon, onParcelSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const polygonsRef = useRef([]);
  const selectedRef = useRef(null);
  const LeafletRef = useRef(null);

  useEffect(() => {
    if (!lat || !lon || !mapRef.current) return;

    // Nettoyer carte existante
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    polygonsRef.current = [];
    selectedRef.current = null;

    // CSS Leaflet
    if (!document.getElementById('lf-css')) {
      const l = document.createElement('link');
      l.id = 'lf-css';
      l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }

    // Attendre que le CSS soit chargé puis init carte
    setTimeout(() => initMap(), 300);

    async function initMap() {
      const L = await import('leaflet').then(m => m.default || m);
      LeafletRef.current = L;

      if (!mapRef.current) return;

      // Corriger icônes
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [lat, lon],
        zoom: 18,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // Tuiles OSM
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 22,
      }).addTo(map);

      setMapReady(true);

      // Marqueur adresse bien visible
      const pin = L.divIcon({
        html: `<div style="width:18px;height:18px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px #ef4444;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        className: '',
      });
      L.marker([lat, lon], { icon: pin, zIndexOffset: 9999 })
        .addTo(map)
        .bindTooltip('📍 Votre adresse', { permanent: true, direction: 'top', offset: [0, -12] });

      // Charger les parcelles via notre proxy API
      setLoading(true);
      try {
        const r = await fetch(`/api/parcelles?lat=${lat}&lon=${lon}`);
        const data = await r.json();
        const features = data.features || [];

        if (features.length === 0) {
          // Aucune parcelle — fallback
          setLoading(false);
          return;
        }

        let bestPolygon = null;
        let bestDist = Infinity;

        features.forEach((feature) => {
          const props = feature.properties || {};
          const geom = feature.geometry;
          if (!geom) return;

          // Convertir coordonnées GeoJSON → Leaflet [lat, lon]
          let coords;
          if (geom.type === 'Polygon') {
            coords = geom.coordinates[0].map(c => [c[1], c[0]]);
          } else if (geom.type === 'MultiPolygon') {
            coords = geom.coordinates[0][0].map(c => [c[1], c[0]]);
          } else return;

          if (!coords || coords.length < 3) return;

          const parcelle = {
            reference: `${props.section || ''}${props.numero || ''}`,
            section: props.section || '',
            numero: props.numero || '',
            surface: props.contenance || null,
            commune_code: props.commune || '',
            geometry: geom,
          };

          // Créer le polygone Leaflet
          const polygon = L.polygon(coords, {
            color: '#94a3b8',
            weight: 1.5,
            fillColor: '#e2e8f0',
            fillOpacity: 0.35,
          });

          polygon.addTo(map);

          // Événements hover + clic
          polygon.on('mouseover', function () {
            if (this !== selectedRef.current) {
              this.setStyle({ fillColor: '#fde68a', fillOpacity: 0.55, color: '#f59e0b', weight: 2.5 });
            }
          });
          polygon.on('mouseout', function () {
            if (this !== selectedRef.current) {
              this.setStyle({ fillColor: '#e2e8f0', fillOpacity: 0.35, color: '#94a3b8', weight: 1.5 });
            }
          });
          polygon.on('click', function () {
            choisirParcelle(L, this, parcelle);
          });

          polygonsRef.current.push({ polygon, parcelle });

          // Trouver la plus proche de l'adresse
          try {
            const c = polygon.getBounds().getCenter();
            const dist = Math.hypot(c.lat - lat, c.lng - lon);
            if (dist < bestDist) {
              bestDist = dist;
              bestPolygon = { polygon, parcelle };
            }
          } catch {}
        });

        // Pré-sélectionner la parcelle de l'adresse
        if (bestPolygon) {
          choisirParcelle(L, bestPolygon.polygon, bestPolygon.parcelle);
          try {
            map.fitBounds(bestPolygon.polygon.getBounds(), { padding: [60, 60], maxZoom: 19 });
          } catch {}
        }

      } catch (e) {
        console.error('Erreur chargement parcelles:', e);
      } finally {
        setLoading(false);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon]);

  function choisirParcelle(L, polygon, parcelle) {
    // Reset ancien style
    if (selectedRef.current && selectedRef.current !== polygon) {
      selectedRef.current.setStyle({
        fillColor: '#e2e8f0', fillOpacity: 0.35, color: '#94a3b8', weight: 1.5,
      });
    }

    // Style sélectionné
    polygon.setStyle({
      color: '#a07820',
      weight: 3.5,
      fillColor: '#fbbf24',
      fillOpacity: 0.5,
    });
    polygon.bringToFront();
    selectedRef.current = polygon;

    // Mettre à jour state
    setSelected(parcelle);

    // *** APPEL DU CALLBACK — remplit les champs du wizard ***
    if (onParcelSelect) {
      onParcelSelect({
        reference: parcelle.reference,
        section: parcelle.section,
        numero: parcelle.numero,
        surface: parcelle.surface ? Math.round(parcelle.surface) : null,
        commune_code: parcelle.commune_code,
        geometry: parcelle.geometry,
      });
    }
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Barre info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#5a5650' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#ef4444', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          Votre adresse ·{' '}
          <strong style={{ color: '#f2efe9' }}>Cliquez sur une parcelle</strong> pour la sélectionner
        </div>
        {loading && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a07820' }}>
            <span style={{ width: 12, height: 12, border: '2px solid rgba(160,120,32,.2)', borderTop: '2px solid #a07820', borderRadius: '50%', display: 'inline-block', animation: 'cadastre-spin .7s linear infinite' }} />
            Chargement parcelles IGN...
          </div>
        )}
      </div>

      {/* Carte */}
      <div style={{ position: 'relative', height: 300, borderRadius: 10, overflow: 'hidden', border: '0.5px solid #2d2d3a' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, background: '#0d0d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 10 }}>
            <div style={{ width: 24, height: 24, border: '2.5px solid rgba(160,120,32,.2)', borderTop: '2.5px solid #a07820', borderRadius: '50%', animation: 'cadastre-spin .7s linear infinite' }} />
            <div style={{ fontSize: 12, color: '#5a5650' }}>Initialisation de la carte...</div>
          </div>
        )}
      </div>

      {/* Résultat sélection */}
      <div style={{ marginTop: 8 }}>
        {selected ? (
          <div style={{ padding: '12px 16px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.25)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>
              ✓ Parcelle sélectionnée — champs mis à jour automatiquement
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12 }}>
              {selected.reference && (
                <div>
                  <span style={{ color: '#5a5650', textTransform: 'uppercase', fontSize: 10 }}>Référence</span>
                  <div style={{ color: '#f2efe9', fontWeight: 600, fontSize: 14 }}>{selected.reference}</div>
                </div>
              )}
              {selected.surface && (
                <div>
                  <span style={{ color: '#5a5650', textTransform: 'uppercase', fontSize: 10 }}>Surface</span>
                  <div style={{ color: '#f2efe9', fontWeight: 600, fontSize: 14 }}>{selected.surface} m²</div>
                </div>
              )}
              {selected.commune_code && (
                <div>
                  <span style={{ color: '#5a5650', textTransform: 'uppercase', fontSize: 10 }}>INSEE</span>
                  <div style={{ color: '#f2efe9', fontWeight: 600, fontSize: 14 }}>{selected.commune_code}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          !loading && (
            <div style={{ padding: '10px 14px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
              Cliquez sur votre parcelle — référence cadastrale et surface se rempliront automatiquement
            </div>
          )
        )}
      </div>

      <style>{`@keyframes cadastre-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
