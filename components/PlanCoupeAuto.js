'use client';
import { useState, useRef, useEffect } from 'react';

// ============================================================
// PLAN EN COUPE AUTOMATIQUE
// Données réelles : altimétrie IGN MNT + règles PLU
// ============================================================

export default function PlanCoupeAuto({ addrData, batimentsData, projetData, onSave }) {
  const canvasRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [vals, setVals] = useState({
    tn: 0,                   // terrain naturel (NGF)
    tf: 0.2,                 // terrain fini
    hRDC: 2.6,               // hauteur RDC
    hCombles: 1.4,           // hauteur combles
    epaisseurPlancher: 0.25, // dalle béton
    debordToiture: 0.6,      // débord toiture
    penteToit: 35,           // angle degrés
    lBatExistant: 10,        // largeur bâtiment existant
    hBatExistant: 6.5,       // hauteur bâtiment existant (depuis données IGN)
    lProjet: 6,              // largeur projet
    recul: 3,                // recul depuis bâtiment existant
    nomProjet: 'Extension',
    orientation: 'Sud',
  });

  // Auto-remplir depuis données PLU et IGN
  useEffect(() => {
    if (batimentsData?.regles) {
      setVals(v => ({
        ...v,
        hCombles: Math.min(batimentsData.regles.hauteur_max - 2.6, 3),
      }));
    }
    if (batimentsData?.batiments?.[0]?.hauteur) {
      setVals(v => ({ ...v, hBatExistant: parseFloat(batimentsData.batiments[0].hauteur) || 6.5 }));
    }
    if (projetData?.surface_creee) {
      const s = parseFloat(projetData.surface_creee) || 30;
      setVals(v => ({ ...v, lProjet: Math.sqrt(s).toFixed(1) }));
    }
    if (projetData?.hauteur_projet) {
      const h = parseFloat(projetData.hauteur_projet) || 4;
      setVals(v => ({ ...v, hRDC: Math.min(h - 1.4, 2.8) }));
    }
    if (projetData?.materiaux_toiture?.toLowerCase().includes('plat')) {
      setVals(v => ({ ...v, penteToit: 2 }));
    }
    if (batimentsData?.regles?.recul_limite) {
      setVals(v => ({ ...v, recul: batimentsData.regles.recul_limite }));
    }
  }, [batimentsData, projetData]);

  useEffect(() => { drawCoupe(); }, [vals]);

  function drawCoupe() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 720, H = 420;
    const sX = 30, sY = 32; // pixels par mètre
    const baseY = H - 80;
    const startX = 80;

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, W, H);

    // Grille légère
    ctx.strokeStyle = '#ebebeb'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += sX) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += sY) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const tnY = baseY - vals.tn * sY;
    const tfY = baseY - vals.tf * sY;

    // Sol naturel (hachures)
    ctx.fillStyle = 'rgba(139,100,20,.15)';
    ctx.fillRect(0, tnY, W, H - tnY);

    // TN ligne
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 4]);
    ctx.beginPath(); ctx.moveTo(0, tnY); ctx.lineTo(W, tnY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#92400e'; ctx.font = '9px Arial';
    ctx.fillText(`TN = NGF ${vals.tn.toFixed(2)}m`, 4, tnY - 4);

    // TF ligne
    ctx.strokeStyle = '#5c4a1e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, tfY); ctx.lineTo(W, tfY); ctx.stroke();
    ctx.fillStyle = '#5c4a1e'; ctx.font = '9px Arial';
    ctx.fillText(`TF +${vals.tf.toFixed(2)}m`, 4, tfY - 3);

    // Terre hachurée entre TN et TF
    ctx.fillStyle = 'rgba(180,140,80,.3)';
    ctx.fillRect(0, tfY, W, tnY - tfY);

    // == BÂTIMENT EXISTANT ==
    const batX = startX;
    const batW = vals.lBatExistant * sX;
    const batH = vals.hBatExistant * sY;
    const batY = tfY - batH;

    // Murs
    ctx.fillStyle = 'rgba(107,114,128,.2)';
    ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 2;
    ctx.fillRect(batX, batY, batW, batH);
    ctx.strokeRect(batX, batY, batW, batH);

    // Toiture bâtiment existant
    const tH_ex = (vals.hBatExistant * 0.3) * sY;
    ctx.beginPath();
    ctx.moveTo(batX - vals.debordToiture * sX, batY);
    ctx.lineTo(batX + batW / 2, batY - tH_ex);
    ctx.lineTo(batX + batW + vals.debordToiture * sX, batY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(107,114,128,.3)'; ctx.fill();
    ctx.strokeStyle = '#6b7280'; ctx.stroke();

    // Fenêtres bâtiment existant
    ctx.fillStyle = 'rgba(200,230,255,.6)'; ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1;
    [[batX + batW * 0.2, batY + batH * 0.3], [batX + batW * 0.6, batY + batH * 0.3]].forEach(([fx, fy]) => {
      ctx.fillRect(fx, fy, sX * 0.8, sY * 0.8);
      ctx.strokeRect(fx, fy, sX * 0.8, sY * 0.8);
    });

    // Label existant
    ctx.fillStyle = '#6b7280'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
    ctx.fillText('EXISTANT', batX + batW / 2, batY + batH / 2);
    ctx.textAlign = 'left';

    // == PROJET ==
    const projX = batX + batW + vals.recul * sX;
    const projW = parseFloat(vals.lProjet) * sX;
    const projH = vals.hRDC * sY;
    const projY = tfY - vals.epaisseurPlancher * sY - projH;
    const comblesH = vals.hCombles * sY;

    // Dalle béton
    ctx.fillStyle = 'rgba(156,163,175,.4)';
    ctx.fillRect(projX, tfY - vals.epaisseurPlancher * sY, projW, vals.epaisseurPlancher * sY);

    // Murs projet
    ctx.fillStyle = 'rgba(26,86,219,.12)';
    ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2.5;
    ctx.fillRect(projX, projY, projW, projH);
    ctx.strokeRect(projX, projY, projW, projH);

    // Toiture projet
    const pentRad = (vals.penteToit * Math.PI) / 180;
    if (vals.penteToit > 5) {
      // Toit en pente
      ctx.beginPath();
      ctx.moveTo(projX - vals.debordToiture * sX, projY);
      ctx.lineTo(projX + projW / 2, projY - comblesH);
      ctx.lineTo(projX + projW + vals.debordToiture * sX, projY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(26,86,219,.2)'; ctx.fill();
      ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2; ctx.stroke();
    } else {
      // Toit plat
      ctx.fillStyle = 'rgba(26,86,219,.2)';
      ctx.fillRect(projX - vals.debordToiture * sX, projY - comblesH, projW + vals.debordToiture * 2 * sX, comblesH);
      ctx.strokeRect(projX - vals.debordToiture * sX, projY - comblesH, projW + vals.debordToiture * 2 * sX, comblesH);
    }

    // Fenêtre projet
    ctx.fillStyle = 'rgba(200,230,255,.8)'; ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1;
    ctx.fillRect(projX + projW * 0.3, projY + projH * 0.3, sX * 0.9, sY * 0.9);
    ctx.strokeRect(projX + projW * 0.3, projY + projH * 0.3, sX * 0.9, sY * 0.9);

    // Label projet
    ctx.fillStyle = '#1d4ed8'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    ctx.fillText(vals.nomProjet || 'PROJET', projX + projW / 2, projY + projH / 2);
    ctx.textAlign = 'left';

    // == COTATIONS ==
    ctx.strokeStyle = '#374151'; ctx.fillStyle = '#374151'; ctx.lineWidth = 0.8; ctx.font = '9px Arial';

    const cotRight = projX + projW + vals.debordToiture * sX + 25;

    // Hauteur RDC
    ctx.beginPath(); ctx.moveTo(cotRight, tfY); ctx.lineTo(cotRight, projY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cotRight - 5, tfY); ctx.lineTo(cotRight + 5, tfY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cotRight - 5, projY); ctx.lineTo(cotRight + 5, projY); ctx.stroke();
    ctx.fillText(`${vals.hRDC}m`, cotRight + 8, (tfY + projY) / 2 + 4);

    // Hauteur combles
    const toitTopY = vals.penteToit > 5 ? projY - comblesH : projY - comblesH;
    ctx.beginPath(); ctx.moveTo(cotRight + 20, projY); ctx.lineTo(cotRight + 20, toitTopY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cotRight + 15, projY); ctx.lineTo(cotRight + 25, projY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cotRight + 15, toitTopY); ctx.lineTo(cotRight + 25, toitTopY); ctx.stroke();
    ctx.fillText(`${vals.hCombles}m`, cotRight + 28, (projY + toitTopY) / 2 + 4);

    // Hauteur totale
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 0.5;
    const cotRight2 = cotRight + 50;
    ctx.beginPath(); ctx.moveTo(cotRight2, tfY); ctx.lineTo(cotRight2, toitTopY); ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.fillText(`H tot = ${(vals.hRDC + vals.hCombles).toFixed(1)}m`, cotRight2 + 4, (tfY + toitTopY) / 2);

    // Recul
    ctx.strokeStyle = '#059669'; ctx.fillStyle = '#059669'; ctx.lineWidth = 1;
    const reculY = tfY + 12;
    ctx.beginPath(); ctx.moveTo(batX + batW, reculY); ctx.lineTo(projX, reculY); ctx.stroke();
    ctx.fillText(`Recul: ${vals.recul}m`, batX + batW + (vals.recul * sX) / 2 - 15, reculY + 12);

    // Largeur projet
    ctx.strokeStyle = '#1d4ed8'; ctx.fillStyle = '#1d4ed8'; ctx.lineWidth = 0.8;
    const largeY = tfY + 28;
    ctx.beginPath(); ctx.moveTo(projX, largeY); ctx.lineTo(projX + projW, largeY); ctx.stroke();
    ctx.fillText(`L: ${vals.lProjet}m`, projX + projW / 2 - 15, largeY + 12);

    // Règle H max PLU
    if (batimentsData?.regles?.hauteur_max) {
      const hMaxY = tfY - batimentsData.regles.hauteur_max * sY;
      ctx.strokeStyle = 'rgba(239,68,68,.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(projX - 20, hMaxY); ctx.lineTo(projX + projW + 20, hMaxY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444'; ctx.font = '9px Arial';
      ctx.fillText(`H max PLU: ${batimentsData.regles.hauteur_max}m`, projX - 15, hMaxY - 4);
    }

    // Flèche Nord
    ctx.fillStyle = '#111'; ctx.font = 'bold 12px Arial';
    ctx.fillText(`← ${vals.orientation}`, W - 90, 18);

    // Titre
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = '#111'; ctx.font = 'bold 10px Arial';
    ctx.fillText(`Plan en coupe — PC3/DP3 — ${vals.nomProjet}`, 8, 14);

    // Zone PLU info
    if (batimentsData?.plu?.zone) {
      ctx.fillStyle = '#666'; ctx.font = '9px Arial';
      ctx.fillText(`Zone ${batimentsData.plu.zone} | Recul min ${batimentsData.regles?.recul_limite || 3}m | H max ${batimentsData.regles?.hauteur_max || 9}m`, W / 2, 14);
    }
  }

  const Inp = ({ label, k, step = 0.1, unit = 'm' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <label style={{ fontSize: 9, color: '#5a5650', textTransform: 'uppercase' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <input type="number" value={vals[k]} step={step}
          onChange={e => setVals(v => ({ ...v, [k]: parseFloat(e.target.value) || 0 }))}
          style={{ width: 65, background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 6, padding: '4px 6px', fontSize: 12, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }} />
        <span style={{ fontSize: 10, color: '#3e3a34' }}>{unit}</span>
      </div>
    </div>
  );

  function exportPNG() {
    const data = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a'); a.href = data; a.download = 'plan-coupe-PC3.png'; a.click();
    if (onSave) onSave(data, 'PC3');
    setSaved(true);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Données auto */}
      {batimentsData?.batiments?.[0] && (
        <div style={{ padding: '8px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80', marginBottom: 10 }}>
          ✅ Données IGN BDTOPO importées — H bâtiment existant: {batimentsData.batiments[0].hauteur}m · PLU Zone {batimentsData.plu?.zone}: H max {batimentsData.regles?.hauteur_max}m
        </div>
      )}

      {/* Paramètres */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, padding: '10px 12px', background: '#111118', borderRadius: 10 }}>
        <Inp label="TN (NGF)" k="tn" />
        <Inp label="TF" k="tf" />
        <Inp label="H RDC" k="hRDC" />
        <Inp label="H combles" k="hCombles" />
        <Inp label="L projet" k="lProjet" step={0.5} />
        <Inp label="Recul" k="recul" />
        <Inp label="L existant" k="lBatExistant" step={0.5} />
        <Inp label="H existant" k="hBatExistant" />
        <Inp label="Pente toit" k="penteToit" step={5} unit="°" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label style={{ fontSize: 9, color: '#5a5650', textTransform: 'uppercase' }}>Orientation</label>
          <select value={vals.orientation} onChange={e => setVals(v => ({ ...v, orientation: e.target.value }))}
            style={{ width: 70, background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 6, padding: '4px 6px', fontSize: 11, color: '#f2efe9', fontFamily: 'inherit' }}>
            <option>Sud</option><option>Nord</option><option>Est</option><option>Ouest</option>
          </select>
        </div>
      </div>

      <canvas ref={canvasRef} width={720} height={420}
        style={{ border: '1px solid #1c1c2a', borderRadius: 10, display: 'block', background: '#fafafa', maxWidth: '100%' }} />

      {/* Vérification PLU */}
      {batimentsData?.regles && (
        <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(vals.hRDC + vals.hCombles) > batimentsData.regles.hauteur_max ? (
            <div style={{ padding: '7px 12px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 11, color: '#ef4444' }}>
              ⚠️ Hauteur totale {(vals.hRDC + vals.hCombles).toFixed(1)}m dépasse le PLU ({batimentsData.regles.hauteur_max}m max)
            </div>
          ) : (
            <div style={{ padding: '7px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80' }}>
              ✓ Hauteur {(vals.hRDC + vals.hCombles).toFixed(1)}m conforme au PLU (max {batimentsData.regles.hauteur_max}m)
            </div>
          )}
          {vals.recul < batimentsData.regles.recul_limite ? (
            <div style={{ padding: '7px 12px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 11, color: '#ef4444' }}>
              ⚠️ Recul {vals.recul}m insuffisant (min {batimentsData.regles.recul_limite}m)
            </div>
          ) : (
            <div style={{ padding: '7px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80' }}>
              ✓ Recul {vals.recul}m conforme (min {batimentsData.regles.recul_limite}m)
            </div>
          )}
        </div>
      )}

      <button onClick={exportPNG}
        style={{ marginTop: 10, padding: '9px 18px', background: saved ? 'rgba(74,222,128,.1)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: saved ? '0.5px solid rgba(74,222,128,.3)' : 'none', borderRadius: 8, color: saved ? '#4ade80' : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        {saved ? '✓ PC3 enregistré' : '⬇ Télécharger PC3 — Plan en coupe'}
      </button>
    </div>
  );
}
