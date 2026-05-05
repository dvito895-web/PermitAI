// components/MapCadastre.js — Solution définitive IGN 2026
// Tuiles data.geopf.fr + APICarto parcelle + react-leaflet
'use client';
import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icônes Leaflet dans Next.js
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Composant qui capture les clics sur la carte
function ClickCatcher({ onParcelle, setLoading }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setLoading(true);
      try {
        // API officielle IGN — coordonnées en [lng, lat] (WGS84 GeoJSON)
        const geom = JSON.stringify({ type: 'Point', coordinates: [lng, lat] });
        const url = `https://apicarto.ign.fr/api/cadastre/parcelle?geom=${encodeURIComponent(geom)}&source_ign=PCI`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('API IGN indisponible');
        const data = await res.json();
        if (data.features?.length > 0) {
          onParcelle(data.features[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  });
  return null;
}

export default function MapCadastre({ lat, lon, onParcelSelect }) {
  const [parcelle, setParcelle] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleParcelle = useCallback((feature) => {
    setParcelle(feature);
    const props = feature.properties || {};
    const data = {
      reference: (props.section || '') + (props.numero || ''),
      section: props.section || '',
      numero: props.numero || '',
      surface: props.contenance ? Math.round(props.contenance) : null,
      commune_code: props.code_insee || `${props.code_dep || ''}${props.code_com || ''}`,
      idu: props.idu || '',
    };
    if (onParcelSelect) onParcelSelect(data);
  }, [onParcelSelect]);

  // Charger la parcelle de l'adresse au montage
  useState(() => {
    if (!lat || !lon) return;
    const geom = JSON.stringify({ type: 'Point', coordinates: [lon, lat] });
    const url = `https://apicarto.ign.fr/api/cadastre/parcelle?geom=${encodeURIComponent(geom)}&source_ign=PCI`;
    fetch(url)
      .then(r => r.json())
      .then(data => { if (data.features?.length > 0) handleParcelle(data.features[0]); })
      .catch(console.error);
  });

  const parcelleKey = parcelle?.properties?.idu || 'none';

  const adresseIcon = L.divIcon({
    html: `<div style="width:16px;height:16px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(239,68,68,.35),0 2px 8px rgba(0,0,0,.5)"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 8], className: '',
  });

  return (
    <div>
      {/* Barre statut */}
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

      {/* Carte Leaflet */}
      <div style={{ height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid #1c1c2a', boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
        <MapContainer
          center={[lat || 46.603, lon || 1.888]}
          zoom={lat ? 18 : 6}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          {/* Fond Plan IGN — data.geopf.fr (remplace wxs.ign.fr mort en 2024) */}
          <TileLayer
            attribution="© IGN-F / Géoplateforme"
            url="https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}"
            maxNativeZoom={19} maxZoom={22}
          />

          {/* Overlay parcelles cadastrales IGN officiel */}
          <TileLayer
            attribution="Cadastre © DGFiP / IGN"
            url="https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELLAIRE_EXPRESS&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}"
            maxNativeZoom={19} maxZoom={22} opacity={0.85}
          />

          {/* Capteur de clics */}
          <ClickCatcher onParcelle={handleParcelle} setLoading={setLoading} />

          {/* Marqueur adresse */}
          {lat && lon && (
            <Marker position={[lat, lon]} icon={adresseIcon}>
              <Popup>📍 Votre adresse</Popup>
            </Marker>
          )}

          {/* Parcelle sélectionnée en surbrillance */}
          {parcelle && (
            <GeoJSON
              key={parcelleKey}
              data={parcelle}
              style={{ color: '#a07820', weight: 3, fillColor: '#fbbf24', fillOpacity: 0.45 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Résultat */}
      {parcelle && (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'rgba(74,222,128,.05)', border: '0.5px solid rgba(74,222,128,.25)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            ✓ Parcelle sélectionnée — champs mis à jour
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              ['Référence cadastrale', (parcelle.properties?.section || '') + (parcelle.properties?.numero || '')],
              ['Surface terrain', parcelle.properties?.contenance ? `${Math.round(parcelle.properties.contenance)} m²` : '—'],
              ['Code INSEE', parcelle.properties?.code_insee || `${parcelle.properties?.code_dep || ''}${parcelle.properties?.code_com || ''}`],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f2efe9' }}>{v || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes cs{to{transform:rotate(360deg)}} .leaflet-interactive{cursor:pointer!important}`}</style>
    </div>
  );
}
// NOTE INSTALLATION — ajouter dans package.json :
// "react-leaflet": "^4.2.1",
// "leaflet": "^1.9.4"
// Et dans globals.css : @import 'leaflet/dist/leaflet.css';
