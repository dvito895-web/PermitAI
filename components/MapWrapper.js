// components/MapWrapper.js
// Import dynamique obligatoire — Leaflet ne tourne pas en SSR
'use client';
import dynamic from 'next/dynamic';

const MapCadastre = dynamic(() => import('./MapCadastre'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 320, background: '#0e0e1a', borderRadius: 12, border: '1px solid #1c1c2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ width: 28, height: 28, border: '3px solid rgba(160,120,32,.15)', borderTop: '3px solid #a07820', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <div style={{ fontSize: 12, color: '#5a5650' }}>Chargement du cadastre officiel IGN...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  ),
});

export default MapCadastre;
