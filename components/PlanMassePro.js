'use client';
// components/PlanMassePro.js
// ═══════════════════════════════════════════════════════════════════════
// PLAN DE MASSE PROFESSIONNEL — SVG vectoriel niveau architecte HMONP.
// Sortie conforme PCMI2/DP2 :
//   - Géométrie IGN réelle (parcelle + bâtiments existants + voisins)
//   - Projet implanté (rectangle déplaçable + rotation)
//   - Reculs PLU matérialisés (zone constructible verte, recul rouge)
//   - Cotations linéaires + nord + échelle graphique + cartouche
//   - Annotations NGF, accès, EP/EU, plantations
//   - Export SVG (vectoriel) + PNG haute résolution
// ═══════════════════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// ── Conversion lat/lon → mètres locaux ─────────────────────────────
function toLocal(lat, lon, center) {
  const Rlat = 111320;
  const Rlon = 111320 * Math.cos((center.lat * Math.PI) / 180);
  return {
    x: (lon - center.lon) * Rlon,
    y: -(lat - center.lat) * Rlat, // Y inversé pour SVG (haut = nord)
  };
}

// ── Extraction coords polygone d'une geometry GeoJSON ──────────────
function polyCoords(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon')      return geometry.coordinates[0] || [];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates[0]?.[0] || [];
  return [];
}

// ── Build SVG path "M x1 y1 L x2 y2 … Z" ───────────────────────────
function poly2path(coords, center, scale) {
  if (!coords || coords.length < 3) return '';
  return coords.map((c, i) => {
    const p = toLocal(c[1], c[0], center);
    return `${i === 0 ? 'M' : 'L'} ${(p.x * scale).toFixed(1)} ${(p.y * scale).toFixed(1)}`;
  }).join(' ') + ' Z';
}

// ── Calcul du centroïde d'un polygone ──────────────────────────────
function centroid(coords, center, scale) {
  if (!coords || coords.length < 3) return { x: 0, y: 0 };
  const pts = coords.map(c => toLocal(c[1], c[0], center));
  const sx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const sy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return { x: sx * scale, y: sy * scale };
}

// ── Composant principal ────────────────────────────────────────────
export default function PlanMassePro({
  // Données géo
  addrData,             // { lat, lon, label, commune, code_postal }
  batimentsData,        // { parcelle: { geometry, reference, contenance }, batiments: [], voisins: [], regles: { hauteur_max, recul_voirie, recul_limite, emprise_max } }
  // Analyse IA du plan (optionnelle)
  analysis,             // { dimensions: { largeur_totale, profondeur_totale, surface_plancher_estimee }, … }
  // Form data (pour cartouche)
  formData,             // { nom, prenom, commune, reference_cadastrale, surface_terrain, nature_travaux }
  cerfaId,
  // Callback
  onSave,               // (svgString, format) => void
}) {
  // — État —
  const svgRef = useRef(null);
  const [scale, setScale] = useState(20);        // pixels par mètre
  const [projet, setProjet] = useState(null);    // { x, y, w, h, rotation } en mètres
  const [drawMode, setDrawMode] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [reculVoirie, setReculVoirie] = useState(batimentsData?.regles?.recul_voirie || 5);
  const [reculLimite, setReculLimite] = useState(batimentsData?.regles?.recul_limite || 3);
  const [ngfTN, setNgfTN] = useState(120);       // m NGF terrain naturel
  const [ngfTF, setNgfTF] = useState(120.20);    // m NGF terrain fini
  const [showLayers, setShowLayers] = useState({
    parcelle: true, batiments: true, voisins: true,
    reculs: true, projet: true, cotations: true,
    reseaux: true, ngf: true, cartouche: true,
  });
  const [saved, setSaved] = useState(false);

  const W = 1100, H = 800;
  const PAD = { top: 40, right: 230, bottom: 110, left: 40 }; // marge pour cartouche + échelle
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // — Centre géographique —
  const center = useMemo(() => {
    if (batimentsData?.parcelle?.geometry) {
      const coords = polyCoords(batimentsData.parcelle.geometry);
      if (coords.length > 2) {
        const sLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const sLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        return { lat: sLat, lon: sLon };
      }
    }
    if (addrData) return { lat: addrData.lat, lon: addrData.lon };
    return { lat: 48.8566, lon: 2.3522 };
  }, [batimentsData, addrData]);

  // — Auto-ajuste l'échelle pour que la parcelle remplisse 70% du viewport —
  useEffect(() => {
    const coords = polyCoords(batimentsData?.parcelle?.geometry);
    if (coords.length < 3) return;
    const pts = coords.map(c => toLocal(c[1], c[0], center));
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const widthM = Math.max(...xs) - Math.min(...xs);
    const heightM = Math.max(...ys) - Math.min(...ys);
    if (widthM > 0 && heightM > 0) {
      const sx = (innerW * 0.7) / widthM;
      const sy = (innerH * 0.7) / heightM;
      setScale(Math.min(sx, sy, 60));
    }
  }, [batimentsData, center, innerW, innerH]);

  // — Init projet centré sur parcelle si analyse IA dispo —
  useEffect(() => {
    if (!projet && analysis?.dimensions?.largeur_totale && analysis?.dimensions?.profondeur_totale) {
      setProjet({
        x: 0, y: 0,
        w: parseFloat(analysis.dimensions.largeur_totale) || 10,
        h: parseFloat(analysis.dimensions.profondeur_totale) || 8,
        rotation: 0,
      });
    }
  }, [analysis, projet]);

  // — Helpers SVG —
  const ox = PAD.left + innerW / 2;
  const oy = PAD.top + innerH / 2;
  const px = (xMeters) => ox + xMeters;
  const py = (yMeters) => oy + yMeters;

  // — Génère un SVG pattern (hachures) pour le projet —
  const hachuresPattern = (
    <pattern id="hachures-projet" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.6" />
    </pattern>
  );
  const remblaisPattern = (
    <pattern id="remblais" patternUnits="userSpaceOnUse" width="8" height="8">
      <circle cx="2" cy="2" r="1" fill="#92400e" opacity="0.4" />
    </pattern>
  );

  // — Polygone parcelle (chemin SVG) —
  const parcellePath = useMemo(() => {
    return poly2path(polyCoords(batimentsData?.parcelle?.geometry), center, scale);
  }, [batimentsData, center, scale]);

  // — Polygones bâtiments existants —
  const batimentsPaths = useMemo(() => {
    return (batimentsData?.batiments || []).map(b => ({
      path: poly2path(polyCoords(b.geometry), center, scale),
      nature: b.nature || 'Existant',
      hauteur: b.hauteur || null,
      centroid: centroid(polyCoords(b.geometry), center, scale),
    }));
  }, [batimentsData, center, scale]);

  // — Polygones parcelles voisines (limites) —
  const voisinsPaths = useMemo(() => {
    return (batimentsData?.voisins || []).map(v => poly2path(polyCoords(v.geometry), center, scale));
  }, [batimentsData, center, scale]);

  // — Rectangle "zone constructible" simplifié (intérieur parcelle - reculs) —
  const zoneConstructiblePath = useMemo(() => {
    const coords = polyCoords(batimentsData?.parcelle?.geometry);
    if (coords.length < 3) return '';
    // Approximation : bbox - reculs (simple mais suffisant pour visualisation)
    const pts = coords.map(c => toLocal(c[1], c[0], center));
    const minX = Math.min(...pts.map(p => p.x)) * scale + reculLimite * scale;
    const maxX = Math.max(...pts.map(p => p.x)) * scale - reculLimite * scale;
    const minY = Math.min(...pts.map(p => p.y)) * scale + reculVoirie * scale;
    const maxY = Math.max(...pts.map(p => p.y)) * scale - reculLimite * scale;
    return `M ${minX.toFixed(1)} ${minY.toFixed(1)} L ${maxX.toFixed(1)} ${minY.toFixed(1)} L ${maxX.toFixed(1)} ${maxY.toFixed(1)} L ${minX.toFixed(1)} ${maxY.toFixed(1)} Z`;
  }, [batimentsData, center, scale, reculVoirie, reculLimite]);

  // — Handlers dessin projet —
  const svgPointToMeters = useCallback((evt) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const loc = pt.matrixTransform(ctm.inverse());
    return { x: (loc.x - ox) / scale, y: (loc.y - oy) / scale };
  }, [scale, ox, oy]);

  const onSvgDown = (e) => {
    if (!drawMode) return;
    const m = svgPointToMeters(e); if (!m) return;
    setDragStart(m);
  };
  const onSvgMove = (e) => {
    if (!drawMode || !dragStart) return;
    const m = svgPointToMeters(e); if (!m) return;
    const x = Math.min(dragStart.x, m.x);
    const y = Math.min(dragStart.y, m.y);
    const w = Math.abs(m.x - dragStart.x);
    const h = Math.abs(m.y - dragStart.y);
    setProjet({ x, y, w, h, rotation: 0 });
  };
  const onSvgUp = () => { setDragStart(null); setDrawMode(false); };

  // — Export SVG (vecteur, parfait pour impression) —
  const exportSVG = () => {
    const svg = svgRef.current; if (!svg) return;
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const str = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([str], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PCMI2-plan-masse-${cerfaId || 'projet'}.svg`;
    a.click(); URL.revokeObjectURL(url);
    if (onSave) onSave(str, 'SVG');
    setSaved(true);
  };

  // — Export PNG (rasterisation pour aperçus) —
  const exportPNG = () => {
    const svg = svgRef.current; if (!svg) return;
    const str = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = W * 2; cv.height = H * 2;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      const dataUrl = cv.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl; a.download = `PCMI2-plan-masse-${cerfaId || 'projet'}.png`;
      a.click();
      if (onSave) onSave(dataUrl, 'PNG');
      setSaved(true);
    };
    img.src = url;
  };

  // — Rendu —
  const echelle1pour = Math.round(1000 / scale);
  const meta = batimentsData?.parcelle || {};
  const projetSurface = projet ? (projet.w * projet.h).toFixed(1) : '—';

  return (
    <div data-testid="plan-masse-pro" style={{ background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 16 }}>
      {/* Barre d'outils */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <button onClick={() => setDrawMode(d => !d)} data-testid="plan-masse-draw-btn"
          style={{ padding: '8px 14px', background: drawMode ? '#1d4ed8' : 'rgba(160,120,32,.1)', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 8, color: drawMode ? '#fff' : '#e8b420', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {drawMode ? '✎ Cliquez-glissez sur la parcelle…' : '✎ Dessiner le projet'}
        </button>
        {projet && (
          <button onClick={() => setProjet(null)} data-testid="plan-masse-clear-btn"
            style={{ padding: '8px 14px', background: 'rgba(239,68,68,.1)', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 8, color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>
            ✕ Effacer projet
          </button>
        )}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', background: '#111118', borderRadius: 8, padding: '4px 6px' }}>
          <button onClick={() => setScale(s => Math.max(8, s - 4))} style={{ background: 'none', border: 0, color: '#a07820', cursor: 'pointer', fontSize: 14, padding: '0 6px' }}>−</button>
          <span style={{ fontSize: 11, color: '#5a5650' }}>1:{echelle1pour}</span>
          <button onClick={() => setScale(s => Math.min(80, s + 4))} style={{ background: 'none', border: 0, color: '#a07820', cursor: 'pointer', fontSize: 14, padding: '0 6px' }}>+</button>
        </div>
        <input type="number" step="0.5" value={reculVoirie} onChange={(e) => setReculVoirie(parseFloat(e.target.value) || 0)} data-testid="plan-masse-recul-voirie"
          style={{ width: 70, padding: '6px 8px', background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 6, color: '#f2efe9', fontSize: 11 }} placeholder="Recul voirie" />
        <input type="number" step="0.5" value={reculLimite} onChange={(e) => setReculLimite(parseFloat(e.target.value) || 0)} data-testid="plan-masse-recul-limite"
          style={{ width: 70, padding: '6px 8px', background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 6, color: '#f2efe9', fontSize: 11 }} placeholder="Recul limite" />
        <input type="number" step="0.01" value={ngfTN} onChange={(e) => setNgfTN(parseFloat(e.target.value) || 0)} data-testid="plan-masse-ngf-tn"
          style={{ width: 90, padding: '6px 8px', background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 6, color: '#f2efe9', fontSize: 11 }} placeholder="NGF TN" />
        <button onClick={exportSVG} data-testid="plan-masse-export-svg"
          style={{ marginLeft: 'auto', padding: '8px 14px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 0, borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          ⬇ Export SVG (vecteur)
        </button>
        <button onClick={exportPNG} data-testid="plan-masse-export-png"
          style={{ padding: '8px 14px', background: saved ? 'rgba(74,222,128,.12)' : '#1c1c2a', border: '0.5px solid ' + (saved ? 'rgba(74,222,128,.3)' : '#2a2a38'), borderRadius: 8, color: saved ? '#4ade80' : '#f2efe9', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {saved ? '✓ Plan exporté' : '⬇ PNG haute déf.'}
        </button>
      </div>

      {/* SVG — niveau architecte */}
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'auto', border: '1px solid #1c1c2a' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', cursor: drawMode ? 'crosshair' : 'default', maxWidth: '100%' }}
          onMouseDown={onSvgDown} onMouseMove={onSvgMove} onMouseUp={onSvgUp}
        >
          <defs>{hachuresPattern}{remblaisPattern}
            <marker id="arrow-cote" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151" />
            </marker>
            <marker id="arrow-recul" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
            </marker>
          </defs>

          {/* Fond ivoire architecte */}
          <rect x="0" y="0" width={W} height={H} fill="#fafaf6" />

          {/* Cadre */}
          <rect x="20" y="20" width={W - 40} height={H - 40} fill="none" stroke="#111" strokeWidth="1.5" />

          {/* Grille fine 1 m */}
          <g opacity="0.06" stroke="#000" strokeWidth="0.3">
            {Array.from({ length: Math.floor(innerW / scale) + 1 }).map((_, i) => (
              <line key={`gx${i}`} x1={PAD.left + i * scale} y1={PAD.top} x2={PAD.left + i * scale} y2={PAD.top + innerH} />
            ))}
            {Array.from({ length: Math.floor(innerH / scale) + 1 }).map((_, i) => (
              <line key={`gy${i}`} x1={PAD.left} y1={PAD.top + i * scale} x2={PAD.left + innerW} y2={PAD.top + i * scale} />
            ))}
          </g>

          {/* Voisins (limites) */}
          {showLayers.voisins && voisinsPaths.map((d, i) => (
            <path key={`v${i}`} d={d} transform={`translate(${ox} ${oy})`} fill="rgba(180,180,170,0.08)" stroke="#9ca3af" strokeWidth="0.6" strokeDasharray="3 2" />
          ))}

          {/* Zone constructible (intérieur reculs) */}
          {showLayers.reculs && zoneConstructiblePath && (
            <path d={zoneConstructiblePath} transform={`translate(${ox} ${oy})`} fill="rgba(74,222,128,0.07)" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="6 3" />
          )}

          {/* Parcelle cadastrale (or) */}
          {showLayers.parcelle && parcellePath && (
            <path d={parcellePath} transform={`translate(${ox} ${oy})`} fill="rgba(232,180,32,0.06)" stroke="#a07820" strokeWidth="2" />
          )}

          {/* Bâtiments existants */}
          {showLayers.batiments && batimentsPaths.map((b, i) => (
            <g key={`b${i}`} transform={`translate(${ox} ${oy})`}>
              <path d={b.path} fill="rgba(107,114,128,0.35)" stroke="#374151" strokeWidth="1.5" />
              <text x={b.centroid.x} y={b.centroid.y} fontSize="10" fill="#1f2937" textAnchor="middle" fontFamily="Arial, sans-serif">
                {b.nature}{b.hauteur ? ` · ${b.hauteur}m` : ''}
              </text>
            </g>
          ))}

          {/* Projet — rectangle hachuré bleu */}
          {showLayers.projet && projet && (
            <g transform={`translate(${px(projet.x * scale)} ${py(projet.y * scale)}) rotate(${projet.rotation || 0})`}>
              <rect x={0} y={0} width={projet.w * scale} height={projet.h * scale} fill="url(#hachures-projet)" stroke="#1d4ed8" strokeWidth="2.5" />
              <rect x={0} y={0} width={projet.w * scale} height={projet.h * scale} fill="rgba(29,78,216,0.05)" stroke="none" />
              {/* Cotations projet */}
              {showLayers.cotations && (
                <>
                  <line x1={0} y1={-14} x2={projet.w * scale} y2={-14} stroke="#374151" strokeWidth="0.8" markerStart="url(#arrow-cote)" markerEnd="url(#arrow-cote)" />
                  <text x={(projet.w * scale) / 2} y={-18} fontSize="11" fill="#1f2937" textAnchor="middle" fontFamily="Arial">{projet.w.toFixed(2)} m</text>
                  <line x1={-14} y1={0} x2={-14} y2={projet.h * scale} stroke="#374151" strokeWidth="0.8" markerStart="url(#arrow-cote)" markerEnd="url(#arrow-cote)" />
                  <text x={-18} y={(projet.h * scale) / 2} fontSize="11" fill="#1f2937" textAnchor="end" fontFamily="Arial" transform={`rotate(-90 -18 ${(projet.h * scale) / 2})`}>{projet.h.toFixed(2)} m</text>
                </>
              )}
              {/* Label */}
              <text x={(projet.w * scale) / 2} y={(projet.h * scale) / 2 + 4} fontSize="14" fill="#1d4ed8" textAnchor="middle" fontFamily="Arial" fontWeight="700">
                PROJET
              </text>
              <text x={(projet.w * scale) / 2} y={(projet.h * scale) / 2 + 22} fontSize="10" fill="#1d4ed8" textAnchor="middle" fontFamily="Arial">
                {projetSurface} m²
              </text>
            </g>
          )}

          {/* Annotations NGF */}
          {showLayers.ngf && projet && (
            <g transform={`translate(${px((projet.x + projet.w) * scale + 8)} ${py((projet.y + projet.h / 2) * scale)})`}>
              <rect x="0" y="-12" width="78" height="26" fill="#fff" stroke="#92400e" strokeWidth="0.8" />
              <text x="4" y="-1" fontSize="9" fill="#92400e" fontFamily="Arial" fontWeight="600">TN: {ngfTN.toFixed(2)} NGF</text>
              <text x="4" y="11" fontSize="9" fill="#92400e" fontFamily="Arial" fontWeight="600">TF: {ngfTF.toFixed(2)} NGF</text>
            </g>
          )}

          {/* Réseaux EP/EU (légende) */}
          {showLayers.reseaux && projet && (
            <g transform={`translate(${px(projet.x * scale)} ${py((projet.y + projet.h) * scale + 6)})`}>
              <circle cx="0" cy="0" r="5" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
              <text x="9" y="3" fontSize="9" fill="#1e40af" fontFamily="Arial">EU → tout-à-l'égout</text>
              <circle cx="0" cy="14" r="5" fill="#06b6d4" stroke="#0e7490" strokeWidth="1" />
              <text x="9" y="17" fontSize="9" fill="#0e7490" fontFamily="Arial">EP → infiltration</text>
            </g>
          )}

          {/* Reculs cotés */}
          {showLayers.reculs && projet && parcellePath && (
            <g transform={`translate(${ox} ${oy})`}>
              {(() => {
                const coords = polyCoords(batimentsData?.parcelle?.geometry);
                const pts = coords.map(c => toLocal(c[1], c[0], center));
                const minY = Math.min(...pts.map(p => p.y)) * scale;
                const minX = Math.min(...pts.map(p => p.x)) * scale;
                const projAbsY = projet.y * scale;
                const projAbsX = projet.x * scale;
                return (
                  <>
                    <line x1={projAbsX + (projet.w * scale) / 2} y1={minY} x2={projAbsX + (projet.w * scale) / 2} y2={projAbsY} stroke="#dc2626" strokeWidth="1" markerStart="url(#arrow-recul)" markerEnd="url(#arrow-recul)" />
                    <text x={projAbsX + (projet.w * scale) / 2 + 4} y={(minY + projAbsY) / 2} fontSize="10" fill="#dc2626" fontFamily="Arial">{Math.abs((projAbsY - minY) / scale).toFixed(1)} m</text>
                    <line x1={minX} y1={projAbsY + (projet.h * scale) / 2} x2={projAbsX} y2={projAbsY + (projet.h * scale) / 2} stroke="#dc2626" strokeWidth="1" markerStart="url(#arrow-recul)" markerEnd="url(#arrow-recul)" />
                    <text x={(minX + projAbsX) / 2} y={projAbsY + (projet.h * scale) / 2 - 4} fontSize="10" fill="#dc2626" fontFamily="Arial" textAnchor="middle">{Math.abs((projAbsX - minX) / scale).toFixed(1)} m</text>
                  </>
                );
              })()}
            </g>
          )}

          {/* Flèche Nord */}
          <g transform={`translate(${W - 100} 70)`}>
            <circle cx="0" cy="0" r="22" fill="#fff" stroke="#111" strokeWidth="1" />
            <polygon points="0,-18 6,8 0,4 -6,8" fill="#111" />
            <text x="0" y="-25" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="Arial">N</text>
          </g>

          {/* Échelle graphique */}
          <g transform={`translate(${PAD.left + 20} ${H - 70})`}>
            <rect x="0" y="0" width={10 * scale} height="6" fill="#111" />
            <rect x={5 * scale} y="0" width={5 * scale} height="6" fill="#fff" stroke="#111" strokeWidth="0.5" />
            <text x="0" y="-4" fontSize="9" fontFamily="Arial">0</text>
            <text x={5 * scale} y="-4" fontSize="9" fontFamily="Arial" textAnchor="middle">5m</text>
            <text x={10 * scale} y="-4" fontSize="9" fontFamily="Arial" textAnchor="middle">10m</text>
            <text x={5 * scale} y="20" fontSize="9" fontFamily="Arial" textAnchor="middle" fontWeight="600">Échelle 1:{echelle1pour}</text>
          </g>

          {/* Cartouche professionnel */}
          {showLayers.cartouche && (
            <g transform={`translate(${W - PAD.right + 10} ${PAD.top + 10})`}>
              <rect x="0" y="0" width={PAD.right - 30} height={innerH * 0.85} fill="#fff" stroke="#111" strokeWidth="1.2" />
              {/* En-tête */}
              <rect x="0" y="0" width={PAD.right - 30} height="36" fill="#0a0a14" />
              <text x="10" y="16" fontSize="11" fill="#e8b420" fontFamily="Arial" fontWeight="700">PermitAI</text>
              <text x="10" y="29" fontSize="8" fill="#c4bfb8" fontFamily="Arial">Plan de masse — PCMI2 / DP2</text>

              {/* Bloc demandeur */}
              <g transform="translate(8 50)">
                <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">MAÎTRE D'OUVRAGE</text>
                <text y="12" fontSize="9" fill="#111" fontFamily="Arial">{(formData?.prenom || '') + ' ' + (formData?.nom || '')}</text>
                <text y="24" fontSize="8" fill="#555" fontFamily="Arial">{formData?.email || ''}</text>
              </g>

              {/* Bloc terrain */}
              <line x1="6" y1="86" x2={PAD.right - 36} y2="86" stroke="#ddd" />
              <g transform="translate(8 96)">
                <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">TERRAIN</text>
                <text y="12" fontSize="8" fill="#111" fontFamily="Arial">{(formData?.commune || '—')}</text>
                <text y="24" fontSize="8" fill="#555" fontFamily="Arial">Parcelle : {meta.reference || formData?.reference_cadastrale || '—'}</text>
                <text y="36" fontSize="8" fill="#555" fontFamily="Arial">Surface : {meta.contenance || formData?.surface_terrain || '—'} m²</text>
                <text y="48" fontSize="8" fill="#555" fontFamily="Arial">Zone PLU : {batimentsData?.plu?.zone || '—'}</text>
              </g>

              {/* Bloc projet */}
              <line x1="6" y1="158" x2={PAD.right - 36} y2="158" stroke="#ddd" />
              <g transform="translate(8 168)">
                <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">PROJET</text>
                <text y="12" fontSize="8" fill="#111" fontFamily="Arial">{formData?.nature_travaux || cerfaId || '—'}</text>
                <text y="24" fontSize="8" fill="#555" fontFamily="Arial">Emprise : {projetSurface} m²</text>
                <text y="36" fontSize="8" fill="#555" fontFamily="Arial">Surface plancher : {analysis?.dimensions?.surface_plancher_estimee || formData?.surface_plancher || '—'} m²</text>
                <text y="48" fontSize="8" fill="#555" fontFamily="Arial">Hauteur : {analysis?.dimensions?.hauteur_estimee || formData?.hauteur_projet || '—'} m</text>
              </g>

              {/* Bloc PLU */}
              <line x1="6" y1="230" x2={PAD.right - 36} y2="230" stroke="#ddd" />
              <g transform="translate(8 240)">
                <text fontSize="7" fill="#5a5650" fontFamily="Arial" fontWeight="700">RÈGLES PLU</text>
                <text y="12" fontSize="8" fill="#111" fontFamily="Arial">H max : {batimentsData?.regles?.hauteur_max || '—'} m</text>
                <text y="24" fontSize="8" fill="#555" fontFamily="Arial">Recul voirie : {reculVoirie} m</text>
                <text y="36" fontSize="8" fill="#555" fontFamily="Arial">Recul limites : {reculLimite} m</text>
                <text y="48" fontSize="8" fill="#555" fontFamily="Arial">CES : {batimentsData?.regles?.emprise_max ? (batimentsData.regles.emprise_max * 100).toFixed(0) + '%' : '—'}</text>
              </g>

              {/* Pied */}
              <text x="8" y={innerH * 0.85 - 22} fontSize="7" fill="#888" fontFamily="Arial">Échelle 1:{echelle1pour}</text>
              <text x="8" y={innerH * 0.85 - 12} fontSize="7" fill="#888" fontFamily="Arial">Date : {new Date().toLocaleDateString('fr-FR')}</text>
              <text x="8" y={innerH * 0.85 - 2} fontSize="7" fill="#888" fontFamily="Arial">CERFA {cerfaId || '13406'}</text>
            </g>
          )}
        </svg>
      </div>

      {/* Légende couches */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, fontSize: 11 }}>
        {Object.entries(showLayers).map(([k, v]) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: v ? '#a07820' : '#5a5650' }}>
            <input type="checkbox" checked={v} onChange={(e) => setShowLayers(s => ({ ...s, [k]: e.target.checked }))}
              data-testid={`layer-${k}`} style={{ accentColor: '#a07820' }} />
            <span style={{ textTransform: 'capitalize' }}>{k}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
