'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/**
 * MAP CADASTRE - VERSION PREMIUM VERCEL-READY
 * Solution définitive IGN 2026 (Géoplateforme)
 */

// Fix icônes Leaflet dans Next.js (Sécurité SSR)
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Composant qui capture les clics sur la carte
function ClickCatcher({ onParcelle, setLoading }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setLoading(true);
      try {
        // Appel proxy serveur (gère buffer bbox + normalisation contenance/contenancedgfip)
        const url = `/api/cadastre-proxy?lon=${lng}&lat=${lat}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('API IGN indisponible');
        const data = await res.json();
        if (data.features?.length > 0) {
          onParcelle(data.features[0]);
        }
      } catch (e) {
        console.error('Erreur API IGN:', e);
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
  const [mounted, setMounted] = useState(false);

  // Refs anti-boucle : bloque le re-fetch lors des re-renders.
  const initialLoadedRef = useRef(false);
  const lastCoordsRef = useRef(null);

  // Sécurité SSR : on monte le composant uniquement côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleParcelle = useCallback((feature) => {
    setParcelle(feature);
    const props = feature.properties || {};
    const contenance = props.contenance || props.contenancedgfip || props.surface_m2 || 0;
    const data = {
      reference: (props.section || '') + (props.numero || ''),
      section: props.section || '',
      numero: props.numero || '',
      surface: contenance > 0 ? Math.round(contenance) : null,
      commune: props.nom_com || '',
      commune_code: props.code_insee || `${props.code_dep || ''}${props.code_com || ''}`,
      idu: props.idu || '',
      geometry: feature.geometry,
    };
    if (onParcelSelect) onParcelSelect(data);
  }, [onParcelSelect]);

  // Charger la parcelle de l'adresse au montage UNIQUEMENT (anti-boucle via useRef).
  useEffect(() => {
    if (!mounted || !lat || !lon) return;

    const coordsKey = `${lat},${lon}`;
    if (initialLoadedRef.current && lastCoordsRef.current === coordsKey) return;
    initialLoadedRef.current = true;
    lastCoordsRef.current = coordsKey;

    const fetchInitialParcel = async () => {
      setLoading(true);
      try {
        const url = `/api/cadastre-proxy?lon=${lon}&lat=${lat}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features?.length > 0) {
          handleParcelle(data.features[0]);
        }
      } catch (e) {
        console.error('Erreur chargement initial parcelle:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialParcel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, lat, lon]);

  if (!mounted) return <div className="w-full h-80 bg-gray-100 animate-pulse rounded-xl" />;

  const adresseIcon = L.divIcon({
    html: `<div class="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg ring-4 ring-red-500/30"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: '',
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Barre de statut Premium */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Cadastre Officiel IGN <span className="text-gray-400 font-normal ml-1">— Cliquez sur votre parcelle</span>
          </span>
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            <div className="w-3 h-3 border-2 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
            Analyse de la parcelle...
          </div>
        )}
      </div>

      {/* Conteneur Carte avec Ombre Portée */}
      <div className="h-80 rounded-xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-100 relative z-0">
        <MapContainer
          center={[lat || 46.603, lon || 1.888]}
          zoom={lat ? 18 : 6}
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          {/* Fond Plan IGN — Géoplateforme 2026 */}
          <TileLayer
            attribution="© IGN-F / Géoplateforme"
            url="https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}"
            maxNativeZoom={19}
            maxZoom={22}
          />

          {/* Overlay Parcelles Cadastrales */}
          <TileLayer
            attribution="Cadastre © DGFiP / IGN"
            url="https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELLAIRE_EXPRESS&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}"
            maxNativeZoom={19}
            maxZoom={22}
            opacity={0.8}
          />

          <ClickCatcher onParcelle={handleParcelle} setLoading={setLoading} />

          {lat && lon && (
            <Marker position={[lat, lon]} icon={adresseIcon}>
              <Popup className="custom-popup">
                <div className="font-bold text-gray-900">📍 Votre adresse</div>
              </Popup>
            </Marker>
          )}

          {parcelle && (
            <GeoJSON
              key={parcelle.properties?.idu || 'selected'}
              data={parcelle}
              style={{
                color: '#D97706', // Amber-600
                weight: 3,
                fillColor: '#FBBF24', // Amber-400
                fillOpacity: 0.4,
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Résultat de Sélection Premium */}
      {parcelle && (
        <div className="mt-2 p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-500 text-white p-1 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Parcelle Identifiée — Données Importées
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider mb-1">Référence</div>
              <div className="text-lg font-black text-emerald-900">
                {(parcelle.properties?.section || '') + (parcelle.properties?.numero || '')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider mb-1">Surface</div>
              <div className="text-lg font-black text-emerald-900">
                {(parcelle.properties?.contenance || parcelle.properties?.contenancedgfip || parcelle.properties?.surface_m2) ? `${Math.round(parcelle.properties.contenance || parcelle.properties.contenancedgfip || parcelle.properties.surface_m2)} m²` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider mb-1">Code INSEE</div>
              <div className="text-lg font-black text-emerald-900">
                {parcelle.properties?.code_insee || `${parcelle.properties?.code_dep || ''}${parcelle.properties?.code_com || ''}`}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .leaflet-container {
          background: #f8fafc !important;
        }
        .leaflet-interactive {
          cursor: pointer !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
