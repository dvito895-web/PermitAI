'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================
// PLAN DE MASSE AUTOMATIQUE
// Données réelles IGN BDTOPO + cadastre + PLU
// ============================================================

function geoToCanvas(lat, lon, center, scale, W, H) {
  // Conversion coordonnées GPS → pixels canvas
  const metersPerDegLat = 111320;
  const metersPerDegLon = 111320 * Math.cos(center.lat * Math.PI / 180);
  const dx = (lon - center.lon) * metersPerDegLon;
  const dy = (lat - center.lat) * metersPerDegLat;
  return {
    x: W / 2 + dx * scale,
    y: H / 2 - dy * scale,
  };
}

function drawPolygon(ctx, coords, center, scale, W, H, fillStyle, strokeStyle, lineWidth = 1.5) {
  if (!coords || coords.length < 3) return;
  ctx.beginPath();
  coords.forEach((c, i) => {
    const pt = geoToCanvas(c[1], c[0], center, scale, W, H);
    i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
  });
  ctx.closePath();
  if (fillStyle) { ctx.fillStyle = fillStyle; ctx.fill(); }
  if (strokeStyle) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

function getPolygonCoords(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates[0] || [];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates[0]?.[0] || [];
  return [];
}

function centroid(coords) {
  if (!coords.length) return { lat: 0, lon: 0 };
  const sum = coords.reduce((acc, c) => ({ lon: acc.lon + c[0], lat: acc.lat + c[1] }), { lon: 0, lat: 0 });
  return { lat: sum.lat / coords.length, lon: sum.lon / coords.length };
}

export default function PlanMasseAuto({ addrData, pluData, batimentsData, projetData, onSave }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(15); // pixels par mètre
  const [projetRect, setProjetRect] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [startPt, setStartPt] = useState(null);
  const [currentPt, setCurrentPt] = useState(null);
  const [showPLU, setShowPLU] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState('view'); // view, draw

  const W = 700, H = 520;

  const center = addrData
    ? { lat: addrData.lat, lon: addrData.lon }
    : batimentsData?.center || { lat: 48.8566, lon: 2.3522 };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Fond blanc
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, W, H);

    // Grille de référence
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    const gridM = 5; // grille 5m
    const gridPx = gridM * scale;
    const offsetX = (W / 2) % gridPx;
    const offsetY = (H / 2) % gridPx;
    for (let x = offsetX; x < W; x += gridPx) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = offsetY; y < H; y += gridPx) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Zone recul PLU (si disponible)
    if (showPLU && batimentsData?.regles && batimentsData?.parcelle) {
      const regles = batimentsData.regles;
      const parcelCoords = getPolygonCoords(batimentsData.parcelle.geometry);
      if (parcelCoords.length > 0) {
        // Zone constructible (recul appliqué visuellement)
        ctx.setLineDash([6, 3]);
        ctx.strokeStyle = 'rgba(239,68,68,.4)';
        ctx.lineWidth = 1.5;
        // Dessiner la zone de recul avec offset
        const reculPx = regles.recul_limite * scale;
        const parcelPts = parcelCoords.map(c => geoToCanvas(c[1], c[0], center, scale, W, H));
        if (parcelPts.length > 2) {
          ctx.beginPath();
          // Version simplifiée : inset du polygone
          const cx = parcelPts.reduce((s, p) => s + p.x, 0) / parcelPts.length;
          const cy = parcelPts.reduce((s, p) => s + p.y, 0) / parcelPts.length;
          const insetPts = parcelPts.map(p => ({
            x: cx + (p.x - cx) * (1 - reculPx / Math.max(Math.abs(p.x - cx), 1) * 0.5),
            y: cy + (p.y - cy) * (1 - reculPx / Math.max(Math.abs(p.y - cy), 1) * 0.5),
          }));
          insetPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.fillStyle = 'rgba(74,222,128,.05)';
          ctx.fill();
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
    }

    // Parcelle cadastrale
    if (batimentsData?.parcelle?.geometry) {
      const coords = getPolygonCoords(batimentsData.parcelle.geometry);
      drawPolygon(ctx, coords, center, scale, W, H, 'rgba(251,191,36,.08)', '#f59e0b', 2);
    }

    // Bâtiments existants (IGN BDTOPO)
    if (batimentsData?.batiments) {
      batimentsData.batiments.forEach(bat => {
        const coords = getPolygonCoords(bat.geometry);
        if (coords.length < 3) return;
        drawPolygon(ctx, coords, center, scale, W, H, 'rgba(107,114,128,.25)', '#6b7280', 1.5);
        // Hachures bâtiment existant
        const pts = coords.map(c => geoToCanvas(c[1], c[0], center, scale, W, H));
        const cx2 = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy2 = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        ctx.fillStyle = '#4b5563';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bat.nature || 'Bâtiment', cx2, cy2 - 4);
        ctx.fillText(`H: ${bat.hauteur}m`, cx2, cy2 + 8);
        ctx.textAlign = 'left';
      });
    }

    // Projet (dessiné par l'utilisateur ou proposé auto)
    if (projetRect) {
      ctx.fillStyle = 'rgba(26,86,219,.15)';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2.5;
      ctx.fillRect(projetRect.x, projetRect.y, projetRect.w, projetRect.h);
      ctx.strokeRect(projetRect.x, projetRect.y, projetRect.w, projetRect.h);

      // Cotations
      if (showDims) {
        const wM = (Math.abs(projetRect.w) / scale).toFixed(1);
        const hM = (Math.abs(projetRect.h) / scale).toFixed(1);
        const surf = (Math.abs(projetRect.w) * Math.abs(projetRect.h) / (scale * scale)).toFixed(0);

        ctx.fillStyle = '#1d4ed8';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';

        // Largeur
        const mx = projetRect.x + projetRect.w / 2;
        const my = projetRect.y + projetRect.h / 2;
        ctx.fillText(`${wM}m`, mx, projetRect.y - 6);
        // Hauteur
        ctx.save(); ctx.translate(projetRect.x + projetRect.w + 14, my); ctx.rotate(Math.PI / 2);
        ctx.fillText(`${hM}m`, 0, 0); ctx.restore();
        // Surface
        ctx.fillText(`${surf} m²`, mx, my + 5);
        ctx.font = '10px Arial';
        ctx.fillText('PROJET', mx, my - 8);
        ctx.textAlign = 'left';

        // Ligne de cote largeur
        ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(projetRect.x, projetRect.y - 12);
        ctx.lineTo(projetRect.x + projetRect.w, projetRect.y - 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(projetRect.x + projetRect.w + 20, projetRect.y);
        ctx.lineTo(projetRect.x + projetRect.w + 20, projetRect.y + projetRect.h);
        ctx.stroke();
      }
    }

    // Projet en cours de dessin
    if (drawing && startPt && currentPt) {
      ctx.fillStyle = 'rgba(26,86,219,.1)';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      const w = currentPt.x - startPt.x, h = currentPt.y - startPt.y;
      ctx.fillRect(startPt.x, startPt.y, w, h);
      ctx.strokeRect(startPt.x, startPt.y, w, h);
      ctx.setLineDash([]);
      // Dimensions temps réel
      ctx.fillStyle = '#1d4ed8'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
      ctx.fillText(`${(Math.abs(w)/scale).toFixed(1)}m × ${(Math.abs(h)/scale).toFixed(1)}m`, startPt.x + w/2, startPt.y + h/2);
      ctx.fillText(`${(Math.abs(w)*Math.abs(h)/(scale*scale)).toFixed(0)} m²`, startPt.x + w/2, startPt.y + h/2 + 14);
      ctx.textAlign = 'left';
    }

    // Flèche Nord
    ctx.save();
    ctx.translate(W - 50, 50);
    ctx.strokeStyle = '#111'; ctx.fillStyle = '#111'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(0, -20); ctx.lineTo(6, 5); ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
    ctx.fillText('N', 0, 38);
    ctx.restore();

    // Légende
    const legX = 10, legY = H - 100;
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillRect(legX - 4, legY - 14, 160, 90);
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5;
    ctx.strokeRect(legX - 4, legY - 14, 160, 90);
    ctx.font = 'bold 9px Arial'; ctx.fillStyle = '#333';
    ctx.fillText('LÉGENDE', legX, legY);
    const items = [
      ['#f59e0b', 'Parcelle cadastrale'],
      ['rgba(107,114,128,.5)', 'Bâtiment existant'],
      ['rgba(26,86,219,.4)', 'Projet'],
      ['rgba(239,68,68,.4)', 'Zone de recul PLU'],
    ];
    items.forEach(([color, label], i) => {
      ctx.fillStyle = color;
      ctx.fillRect(legX, legY + 10 + i * 16, 12, 10);
      ctx.fillStyle = '#333'; ctx.font = '9px Arial';
      ctx.fillText(label, legX + 16, legY + 19 + i * 16);
    });

    // Titre + échelle
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.fillRect(0, 0, W, 30);
    ctx.fillStyle = '#111'; ctx.font = 'bold 11px Arial';
    ctx.fillText(`Plan de masse — PC2/DP2 — Échelle 1:${Math.round(100/scale*10)}`, 10, 18);
    if (batimentsData?.parcelle) {
      ctx.font = '9px Arial'; ctx.fillStyle = '#666';
      ctx.fillText(`Parcelle ${batimentsData.parcelle.section || ''}${batimentsData.parcelle.numero || ''} — ${batimentsData.parcelle.contenance || '?'}m²`, 10, 28);
    }
    if (batimentsData?.plu) {
      ctx.fillText(`Zone PLU: ${batimentsData.plu.zone || 'UB'} | Recul min: ${batimentsData.regles?.recul_limite || 3}m | H max: ${batimentsData.regles?.hauteur_max || 9}m`, W/2, 18);
    }

    // Échelle graphique
    const scaleBarX = W - 150, scaleBarY = H - 20;
    const bar10m = 10 * scale;
    ctx.fillStyle = '#333'; ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(scaleBarX, scaleBarY); ctx.lineTo(scaleBarX + bar10m, scaleBarY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(scaleBarX, scaleBarY - 4); ctx.lineTo(scaleBarX, scaleBarY + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(scaleBarX + bar10m, scaleBarY - 4); ctx.lineTo(scaleBarX + bar10m, scaleBarY + 4); ctx.stroke();
    ctx.font = '9px Arial'; ctx.textAlign = 'center';
    ctx.fillText('10m', scaleBarX + bar10m / 2, scaleBarY - 6);
    ctx.textAlign = 'left';

  }, [batimentsData, projetRect, drawing, startPt, currentPt, scale, showPLU, showDims, center, W, H]);

  useEffect(() => { draw(); }, [draw]);

  function getCanvasPos(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onDown(e) {
    if (mode !== 'draw') return;
    const p = getCanvasPos(e);
    setStartPt(p); setDrawing(true);
  }
  function onMove(e) {
    if (!drawing) return;
    setCurrentPt(getCanvasPos(e));
  }
  function onUp(e) {
    if (!drawing || !startPt) return;
    const p = getCanvasPos(e);
    const w = p.x - startPt.x, h = p.y - startPt.y;
    if (Math.abs(w) > 10 && Math.abs(h) > 10) {
      setProjetRect({ x: startPt.x, y: startPt.y, w, h });
    }
    setDrawing(false); setStartPt(null); setCurrentPt(null);
  }

  // Proposer automatiquement l'emplacement du projet
  function proposeAuto() {
    if (!projetData?.surface_creee) return;
    const surf = parseFloat(projetData.surface_creee) || 30;
    const sideM = Math.sqrt(surf);
    const sidePx = sideM * scale;
    // Placer le projet en bas de la parcelle (sud) avec recul
    const reculPx = (batimentsData?.regles?.recul_limite || 3) * scale;
    setProjetRect({
      x: W / 2 - sidePx / 2,
      y: H / 2 + 40 + reculPx,
      w: sidePx,
      h: sidePx,
    });
  }

  function exportPNG() {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data; a.download = 'plan-masse-PC2.png'; a.click();
    if (onSave) onSave(data, 'PC2');
    setSaved(true);
  }

  const surfaceProjet = projetRect
    ? (Math.abs(projetRect.w) * Math.abs(projetRect.h) / (scale * scale)).toFixed(0)
    : null;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setMode(mode === 'draw' ? 'view' : 'draw')}
          style={{ padding: '7px 14px', background: mode === 'draw' ? '#1d4ed8' : 'transparent', border: `0.5px solid ${mode === 'draw' ? '#1d4ed8' : '#1c1c2a'}`, borderRadius: 8, color: mode === 'draw' ? '#fff' : '#f2efe9', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          {mode === 'draw' ? '✏️ Mode dessin actif' : '🖱️ Dessiner le projet'}
        </button>
        <button onClick={proposeAuto}
          style={{ padding: '7px 14px', background: 'rgba(160,120,32,.1)', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 8, color: '#a07820', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          🤖 Proposer automatiquement
        </button>
        {projetRect && <button onClick={() => setProjetRect(null)}
          style={{ padding: '7px 12px', background: 'transparent', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 8, color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          🗑 Supprimer
        </button>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ fontSize: 11, color: '#5a5650' }}>Zoom:</span>
          <button onClick={() => setScale(s => Math.min(s + 2, 30))} style={{ padding: '4px 10px', background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 6, color: '#f2efe9', cursor: 'pointer', fontSize: 14 }}>+</button>
          <button onClick={() => setScale(s => Math.max(s - 2, 5))} style={{ padding: '4px 10px', background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 6, color: '#f2efe9', cursor: 'pointer', fontSize: 14 }}>−</button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5a5650', cursor: 'pointer' }}>
          <input type="checkbox" checked={showPLU} onChange={e => setShowPLU(e.target.checked)} />
          Règles PLU
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5a5650', cursor: 'pointer' }}>
          <input type="checkbox" checked={showDims} onChange={e => setShowDims(e.target.checked)} />
          Cotations
        </label>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={W} height={H}
        style={{ border: '1px solid #1c1c2a', borderRadius: 10, display: 'block', maxWidth: '100%', cursor: mode === 'draw' ? 'crosshair' : 'default' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} />

      {/* Info projet */}
      {projetRect && batimentsData?.regles && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: '#111118', borderRadius: 8, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#5a5650' }}>Surface projet: </span>
            <span style={{ color: '#e8b420', fontWeight: 600 }}>{surfaceProjet} m²</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#5a5650' }}>Emprise autorisée (PLU): </span>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>max {(batimentsData.regles.emprise_max * 100).toFixed(0)}%</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#5a5650' }}>H max PLU: </span>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>{batimentsData.regles.hauteur_max}m</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#5a5650' }}>Recul limite: </span>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>{batimentsData.regles.recul_limite}m min</span>
          </div>
        </div>
      )}

      {/* PLU alerte */}
      {batimentsData?.regles && projetRect && parseFloat(surfaceProjet) > (batimentsData.regles.emprise_max * (batimentsData.parcelle?.contenance || 500)) && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 12, color: '#ef4444' }}>
          ⚠️ Surface projet dépasse l'emprise maximale autorisée par le PLU ({(batimentsData.regles.emprise_max * 100).toFixed(0)}%)
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={exportPNG}
          style={{ padding: '9px 18px', background: saved ? 'rgba(74,222,128,.1)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: saved ? '0.5px solid rgba(74,222,128,.3)' : 'none', borderRadius: 8, color: saved ? '#4ade80' : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {saved ? '✓ PC2 enregistré' : '⬇ Télécharger PC2 — Plan de masse'}
        </button>
      </div>

      {mode === 'draw' && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#5a5650', padding: '8px 12px', background: 'rgba(26,86,219,.05)', borderRadius: 8, border: '0.5px solid rgba(26,86,219,.15)' }}>
          💡 Cliquez et glissez pour dessiner votre projet sur le plan. Les cotations en mètres s'affichent en temps réel. La zone verte indique la zone constructible selon le PLU.
        </div>
      )}
    </div>
  );
}
