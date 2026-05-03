// app/components/CadastreMapClient.js
// Composant carte interactive avec Leaflet installé en npm
'use client';
import { useEffect, useRef, useState } from 'react';

export default function CadastreMapClient({ lat, lon, onParcelSelect, defaultParcelle }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [selected, setSelected] = useState(defaultParcelle || null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [baseLayer, setBaseLayer] = useState('plan');

  useEffect(() => {
    if (!lat || !lon || !mapRef.current || mapInstanceRef.current) return;

    // Import Leaflet dynamiquement (installé en npm donc pas de blocage CDN)
    import('leaflet').then(L => {
      const Leaflet = L.default || L;

      // Fix icônes Leaflet dans Next.js
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = Leaflet.map(mapRef.current, {
        center: [lat, lon],
        zoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Fond Plan IGN
      const planLayer = Leaflet.tileLayer(
        'https://wxs.ign.fr/cartes/geoportail/r/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        { attribution: '© IGN', maxZoom: 20 }
      );

      // Fond Satellite IGN
      const satLayer = Leaflet.tileLayer(
        'https://wxs.ign.fr/ortho/geoportail/r/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        { attribution: '© IGN', maxZoom: 20 }
      );

      // Overlay Cadastre IGN (parcelles)
      const cadastreLayer = Leaflet.tileLayer.wms(
        'https://wxs.ign.fr/parcellaire/geoportail/r/wms',
        {
          layers: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
          format: 'image/png',
          transparent: true,
          opacity: 0.7,
          attribution: '© IGN Cadastre',
          maxZoom: 21,
        }
      );

      // Ajouter plan par défaut + cadastre
      planLayer.addTo(map);
      cadastreLayer.addTo(map);

      // Contrôle de couches
      const baseLayers = {
        '🗺️ Plan IGN': planLayer,
        '🛰️ Satellite': satLayer,
      };
      const overlays = {
        '📐 Parcelles cadastrales': cadastreLayer,
      };
      Leaflet.control.layers(baseLayers, overlays, { position: 'topright' }).addTo(map);

      // Marqueur position de l'adresse
      const adresseIcon = Leaflet.divIcon({
        html: `<div style="width:16px;height:16px;background:#a07820;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '',
      });
      Leaflet.marker([lat, lon], { icon: adresseIcon })
        .addTo(map)
        .bindTooltip('Votre adresse', { permanent: false });

      // Groupe pour les parcelles sélectionnées
      layerGroupRef.current = Leaflet.layerGroup().addTo(map);

      // Si parcelle déjà connue, l'afficher
      if (defaultParcelle?.geometry) {
        drawParcelle(Leaflet, defaultParcelle);
      }

      // Clic sur carte → identifier la parcelle
      map.on('click', async (e) => {
        const { lat: cLat, lng: cLon } = e.latlng;
        await fetchParcelle(Leaflet, cLat, cLon);
      });

      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon]);

  async function fetchParcelle(Leaflet, cLat, cLon) {
    setLoading(true);
    try {
      const r = await fetch(`/api/cadastre?lat=${cLat}&lon=${cLon}`);
      const d = await r.json();
      if (d.parcelle) {
        drawParcelle(Leaflet || (await import('leaflet').then(L => L.default || L)), d.parcelle);
        setSelected(d.parcelle);
        if (onParcelSelect) onParcelSelect(d.parcelle);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function drawParcelle(Leaflet, parcelle) {
    if (!layerGroupRef.current || !parcelle.geometry) return;
    layerGroupRef.current.clearLayers();

    const style = {
      color: '#a07820',
      weight: 3,
      fillColor: '#e8b420',
      fillOpacity: 0.25,
    };

    let layer;
    const geom = parcelle.geometry;
    if (geom.type === 'Polygon') {
      layer = Leaflet.polygon(geom.coordinates[0].map(c => [c[1], c[0]]), style);
    } else if (geom.type === 'MultiPolygon') {
      layer = Leaflet.polygon(geom.coordinates[0][0].map(c => [c[1], c[0]]), style);
    }

    if (layer) {
      layer.addTo(layerGroupRef.current);
      const ref = [parcelle.section, parcelle.numero].filter(Boolean).join(' ');
      layer.bindPopup(`
        <div style="font-family:Arial,sans-serif;font-size:13px;min-width:150px">
          <strong style="color:#a07820">📐 ${ref || 'Parcelle'}</strong><br>
          ${parcelle.surface ? `Surface: <strong>${Math.round(parcelle.surface)} m²</strong><br>` : ''}
          ${parcelle.commune_code ? `INSEE: ${parcelle.commune_code}` : ''}
          <br><br>
          <button onclick="window.selectThisParcelle()" style="background:#a07820;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:12px;width:100%">
            ✓ Sélectionner cette parcelle
          </button>
        </div>
      `).openPopup();

      // Handler pour le bouton dans le popup
      window.selectThisParcelle = () => {
        setSelected(parcelle);
        if (onParcelSelect) onParcelSelect(parcelle);
        if (mapInstanceRef.current) mapInstanceRef.current.closePopup();
      };

      try { mapInstanceRef.current?.fitBounds(layer.getBounds(), { padding: [30, 30] }); } catch {}
    }
  }

  async function identifierDepuisAdresse() {
    if (!lat || !lon) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/cadastre?lat=${lat}&lon=${lon}`);
      const d = await r.json();
      if (d.parcelle) {
        const L = await import('leaflet').then(mod => mod.default || mod);
        drawParcelle(L, d.parcelle);
        setSelected(d.parcelle);
        if (onParcelSelect) onParcelSelect(d.parcelle);
      }
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <div>
      {/* Instructions */}
      <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🖱️ <strong style={{ color: '#f2efe9' }}>Cliquez sur votre parcelle</strong> sur la carte pour la sélectionner</span>
        <button onClick={identifierDepuisAdresse} disabled={loading}
          style={{ padding: '4px 12px', background: 'rgba(160,120,32,.1)', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 6, color: '#a07820', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', flexShrink: 0 }}>
          {loading
            ? <><span style={{ display:'inline-block',width:10,height:10,border:'1.5px solid rgba(160,120,32,.3)',borderTop:'1.5px solid #a07820',borderRadius:'50%',animation:'spin .8s linear infinite' }} />Identification...</>
            : '📐 Auto-identifier'}
        </button>
      </div>

      {/* Carte */}
      <div style={{ position: 'relative', height: 280, borderRadius: 10, overflow: 'hidden', border: '0.5px solid #1c1c2a' }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, background: '#0a0a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ display:'inline-block',width:24,height:24,border:'2.5px solid rgba(160,120,32,.3)',borderTop:'2.5px solid #a07820',borderRadius:'50%',animation:'spin .8s linear infinite' }} />
            <div style={{ fontSize: 12, color: '#5a5650' }}>Chargement de la carte...</div>
          </div>
        )}
        {loading && (
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(14,14,26,.92)', border: '0.5px solid rgba(160,120,32,.4)', borderRadius: 8, padding: '7px 14px', fontSize: 11, color: '#a07820', zIndex: 999, whiteSpace: 'nowrap' }}>
            🔍 Récupération de la parcelle...
          </div>
        )}
      </div>

      {/* Résultat sélection */}
      {selected ? (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>✓ Parcelle sélectionnée</span>
          {selected.section && <span style={{ fontSize: 12, color: '#c4bfb8' }}>Réf: <strong>{selected.section} {selected.numero}</strong></span>}
          {selected.surface && <span style={{ fontSize: 12, color: '#c4bfb8' }}>Surface: <strong>{Math.round(selected.surface)} m²</strong></span>}
          {selected.commune_code && <span style={{ fontSize: 11, color: '#3e3a34' }}>INSEE: {selected.commune_code}</span>}
          <button onClick={() => { setSelected(null); if (layerGroupRef.current) layerGroupRef.current.clearLayers(); }}
            style={{ marginLeft: 'auto', padding: '3px 8px', background: 'transparent', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 5, color: '#ef4444', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
            Changer
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          Cliquez sur la carte ou sur "Auto-identifier" — données cadastrales IGN officielles
        </div>
      )}
    </div>
  );
}
