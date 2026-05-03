'use client';
import { useEffect, useRef, useState } from 'react';

export default function CadastreMapClient({ lat, lon, onParcelSelect, defaultParcelle }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [selected, setSelected] = useState(defaultParcelle || null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!lat || !lon || !mapRef.current || mapInstanceRef.current) return;

    // Injecter le CSS Leaflet dynamiquement
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      const Leaflet = L.default || L;

      // Fix icônes Next.js
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = Leaflet.map(mapRef.current, {
        center: [lat, lon],
        zoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      // Fond OpenStreetMap (toujours disponible, pas d'auth)
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 21,
      }).addTo(map);

      // Overlay cadastre IGN WMS public (pas d'auth requise)
      Leaflet.tileLayer.wms('https://wxs.ign.fr/parcellaire/geoportail/r/wms', {
        layers: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
        format: 'image/png',
        transparent: true,
        opacity: 0.6,
        attribution: '© IGN',
        maxZoom: 21,
      }).addTo(map);

      // Marqueur position adresse
      const icon = Leaflet.divIcon({
        html: `<div style="width:14px;height:14px;background:#a07820;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.6)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: '',
      });
      Leaflet.marker([lat, lon], { icon })
        .addTo(map)
        .bindTooltip('Votre adresse', { permanent: false });

      // Groupe couches parcelles
      layerGroupRef.current = Leaflet.layerGroup().addTo(map);

      // Afficher parcelle par défaut si dispo
      if (defaultParcelle?.geometry) drawParcelle(Leaflet, defaultParcelle);

      // Clic sur carte
      map.on('click', async (e) => {
        await fetchAndDraw(Leaflet, e.latlng.lat, e.latlng.lng);
      });

      // Auto-identifier au chargement
      fetchAndDraw(Leaflet, lat, lon);

      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon]);

  async function fetchAndDraw(Leaflet, cLat, cLon) {
    setLoading(true);
    try {
      const r = await fetch(`/api/cadastre?lat=${cLat}&lon=${cLon}`);
      const d = await r.json();
      if (d.parcelle) {
        drawParcelle(Leaflet, d.parcelle);
        setSelected(d.parcelle);
        if (onParcelSelect) onParcelSelect(d.parcelle);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function drawParcelle(Leaflet, parcelle) {
    if (!layerGroupRef.current || !parcelle?.geometry) return;
    layerGroupRef.current.clearLayers();

    const geom = parcelle.geometry;
    const coords =
      geom.type === 'Polygon' ? geom.coordinates[0] :
      geom.type === 'MultiPolygon' ? geom.coordinates[0][0] : null;
    if (!coords) return;

    const layer = Leaflet.polygon(
      coords.map(c => [c[1], c[0]]),
      { color: '#a07820', weight: 3, fillColor: '#e8b420', fillOpacity: 0.25 }
    ).addTo(layerGroupRef.current);

    const ref = [parcelle.section, parcelle.numero].filter(Boolean).join(' ');
    layer.bindPopup(`
      <div style="font-family:Arial;font-size:12px;min-width:140px">
        <b style="color:#a07820">📐 ${ref || 'Parcelle'}</b><br>
        ${parcelle.surface ? `Surface: <b>${Math.round(parcelle.surface)} m²</b><br>` : ''}
        ${parcelle.commune_code ? `INSEE: ${parcelle.commune_code}` : ''}
      </div>
    `).openPopup();

    try { mapInstanceRef.current?.fitBounds(layer.getBounds(), { padding: [40, 40] }); } catch {}
  }

  async function reIdentifier() {
    if (!lat || !lon || !mapInstanceRef.current) return;
    const L = await import('leaflet').then(m => m.default || m);
    await fetchAndDraw(L, lat, lon);
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🖱️ <strong style={{ color: '#f2efe9' }}>Cliquez sur votre parcelle</strong> pour la sélectionner</span>
        <button onClick={reIdentifier} disabled={loading}
          style={{ marginLeft: 'auto', padding: '4px 10px', background: 'rgba(160,120,32,.1)', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 6, color: '#a07820', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
          {loading
            ? <><span style={{ width: 10, height: 10, border: '1.5px solid rgba(160,120,32,.3)', borderTop: '1.5px solid #a07820', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />Chargement...</>
            : '📐 Ré-identifier'}
        </button>
      </div>

      <div style={{ position: 'relative', height: 280, borderRadius: 10, overflow: 'hidden', border: '0.5px solid #1c1c2a' }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexDirection: 'column' }}>
            <span style={{ width: 22, height: 22, border: '2px solid rgba(160,120,32,.3)', borderTop: '2px solid #a07820', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
            <div style={{ fontSize: 12, color: '#5a5650' }}>Chargement de la carte...</div>
          </div>
        )}
        {loading && (
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(14,14,26,.9)', border: '0.5px solid rgba(160,120,32,.4)', borderRadius: 8, padding: '6px 14px', fontSize: 11, color: '#a07820', zIndex: 999 }}>
            🔍 Récupération de la parcelle IGN...
          </div>
        )}
      </div>

      {selected ? (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: '#4ade80', fontWeight: 600 }}>✓ Parcelle sélectionnée</span>
          {selected.section && <span style={{ color: '#c4bfb8' }}>Réf: <strong>{selected.section} {selected.numero}</strong></span>}
          {selected.surface && <span style={{ color: '#c4bfb8' }}>Surface: <strong>{Math.round(selected.surface)} m²</strong></span>}
          {selected.commune_code && <span style={{ color: '#3e3a34' }}>INSEE: {selected.commune_code}</span>}
        </div>
      ) : (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          Cliquez sur votre parcelle sur la carte — les données cadastrales se rempliront automatiquement
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
