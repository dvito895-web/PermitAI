'use client';
import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ============================================================
// CERFA DATA
// ============================================================
const CERFA_DATA = {
  '13406': { numero: '13406*07', nom: 'Permis de construire — maison individuelle', emoji: '🏠', delai: '2 mois', pieces: [
    { code: 'PC1', nom: 'Plan de situation', obligatoire: true, generation: 'auto', description: 'Généré automatiquement depuis les données IGN officielles' },
    { code: 'PC2', nom: 'Plan de masse', obligatoire: true, generation: 'draw_masse', description: 'Dessinez votre projet sur le fond cadastral — outil de dessin intégré' },
    { code: 'PC3', nom: 'Plan en coupe', obligatoire: true, generation: 'draw_coupe', description: 'Entrez les dimensions — la coupe architecturale se génère automatiquement' },
    { code: 'PC4', nom: 'Plans des façades et toitures', obligatoire: true, generation: 'upload', description: 'Photos ou dessins des façades avant/après travaux' },
    { code: 'PC5', nom: "Document graphique d'insertion", obligatoire: true, generation: 'upload', description: "Photo du terrain + esquisse du projet dans son environnement" },
    { code: 'PC6', nom: 'Photographies environnement', obligatoire: true, generation: 'photo', description: 'Photos depuis et vers le terrain depuis espace public' },
    { code: 'PC7', nom: 'Notice descriptive', obligatoire: true, generation: 'ia', description: 'Rédigée automatiquement par PermitAI depuis vos données' },
    { code: 'PC8', nom: 'Justificatifs demandeur', obligatoire: true, generation: 'upload', description: 'Titre de propriété ou autorisation du propriétaire' },
  ]},
  '13703': { numero: '13703*11', nom: 'Déclaration préalable — maison individuelle', emoji: '📋', delai: '1 mois', pieces: [
    { code: 'DP1', nom: 'Plan de situation', obligatoire: true, generation: 'auto', description: 'Généré automatiquement depuis IGN' },
    { code: 'DP2', nom: 'Plan de masse', obligatoire: true, generation: 'draw_masse', description: 'Outil de dessin intégré avec fond cadastral' },
    { code: 'DP3', nom: 'Plan en coupe', obligatoire: false, generation: 'draw_coupe', description: 'Si modification du profil du terrain' },
    { code: 'DP4', nom: 'Plans des façades', obligatoire: true, generation: 'upload', description: 'Façades avant/après' },
    { code: 'DP5', nom: 'Représentation extérieure', obligatoire: true, generation: 'upload', description: 'Photo + simulation du projet' },
    { code: 'DP6', nom: 'Photographies', obligatoire: true, generation: 'photo', description: 'Photos du terrain et environnement' },
    { code: 'DP7', nom: 'Notice descriptive', obligatoire: true, generation: 'ia', description: 'Générée automatiquement par PermitAI' },
  ]},
  '13410': { numero: '13410*06', nom: "Certificat d'urbanisme", emoji: '📜', delai: '1 à 2 mois', pieces: [
    { code: 'CU1', nom: 'Plan de situation', obligatoire: true, generation: 'auto', description: 'Généré automatiquement' },
    { code: 'CU2', nom: 'Note descriptive (CUb)', obligatoire: false, generation: 'ia', description: 'Pour CUb uniquement' },
  ]},
  '13414': { numero: '13414*05', nom: 'Déclaration ouverture chantier', emoji: '🚧', delai: 'Immédiat', pieces: [] },
  '13408': { numero: '13408*08', nom: 'DAACT — Achèvement travaux', emoji: '✅', delai: '90 jours', pieces: [] },
};

function detectCerfa(surface, type) {
  const s = parseInt(surface) || 0;
  if (s > 150) return null;
  if (['construction', 'surelevation'].includes(type)) return '13406';
  if (type === 'extension') return s > 20 ? '13406' : '13703';
  if (type === 'doc') return '13414';
  if (type === 'daact') return '13408';
  if (type === 'certificat') return '13410';
  return '13703';
}

// ============================================================
// COMPOSANTS DÉFINIS EN DEHORS DU WIZARD (fix perte focus)
// ============================================================

// Autocomplete adresse
function AdresseField({ value, onChange, onSelect }) {
  const [sugg, setSugg] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const search = (val) => {
    onChange(val);
    clearTimeout(timer.current);
    if (!val || val.length < 1) { setSugg([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/address?q=' + encodeURIComponent(val) + '&limit=6');
        const d = await r.json();
        const s = (d.features || []).map(f => ({
          label: f.properties.label, city: f.properties.city,
          postcode: f.properties.postcode, citycode: f.properties.citycode,
          context: f.properties.context,
          lat: f.geometry?.coordinates?.[1], lon: f.geometry?.coordinates?.[0],
        }));
        setSugg(s); setOpen(s.length > 0);
      } catch { setSugg([]); }
    }, 300);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2, fontSize: 15, color: value ? '#a07820' : '#3e3a34' }}>📍</span>
      <input type="text" value={value} autoComplete="off" spellCheck="false"
        onChange={e => search(e.target.value)}
        placeholder="Ex: 12 avenue des Fleurs, Paris 75011"
        style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px 11px 38px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
      {open && sugg.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999, background: '#0e0e1a', border: '0.5px solid rgba(160,120,32,.4)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,.9)' }}>
          {sugg.map((s, i) => (
            <button key={i} type="button"
              onMouseDown={e => { e.preventDefault(); onSelect(s); onChange(s.label); setOpen(false); setSugg([]); }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '11px 14px', background: 'transparent', border: 'none', borderBottom: i < sugg.length - 1 ? '0.5px solid #111118' : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 10, color: '#3e3a34', marginTop: 2 }}>{s.context}</span>
            </button>
          ))}
          <div style={{ padding: '5px 14px', fontSize: 9, color: '#1a1a28', borderTop: '0.5px solid #0a0a10', textAlign: 'right' }}>api-adresse.data.gouv.fr · 34 970 communes</div>
        </div>
      )}
    </div>
  );
}

// Plan de masse canvas
function PlanMasseCanvas({ planData, onSave }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('rect');
  const [shapes, setShapes] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState(null);
  const [current, setCurrent] = useState(null);
  const [saved, setSaved] = useState(false);
  const W = 640, H = 420;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = '#888'; ctx.font = '10px Arial';
    ctx.fillText('Plan de masse — PC2/DP2 | Bleu = projet | Gris = existant | Échelle 1:200', 8, 14);

    [...shapes, ...(current ? [current] : [])].forEach(s => {
      if (s.type === 'rect') {
        ctx.fillStyle = s.color === 'gray' ? 'rgba(100,100,100,.15)' : 'rgba(26,86,219,.12)';
        ctx.strokeStyle = s.color === 'gray' ? '#666' : '#1a56db'; ctx.lineWidth = 2;
        ctx.fillRect(s.x, s.y, s.w, s.h); ctx.strokeRect(s.x, s.y, s.w, s.h);
        if (s.label) { ctx.fillStyle = s.color === 'gray' ? '#666' : '#1a56db'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText(s.label, s.x + s.w / 2, s.y + s.h / 2 + 4); ctx.textAlign = 'left'; }
        const wm = (Math.abs(s.w) * 0.4).toFixed(1), hm = (Math.abs(s.h) * 0.4).toFixed(1);
        ctx.fillStyle = '#555'; ctx.font = '9px Arial'; ctx.textAlign = 'center';
        ctx.fillText(`${wm}m`, s.x + s.w / 2, s.y - 3);
        ctx.fillText(`${hm}m`, s.x + s.w + 8, s.y + s.h / 2 + 4);
        ctx.textAlign = 'left';
      }
      if (s.type === 'north') {
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(s.x, s.y + 25); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.x - 5, s.y + 8); ctx.lineTo(s.x, s.y); ctx.lineTo(s.x + 5, s.y + 8); ctx.closePath(); ctx.fillStyle = '#111'; ctx.fill();
        ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.fillText('N', s.x, s.y - 4); ctx.textAlign = 'left';
      }
    });
  }, [shapes, current]);

  const gp = (e) => { const r = canvasRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onDown = (e) => { const p = gp(e); setStart(p); setDrawing(true); if (tool === 'north') { setShapes(s => [...s, { type: 'north', x: p.x, y: p.y }]); setDrawing(false); } };
  const onMove = (e) => { if (!drawing || !start) return; const p = gp(e); if (tool === 'rect' || tool === 'existing') setCurrent({ type: 'rect', x: start.x, y: start.y, w: p.x - start.x, h: p.y - start.y, color: tool === 'existing' ? 'gray' : 'blue', label: '' }); };
  const onUp = (e) => {
    if (!drawing || !start) return;
    const p = gp(e);
    if ((tool === 'rect' || tool === 'existing') && Math.abs(p.x - start.x) > 10 && Math.abs(p.y - start.y) > 10) {
      const label = window.prompt('Étiquette (ex: Maison, Extension, Garage):') || '';
      setShapes(s => [...s, { type: 'rect', x: start.x, y: start.y, w: p.x - start.x, h: p.y - start.y, color: tool === 'existing' ? 'gray' : 'blue', label }]);
    }
    setCurrent(null); setDrawing(false); setStart(null);
  };

  const save = () => {
    const data = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a'); a.href = data; a.download = 'plan-masse-PC2.png'; a.click();
    if (onSave) onSave(data, 'PC2');
    setSaved(true);
  };

  const btnStyle = (t) => ({ padding: '6px 12px', background: tool === t ? '#1a56db' : 'transparent', border: `0.5px solid ${tool === t ? '#1a56db' : '#1c1c2a'}`, borderRadius: 6, color: tool === t ? '#fff' : '#f2efe9', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' });

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setTool('rect')} style={btnStyle('rect')}>⬜ Projet</button>
        <button onClick={() => setTool('existing')} style={btnStyle('existing')}>⬜ Existant</button>
        <button onClick={() => setTool('north')} style={btnStyle('north')}>↑ Nord</button>
        <button onClick={() => setShapes(s => s.slice(0, -1))} style={{ padding: '6px 10px', background: 'transparent', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 6, color: '#ef4444', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>↩ Annuler</button>
        <button onClick={() => setShapes([])} style={{ padding: '6px 10px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 6, color: '#5a5650', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>🗑 Effacer</button>
      </div>
      <div style={{ fontSize: 10, color: '#5a5650', marginBottom: 6 }}>Glissez pour dessiner — cliquez sur le type avant de dessiner</div>
      {planData && (
        <div style={{ marginBottom: 8, padding: '6px 10px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 6, fontSize: 11 }}>
          <a href={planData.geoportail} target="_blank" rel="noreferrer" style={{ color: '#a07820', marginRight: 12 }}>🗺️ Voir parcelle sur Géoportail →</a>
          <a href={planData.embed_url} target="_blank" rel="noreferrer" style={{ color: '#5a5650' }}>OpenStreetMap →</a>
        </div>
      )}
      <canvas ref={canvasRef} width={W} height={H}
        style={{ border: '1px solid #1c1c2a', borderRadius: 8, display: 'block', background: '#fff', maxWidth: '100%', cursor: 'crosshair' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} />
      <button onClick={save} style={{ marginTop: 8, padding: '8px 16px', background: saved ? 'rgba(74,222,128,.1)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: saved ? '0.5px solid rgba(74,222,128,.3)' : 'none', borderRadius: 8, color: saved ? '#4ade80' : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        {saved ? '✓ PC2 sauvegardé' : '⬇ Télécharger PC2 (PNG)'}
      </button>
    </div>
  );
}

// Plan en coupe canvas
function PlanCoupeCanvas({ batimentsData, projetData, onSave }) {
  const canvasRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [v, setV] = useState({ tn: 0, tf: 0.2, hRDC: 2.6, hCombles: 1.4, lBat: 10, hBatEx: 6.5, lProjet: 6, recul: 3, pente: 35, nom: 'Projet' });

  useEffect(() => {
    if (batimentsData?.regles) { setV(x => ({ ...x, recul: batimentsData.regles.recul_limite || 3 })); }
    if (batimentsData?.batiments?.[0]?.hauteur) { setV(x => ({ ...x, hBatEx: parseFloat(batimentsData.batiments[0].hauteur) || 6.5 })); }
    if (projetData?.surface_creee) { setV(x => ({ ...x, lProjet: parseFloat(Math.sqrt(parseFloat(projetData.surface_creee) || 30)).toFixed(1) })); }
    if (projetData?.hauteur_projet) { setV(x => ({ ...x, hRDC: Math.min(parseFloat(projetData.hauteur_projet) - 1.4, 2.8) })); }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 680, H = 380, sX = 32, sY = 34, baseY = H - 60, startX = 70;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#ebebeb'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += sX) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += sY) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const tnY = baseY - v.tn * sY, tfY = baseY - v.tf * sY;
    ctx.fillStyle = 'rgba(139,100,20,.15)'; ctx.fillRect(0, tnY, W, H - tnY);
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(0, tnY); ctx.lineTo(W, tnY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#92400e'; ctx.font = '9px Arial'; ctx.fillText(`TN +${v.tn.toFixed(2)}m`, 4, tnY - 3);
    ctx.strokeStyle = '#5c4a1e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, tfY); ctx.lineTo(W, tfY); ctx.stroke();
    ctx.fillStyle = '#5c4a1e'; ctx.fillText(`TF +${v.tf.toFixed(2)}m`, 4, tfY - 3);
    ctx.fillStyle = 'rgba(180,140,80,.25)'; ctx.fillRect(0, tfY, W, tnY - tfY);
    // Bâtiment existant
    const bX = startX, bW = v.lBat * sX, bH = v.hBatEx * sY, bY = tfY - bH;
    ctx.fillStyle = 'rgba(107,114,128,.2)'; ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 2;
    ctx.fillRect(bX, bY, bW, bH); ctx.strokeRect(bX, bY, bW, bH);
    const tEx = bH * 0.3;
    ctx.beginPath(); ctx.moveTo(bX - 15, bY); ctx.lineTo(bX + bW / 2, bY - tEx); ctx.lineTo(bX + bW + 15, bY); ctx.closePath();
    ctx.fillStyle = 'rgba(107,114,128,.25)'; ctx.fill(); ctx.strokeStyle = '#6b7280'; ctx.stroke();
    ctx.fillStyle = '#6b7280'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    ctx.fillText('EXISTANT', bX + bW / 2, bY + bH / 2 + 4); ctx.textAlign = 'left';
    // Projet
    const pX = bX + bW + v.recul * sX, pW = parseFloat(v.lProjet) * sX, pH = v.hRDC * sY, pY = tfY - 0.2 * sY - pH, cH = v.hCombles * sY;
    ctx.fillStyle = 'rgba(26,86,219,.1)'; ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2.5;
    ctx.fillRect(pX, pY, pW, pH); ctx.strokeRect(pX, pY, pW, pH);
    if (v.pente > 5) {
      ctx.beginPath(); ctx.moveTo(pX - 15, pY); ctx.lineTo(pX + pW / 2, pY - cH); ctx.lineTo(pX + pW + 15, pY); ctx.closePath();
      ctx.fillStyle = 'rgba(26,86,219,.15)'; ctx.fill(); ctx.strokeStyle = '#1d4ed8'; ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(26,86,219,.15)'; ctx.fillRect(pX - 10, pY - cH, pW + 20, cH); ctx.strokeRect(pX - 10, pY - cH, pW + 20, cH);
    }
    ctx.fillStyle = '#1d4ed8'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    ctx.fillText(v.nom, pX + pW / 2, pY + pH / 2 + 4); ctx.textAlign = 'left';
    // Cotations
    const cR = pX + pW + 20;
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 0.8; ctx.fillStyle = '#374151'; ctx.font = '9px Arial';
    ctx.beginPath(); ctx.moveTo(cR, tfY); ctx.lineTo(cR, pY); ctx.stroke();
    ctx.fillText(`${v.hRDC}m RDC`, cR + 4, (tfY + pY) / 2 + 4);
    const topY = v.pente > 5 ? pY - cH : pY - cH;
    ctx.beginPath(); ctx.moveTo(cR + 18, tfY); ctx.lineTo(cR + 18, topY); ctx.stroke();
    ctx.fillStyle = '#dc2626'; ctx.fillText(`H=${(v.hRDC + v.hCombles).toFixed(1)}m tot`, cR + 22, (tfY + topY) / 2 + 4);
    // Recul
    ctx.strokeStyle = '#059669'; ctx.fillStyle = '#059669'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bX + bW, tfY + 14); ctx.lineTo(pX, tfY + 14); ctx.stroke();
    ctx.fillText(`Recul ${v.recul}m`, bX + bW + (pX - bX - bW) / 2 - 18, tfY + 26);
    // H max PLU
    if (batimentsData?.regles?.hauteur_max) {
      const hMaxY = tfY - batimentsData.regles.hauteur_max * sY;
      ctx.strokeStyle = 'rgba(239,68,68,.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pX - 20, hMaxY); ctx.lineTo(pX + pW + 20, hMaxY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444'; ctx.font = '9px Arial'; ctx.fillText(`H max PLU: ${batimentsData.regles.hauteur_max}m`, pX, hMaxY - 4);
    }
    ctx.fillStyle = '#333'; ctx.font = 'bold 10px Arial'; ctx.fillText('Plan en coupe — PC3/DP3', 8, 14);
  }, [v, batimentsData]);

  const Inp = ({ label, k, step = 0.1 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <label style={{ fontSize: 9, color: '#5a5650', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</label>
      <input type="number" value={v[k]} step={step}
        onChange={e => setV(x => ({ ...x, [k]: parseFloat(e.target.value) || 0 }))}
        style={{ width: 68, background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 6, padding: '5px 6px', fontSize: 12, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }} />
    </div>
  );

  const save = () => {
    const data = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a'); a.href = data; a.download = 'plan-coupe-PC3.png'; a.click();
    if (onSave) onSave(data, 'PC3');
    setSaved(true);
  };

  const totalH = v.hRDC + v.hCombles;
  const hMaxPLU = batimentsData?.regles?.hauteur_max || 99;
  const conforme = totalH <= hMaxPLU && v.recul >= (batimentsData?.regles?.recul_limite || 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, padding: '10px 12px', background: '#111118', borderRadius: 10 }}>
        <Inp label="TN (m)" k="tn" /><Inp label="TF (m)" k="tf" /><Inp label="H RDC (m)" k="hRDC" />
        <Inp label="H combles (m)" k="hCombles" /><Inp label="L projet (m)" k="lProjet" step={0.5} />
        <Inp label="Recul (m)" k="recul" /><Inp label="L existant (m)" k="lBat" step={0.5} />
        <Inp label="H existant (m)" k="hBatEx" /><Inp label="Pente toit (°)" k="pente" step={5} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label style={{ fontSize: 9, color: '#5a5650', textTransform: 'uppercase' }}>Nom</label>
          <input type="text" value={v.nom} onChange={e => setV(x => ({ ...x, nom: e.target.value }))}
            style={{ width: 90, background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 6, padding: '5px 6px', fontSize: 12, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }} />
        </div>
      </div>
      <canvas ref={canvasRef} width={680} height={380}
        style={{ border: '1px solid #1c1c2a', borderRadius: 8, display: 'block', background: '#fff', maxWidth: '100%' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <div style={{ padding: '6px 12px', background: conforme ? 'rgba(74,222,128,.06)' : 'rgba(239,68,68,.06)', border: `0.5px solid ${conforme ? 'rgba(74,222,128,.2)' : 'rgba(239,68,68,.2)'}`, borderRadius: 8, fontSize: 11, color: conforme ? '#4ade80' : '#ef4444' }}>
          {conforme ? '✓' : '⚠️'} H totale: {totalH.toFixed(1)}m {hMaxPLU < 99 ? `(max PLU: ${hMaxPLU}m)` : ''} | Recul: {v.recul}m {batimentsData?.regles?.recul_limite ? `(min: ${batimentsData.regles.recul_limite}m)` : ''}
        </div>
      </div>
      <button onClick={save} style={{ marginTop: 8, padding: '8px 16px', background: saved ? 'rgba(74,222,128,.1)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: saved ? '0.5px solid rgba(74,222,128,.3)' : 'none', borderRadius: 8, color: saved ? '#4ade80' : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        {saved ? '✓ PC3 sauvegardé' : '⬇ Télécharger PC3 (PNG)'}
      </button>
    </div>
  );
}

// Photo uploader
function PhotoUploader({ code, description, onSave }) {
  const [photos, setPhotos] = useState([]);
  function handle(e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPhotos(prev => {
          const updated = [...prev, { name: file.name, data: ev.target.result, id: Date.now() + Math.random() }];
          if (onSave) onSave(updated, code);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  }
  return (
    <div>
      <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 8 }}>{description}</div>
      <label style={{ display: 'block', padding: '16px', border: '1.5px dashed #1c1c2a', borderRadius: 10, textAlign: 'center', cursor: 'pointer', marginBottom: 8, transition: 'border-color .15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#a07820'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#1c1c2a'}>
        <input type="file" accept="image/*,.pdf" multiple onChange={handle} style={{ display: 'none' }} />
        <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
        <div style={{ fontSize: 12, color: '#5a5650' }}>Cliquez pour uploader — photos ou PDF</div>
        <div style={{ fontSize: 10, color: '#3e3a34', marginTop: 2 }}>JPG, PNG, PDF acceptés</div>
      </label>
      {photos.length > 0 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 6 }}>
            {photos.map(p => (
              <div key={p.id} style={{ borderRadius: 8, overflow: 'hidden', border: '0.5px solid #1c1c2a' }}>
                {p.data.startsWith('data:image') ? (
                  <img src={p.data} alt={p.name} style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: 70, background: '#111118', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📄</div>
                )}
                <div style={{ padding: '3px 6px', fontSize: 9, color: '#5a5650', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#4ade80' }}>✓ {photos.length} fichier(s) ajouté(s)</div>
        </div>
      )}
    </div>
  );
}

// Notice generator
function NoticeGen({ formData, cerfaId, onSave }) {
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  async function gen() {
    setLoading(true);
    try {
      const r = await fetch('/api/cerfa/notice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type_cerfa: cerfaId, ...formData }) });
      const d = await r.json();
      setNotice(d.notice || '');
    } catch { setNotice('Erreur. Réessayez.'); }
    finally { setLoading(false); }
  }
  function download() {
    const blob = new Blob([notice], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `notice-${cerfaId}.txt`; a.click();
    URL.revokeObjectURL(url);
    if (onSave) onSave(notice, 'PC7');
    setSaved(true);
  }
  return (
    <div>
      <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 10 }}>Notice descriptive générée depuis vos données — modifiable avant téléchargement.</div>
      {!notice ? (
        <button onClick={gen} disabled={loading}
          style={{ padding: '10px 20px', background: loading ? 'rgba(160,120,32,.3)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {loading ? '⏳ Génération...' : '✨ Générer la notice automatiquement'}
        </button>
      ) : (
        <div>
          <textarea value={notice} onChange={e => setNotice(e.target.value)} rows={10}
            style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: 12, fontSize: 11, color: '#f2efe9', fontFamily: 'monospace', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={download} style={{ padding: '8px 16px', background: saved ? 'rgba(74,222,128,.1)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: saved ? '0.5px solid rgba(74,222,128,.3)' : 'none', borderRadius: 8, color: saved ? '#4ade80' : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saved ? '✓ Téléchargé' : '⬇ Télécharger PC7'}
            </button>
            <button onClick={gen} style={{ padding: '8px 12px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 8, color: '#5a5650', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Régénérer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// WIZARD PRINCIPAL
// ============================================================
function WizardContent() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [cerfaId, setCerfaId] = useState(params.get('cerfa') || '');
  const [planData, setPlanData] = useState(null);
  const [batimentsData, setBatimentsData] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [piecesData, setPiecesData] = useState({});
  const [form, setForm] = useState({
    civilite: 'M.', nom: '', prenom: '', telephone: '', email: '',
    adresse_terrain: params.get('adresse') || '',
    commune: params.get('commune') || '',
    code_postal: params.get('postcode') || '',
    code_insee: params.get('citycode') || '',
    reference_cadastrale: '', surface_terrain: '',
    nature_travaux: params.get('type') || '',
    surface_creee: params.get('surface') || '',
    surface_plancher: '', emprise_sol: '', hauteur_projet: '',
    destination: 'Habitation', materiaux_facade: '', materiaux_toiture: '',
    description_libre: '', zone_abf: false,
  });

  const setField = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const savePiece = useCallback((data, code) => setPiecesData(prev => ({ ...prev, [code]: data })), []);

  async function handleAddrSelect(item) {
    setForm(f => ({ ...f, adresse_terrain: item.label, commune: item.city || '', code_postal: item.postcode || '', code_insee: item.citycode || '' }));
    if (!item.lat || !item.lon) return;
    setLoadingAddr(true);
    try {
      const [pRes, bRes] = await Promise.all([
        fetch(`/api/plan-situation?lat=${item.lat}&lon=${item.lon}`),
        fetch(`/api/batiments?lat=${item.lat}&lon=${item.lon}&code_insee=${item.citycode}`),
      ]);
      const [pData, bData] = await Promise.all([pRes.json(), bRes.json()]);
      setPlanData(pData);
      setBatimentsData(bData);
      if (bData.parcelle?.reference) setField('reference_cadastrale', bData.parcelle.reference);
      if (bData.parcelle?.contenance) setField('surface_terrain', Math.round(bData.parcelle.contenance));
    } catch (e) { console.error(e); }
    finally { setLoadingAddr(false); }
  }

  const cerfa = CERFA_DATA[cerfaId];
  const iStyle = { width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const lStyle = { display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 };

  const steps = ['Type', 'Demandeur', 'Terrain', 'Projet', 'Pièces', 'Dossier'];

  function downloadFinal() {
    const c = cerfa || CERFA_DATA['13406'];
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dossier ${c.numero}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;max-width:820px;margin:0 auto;color:#333}h1{color:#a07820;border-bottom:3px solid #a07820;padding-bottom:10px}h2{color:#555;font-size:15px;margin-top:24px;border-bottom:1px solid #eee;padding-bottom:5px}.f{display:flex;padding:8px 12px;margin:3px 0;background:#f8f8f8;border-radius:5px}.l{font-size:11px;color:#888;text-transform:uppercase;min-width:190px;flex-shrink:0;padding-top:2px}.v{font-size:14px;font-weight:500}.ok{padding:9px 12px;border-left:3px solid #4ade80;margin:5px 0;background:#f0fff4;font-size:12px}.nok{padding:9px 12px;border-left:3px solid #ef4444;margin:5px 0;background:#fff5f5;font-size:12px}.warn{padding:12px;background:#fff8e1;border-left:3px solid #f59e0b;margin:14px 0;font-size:12px}.footer{margin-top:40px;padding-top:12px;border-top:1px solid #eee;font-size:11px;color:#aaa;text-align:center}</style>
</head><body>
<h1>📋 Dossier ${c.numero} — PermitAI</h1>
<p style="color:#888;font-size:12px">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
<h2>👤 Demandeur</h2>
<div class="f"><span class="l">Identité</span><span class="v">${form.civilite} ${form.prenom} ${form.nom}</span></div>
<div class="f"><span class="l">Téléphone</span><span class="v">${form.telephone || '—'}</span></div>
<div class="f"><span class="l">Email</span><span class="v">${form.email || '—'}</span></div>
<h2>📍 Terrain</h2>
<div class="f"><span class="l">Adresse</span><span class="v">${form.adresse_terrain}</span></div>
<div class="f"><span class="l">Commune</span><span class="v">${form.commune} (${form.code_postal}) — INSEE ${form.code_insee}</span></div>
<div class="f"><span class="l">Réf. cadastrale</span><span class="v">${form.reference_cadastrale || '—'}</span></div>
<div class="f"><span class="l">Surface terrain</span><span class="v">${form.surface_terrain || '—'} m²</span></div>
${form.zone_abf ? '<div class="warn">🏛️ Zone ABF — Accord ABF obligatoire avant dépôt</div>' : ''}
<h2>🏗 Projet</h2>
<div class="f"><span class="l">Nature</span><span class="v">${form.nature_travaux}</span></div>
<div class="f"><span class="l">Surface plancher</span><span class="v">${form.surface_plancher || form.surface_creee} m²</span></div>
<div class="f"><span class="l">Emprise au sol</span><span class="v">${form.emprise_sol || '—'} m²</span></div>
<div class="f"><span class="l">Hauteur</span><span class="v">${form.hauteur_projet || '—'} m</span></div>
<div class="f"><span class="l">Façades</span><span class="v">${form.materiaux_facade || '—'}</span></div>
<div class="f"><span class="l">Toiture</span><span class="v">${form.materiaux_toiture || '—'}</span></div>
${parseInt(form.surface_plancher || form.surface_creee) > 150 ? '<div class="warn">⚖️ Architecte obligatoire — Surface > 150m²</div>' : ''}
<h2>📎 Pièces</h2>
${c.pieces.map(p => {
  const done = piecesData[p.code] || p.generation === 'auto';
  return `<div class="${done ? 'ok' : 'nok'}"><strong>${done ? '✅' : '❌'} ${p.code} — ${p.nom}</strong>${!done && p.obligatoire ? ' <span style="color:#dc2626">(MANQUANTE)</span>' : ''}</div>`;
}).join('')}
${planData ? `<h2>🗺️ Plan de situation</h2><p><a href="${planData.geoportail}">Géoportail →</a> | <a href="${planData.embed_url}">OpenStreetMap →</a></p>` : ''}
<div class="footer">PermitAI · permitai.eu · ${new Date().toLocaleDateString('fr-FR')}</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `dossier-${cerfaId}-${(form.commune || 'commune').replace(/ /g, '-')}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ padding: '14px 52px', borderBottom: '0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.3"/><rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white"/></svg>
          </div>
          <span style={{ color: '#f2efe9', fontWeight: 500, fontSize: 15 }}>PermitAI</span>
        </Link>
        <Link href="/cerfa" style={{ fontSize: 12, color: '#5a5650', textDecoration: 'none' }}>← Tous les CERFA</Link>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>✨ Wizard CERFA complet</div>
          <h1 style={{ fontSize: 26, color: '#f2efe9', fontWeight: 500, marginBottom: 4 }}>Créez <em style={{ color: '#e8b420', fontStyle: 'italic' }}>tout votre dossier</em> ici</h1>
          <p style={{ fontSize: 12, color: '#5a5650' }}>Plan de masse · Plan en coupe · Notice · Photos · Plan IGN — tout sans architecte</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div onClick={() => i + 1 < step && setStep(i + 1)}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: i+1<step?'#a07820':i+1===step?'rgba(160,120,32,.15)':'#111118', border: i+1===step?'1.5px solid #a07820':i+1<step?'none':'0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: i+1<step?'#fff':i+1===step?'#a07820':'#2a2a38', cursor: i+1<step?'pointer':'default' }}>
                  {i+1<step?'✓':i+1}
                </div>
                <span style={{ fontSize: 9, color: i+1===step?'#a07820':'#2a2a38', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length-1 && <div style={{ flex: 1, height: '0.5px', background: i+1<step?'#a07820':'#1c1c2a', margin: '0 4px', marginBottom: 14 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 24 }}>

          {/* ÉTAPE 1 — TYPE */}
          {step === 1 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Quel est votre projet ?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['construction','🏠','Construction neuve','13406','Permis de construire PC (2 mois)'],
                  ['extension','📐','Extension de maison','auto','< 20m² DP · 20-150m² PC'],
                  ['piscine','🏊','Piscine','13703','Déclaration préalable (1 mois)'],
                  ['cloture','🚧','Clôture','13703','Déclaration préalable (1 mois)'],
                  ['ravalement','🎨','Ravalement de façade','13703','Déclaration préalable (1 mois)'],
                  ['abri','🏚','Abri / Garage / Carport','auto','< 20m² DP · > 20m² PC'],
                  ['certificat','📜',"Certificat d'urbanisme",'13410','CUa info · CUb opérationnel'],
                  ['doc','🚧','Ouverture de chantier','13414','DOC — obligatoire'],
                  ['daact','✅','Achèvement des travaux','13408','DAACT — dans les 90 jours'],
                ].map(([val, icon, label, id, desc]) => (
                  <button key={val} onClick={() => {
                    setField('nature_travaux', val);
                    if (id !== 'auto') setCerfaId(id);
                    setStep(2);
                  }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: form.nature_travaux === val ? 'rgba(160,120,32,.08)' : '#111118', border: `0.5px solid ${form.nature_travaux === val ? '#a07820' : '#1c1c2a'}`, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#f2efe9', textAlign: 'left' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                    <div><div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</div><div style={{ fontSize: 10, color: '#3e3a34' }}>{desc}</div></div>
                  </button>
                ))}
              </div>
              {(form.nature_travaux === 'extension' || form.nature_travaux === 'abri') && (
                <div style={{ marginTop: 12, padding: '12px 14px', background: '#111118', borderRadius: 10 }}>
                  <label style={lStyle}>Surface créée (m²) — détermine le formulaire requis</label>
                  <input type="number" value={form.surface_creee}
                    onChange={e => { const s = e.target.value; setField('surface_creee', s); const d = detectCerfa(s, form.nature_travaux); if (d) setCerfaId(d); }}
                    placeholder="Ex: 25" style={{ ...iStyle, width: 120 }} />
                  {form.surface_creee && (
                    <div style={{ marginTop: 8, fontSize: 12, color: parseInt(form.surface_creee) > 150 ? '#ef4444' : '#a07820', fontWeight: 500 }}>
                      → {parseInt(form.surface_creee) <= 20 ? 'CERFA 13703 — Déclaration préalable (1 mois)' : parseInt(form.surface_creee) <= 150 ? 'CERFA 13406 — Permis de construire (2 mois)' : '⚖️ Architecte obligatoire — surface > 150m²'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2 — DEMANDEUR */}
          {step === 2 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>👤 Vos informations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Civilité</label>
                  <select value={form.civilite} onChange={e => setField('civilite', e.target.value)} style={iStyle}>
                    <option>M.</option><option>Mme</option>
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Prénom *</label>
                  <input type="text" value={form.prenom} onChange={e => setField('prenom', e.target.value)} placeholder="Jean" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Nom *</label>
                  <input type="text" value={form.nom} onChange={e => setField('nom', e.target.value)} placeholder="Dupont" style={iStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lStyle}>Téléphone</label>
                <input type="tel" value={form.telephone} onChange={e => setField('telephone', e.target.value)} placeholder="06 12 34 56 78" style={iStyle} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lStyle}>Email</label>
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="jean.dupont@email.fr" style={iStyle} />
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — TERRAIN */}
          {step === 3 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 16 }}>📍 Localisation du terrain</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={lStyle}>Adresse complète *</label>
                <AdresseField
                  value={form.adresse_terrain}
                  onChange={v => setField('adresse_terrain', v)}
                  onSelect={handleAddrSelect} />
              </div>
              {loadingAddr && <div style={{ padding: '8px 12px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 11, color: '#a07820', marginBottom: 12 }}>🔍 Récupération données IGN cadastre + PLU...</div>}
              {form.commune && (
                <div style={{ padding: '8px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80', marginBottom: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>✓ {form.commune}</span><span>{form.code_postal}</span>
                  <span style={{ color: '#3e3a34' }}>INSEE: {form.code_insee}</span>
                  {batimentsData?.parcelle?.reference && <span>Parcelle: {batimentsData.parcelle.reference}</span>}
                  {batimentsData?.plu?.zone && <span>Zone PLU: {batimentsData.plu.zone}</span>}
                </div>
              )}
              {planData && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80', display: 'flex', gap: 12 }}>
                  🗺️ Plan de situation généré ·
                  <a href={planData.geoportail} target="_blank" rel="noreferrer" style={{ color: '#a07820' }}>Géoportail Urbanisme →</a>
                  <a href={planData.embed_url} target="_blank" rel="noreferrer" style={{ color: '#5a5650' }}>OSM →</a>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Référence cadastrale</label>
                  <input type="text" value={form.reference_cadastrale} onChange={e => setField('reference_cadastrale', e.target.value)} placeholder="Ex: AB 123" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Surface terrain (m²)</label>
                  <input type="number" value={form.surface_terrain} onChange={e => setField('surface_terrain', e.target.value)} placeholder="Auto depuis cadastre" style={iStyle} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#f2efe9' }}>
                <input type="checkbox" checked={form.zone_abf} onChange={e => setField('zone_abf', e.target.checked)} />
                Mon terrain est en zone ABF (périmètre monument historique)
              </label>
              {form.zone_abf && <div style={{ marginTop: 6, padding: '7px 12px', background: 'rgba(232,180,32,.06)', border: '0.5px solid rgba(232,180,32,.2)', borderRadius: 8, fontSize: 11, color: '#e8b420' }}>🏛️ Accord ABF obligatoire</div>}
            </div>
          )}

          {/* ÉTAPE 4 — PROJET */}
          {step === 4 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>🏗 Description du projet</h2>
              {cerfa && <div style={{ padding: '8px 12px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 12, color: '#e8b420', fontWeight: 600, marginBottom: 16 }}>{cerfa.emoji} CERFA {cerfa.numero} — {cerfa.nom} · Délai: {cerfa.delai}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={lStyle}>Surface plancher créée (m²) *</label><input type="number" value={form.surface_plancher} onChange={e => setField('surface_plancher', e.target.value)} placeholder="35" style={iStyle} /></div>
                <div><label style={lStyle}>Emprise au sol créée (m²) *</label><input type="number" value={form.emprise_sol} onChange={e => setField('emprise_sol', e.target.value)} placeholder="35" style={iStyle} /></div>
                <div><label style={lStyle}>Hauteur maximale (m)</label><input type="number" value={form.hauteur_projet} onChange={e => setField('hauteur_projet', e.target.value)} placeholder="3.5" style={iStyle} /></div>
                <div><label style={lStyle}>Destination</label>
                  <select value={form.destination} onChange={e => setField('destination', e.target.value)} style={iStyle}>
                    <option>Habitation</option><option>Hébergement</option><option>Commerce</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={lStyle}>Matériaux de façade *</label><input type="text" value={form.materiaux_facade} onChange={e => setField('materiaux_facade', e.target.value)} placeholder="Enduit blanc, bardage bois Douglas..." style={iStyle} /></div>
              <div style={{ marginBottom: 12 }}><label style={lStyle}>Matériaux de toiture *</label><input type="text" value={form.materiaux_toiture} onChange={e => setField('materiaux_toiture', e.target.value)} placeholder="Tuiles terre cuite, zinc, bac acier..." style={iStyle} /></div>
              <div><label style={lStyle}>Description complémentaire</label>
                <textarea value={form.description_libre} onChange={e => setField('description_libre', e.target.value)}
                  placeholder="Position du projet, usage prévu, impact visuel..." rows={3} style={{ ...iStyle, resize: 'vertical' }} />
              </div>
              {parseInt(form.surface_plancher) > 150 && <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 12, color: '#ef4444' }}>⚖️ <strong>Architecte obligatoire</strong> — Surface {'>'} 150m²</div>}
            </div>
          )}

          {/* ÉTAPE 5 — PIÈCES */}
          {step === 5 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>📎 Créez vos pièces</h2>
              <p style={{ fontSize: 12, color: '#5a5650', marginBottom: 20 }}>Plan de masse et coupe avec outils de dessin intégrés. Notice générée automatiquement. Photos à uploader.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {cerfa?.pieces.map((p, i) => (
                  <div key={i} style={{ background: '#111118', border: `0.5px solid ${piecesData[p.code] || p.generation === 'auto' ? 'rgba(74,222,128,.3)' : '#1c1c2a'}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#e8b420' }}>{p.code}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9' }}>{p.nom}</span>
                      {p.obligatoire && <span style={{ fontSize: 10, padding: '1px 7px', background: 'rgba(239,68,68,.1)', color: '#ef4444', borderRadius: 20 }}>Obligatoire</span>}
                      {(piecesData[p.code] || p.generation === 'auto') && <span style={{ fontSize: 10, padding: '1px 7px', background: 'rgba(74,222,128,.1)', color: '#4ade80', borderRadius: 20, marginLeft: 'auto' }}>✓ Prêt</span>}
                    </div>
                    {p.generation === 'auto' && (
                      <div>
                        {planData ? (
                          <div>
                            <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 8 }}>✅ Généré automatiquement depuis les données officielles IGN</div>
                            <iframe src={planData.embed_url} width="100%" height="180" style={{ border: 'none', borderRadius: 8, marginBottom: 8 }} title="Plan situation" />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <a href={planData.geoportail} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: '6px 12px', background: '#a07820', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>Géoportail → imprimer PDF</a>
                              <a href={planData.plan_situation} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: '6px 12px', background: '#1c1c2a', color: '#f2efe9', borderRadius: 6, textDecoration: 'none' }}>Carte IGN WMS →</a>
                            </div>
                            <div style={{ fontSize: 10, color: '#3e3a34', marginTop: 6 }}>💡 Géoportail → Cmd+P → Enregistrer en PDF → votre {p.code} est prêt</div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#5a5650' }}>⚠️ Entrez une adresse à l'étape Terrain pour générer le plan automatiquement.</div>
                        )}
                      </div>
                    )}
                    {p.generation === 'draw_masse' && (
                      <PlanMasseCanvas planData={planData} onSave={savePiece} />
                    )}
                    {p.generation === 'draw_coupe' && (
                      <PlanCoupeCanvas batimentsData={batimentsData} projetData={form} onSave={savePiece} />
                    )}
                    {p.generation === 'ia' && (
                      <NoticeGen formData={form} cerfaId={cerfaId} onSave={savePiece} />
                    )}
                    {(p.generation === 'upload' || p.generation === 'photo') && (
                      <PhotoUploader code={p.code} description={p.description} onSave={savePiece} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 6 — DOSSIER */}
          {step === 6 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                <h2 style={{ color: '#f2efe9', fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Dossier finalisé</h2>
                <p style={{ fontSize: 12, color: '#5a5650' }}>{form.civilite} {form.prenom} {form.nom} · {form.commune} {form.code_postal}</p>
              </div>
              {cerfa && <div style={{ padding: '10px 14px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 12, color: '#e8b420', fontWeight: 600, marginBottom: 16 }}>{cerfa.emoji} {cerfa.numero} — {cerfa.nom} · Délai: {cerfa.delai}</div>}
              <div style={{ background: '#111118', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f2efe9', marginBottom: 10 }}>Statut des pièces</div>
                {cerfa?.pieces.map((p, i) => {
                  const done = piecesData[p.code] || p.generation === 'auto';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '0.5px solid #1a1a28', fontSize: 12 }}>
                      <span style={{ color: done ? '#4ade80' : p.obligatoire ? '#ef4444' : '#e8b420', fontSize: 14 }}>{done ? '✓' : p.obligatoire ? '✗' : '○'}</span>
                      <span style={{ color: done ? '#c4bfb8' : p.obligatoire ? '#ef4444' : '#5a5650' }}>{p.code} — {p.nom}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={downloadFinal}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  ⬇ Télécharger le dossier complet
                </button>
                <Link href={`/depot?adresse=${encodeURIComponent(form.adresse_terrain)}&commune=${encodeURIComponent(form.commune)}&cerfa=${cerfaId}&postcode=${form.code_postal}&citycode=${form.code_insee}`} style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 10, color: '#a07820', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    📬 Dépôt mairie assisté — 199€ →
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 20, borderTop: '0.5px solid #111118' }}>
            {step > 1 && <button onClick={() => setStep(s => s - 1)} style={{ padding: '11px 20px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 9, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>← Retour</button>}
            {step < 6 && <button onClick={() => setStep(s => s + 1)} style={{ flex: 1, padding: '11px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {step === 5 ? 'Voir le dossier final →' : 'Continuer →'}
            </button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f2efe9' }}>Chargement...</div>}>
      <WizardContent />
    </Suspense>
  );
}
