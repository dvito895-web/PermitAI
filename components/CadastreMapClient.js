'use client';
import { useEffect, useRef, useState } from 'react';

export default function CadastreMapClient({ lat, lon, onParcelSelect, defaultParcelle }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selected, setSelected] = useState(defaultParcelle || null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const layersRef = useRef({}); // stocke toutes les parcelles rendues
  const selectedLayerRef = useRef(null);

  useEffect(() => {
    if (!lat || !lon || !mapRef.current || mapInstanceRef.current) return;

    // CSS Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      const Lf = L.default || L;

      // Fix icônes
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

      // Charger et afficher toutes les parcelles autour de l'adresse
      loadParcelles(Lf, map, lat, lon);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon]);

  async function loadParcelles(Lf, map, centerLat, centerLon) {
    setLoading(true);
    try {
      // Récupérer toutes les parcelles autour de l'adresse via API IGN
      const url = `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${centerLon}&lat=${centerLat}&_limit=50`;
      const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await r.json();

      if (!data.features || data.features.length === 0) {
        // Fallback: identifier juste la parcelle de l'adresse
        const fallback = await fetch(`/api/cadastre?lat=${centerLat}&lon=${centerLon}`);
        const fd = await fallback.json();
        if (fd.parcelle) preselectParcelle(Lf, map, fd.parcelle, true);
        return;
      }

      // Trouver quelle parcelle contient notre adresse
      let parcelleAdresse = null;

      // Rendre chaque parcelle comme polygone cliquable
      data.features.forEach(feature => {
        const props = feature.properties;
        const parcelle = {
          section: props.section,
          numero: props.numero,
          reference: `${props.section}${props.numero}`,
          surface: props.contenance,
          commune_code: props.commune,
          geometry: feature.geometry,
        };

        const coords = getCoords(feature.geometry);
        if (!coords) return;

        const polygon = Lf.polygon(coords, {
          color: '#6b7280',
          weight: 1.5,
          fillColor: '#e5e7eb',
          fillOpacity: 0.2,
          className: 'parcelle-polygon',
        }).addTo(map);

        polygon.on('click', () => selectParcelle(Lf, map, polygon, parcelle));
        polygon.on('mouseover', () => {
          if (polygon !== selectedLayerRef.current) {
            polygon.setStyle({ fillColor: '#fde68a', fillOpacity: 0.4, color: '#d97706', weight: 2 });
          }
        });
        polygon.on('mouseout', () => {
          if (polygon !== selectedLayerRef.current) {
            polygon.setStyle({ color: '#6b7280', weight: 1.5, fillColor: '#e5e7eb', fillOpacity: 0.2 });
          }
        });

        layersRef.current[parcelle.reference] = { polygon, parcelle };

        // Vérifier si cette parcelle contient notre adresse (point-in-polygon approximatif)
        if (!parcelleAdresse && isPointInBounds(centerLat, centerLon, polygon)) {
          parcelleAdresse = { polygon, parcelle };
        }
      });

      // Pré-sélectionner la parcelle de l'adresse
      if (parcelleAdresse) {
        selectParcelle(Lf, map, parcelleAdresse.polygon, parcelleAdresse.parcelle, false);
      } else {
        // Fallback API cadastre
        const fallback = await fetch(`/api/cadastre?lat=${centerLat}&lon=${centerLon}`);
        const fd = await fallback.json();
        if (fd.parcelle) preselectParcelle(Lf, map, fd.parcelle, false);
      }

    } catch (e) {
      console.error('Erreur chargement parcelles:', e);
      // Fallback complet
      try {
        const fallback = await fetch(`/api/cadastre?lat=${centerLat}&lon=${centerLon}`);
        const fd = await fallback.json();
        if (fd.parcelle) preselectParcelle(null, map, fd.parcelle, true);
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  function getCoords(geometry) {
    if (!geometry) return null;
    if (geometry.type === 'Polygon') return geometry.coordinates[0].map(c => [c[1], c[0]]);
    if (geometry.type === 'MultiPolygon') return geometry.coordinates[0][0].map(c => [c[1], c[0]]);
    return null;
  }

  function isPointInBounds(lat, lon, polygon) {
    try {
      const bounds = polygon.getBounds();
      return bounds.contains([lat, lon]);
    } catch { return false; }
  }

  function selectParcelle(Lf, map, polygon, parcelle, fitBounds = true) {
    // Réinitialiser l'ancienne sélection
    if (selectedLayerRef.current && selectedLayerRef.current !== polygon) {
      selectedLayerRef.current.setStyle({
        color: '#6b7280', weight: 1.5, fillColor: '#e5e7eb', fillOpacity: 0.2
      });
    }

    // Mettre en surbrillance la parcelle sélectionnée
    polygon.setStyle({
      color: '#a07820',
      weight: 3,
      fillColor: '#e8b420',
      fillOpacity: 0.35,
    });
    polygon.bringToFront();
    selectedLayerRef.current = polygon;

    // Popup avec infos
    const ref = [parcelle.section, parcelle.numero].filter(Boolean).join(' ');
    polygon.bindPopup(`
      <div style="font-family:Arial;font-size:12px;min-width:150px">
        <b style="color:#a07820">📐 Parcelle ${ref}</b><br>
        ${parcelle.surface ? `Surface : <b>${Math.round(parcelle.surface)} m²</b><br>` : ''}
        ${parcelle.commune_code ? `INSEE : ${parcelle.commune_code}` : ''}
        <div style="margin-top:8px;padding:6px;background:#f0fff4;border-radius:4px;font-size:11px;color:#065f46">
          ✓ Parcelle sélectionnée
        </div>
      </div>
    `).openPopup();

    if (fitBounds) {
      try { map.fitBounds(polygon.getBounds(), { padding: [40, 40] }); } catch {}
    }

    setSelected(parcelle);
    if (onParcelSelect) onParcelSelect(parcelle);
  }

  function preselectParcelle(Lf, map, parcelle, fitBounds) {
    // Utilisé quand on a juste la géométrie depuis l'API (pas depuis la liste)
    if (!Lf && !mapInstanceRef.current) return;
    const L = Lf;
    if (!L || !parcelle?.geometry) return;

    const coords = getCoords(parcelle.geometry);
    if (!coords) return;

    const polygon = L.polygon(coords, {
      color: '#a07820', weight: 3, fillColor: '#e8b420', fillOpacity: 0.35,
    }).addTo(map || mapInstanceRef.current);

    selectedLayerRef.current = polygon;
    if (fitBounds) {
      try { (map || mapInstanceRef.current).fitBounds(polygon.getBounds(), { padding: [40, 40] }); } catch {}
    }

    setSelected(parcelle);
    if (onParcelSelect) onParcelSelect(parcelle);
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🖱️ <strong style={{ color: '#f2efe9' }}>Cliquez sur une parcelle</strong> pour la sélectionner — en jaune = sélectionnée</span>
        {loading && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', fontSize: 11, color: '#a07820' }}>
            <span style={{ width: 10, height: 10, border: '1.5px solid rgba(160,120,32,.3)', borderTop: '1.5px solid #a07820', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
            Chargement parcelles IGN...
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
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: '#4ade80', fontWeight: 600 }}>✓ Parcelle sélectionnée</span>
          {selected.section && (
            <span style={{ color: '#c4bfb8' }}>
              Réf: <strong>{selected.section} {selected.numero}</strong>
            </span>
          )}
          {selected.surface && (
            <span style={{ color: '#c4bfb8' }}>
              Surface: <strong>{Math.round(selected.surface)} m²</strong>
            </span>
          )}
          {selected.commune_code && (
            <span style={{ color: '#3e3a34' }}>INSEE: {selected.commune_code}</span>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(160,120,32,.04)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 11, color: '#5a5650' }}>
          Cliquez sur votre parcelle — référence et surface se rempliront automatiquement
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .parcelle-polygon { cursor: pointer; }
      `}</style>
    </div>
  );
}
