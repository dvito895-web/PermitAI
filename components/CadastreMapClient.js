'use client';
import { useEffect, useRef, useState } from 'react';

export default function CadastreMapClient({ lat, lon, onParcelSelect, defaultParcelle }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selected, setSelected] = useState(defaultParcelle || null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const allPolygonsRef = useRef([]);
  const selectedPolygonRef = useRef(null);

  useEffect(() => {
    if (!lat || !lon || !mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    allPolygonsRef.current = [];
    selectedPolygonRef.current = null;

    // Injecter CSS Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      const Lf = L.default || L;

      // Fix icônes Leaflet Next.js
      delete Lf.Icon.Default.prototype._getIconUrl;
      Lf.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = Lf.map(mapRef.current, {
        center: [lat, lon],
        zoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      // Fond OSM
      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 21,
      }).addTo(map);

      setMapReady(true);

      // Marqueur rouge visible pour l'adresse
      const markerIcon = Lf.divIcon({
        html: `<div style="
          width: 20px; height: 20px;
          background: #ef4444;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,.7);
          position: relative;
          z-index: 1000;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: '',
      });

      Lf.marker([lat, lon], { icon: markerIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip('📍 Votre adresse', { permanent: true, direction: 'top', offset: [0, -14] });

      // Charger les parcelles
      chargerParcelles(Lf, map);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon]);

  async function chargerParcelles(Lf, map) {
    setLoading(true);
    try {
      // API IGN apicarto — retourne les parcelles autour du point
      const url = `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}&_limit=30`;
      const r = await fetch(url);

      if (!r.ok) throw new Error('API indisponible');

      const data = await r.json();
      const features = data.features || [];

      if (features.length === 0) throw new Error('Aucune parcelle');

      let parcelleInitiale = null;
      let distanceMin = Infinity;

      features.forEach((feature) => {
        const props = feature.properties;
        const geom = feature.geometry;
        if (!geom) return;

        const coords = geom.type === 'Polygon'
          ? geom.coordinates[0].map(c => [c[1], c[0]])
          : geom.type === 'MultiPolygon'
          ? geom.coordinates[0][0].map(c => [c[1], c[0]])
          : null;

        if (!coords || coords.length < 3) return;

        const parcelle = {
          section: props.section || '',
          numero: props.numero || '',
          reference: `${props.section || ''}${props.numero || ''}`,
          surface: props.contenance || null,
          commune_code: props.commune || '',
          geometry: geom,
        };

        // Style normal
        const polygon = Lf.polygon(coords, {
          color: '#9ca3af',
          weight: 1.5,
          fillColor: '#f3f4f6',
          fillOpacity: 0.3,
          interactive: true,
        }).addTo(map);

        // Hover
        polygon.on('mouseover', function() {
          if (this !== selectedPolygonRef.current) {
            this.setStyle({ fillColor: '#fde68a', fillOpacity: 0.5, color: '#d97706', weight: 2 });
          }
          this.bringToFront();
        });
        polygon.on('mouseout', function() {
          if (this !== selectedPolygonRef.current) {
            this.setStyle({ fillColor: '#f3f4f6', fillOpacity: 0.3, color: '#9ca3af', weight: 1.5 });
          }
        });

        // Clic — sélectionner la parcelle
        polygon.on('click', function() {
          selectionnerParcelle(Lf, map, this, parcelle);
        });

        allPolygonsRef.current.push({ polygon, parcelle });

        // Trouver la parcelle la plus proche de l'adresse
        try {
          const bounds = polygon.getBounds();
          const center = bounds.getCenter();
          const dist = Math.abs(center.lat - lat) + Math.abs(center.lng - lon);
          if (dist < distanceMin) {
            distanceMin = dist;
            parcelleInitiale = { polygon, parcelle };
          }
        } catch {}
      });

      // Pré-sélectionner la parcelle de l'adresse
      if (parcelleInitiale) {
        selectionnerParcelle(Lf, map, parcelleInitiale.polygon, parcelleInitiale.parcelle);
        // Zoom sur la parcelle sélectionnée
        try {
          map.fitBounds(parcelleInitiale.polygon.getBounds(), { padding: [50, 50], maxZoom: 19 });
        } catch {}
      }

    } catch (err) {
      console.error('Erreur parcelles IGN:', err);
      // Fallback: API cadastre interne
      try {
        const r2 = await fetch(`/api/cadastre?lat=${lat}&lon=${lon}`);
        const d2 = await r2.json();
        if (d2.parcelle) {
          handleSelectParcelle(d2.parcelle);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  function selectionnerParcelle(Lf, map, polygon, parcelle) {
    // Désélectionner l'ancienne
    if (selectedPolygonRef.current && selectedPolygonRef.current !== polygon) {
      selectedPolygonRef.current.setStyle({
        color: '#9ca3af', weight: 1.5, fillColor: '#f3f4f6', fillOpacity: 0.3,
      });
    }

    // Sélectionner la nouvelle
    polygon.setStyle({
      color: '#a07820',
      weight: 3,
      fillColor: '#fbbf24',
      fillOpacity: 0.4,
    });
    polygon.bringToFront();
    selectedPolygonRef.current = polygon;

    // Appeler le callback parent — remplit les champs
    handleSelectParcelle(parcelle);
  }

  function handleSelectParcelle(parcelle) {
    setSelected(parcelle);
    // Appel du parent avec toutes les données
    if (onParcelSelect) {
      onParcelSelect({
        reference: parcelle.reference || `${parcelle.section}${parcelle.numero}`,
        section: parcelle.section,
        numero: parcelle.numero,
        surface: parcelle.surface,
        commune_code: parcelle.commune_code,
        geometry: parcelle.geometry,
      });
    }
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>
          🔴 = votre adresse · 
          <strong style={{ color: '#f2efe9' }}> Cliquez sur une parcelle</strong> pour la sélectionner
        </span>
        {loading && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, color: '#a07820', fontSize: 11 }}>
            <span style={{ width: 10, height: 10, border: '1.5px solid rgba(160,120,32,.3)', borderTop: '1.5px solid #a07820', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
            Chargement parcelles...
          </span>
        )}
      </div>

      <div style={{ position: 'relative', height: 300, borderRadius: 10, overflow: 'hidden', border: '0.5px solid #1c1c2a' }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
            <span style={{ width: 22, height: 22, border: '2px solid rgba(160,120,32,.3)', borderTop: '2px solid #a07820', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
            <div style={{ fontSize: 12, color: '#5a5650' }}>Chargement de la carte...</div>
          </div>
        )}
      </div>

      {selected ? (
        <div style={{ marginTop: 8, padding: '12px 14px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, marginBottom: 8 }}>✓ Parcelle sélectionnée — champs auto-remplis</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
            {selected.reference && (
              <span style={{ color: '#c4bfb8' }}>
                Référence : <strong style={{ color: '#f2efe9' }}>{selected.reference}</strong>
              </span>
            )}
            {selected.surface && (
              <span style={{ color: '#c4bfb8' }}>
                Surface : <strong style={{ color: '#f2efe9' }}>{Math.round(selected.surface)} m²</strong>
              </span>
            )}
            {selected.commune_code && (
              <span style={{ color: '#3e3a34' }}>INSEE : {selected.commune_code}</span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          Cliquez sur votre parcelle pour remplir automatiquement la référence et la surface
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* 
IMPORTANT — dans wizard/page.js, la fonction handleParcelSelect doit être :

function handleParcelSelect(parcelle) {
  if (parcelle.reference) setField('reference_cadastrale', parcelle.reference);
  if (parcelle.surface) setField('surface_terrain', Math.round(parcelle.surface));
  if (parcelle.commune_code) setField('code_insee', parcelle.commune_code);
}

Et le composant CadastreMap doit être appelé ainsi :
<CadastreMap
  lat={addrCoords?.lat}
  lon={addrCoords?.lon}
  onParcelSelect={handleParcelSelect}
/>
*/
