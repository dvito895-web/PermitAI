'use client';
import { useEffect, useRef, useState } from 'react';

export default function CadastreMapClient({ lat, lon, onParcelSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const geoJsonLayerRef = useRef(null);
  const selectedFeatureRef = useRef(null);

  useEffect(() => {
    if (!lat || !lon || !mapRef.current) return;

    // Nettoyer
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // CSS Leaflet
    if (!document.getElementById('lf-css')) {
      const link = document.createElement('link');
      link.id = 'lf-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Init après CSS
    const t = setTimeout(() => init(), 400);
    return () => {
      clearTimeout(t);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon]);

  async function init() {
    if (!mapRef.current) return;
    const L = await import('leaflet').then(m => m.default || m);

    // Fix icônes
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current, {
      center: [lat, lon],
      zoom: 18,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Fond carte claire (style urbassist)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB © OSM',
      maxZoom: 22,
    }).addTo(map);

    setMapReady(true);

    // Charger parcelles
    setLoading(true);
    try {
      const res = await fetch(`/api/parcelles?lat=${lat}&lon=${lon}`);
      const geojson = await res.json();

      if (!geojson.features || geojson.features.length === 0) {
        setLoading(false);
        return;
      }

      // Trouver la parcelle de l'adresse (pré-sélection)
      let parcelleAdresse = null;
      let distMin = Infinity;

      geojson.features.forEach(f => {
        if (!f.geometry) return;
        // Centroïde approx
        const coords = f.geometry.type === 'Polygon'
          ? f.geometry.coordinates[0]
          : f.geometry.coordinates[0][0];
        const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        const dist = Math.hypot(cx - lon, cy - lat);
        if (dist < distMin) { distMin = dist; parcelleAdresse = f; }
      });

      // Rendu GeoJSON avec styles
      const geoJsonLayer = L.geoJSON(geojson, {
        style: (feature) => ({
          color: '#64748b',
          weight: 1.5,
          fillColor: feature === parcelleAdresse ? '#fbbf24' : '#cbd5e1',
          fillOpacity: feature === parcelleAdresse ? 0.5 : 0.3,
        }),
        onEachFeature: (feature, layer) => {
          // Hover
          layer.on('mouseover', function () {
            if (feature !== selectedFeatureRef.current) {
              this.setStyle({ fillColor: '#fde68a', fillOpacity: 0.55, color: '#f59e0b', weight: 2 });
              this.bringToFront();
            }
          });
          layer.on('mouseout', function () {
            if (feature !== selectedFeatureRef.current) {
              this.setStyle({ fillColor: '#cbd5e1', fillOpacity: 0.3, color: '#64748b', weight: 1.5 });
            }
          });
          // Clic
          layer.on('click', () => {
            selectFeature(L, geoJsonLayer, feature, layer);
          });
        },
      }).addTo(map);

      geoJsonLayerRef.current = geoJsonLayer;

      // Pré-sélectionner
      if (parcelleAdresse) {
        geoJsonLayer.eachLayer(layer => {
          if (layer.feature === parcelleAdresse) {
            selectFeature(L, geoJsonLayer, parcelleAdresse, layer);
          }
        });
        try {
          map.fitBounds(geoJsonLayer.getBounds(), { padding: [60, 60], maxZoom: 19 });
        } catch {}
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }

    // Marqueur adresse (point rouge par-dessus tout)
    const L2 = await import('leaflet').then(m => m.default || m);
    const icon = L2.divIcon({
      html: `<div style="width:14px;height:14px;background:#ef4444;border:2.5px solid white;border-radius:50%;box-shadow:0 0 0 2px rgba(239,68,68,.4),0 2px 6px rgba(0,0,0,.4)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: '',
    });
    L2.marker([lat, lon], { icon, zIndexOffset: 9999 })
      .addTo(map)
      .bindTooltip('Votre adresse', { permanent: false, direction: 'top' });
  }

  function selectFeature(L, geoJsonLayer, feature, layer) {
    const props = feature.properties || {};

    // Reset tous les styles
    geoJsonLayer.eachLayer(l => {
      if (l.feature === selectedFeatureRef.current && l !== layer) {
        l.setStyle({ fillColor: '#cbd5e1', fillOpacity: 0.3, color: '#64748b', weight: 1.5 });
      }
    });

    // Style sélectionné
    layer.setStyle({
      color: '#a07820',
      weight: 3,
      fillColor: '#fbbf24',
      fillOpacity: 0.55,
    });
    layer.bringToFront();
    selectedFeatureRef.current = feature;

    // Données parcelle
    const parcelle = {
      reference: `${props.section || ''}${props.numero || ''}`,
      section: props.section || '',
      numero: props.numero || '',
      surface: props.contenance ? Math.round(props.contenance) : null,
      commune_code: props.commune || '',
    };

    setSelected(parcelle);

    // *** REMPLIT LES CHAMPS DU WIZARD ***
    if (onParcelSelect) onParcelSelect(parcelle);
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#5a5650', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
          Votre adresse · <strong style={{ color: '#f2efe9' }}>Cliquez sur votre parcelle</strong>
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a07820' }}>
            <div style={{ width: 11, height: 11, border: '2px solid rgba(160,120,32,.2)', borderTop: '2px solid #a07820', borderRadius: '50%', animation: 'cs .7s linear infinite' }} />
            Chargement parcelles IGN...
          </div>
        )}
      </div>

      {/* Carte */}
      <div style={{ position: 'relative', height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid #1c1c2a', boxShadow: '0 4px 24px rgba(0,0,0,.4)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, background: '#0d0d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 999 }}>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(160,120,32,.15)', borderTop: '3px solid #a07820', borderRadius: '50%', animation: 'cs .7s linear infinite' }} />
            <div style={{ fontSize: 12, color: '#5a5650' }}>Chargement de la carte cadastrale...</div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#3e3a34' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 10, background: 'rgba(251,191,36,.5)', border: '2px solid #a07820', borderRadius: 2, display: 'inline-block' }} />
          Parcelle sélectionnée
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 10, background: 'rgba(203,213,225,.3)', border: '1.5px solid #64748b', borderRadius: 2, display: 'inline-block' }} />
          Autres parcelles (cliquables)
        </span>
        <span style={{ marginLeft: 'auto', color: '#2a2a38' }}>Données cadastrales IGN · Cliquez pour changer</span>
      </div>

      {/* Résultat */}
      {selected && (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'linear-gradient(135deg, rgba(74,222,128,.05), rgba(160,120,32,.05))', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            ✓ Parcelle sélectionnée — données enregistrées
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              ['Référence cadastrale', selected.reference],
              ['Surface terrain', selected.surface ? `${selected.surface} m²` : '—'],
              ['Code INSEE', selected.commune_code || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f2efe9' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes cs { to { transform: rotate(360deg); } } .leaflet-container { cursor: default; } .leaflet-interactive { cursor: pointer !important; }`}</style>
    </div>
  );
}
