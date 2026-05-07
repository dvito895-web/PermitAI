'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * PLAN DE MASSE AUTOMATIQUE - VERSION PREMIUM VERCEL-READY
 * Adapté pour PermitAI 2.0
 */

// --- Utilitaires de conversion Géospatiale ---
function geoToCanvas(lat, lon, center, scale, W, H, dpr = 1) {
  const metersPerDegLat = 111320;
  const metersPerDegLon = 111320 * Math.cos((center.lat * Math.PI) / 180);
  const dx = (lon - center.lon) * metersPerDegLon;
  const dy = (lat - center.lat) * metersPerDegLat;
  return {
    x: (W / 2 + dx * scale) * dpr,
    y: (H / 2 - dy * scale) * dpr,
  };
}

function getPolygonCoords(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates[0] || [];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates[0]?.[0] || [];
  return [];
}

export default function PlanMasseAuto({ addrData, batimentsData, projetData, onSave }) {
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
  const [mounted, setMounted] = useState(false);

  const W = 800;
  const H = 600;

  // Sécurité SSR : On ne monte le composant que côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  const center = addrData
    ? { lat: addrData.lat, lon: addrData.lon }
    : batimentsData?.center || { lat: 48.8566, lon: 2.3522 };

  const draw = useCallback(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Ajustement pour écrans Retina (Haute Définition)
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    // Fond blanc cassé "Architecte"
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W * dpr, H * dpr);

    // Grille de référence fine
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1 * dpr;
    const gridM = 5;
    const gridPx = gridM * scale * dpr;
    const offsetX = ((W * dpr) / 2) % gridPx;
    const offsetY = ((H * dpr) / 2) % gridPx;
    for (let x = offsetX; x < W * dpr; x += gridPx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H * dpr);
      ctx.stroke();
    }
    for (let y = offsetY; y < H * dpr; y += gridPx) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W * dpr, y);
      ctx.stroke();
    }

    const drawPolygon = (coords, fillStyle, strokeStyle, lineWidth = 2, dash = []) => {
      if (!coords || coords.length < 3) return;
      ctx.beginPath();
      ctx.setLineDash(dash.map(d => d * dpr));
      coords.forEach((c, i) => {
        const pt = geoToCanvas(c[1], c[0], center, scale, W, H, dpr);
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth * dpr;
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    // 1. Zone de recul PLU (Rendu en premier pour être en dessous)
    if (showPLU && batimentsData?.regles && batimentsData?.parcelle) {
      const parcelCoords = getPolygonCoords(batimentsData.parcelle.geometry);
      if (parcelCoords.length > 2) {
        // Simulation visuelle du recul (Simplifiée pour le rendu canvas)
        drawPolygon(parcelCoords, 'rgba(74, 222, 128, 0.05)', 'rgba(239, 68, 68, 0.3)', 1.5, [5, 5]);
      }
    }

    // 2. Parcelle cadastrale
    if (batimentsData?.parcelle?.geometry) {
      const coords = getPolygonCoords(batimentsData.parcelle.geometry);
      drawPolygon(coords, 'rgba(232, 180, 32, 0.05)', '#E8B420', 2.5);
    }

    // 3. Bâtiments existants
    if (batimentsData?.batiments) {
      batimentsData.batiments.forEach((bat) => {
        const coords = getPolygonCoords(bat.geometry);
        drawPolygon(coords, 'rgba(156, 163, 175, 0.3)', '#4B5563', 1.5);
        
        // Label bâtiment
        const pts = coords.map(c => geoToCanvas(c[1], c[0], center, scale, W, H, dpr));
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        ctx.fillStyle = '#374151';
        ctx.font = `${10 * dpr}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(bat.nature || 'Existant', cx, cy);
      });
    }

    // 4. Projet
    if (projetRect) {
      const { x, y, w, h } = projetRect;
      const rx = x * dpr;
      const ry = y * dpr;
      const rw = w * dpr;
      const rh = h * dpr;

      // Style "Hachures" pour le projet
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.strokeStyle = 'rgba(29, 78, 216, 0.2)';
      ctx.lineWidth = 1 * dpr;
      for (let i = -1000; i < 2000; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i * dpr, 0);
        ctx.lineTo((i + 1000) * dpr, 2000 * dpr);
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = '#1D4ED8';
      ctx.lineWidth = 3 * dpr;
      ctx.strokeRect(rx, ry, rw, rh);

      if (showDims) {
        const wM = (Math.abs(w) / scale).toFixed(2);
        const hM = (Math.abs(h) / scale).toFixed(2);
        ctx.fillStyle = '#1D4ED8';
        ctx.font = `bold ${12 * dpr}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`${wM}m`, rx + rw / 2, ry - 10 * dpr);
        
        ctx.save();
        ctx.translate(rx + rw + 15 * dpr, ry + rh / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(`${hM}m`, 0, 0);
        ctx.restore();
      }
    }

    // 5. Dessin en cours
    if (drawing && startPt && currentPt) {
      ctx.strokeStyle = '#1D4ED8';
      ctx.setLineDash([5 * dpr, 5 * dpr]);
      const w = (currentPt.x - startPt.x) * dpr;
      const h = (currentPt.y - startPt.y) * dpr;
      ctx.strokeRect(startPt.x * dpr, startPt.y * dpr, w, h);
      ctx.setLineDash([]);
    }

    // 6. Habillage (Nord, Échelle, Légende)
    // Flèche Nord Premium
    ctx.save();
    ctx.translate((W - 60) * dpr, 60 * dpr);
    ctx.beginPath();
    ctx.moveTo(0, -25 * dpr);
    ctx.lineTo(10 * dpr, 10 * dpr);
    ctx.lineTo(0, 5 * dpr);
    ctx.lineTo(-10 * dpr, 10 * dpr);
    ctx.closePath();
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.font = `bold ${16 * dpr}px Inter, sans-serif`;
    ctx.fillText('N', 0, 30 * dpr);
    ctx.restore();

    // Échelle graphique
    const barWidthM = 10;
    const barWidthPx = barWidthM * scale * dpr;
    ctx.lineWidth = 2 * dpr;
    ctx.strokeStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo((W - 150) * dpr, (H - 40) * dpr);
    ctx.lineTo((W - 150 + barWidthPx) * dpr, (H - 40) * dpr);
    ctx.stroke();
    ctx.font = `${12 * dpr}px Inter, sans-serif`;
    ctx.fillText('10m', (W - 150 + barWidthPx / 2) * dpr, (H - 50) * dpr);

  }, [mounted, batimentsData, projetRect, drawing, startPt, currentPt, scale, showPLU, showDims, center]);

  useEffect(() => {
    draw();
  }, [draw]);

  if (!mounted) return <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg" />;

  const handleMouseDown = (e) => {
    if (mode !== 'draw') return;
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPt({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setCurrentPt({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = (e) => {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const endPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setProjetRect({
      x: Math.min(startPt.x, endPt.x),
      y: Math.min(startPt.y, endPt.y),
      w: Math.abs(endPt.x - startPt.x),
      h: Math.abs(endPt.y - startPt.y),
    });
    setDrawing(false);
    setStartPt(null);
    setCurrentPt(null);
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = 'PermitAI-Plan-Masse-PC2.png';
    link.href = data;
    link.click();
    if (onSave) onSave(data);
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* Barre d'outils Premium */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode(mode === 'draw' ? 'view' : 'draw')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'draw' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {mode === 'draw' ? '📍 Terminer le dessin' : '✏️ Dessiner le projet'}
          </button>
          <button
            onClick={() => setProjetRect(null)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
          >
            Effacer
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button onClick={() => setScale(s => Math.max(5, s - 2))} className="p-2 hover:bg-white rounded-md transition-all text-gray-600">−</button>
            <span className="px-3 text-xs font-semibold text-gray-500 min-w-[60px] text-center">Zoom</span>
            <button onClick={() => setScale(s => Math.min(40, s + 2))} className="p-2 hover:bg-white rounded-md transition-all text-gray-600">+</button>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={showPLU} 
              onChange={e => setShowPLU(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-all">Règles PLU</span>
          </label>
        </div>
      </div>

      {/* Zone Canvas */}
      <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`mx-auto ${mode === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
        />
        
        {/* Overlay d'aide */}
        {mode === 'draw' && !projetRect && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-blue-100 text-blue-700 text-sm font-medium animate-bounce">
              Cliquez et glissez pour dessiner l'emprise au sol
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-500 italic">
          Plan de masse conforme PC2/DP2 — Échelle dynamique 1:{Math.round(100/scale*10)}
        </div>
        <button
          onClick={exportPNG}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            saved 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
          }`}
        >
          {saved ? '✓ Plan enregistré' : 'Exporter le Plan de Masse (PNG)'}
        </button>
      </div>
    </div>
  );
}
