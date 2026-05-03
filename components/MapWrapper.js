// components/MapWrapper.js
// Dynamic import — désactive le SSR pour Leaflet
'use client';
import dynamic from 'next/dynamic';

const MapCadastre = dynamic(() => import('./MapCadastre'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 320, background: '#0e0e1a', borderRadius: 12, border: '1px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexDirection: 'column' }}>
      <div style={{ width: 28, height: 28, border: '3px solid rgba(160,120,32,.2)', borderTop: '3px solid #a07820', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 12, color: '#5a5650' }}>Chargement de la carte cadastrale...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  ),
});

export default function MapWrapper(props) {
  return <MapCadastre {...props} />;
}
