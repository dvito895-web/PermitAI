'use client';
// components/PlanFacadePro.js
// ═══════════════════════════════════════════════════════════════════════
// PLAN DES FAÇADES ET TOITURES — SVG vectoriel architecte HMONP.
// Sortie conforme PCMI5/DP4 :
//   - 4 façades cotées (Nord / Sud / Est / Ouest)
//   - Textures matériaux (enduit, brique, bois, pierre) selon analyse IA
//   - Toiture (2 pans, 4 pans, plat) avec matériau (tuile, ardoise, zinc)
//   - Fenêtres + portes positionnées
//   - Cotations hauteur + largeur + cartouche
// ═══════════════════════════════════════════════════════════════════════
import React, { useState, useRef } from 'react';

const FACADES = [
  { key: 'sud',   label: 'FAÇADE SUD (principale)',  nord: false },
  { key: 'nord',  label: 'FAÇADE NORD',              nord: true },
  { key: 'est',   label: 'PIGNON EST',               pignon: true },
  { key: 'ouest', label: 'PIGNON OUEST',             pignon: true },
];

function Facade({ id, label, pignon, analysis, longueur, hauteur, hCombles, pente, scale, materiauMurs, materiauToit, nbFen, x, y }) {
  const W = longueur * scale, H = hauteur * scale, cH = hCombles * scale;
  const isPlat = pente <= 5;

  // Couleurs matériaux
  const colorMurs = materiauMurs === 'brique' ? 'rgba(180,80,40,0.18)'
                  : materiauMurs === 'bois'  ? 'rgba(140,90,40,0.18)'
                  : materiauMurs === 'pierre' ? 'rgba(170,160,140,0.25)'
                  : materiauMurs === 'bardage_bois' ? 'rgba(140,90,40,0.22)'
                  : materiauMurs === 'bardage_metallique' ? 'rgba(120,130,140,0.25)'
                  : 'rgba(232,228,218,0.5)';
  const colorToit = materiauToit === 'ardoise' ? 'rgba(50,60,75,0.7)'
                  : materiauToit === 'zinc'    ? 'rgba(130,140,150,0.7)'
                  : materiauToit === 'bac_acier' ? 'rgba(100,110,120,0.7)'
                  : materiauToit === 'vegetalise' ? 'rgba(80,140,70,0.7)'
                  : 'rgba(170,75,40,0.6)'; // tuile

  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Sol */}
      <line x1={-30} y1={H} x2={W + 30} y2={H} stroke="#92400e" strokeWidth="1.8" />
      <rect x={-30} y={H} width={W + 60} height="14" fill="url(#terre-facade)" />

      {/* Murs */}
      <rect x={0} y={0} width={W} height={H} fill={colorMurs} stroke="#555" strokeWidth="1.5" />

      {/* Texture brique si applicable */}
      {materiauMurs === 'brique' && (
        <g opacity="0.35">
          {Array.from({ length: Math.ceil(H / 8) }).map((_, row) => (
            Array.from({ length: Math.ceil(W / 22) }).map((_, col) => (
              <rect key={`b${row}-${col}`} x={col * 22 + (row % 2 ? 11 : 0)} y={row * 8} width={20} height={6} fill="none" stroke="#a04020" strokeWidth="0.4" />
            ))
          ))}
        </g>
      )}

      {/* Toiture */}
      {!isPlat ? (
        <polygon
          points={pignon
            ? `${-15},${0} ${W / 2},${-cH} ${W + 15},${0}`
            : `${-15},${0} ${W / 2},${-cH * 0.5} ${W + 15},${0}`}
          fill={colorToit} stroke="#444" strokeWidth="1.5"
        />
      ) : (
        <rect x={-10} y={-cH} width={W + 20} height={cH} fill={colorToit} stroke="#444" strokeWidth="1.5" />
      )}

      {/* Texture tuiles */}
      {(materiauToit === 'tuile_canal' || materiauToit === 'tuile_mecanique' || !materiauToit) && !isPlat && (
        <g opacity="0.3" clipPath={`url(#clip-toit-${id})`}>
          {Array.from({ length: 5 }).map((_, row) => (
            Array.from({ length: Math.ceil(W / 18) }).map((_, col) => (
              <rect key={`t${row}-${col}`} x={col * 18 - (row % 2 ? 9 : 0)} y={-cH + row * (cH / 5)} width={16} height={cH / 5 - 1} fill="none" stroke={materiauToit === 'ardoise' ? '#222' : '#7a3010'} strokeWidth="0.4" />
            ))
          ))}
        </g>
      )}

      <defs>
        <clipPath id={`clip-toit-${id}`}>
          {!isPlat ? (
            <polygon points={pignon
              ? `${-15},${0} ${W / 2},${-cH} ${W + 15},${0}`
              : `${-15},${0} ${W / 2},${-cH * 0.5} ${W + 15},${0}`} />
          ) : (
            <rect x={-10} y={-cH} width={W + 20} height={cH} />
          )}
        </clipPath>
      </defs>

      {/* Fenêtres */}
      {Array.from({ length: Math.min(nbFen, 6) }).map((_, i) => {
        const fx = (i + 1) * W / (Math.min(nbFen, 6) + 1) - 0.6 * scale;
        const fy = H * 0.25;
        return (
          <g key={`fen-${i}`}>
            <rect x={fx} y={fy} width={1.2 * scale} height={1.4 * scale} fill="rgba(200,230,255,0.75)" stroke="#3b82f6" strokeWidth="1.2" />
            <line x1={fx + 0.6 * scale} y1={fy} x2={fx + 0.6 * scale} y2={fy + 1.4 * scale} stroke="#3b82f6" strokeWidth="0.8" />
            <line x1={fx} y1={fy + 0.7 * scale} x2={fx + 1.2 * scale} y2={fy + 0.7 * scale} stroke="#3b82f6" strokeWidth="0.8" />
          </g>
        );
      })}

      {/* Porte (façade principale uniquement) */}
      {!pignon && id === 'sud' && (
        <g>
          <rect x={W / 2 - 0.5 * scale} y={H - 2.1 * scale} width={1 * scale} height={2.1 * scale} fill="rgba(139,90,30,0.6)" stroke="#7c5a2a" strokeWidth="1.2" />
          <circle cx={W / 2 + 0.4 * scale - 4} cy={H - 1.05 * scale} r="2.5" fill="#d97706" />
        </g>
      )}

      {/* Cotations */}
      <line x1={0} y1={H + 22} x2={W} y2={H + 22} stroke="#374151" strokeWidth="0.8" markerStart="url(#ar-facade)" markerEnd="url(#ar-facade)" />
      <text x={W / 2} y={H + 36} fontSize="10" fill="#1f2937" textAnchor="middle" fontFamily="Arial">{longueur.toFixed(2)} m</text>

      <line x1={-22} y1={0} x2={-22} y2={H} stroke="#374151" strokeWidth="0.8" markerStart="url(#ar-facade)" markerEnd="url(#ar-facade)" />
      <text x={-28} y={H / 2 + 4} fontSize="10" fill="#1f2937" textAnchor="end" fontFamily="Arial">{hauteur.toFixed(2)} m</text>

      {/* H totale (faîtage) */}
      {!isPlat && (
        <>
          <line x1={W + 22} y1={-cH} x2={W + 22} y2={H} stroke="#dc2626" strokeWidth="1" markerStart="url(#ar-facade)" markerEnd="url(#ar-facade)" />
          <text x={W + 28} y={(H - cH) / 2} fontSize="10" fill="#dc2626" fontFamily="Arial" fontWeight="600">{(hauteur + hCombles).toFixed(2)} m</text>
        </>
      )}

      {/* Label */}
      <text x={W / 2} y={-cH - 12} fontSize="11" fill="#111" textAnchor="middle" fontFamily="Arial" fontWeight="700">{label}</text>
    </g>
  );
}

export default function PlanFacadePro({ analysis, formData, batimentsData, pluRegles, cerfaId, onSave }) {
  const svgRef = useRef(null);
  const [saved, setSaved] = useState(false);

  const longueur = parseFloat(analysis?.dimensions?.largeur_totale_m?.valeur || analysis?.dimensions?.largeur_totale || 10);
  const profondeur = parseFloat(analysis?.dimensions?.profondeur_batiment_m?.valeur || analysis?.dimensions?.profondeur_totale || 8);
  const hauteur = parseFloat(analysis?.dimensions?.hauteur_egout_m?.valeur || analysis?.dimensions?.hauteur_estimee || 2.8);
  const hCombles = parseFloat(analysis?.dimensions?.hauteur_faitage_m?.valeur ? (analysis.dimensions.hauteur_faitage_m.valeur - hauteur) : 1.6);
  const pente = parseFloat(analysis?.toiture?.pente_degres?.valeur || analysis?.elements?.pente_toiture_estimee || 35);
  const materiauMurs = analysis?.facades?.materiau_principal || analysis?.materiaux_detectes?.murs || 'enduit';
  const materiauToit = analysis?.toiture?.materiau || analysis?.materiaux_detectes?.toiture || 'tuile_mecanique';
  const nbFen = parseInt(analysis?.facades?.ouvertures?.nombre_fenetres?.valeur || analysis?.facade_principale?.nombre_fenetres || 3);

  const W = 1180, H = 820;
  const PAD = { top: 50, right: 230, bottom: 50, left: 60 };

  // Échelle dynamique
  const maxLong = Math.max(longueur, profondeur);
  const innerW = (W - PAD.left - PAD.right) / 2 - 80; // 2 façades par ligne
  const innerH = (H - PAD.top - PAD.bottom) / 2 - 100;
  const scale = Math.min(innerW / maxLong, innerH / (hauteur + hCombles + 1), 28);

  const exportSVG = () => {
    const svg = svgRef.current; if (!svg) return;
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const str = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([str], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PCMI5-plan-facades-${cerfaId || 'projet'}.svg`;
    a.click(); URL.revokeObjectURL(url);
    if (onSave) onSave(str, 'SVG');
    setSaved(true);
  };
  const exportPNG = () => {
    const svg = svgRef.current; if (!svg) return;
    const str = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const url = URL.createObjectURL(new Blob([str], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = W * 2; cv.height = H * 2;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      const dataUrl = cv.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl; a.download = `PCMI5-plan-facades-${cerfaId || 'projet'}.png`;
      a.click();
      if (onSave) onSave(dataUrl, 'PNG');
      setSaved(true);
    };
    img.src = url;
  };

  // Positions des 4 façades (2x2 grid)
  const facadeW = longueur * scale;
  const facadeH = (hauteur + hCombles) * scale;
  const gap = 80;
  const positions = {
    sud:   { x: PAD.left + 40, y: PAD.top + 50 + hCombles * scale },
    nord:  { x: PAD.left + 40 + facadeW + gap, y: PAD.top + 50 + hCombles * scale },
    est:   { x: PAD.left + 40, y: PAD.top + 50 + facadeH + 80 + hCombles * scale },
    ouest: { x: PAD.left + 40 + (profondeur * scale) + gap, y: PAD.top + 50 + facadeH + 80 + hCombles * scale },
  };

  return (
    <div data-testid="plan-facade-pro" style={{ background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, color: '#5a5650' }}>
          Matériaux : <strong style={{ color: '#e8b420' }}>{materiauMurs}</strong> / <strong style={{ color: '#e8b420' }}>{materiauToit}</strong> · Pente : {pente.toFixed(0)}° · {nbFen} fenêtre{nbFen > 1 ? 's' : ''}
        </div>
        <button onClick={exportSVG} data-testid="facade-export-svg"
          style={{ marginLeft: 'auto', padding: '8px 14px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 0, borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          ⬇ SVG
        </button>
        <button onClick={exportPNG} data-testid="facade-export-png"
          style={{ padding: '8px 14px', background: saved ? 'rgba(74,222,128,.12)' : '#1c1c2a', border: '0.5px solid ' + (saved ? 'rgba(74,222,128,.3)' : '#2a2a38'), borderRadius: 8, color: saved ? '#4ade80' : '#f2efe9', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {saved ? '✓ Exporté' : '⬇ PNG'}
        </button>
      </div>

      {/* SVG */}
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'auto', border: '1px solid #1c1c2a' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxWidth: '100%' }}>
          <defs>
            <pattern id="terre-facade" patternUnits="userSpaceOnUse" width="6" height="6">
              <circle cx="3" cy="3" r="0.8" fill="#92400e" opacity="0.4" />
            </pattern>
            <marker id="ar-facade" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151" />
            </marker>
          </defs>

          <rect x="0" y="0" width={W} height={H} fill="#fafaf6" />
          <rect x="20" y="20" width={W - 40} height={H - 40} fill="none" stroke="#111" strokeWidth="1.2" />

          {FACADES.map(f => {
            const lng = (f.pignon) ? profondeur : longueur;
            const pos = positions[f.key];
            return (
              <Facade
                key={f.key}
                id={f.key}
                label={f.label}
                pignon={f.pignon}
                analysis={analysis}
                longueur={lng}
                hauteur={hauteur}
                hCombles={hCombles}
                pente={pente}
                scale={scale}
                materiauMurs={materiauMurs}
                materiauToit={materiauToit}
                nbFen={nbFen}
                x={pos.x}
                y={pos.y}
              />
            );
          })}

          {/* Échelle */}
          <g transform={`translate(${PAD.left + 40} ${H - 40})`}>
            <rect x="0" y="0" width={5 * scale} height="6" fill="#111" />
            <rect x={2.5 * scale} y="0" width={2.5 * scale} height="6" fill="#fff" stroke="#111" strokeWidth="0.5" />
            <text x={2.5 * scale} y="20" fontSize="9" textAnchor="middle" fontWeight="600">Échelle 1:{Math.round(1000 / scale)}</text>
          </g>

          {/* Cartouche */}
          <g transform={`translate(${W - PAD.right + 10} ${PAD.top})`}>
            <rect width={PAD.right - 30} height={H - PAD.top - PAD.bottom} fill="#fff" stroke="#111" strokeWidth="1.2" />
            <rect width={PAD.right - 30} height="36" fill="#0a0a14" />
            <text x="10" y="16" fontSize="11" fill="#e8b420" fontFamily="Arial" fontWeight="700">PermitAI</text>
            <text x="10" y="29" fontSize="8" fill="#c4bfb8" fontFamily="Arial">Plan des façades — PCMI5 / DP4</text>

            <g transform="translate(8 50)">
              <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">MAÎTRE D'OUVRAGE</text>
              <text y="12" fontSize="9" fill="#111" fontFamily="Arial">{(formData?.prenom || '') + ' ' + (formData?.nom || '')}</text>
              <text y="24" fontSize="8" fill="#555" fontFamily="Arial">{formData?.commune || ''}</text>
            </g>

            <g transform="translate(8 90)">
              <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">MATÉRIAUX</text>
              <text y="12" fontSize="8" fill="#111" fontFamily="Arial">Murs : {materiauMurs}</text>
              <text y="24" fontSize="8" fill="#555" fontFamily="Arial">Toiture : {materiauToit}</text>
              <text y="36" fontSize="8" fill="#555" fontFamily="Arial">Couleur murs : {analysis?.facades?.couleur_principale || 'à préciser'}</text>
              <text y="48" fontSize="8" fill="#555" fontFamily="Arial">Couleur toit : {analysis?.toiture?.couleur || 'à préciser'}</text>
            </g>

            <g transform="translate(8 150)">
              <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">DIMENSIONS</text>
              <text y="12" fontSize="8" fill="#111" fontFamily="Arial">L façade : {longueur.toFixed(2)} m</text>
              <text y="24" fontSize="8" fill="#555" fontFamily="Arial">P façade : {profondeur.toFixed(2)} m</text>
              <text y="36" fontSize="8" fill="#555" fontFamily="Arial">H égout : {hauteur.toFixed(2)} m</text>
              <text y="48" fontSize="8" fill="#555" fontFamily="Arial">H faîtage : {(hauteur + hCombles).toFixed(2)} m</text>
              <text y="60" fontSize="8" fill="#555" fontFamily="Arial">Pente : {pente.toFixed(0)}°</text>
            </g>

            <g transform="translate(8 224)">
              <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">OUVERTURES</text>
              <text y="12" fontSize="8" fill="#111" fontFamily="Arial">Fenêtres : {nbFen}</text>
              <text y="24" fontSize="8" fill="#555" fontFamily="Arial">Menuiserie : {analysis?.facades?.menuiseries?.materiau || 'aluminium'}</text>
            </g>

            <text x="8" y={H - PAD.top - PAD.bottom - 22} fontSize="7" fill="#888" fontFamily="Arial">Échelle 1:{Math.round(1000 / scale)}</text>
            <text x="8" y={H - PAD.top - PAD.bottom - 12} fontSize="7" fill="#888" fontFamily="Arial">{new Date().toLocaleDateString('fr-FR')}</text>
            <text x="8" y={H - PAD.top - PAD.bottom - 2} fontSize="7" fill="#888" fontFamily="Arial">CERFA {cerfaId || '13406'}</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
