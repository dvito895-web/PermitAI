'use client';
import { useEffect, useRef, useState } from 'react';

export default function CadastreMapClient({ lat, lon, onParcelSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const selectedLayerRef = useRef(null);
  const allLayersRef = useRef([]);

  useEffect(() => {
    if (!lat || !lon || !mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    allLayersRef.current = [];
    selectedLayerRef.current = null;

    if (!document.getElementById('lf-css')) {
      const link = document.createElement('link');
      link.id = 'lf-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    setTimeout(initMap, 300);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon]);

  async function initMap() {
    if (!mapRef.current) return;
    const L = await import('leaflet').then(m => m.default || m);
    delete L.Icon.Default.prototype._getIconUrl;

    // *** CARTE TOUJOURS CENTRÉE SUR L'ADRESSE — zoom 18 fixe ***
    const map = L.map(mapRef.current, {
      center: [lat, lon],
      zoom: 18,
      zoomControl: true,
      scrollWheelZoom: true,
      maxZoom: 21,
    });
    mapInstanceRef.current = map;

    // Fond clair style moderne
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB © OSM contributors',
      maxZoom: 21,
    }).addTo(map);

    // Marqueur adresse — toujours visible, rouge, au-dessus de tout
    const pinIcon = L.divIcon({
      html: `<div style="
        width:16px;height:16px;
        background:#ef4444;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 3px rgba(239,68,68,.35), 0 3px 8px rgba(0,0,0,.5);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: '',
    });
    L.marker([lat, lon], { icon: pinIcon, zIndexOffset: 99999 })
      .addTo(map)
      .bindTooltip('📍 Votre adresse', { permanent: true, direction: 'top', offset: [0, -12] });

    // Charger les parcelles
    setLoading(true);
    setStatus('Chargement des parcelles cadastrales...');

    try {
      const r = await fetch(`/api/parcelles?lat=${lat}&lon=${lon}`);
      const geojson = await r.json();
      const features = geojson.features || [];

      if (features.length === 0) {
        setStatus('Aucune parcelle trouvée — vérifiez l\'adresse');
        setLoading(false);
        return;
      }

      setStatus(`${features.length} parcelles chargées`);

      // Trouver la parcelle la plus proche de l'adresse
      let closest = null;
      let closestLayer = null;
      let distMin = Infinity;

      // Rendre chaque parcelle
      features.forEach(feature => {
        const geom = feature.geometry;
        const props = feature.properties || {};
        if (!geom) return;

        // Convertir GeoJSON en coordonnées Leaflet
        let latlngs;
        if (geom.type === 'Polygon') {
          latlngs = geom.coordinates[0].map(c => [c[1], c[0]]);
        } else if (geom.type === 'MultiPolygon') {
          latlngs = geom.coordinates[0][0].map(c => [c[1], c[0]]);
        } else return;

        const polygon = L.polygon(latlngs, {
          color: '#94a3b8',
          weight: 1.5,
          fillColor: '#e2e8f0',
          fillOpacity: 0.4,
          interactive: true,
        }).addTo(map);

        const parcelle = {
          reference: `${props.section || ''}${props.numero || ''}`,
          section: props.section || '',
          numero: props.numero || '',
          surface: props.contenance ? Math.round(props.contenance) : null,
          commune_code: props.commune || '',
        };

        polygon.on('mouseover', function() {
          if (this !== selectedLayerRef.current) {
            this.setStyle({ fillColor: '#fde68a', fillOpacity: 0.6, color: '#d97706', weight: 2.5 });
            this.bringToFront();
          }
        });
        polygon.on('mouseout', function() {
          if (this !== selectedLayerRef.current) {
            this.setStyle({ fillColor: '#e2e8f0', fillOpacity: 0.4, color: '#94a3b8', weight: 1.5 });
          }
        });
        polygon.on('click', function() {
          doSelect(this, parcelle);
        });

        allLayersRef.current.push({ polygon, parcelle });

        // Distance au point adresse
        try {
          const c = polygon.getBounds().getCenter();
          const d = Math.hypot(c.lat - lat, c.lng - lon);
          if (d < distMin) {
            distMin = d;
            closest = parcelle;
            closestLayer = polygon;
          }
        } catch {}
      });

      // Pré-sélectionner la parcelle de l'adresse
      if (closestLayer && closest) {
        doSelect(closestLayer, closest);
      }

    } catch (e) {
      setStatus('Erreur chargement parcelles');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function doSelect(polygon, parcelle) {
    // Reset ancien
    if (selectedLayerRef.current && selectedLayerRef.current !== polygon) {
      selectedLayerRef.current.setStyle({
        color: '#94a3b8', weight: 1.5, fillColor: '#e2e8f0', fillOpacity: 0.4,
      });
    }
    // Sélectionner
    polygon.setStyle({
      color: '#a07820', weight: 3, fillColor: '#fbbf24', fillOpacity: 0.55,
    });
    polygon.bringToFront();
    selectedLayerRef.current = polygon;

    setSelected(parcelle);

    // Remplir les champs du wizard
    if (onParcelSelect) onParcelSelect(parcelle);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 10 }}>
        <div style={{ fontSize: 11, color: '#5a5650', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 0 2px rgba(239,68,68,.3)' }} />
          <span>Votre adresse · <strong style={{ color: '#f2efe9' }}>Cliquez sur votre parcelle</strong></span>
        </div>
        {loading && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a07820' }}>
            <div style={{ width: 12, height: 12, border: '2px solid rgba(160,120,32,.2)', borderTop: '2px solid #a07820', borderRadius: '50%', animation: 'cs .7s linear infinite' }} />
            {status}
          </div>
        )}
      </div>

      {/* Carte */}
      <div style={{ position: 'relative', height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid #1c1c2a', boxShadow: '0 4px 20px rgba(0,0,0,.5)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#3e3a34', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 10, background: 'rgba(251,191,36,.55)', border: '2px solid #a07820', borderRadius: 2 }} />
          <span>Sélectionnée</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 10, background: 'rgba(226,232,240,.4)', border: '1.5px solid #94a3b8', borderRadius: 2 }} />
          <span>Cliquables</span>
        </div>
        {!loading && status && <span style={{ marginLeft: 'auto', color: '#2a2a38' }}>{status}</span>}
      </div>

      {/* Résultat */}
      {selected ? (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'rgba(74,222,128,.05)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 10 }}>
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
                <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f2efe9' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          Cliquez sur votre parcelle — référence et surface se rempliront automatiquement
        </div>
      )}

      <style>{`@keyframes cs{to{transform:rotate(360deg)}} .leaflet-interactive{cursor:pointer!important}`}</style>
    </div>
  );
}
