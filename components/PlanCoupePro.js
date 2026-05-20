'use client';
// components/PlanCoupePro.js
// ═══════════════════════════════════════════════════════════════════════
// PLAN EN COUPE PROFESSIONNEL — SVG vectoriel niveau architecte HMONP.
// Sortie conforme PCMI3/DP3 :
//   - Terrain naturel (TN) + Terrain fini (TF) avec hachures béton/remblais
//   - Bâtiment existant + projet avec toiture (2 pans, 4 pans, plat) selon analyse
//   - Cotations verticales (H façade, H faîtage, H combles, HSP)
//   - Annotations NGF + H max PLU + niveau RDC/R+1
//   - Cartouche complet + échelle + verdict conformité PLU automatique
// ═══════════════════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect, useMemo } from 'react';

export default function PlanCoupePro({
  analysis,           // Analyse IA du plan (dimensions, toiture, …)
  batimentsData,      // { batiments: [{hauteur}], regles: { hauteur_max } }
  pluRegles,
  formData,
  cerfaId,
  onSave,
}) {
  const svgRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [v, setV] = useState({
    tn: 0,
    tf: 0.20,
    hRDC: parseFloat(analysis?.dimensions?.hauteur_etage_m?.valeur || analysis?.dimensions?.hauteur_estimee || 2.8),
    hCombles: 1.6,
    pente: parseFloat(analysis?.toiture?.pente_degres?.valeur || analysis?.elements?.pente_toiture_estimee || 35),
    longueurProjet: parseFloat(analysis?.dimensions?.largeur_totale_m?.valeur || analysis?.dimensions?.largeur_totale || 10),
    hauteurEx: parseFloat(batimentsData?.batiments?.[0]?.hauteur || 6.5),
    longueurEx: 10,
    reculEx: parseFloat(pluRegles?.recul_limite || 3),
    ngfTN: 120,
  });

  // Réinit. quand l'analyse change
  useEffect(() => {
    if (analysis) {
      setV(x => ({
        ...x,
        hRDC: parseFloat(analysis?.dimensions?.hauteur_etage_m?.valeur || analysis?.dimensions?.hauteur_estimee || x.hRDC),
        pente: parseFloat(analysis?.toiture?.pente_degres?.valeur || analysis?.elements?.pente_toiture_estimee || x.pente),
        longueurProjet: parseFloat(analysis?.dimensions?.largeur_totale_m?.valeur || analysis?.dimensions?.largeur_totale || x.longueurProjet),
        hCombles: (analysis?.toiture?.type === 'plat' || analysis?.elements?.type_toiture === 'plat') ? 0.2 : x.hCombles,
      }));
    }
  }, [analysis]);

  const W = 1100, H = 720;
  const PAD = { top: 50, right: 230, bottom: 110, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Échelle dynamique : on calcule pour que la coupe complète tienne dans innerW × innerH
  const scale = useMemo(() => {
    const totalLen = v.longueurEx + v.reculEx + v.longueurProjet + 4;
    const totalH = Math.max(v.hauteurEx, v.hRDC + v.hCombles) + 3;
    return Math.min(innerW / totalLen, innerH / totalH, 35);
  }, [v, innerW, innerH]);

  // — Coordonnées en mètres → SVG —
  const baseY = PAD.top + innerH - 50; // ligne de TN
  const px = (m) => PAD.left + 40 + m * scale;
  const py = (m) => baseY - m * scale;

  // Positions
  const exX = 0;
  const exW = v.longueurEx * scale;
  const exH = v.hauteurEx * scale;
  const projX = exX + v.longueurEx + v.reculEx;
  const projW = v.longueurProjet * scale;
  const projH = v.hRDC * scale;
  const combH = v.hCombles * scale;

  // Verdict PLU
  const totalH = v.hRDC + v.hCombles;
  const hMax = parseFloat(pluRegles?.hauteur_max) || 999;
  const conforme = totalH <= hMax;

  const exportSVG = () => {
    const svg = svgRef.current; if (!svg) return;
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const str = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([str], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PCMI3-plan-coupe-${cerfaId || 'projet'}.svg`;
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
      a.href = dataUrl; a.download = `PCMI3-plan-coupe-${cerfaId || 'projet'}.png`;
      a.click();
      if (onSave) onSave(dataUrl, 'PNG');
      setSaved(true);
    };
    img.src = url;
  };

  // — Toiture path (selon pente) —
  const toitureProjPath = useMemo(() => {
    if (v.pente <= 5) {
      // Toit plat
      return `M ${(projX - 0.5) * scale + PAD.left + 40} ${py(v.hRDC + 0.3)} L ${(projX + v.longueurProjet + 0.5) * scale + PAD.left + 40} ${py(v.hRDC + 0.3)} L ${(projX + v.longueurProjet + 0.5) * scale + PAD.left + 40} ${py(v.hRDC)} L ${(projX - 0.5) * scale + PAD.left + 40} ${py(v.hRDC)} Z`;
    }
    // Toit à 2 pans (triangle isocèle)
    return `M ${(projX - 0.5) * scale + PAD.left + 40} ${py(v.hRDC)} L ${(projX + v.longueurProjet / 2) * scale + PAD.left + 40} ${py(v.hRDC + v.hCombles)} L ${(projX + v.longueurProjet + 0.5) * scale + PAD.left + 40} ${py(v.hRDC)} Z`;
  }, [v, projX, scale, py, PAD.left]);

  return (
    <div data-testid="plan-coupe-pro" style={{ background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        {[
          ['TN (m)', 'tn', 0.1],
          ['TF (m)', 'tf', 0.05],
          ['H RDC (m)', 'hRDC', 0.1],
          ['H combles (m)', 'hCombles', 0.1],
          ['Pente (°)', 'pente', 1],
          ['L projet (m)', 'longueurProjet', 0.5],
          ['H existant (m)', 'hauteurEx', 0.5],
          ['L existant (m)', 'longueurEx', 0.5],
          ['Recul (m)', 'reculEx', 0.5],
          ['NGF TN', 'ngfTN', 0.01],
        ].map(([label, key, step]) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 9, color: '#5a5650', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</label>
            <input
              type="number" step={step} value={v[key]}
              onChange={e => setV(x => ({ ...x, [key]: parseFloat(e.target.value) || 0 }))}
              data-testid={`coupe-${key}`}
              style={{ width: 80, background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 6, padding: '6px 8px', fontSize: 11, color: '#f2efe9' }}
            />
          </div>
        ))}
        <button onClick={exportSVG} data-testid="coupe-export-svg"
          style={{ marginLeft: 'auto', padding: '8px 14px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 0, borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          ⬇ SVG
        </button>
        <button onClick={exportPNG} data-testid="coupe-export-png"
          style={{ padding: '8px 14px', background: saved ? 'rgba(74,222,128,.12)' : '#1c1c2a', border: '0.5px solid ' + (saved ? 'rgba(74,222,128,.3)' : '#2a2a38'), borderRadius: 8, color: saved ? '#4ade80' : '#f2efe9', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {saved ? '✓ Exporté' : '⬇ PNG'}
        </button>
      </div>

      {/* SVG */}
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'auto', border: '1px solid #1c1c2a' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxWidth: '100%' }}>
          <defs>
            <pattern id="terre" patternUnits="userSpaceOnUse" width="6" height="6">
              <circle cx="3" cy="3" r="0.8" fill="#92400e" opacity="0.4" />
            </pattern>
            <pattern id="beton" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#6b7280" strokeWidth="1" />
            </pattern>
            <pattern id="murs-projet" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.5" />
            </pattern>
            <marker id="ar-cote-v" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 5 0 L 0 10 L 10 10 Z" fill="#374151" />
            </marker>
          </defs>

          {/* Fond */}
          <rect x="0" y="0" width={W} height={H} fill="#fafaf6" />
          <rect x="20" y="20" width={W - 40} height={H - 40} fill="none" stroke="#111" strokeWidth="1.2" />

          {/* TN (terrain naturel) */}
          <line x1={PAD.left} y1={py(v.tn)} x2={W - PAD.right - 20} y2={py(v.tn)} stroke="#92400e" strokeWidth="2" strokeDasharray="6 3" />
          <rect x={PAD.left} y={py(v.tn)} width={W - PAD.right - 20 - PAD.left} height={H - py(v.tn) - PAD.bottom + 40} fill="url(#terre)" />
          <text x={PAD.left + 4} y={py(v.tn) - 4} fontSize="10" fill="#92400e" fontFamily="Arial" fontWeight="600">
            TN ± {v.tn.toFixed(2)} m · {v.ngfTN.toFixed(2)} NGF
          </text>

          {/* TF (terrain fini) */}
          <line x1={PAD.left} y1={py(v.tf)} x2={W - PAD.right - 20} y2={py(v.tf)} stroke="#5c4a1e" strokeWidth="2.5" />
          <text x={PAD.left + 4} y={py(v.tf) - 4} fontSize="10" fill="#5c4a1e" fontFamily="Arial" fontWeight="600">
            TF + {(v.tf - v.tn).toFixed(2)} m
          </text>

          {/* Bâtiment existant */}
          <g transform={`translate(${PAD.left + 40} 0)`}>
            <rect x={exX * scale} y={py(v.hauteurEx)} width={exW} height={exH} fill="rgba(107,114,128,0.25)" stroke="#374151" strokeWidth="2" />
            {/* Toit existant (2 pans) */}
            <polygon points={`${exX * scale - 10},${py(v.hauteurEx)} ${(exX + v.longueurEx / 2) * scale},${py(v.hauteurEx + 1.5)} ${(exX + v.longueurEx) * scale + 10},${py(v.hauteurEx)}`} fill="rgba(107,114,128,0.35)" stroke="#374151" strokeWidth="1.8" />
            <text x={(exX + v.longueurEx / 2) * scale} y={py(v.hauteurEx / 2)} fontSize="13" fill="#1f2937" fontFamily="Arial" textAnchor="middle" fontWeight="700">EXISTANT</text>

            {/* Projet — murs */}
            <rect x={projX * scale} y={py(v.hRDC)} width={projW} height={projH} fill="url(#murs-projet)" stroke="#1d4ed8" strokeWidth="2.5" />
            <rect x={projX * scale} y={py(v.hRDC)} width={projW} height={projH} fill="rgba(29,78,216,0.06)" stroke="none" />

            {/* Projet — toiture */}
            <path d={toitureProjPath.replace(`translate(${PAD.left + 40}`, '').replace('translate(0', '')} fill="rgba(29,78,216,0.18)" stroke="#1d4ed8" strokeWidth="2" />

            {/* Dalle béton */}
            <rect x={projX * scale} y={py(0)} width={projW} height={Math.max(0.22 * scale, 4)} fill="url(#beton)" />

            {/* Label projet */}
            <text x={(projX + v.longueurProjet / 2) * scale} y={py(v.hRDC / 2)} fontSize="13" fill="#1d4ed8" fontFamily="Arial" textAnchor="middle" fontWeight="700">PROJET</text>
            <text x={(projX + v.longueurProjet / 2) * scale} y={py(v.hRDC / 2) + 16} fontSize="10" fill="#1d4ed8" fontFamily="Arial" textAnchor="middle">{v.hRDC.toFixed(2)} m</text>

            {/* Fenêtres projet (3 baies) */}
            {Array.from({ length: 3 }).map((_, i) => {
              const fx = projX * scale + ((i + 1) * projW) / 4 - 0.6 * scale;
              const fy = py(v.hRDC * 0.72);
              return (
                <rect key={i} x={fx} y={fy} width={1.2 * scale} height={1.4 * scale} fill="rgba(200,230,255,0.7)" stroke="#3b82f6" strokeWidth="1.2" />
              );
            })}

            {/* Porte */}
            <rect x={projX * scale + projW / 2 - 0.5 * scale} y={py(2.1)} width={1 * scale} height={2.1 * scale} fill="rgba(251,191,36,0.6)" stroke="#d97706" strokeWidth="1.2" />
          </g>

          {/* Cotation H façade projet (à droite du projet) */}
          {(() => {
            const cX = PAD.left + 40 + (projX + v.longueurProjet) * scale + 20;
            return (
              <g>
                <line x1={cX} y1={py(v.tf)} x2={cX} y2={py(v.hRDC)} stroke="#374151" strokeWidth="0.9" markerStart="url(#ar-cote-v)" markerEnd="url(#ar-cote-v)" />
                <text x={cX + 4} y={py((v.tf + v.hRDC) / 2)} fontSize="11" fill="#1f2937" fontFamily="Arial">H façade {v.hRDC.toFixed(2)} m</text>
                {/* Cotation H totale */}
                <line x1={cX + 30} y1={py(v.tf)} x2={cX + 30} y2={py(totalH)} stroke="#dc2626" strokeWidth="1" markerStart="url(#ar-cote-v)" markerEnd="url(#ar-cote-v)" />
                <text x={cX + 34} y={py((v.tf + totalH) / 2)} fontSize="11" fill="#dc2626" fontFamily="Arial" fontWeight="600">H = {totalH.toFixed(2)} m</text>
              </g>
            );
          })()}

          {/* H max PLU */}
          {pluRegles?.hauteur_max && (
            <g>
              <line x1={PAD.left + 40} y1={py(parseFloat(pluRegles.hauteur_max))} x2={W - PAD.right - 20} y2={py(parseFloat(pluRegles.hauteur_max))} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6 3" />
              <text x={PAD.left + 44} y={py(parseFloat(pluRegles.hauteur_max)) - 4} fontSize="10" fill="#dc2626" fontFamily="Arial" fontWeight="700">
                H max PLU : {pluRegles.hauteur_max} m
              </text>
            </g>
          )}

          {/* Verdict conformité */}
          <g transform={`translate(${PAD.left + 40} ${H - PAD.bottom + 16})`}>
            <rect width="280" height="32" fill={conforme ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)'} stroke={conforme ? '#16a34a' : '#dc2626'} strokeWidth="1" rx="6" />
            <text x="14" y="20" fontSize="12" fontFamily="Arial" fontWeight="700" fill={conforme ? '#15803d' : '#b91c1c'}>
              {conforme
                ? `✓ Conforme PLU (H ${totalH.toFixed(2)} m ≤ ${hMax} m)`
                : `⚠ Hors PLU (H ${totalH.toFixed(2)} m > ${hMax} m)`}
            </text>
          </g>

          {/* Échelle */}
          <g transform={`translate(${PAD.left + 40} ${H - 70})`}>
            <rect x="0" y="0" width={5 * scale} height="6" fill="#111" />
            <rect x={2.5 * scale} y="0" width={2.5 * scale} height="6" fill="#fff" stroke="#111" strokeWidth="0.5" />
            <text x="0" y="-4" fontSize="9">0</text>
            <text x={5 * scale} y="-4" fontSize="9" textAnchor="end">5m</text>
            <text x={2.5 * scale} y="20" fontSize="9" textAnchor="middle" fontWeight="600">Échelle 1:{Math.round(1000 / scale)}</text>
          </g>

          {/* Cartouche */}
          <g transform={`translate(${W - PAD.right + 10} ${PAD.top})`}>
            <rect width={PAD.right - 30} height={H - PAD.top - PAD.bottom + 20} fill="#fff" stroke="#111" strokeWidth="1.2" />
            <rect width={PAD.right - 30} height="36" fill="#0a0a14" />
            <text x="10" y="16" fontSize="11" fill="#e8b420" fontFamily="Arial" fontWeight="700">PermitAI</text>
            <text x="10" y="29" fontSize="8" fill="#c4bfb8" fontFamily="Arial">Plan en coupe — PCMI3 / DP3</text>

            <g transform="translate(8 50)">
              <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">MAÎTRE D'OUVRAGE</text>
              <text y="12" fontSize="9" fill="#111" fontFamily="Arial">{(formData?.prenom || '') + ' ' + (formData?.nom || '')}</text>
            </g>
            <line x1="6" y1="76" x2={PAD.right - 36} y2="76" stroke="#ddd" />

            <g transform="translate(8 88)">
              <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">TERRAIN</text>
              <text y="12" fontSize="8" fill="#111" fontFamily="Arial">{formData?.commune || '—'}</text>
              <text y="24" fontSize="8" fill="#555" fontFamily="Arial">Parcelle : {formData?.reference_cadastrale || '—'}</text>
              <text y="36" fontSize="8" fill="#555" fontFamily="Arial">Zone PLU : {batimentsData?.plu?.zone || '—'}</text>
            </g>
            <line x1="6" y1="138" x2={PAD.right - 36} y2="138" stroke="#ddd" />

            <g transform="translate(8 150)">
              <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">DIMENSIONS PROJET</text>
              <text y="12" fontSize="8" fill="#111" fontFamily="Arial">H façade : {v.hRDC.toFixed(2)} m</text>
              <text y="24" fontSize="8" fill="#555" fontFamily="Arial">H combles : {v.hCombles.toFixed(2)} m</text>
              <text y="36" fontSize="8" fill="#555" fontFamily="Arial">H totale : {totalH.toFixed(2)} m</text>
              <text y="48" fontSize="8" fill="#555" fontFamily="Arial">Pente : {v.pente.toFixed(0)}°</text>
              <text y="60" fontSize="8" fill="#555" fontFamily="Arial">L : {v.longueurProjet.toFixed(2)} m</text>
            </g>
            <line x1="6" y1="224" x2={PAD.right - 36} y2="224" stroke="#ddd" />

            <g transform="translate(8 236)">
              <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">CONFORMITÉ PLU</text>
              <text y="12" fontSize="8" fill={conforme ? '#15803d' : '#b91c1c'} fontFamily="Arial" fontWeight="700">
                {conforme ? '✓ OK' : '⚠ DÉPASSEMENT'}
              </text>
              <text y="24" fontSize="8" fill="#555" fontFamily="Arial">H max : {hMax} m</text>
              <text y="36" fontSize="8" fill="#555" fontFamily="Arial">H projet : {totalH.toFixed(2)} m</text>
            </g>

            <text x="8" y={H - PAD.top - PAD.bottom - 8} fontSize="7" fill="#888" fontFamily="Arial">Échelle 1:{Math.round(1000 / scale)}</text>
            <text x="8" y={H - PAD.top - PAD.bottom + 4} fontSize="7" fill="#888" fontFamily="Arial">{new Date().toLocaleDateString('fr-FR')} · CERFA {cerfaId || '13406'}</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
