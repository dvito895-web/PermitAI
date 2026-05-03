// app/components/CadastreMap.js
// Wrapper avec dynamic import pour éviter les erreurs SSR
'use client';
import dynamic from 'next/dynamic';

const CadastreMapClient = dynamic(
  () => import('./CadastreMapClient'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 280, borderRadius: 10, background: '#0a0a14', border: '0.5px solid #1c1c2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#5a5650' }}>Chargement de la carte...</div>
      </div>
    ),
  }
);

export default function CadastreMap(props) {
  return <CadastreMapClient {...props} />;
}
