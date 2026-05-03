'use client';
import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import CadastreMap from '@/components/CadastreMap';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const CERFA_DATA = {
  '13406': { numero: '13406*07', nom: 'Permis de construire — maison individuelle', emoji: '🏠', delai: '2 mois', pieces: [
    { code: 'PC1', nom: 'Plan de situation', obligatoire: true, generation: 'auto' },
    { code: 'PC2', nom: 'Plan de masse', obligatoire: true, generation: 'ai_masse' },
    { code: 'PC3', nom: 'Plan en coupe', obligatoire: true, generation: 'ai_coupe' },
    { code: 'PC4', nom: 'Plans des façades et toitures', obligatoire: true, generation: 'ai_facade' },
    { code: 'PC5', nom: "Document graphique d'insertion", obligatoire: true, generation: 'upload' },
    { code: 'PC6', nom: 'Photographies environnement', obligatoire: true, generation: 'photo' },
    { code: 'PC7', nom: 'Notice descriptive', obligatoire: true, generation: 'ai_notice' },
    { code: 'PC8', nom: 'Justificatifs demandeur', obligatoire: true, generation: 'upload' },
  ]},
  '13703': { numero: '13703*11', nom: 'Déclaration préalable — maison individuelle', emoji: '📋', delai: '1 mois', pieces: [
    { code: 'DP1', nom: 'Plan de situation', obligatoire: true, generation: 'auto' },
    { code: 'DP2', nom: 'Plan de masse', obligatoire: true, generation: 'ai_masse' },
    { code: 'DP3', nom: 'Plan en coupe', obligatoire: false, generation: 'ai_coupe' },
    { code: 'DP4', nom: 'Plans des façades', obligatoire: true, generation: 'ai_facade' },
    { code: 'DP5', nom: 'Représentation extérieure', obligatoire: true, generation: 'upload' },
    { code: 'DP6', nom: 'Photographies', obligatoire: true, generation: 'photo' },
    { code: 'DP7', nom: 'Notice descriptive', obligatoire: true, generation: 'ai_notice' },
  ]},
  '13410': { numero: '13410*06', nom: "Certificat d'urbanisme", emoji: '📜', delai: '1 à 2 mois', pieces: [
    { code: 'CU1', nom: 'Plan de situation', obligatoire: true, generation: 'auto' },
    { code: 'CU2', nom: 'Note descriptive (CUb)', obligatoire: false, generation: 'ai_notice' },
  ]},
  '13414': { numero: '13414*05', nom: 'Déclaration ouverture chantier', emoji: '🚧', delai: 'Immédiat', pieces: [] },
  '13408': { numero: '13408*08', nom: 'DAACT', emoji: '✅', delai: '90 jours', pieces: [] },
};

function detectCerfa(surface, type) {
  const s = parseInt(surface) || 0;
  if (s > 150) return null;
  if (['construction','surelevation'].includes(type)) return '13406';
  if (type === 'extension') return s > 20 ? '13406' : '13703';
  if (['doc'].includes(type)) return '13414';
  if (['daact'].includes(type)) return '13408';
  if (['certificat'].includes(type)) return '13410';
  return '13703';
}

// ── UPLOAD + ANALYSE IA DU PLAN ──────────────────────────────
function PlanUploader({ onAnalysisComplete, surface, natureTravaux }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [analysis, setAnalysis] = useState(null);

  async function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  }

  async function analyzeWithAI() {
    if (!file) return;
    setLoading(true);
    setProgress('Lecture du plan...');
    try {
      const base64 = preview.split(',')[1];
      const mimeType = file.type || 'image/jpeg';
      setProgress('Analyse architecturale par IA...');
      const r = await fetch('/api/cerfa/analyze-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, surface_declaree: surface, nature_travaux: natureTravaux }),
      });
      const d = await r.json();
      setProgress('Génération des plans...');
      if (d.success && d.analysis) {
        setAnalysis(d.analysis);
        if (onAnalysisComplete) onAnalysisComplete(d.analysis, preview);
      }
    } catch (e) { setProgress('Erreur — réessayez'); }
    finally { setLoading(false); setProgress(''); }
  }

  return (
    <div style={{ background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#f2efe9', marginBottom: 4 }}>📐 Uploadez votre plan</div>
      <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 16 }}>
        Photo de votre plan existant, croquis, ou plan d'architecte — Claude Vision analyse et génère tous les documents requis
      </div>

      {!preview ? (
        <label style={{ display: 'block', padding: '32px 20px', border: '2px dashed rgba(160,120,32,.3)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: 'rgba(160,120,32,.03)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(160,120,32,.7)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(160,120,32,.3)'}>
          <input type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: 'none' }} />
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
          <div style={{ fontSize: 14, color: '#f2efe9', fontWeight: 500, marginBottom: 6 }}>Déposez votre plan ici</div>
          <div style={{ fontSize: 12, color: '#5a5650', marginBottom: 4 }}>Plan de maison existante, croquis, ou photo du plan</div>
          <div style={{ fontSize: 11, color: '#3e3a34' }}>JPG, PNG, PDF — Plan de masse, plan de coupe, photo de maison</div>
        </label>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 6 }}>Plan uploadé</div>
              <img src={preview} alt="Plan uploadé" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '0.5px solid #1c1c2a', background: '#fff' }} />
            </div>
            {analysis && (
              <div style={{ padding: '12px 14px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600, marginBottom: 10 }}>✅ Analyse IA complète</div>
                {[
                  ['Dimensions', `${analysis.dimensions.largeur_totale}m × ${analysis.dimensions.profondeur_totale}m`],
                  ['Surface estimée', `${analysis.dimensions.surface_plancher_estimee} m²`],
                  ['Forme', analysis.forme_batiment.type],
                  ['Pièces', analysis.elements.pieces.join(', ')],
                  ['Toiture', `${analysis.elements.type_toiture} (${analysis.elements.pente_toiture_estimee}°)`],
                  ['Matériaux murs', analysis.materiaux_detectes.murs],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '0.5px solid rgba(74,222,128,.1)', fontSize: 11 }}>
                    <span style={{ color: '#5a5650' }}>{l}</span>
                    <span style={{ color: '#f2efe9', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!analysis && (
              <button onClick={analyzeWithAI} disabled={loading}
                style={{ flex: 1, padding: '12px', background: loading ? 'rgba(160,120,32,.3)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {loading ? (
                  <><span style={{ display:'inline-block',width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite' }} />{progress}</>
                ) : '🤖 Analyser avec Claude Vision →'}
              </button>
            )}
            {analysis && (
              <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 10, fontSize: 12, color: '#4ade80', flex: 1, textAlign: 'center' }}>
                ✓ Analyse complète — les plans ci-dessous sont générés automatiquement
              </div>
            )}
            <button onClick={() => { setPreview(null); setFile(null); setAnalysis(null); }}
              style={{ padding: '12px 16px', background: 'transparent', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 10, color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              🗑 Changer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PLAN DE MASSE ARCHI (depuis analyse IA) ──────────────────
function PlanMasseArchi({ analysis, planData, parcelData, pluRegles, onSave }) {
  const canvasRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [reculVoirie, setReculVoirie] = useState(pluRegles?.recul_voirie || 5);
  const [reculLimite, setReculLimite] = useState(pluRegles?.recul_limite || 3);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);

  useEffect(() => {
    if (pluRegles) {
      setReculVoirie(pluRegles.recul_voirie || 5);
      setReculLimite(pluRegles.recul_limite || 3);
    }
  }, [pluRegles]);

  useEffect(() => { draw(); }, [analysis, reculVoirie, reculLimite, rotation, posX, posY, parcelData]);

  function draw() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 680, H = 520;
    const scale = 12; // px/m

    ctx.fillStyle = '#f8f8f4'; ctx.fillRect(0, 0, W, H);

    // Grille
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += scale * 5) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += scale * 5) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Parcelle (simplifié si pas de géométrie)
    const parcelW = 30 * scale, parcelH = 25 * scale;
    const parcelX = (W - parcelW) / 2, parcelY = (H - parcelH) / 2;
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5;
    ctx.setLineDash([8,3]);
    ctx.strokeRect(parcelX, parcelY, parcelW, parcelH);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(251,191,36,.05)'; ctx.fillRect(parcelX, parcelY, parcelW, parcelH);

    // Label parcelle
    const parcelSurf = parcelData?.contenance || 750;
    ctx.fillStyle = '#92400e'; ctx.font = '9px Arial';
    ctx.fillText(`Parcelle ${parcelData?.reference || '—'} · ${parcelSurf} m²`, parcelX + 4, parcelY + 12);

    // Zone recul voirie (haut)
    ctx.fillStyle = 'rgba(239,68,68,.06)';
    ctx.fillRect(parcelX, parcelY, parcelW, reculVoirie * scale);
    ctx.fillStyle = '#ef4444'; ctx.font = '8px Arial';
    ctx.fillText(`Recul voirie: ${reculVoirie}m`, parcelX + 4, parcelY + reculVoirie * scale - 3);

    // Zone recul latéral
    ctx.fillStyle = 'rgba(239,68,68,.04)';
    ctx.fillRect(parcelX, parcelY, reculLimite * scale, parcelH);
    ctx.fillRect(parcelX + parcelW - reculLimite * scale, parcelY, reculLimite * scale, parcelH);

    // Zone constructible
    const zoneX = parcelX + reculLimite * scale;
    const zoneY = parcelY + reculVoirie * scale;
    const zoneW = parcelW - 2 * reculLimite * scale;
    const zoneH = parcelH - reculVoirie * scale - reculLimite * scale;
    ctx.fillStyle = 'rgba(74,222,128,.08)';
    ctx.fillRect(zoneX, zoneY, zoneW, zoneH);
    ctx.strokeStyle = 'rgba(74,222,128,.4)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
    ctx.strokeRect(zoneX, zoneY, zoneW, zoneH);
    ctx.setLineDash([]);

    if (analysis) {
      // Bâtiment principal depuis analyse IA
      const bW = (analysis.dimensions.largeur_totale || 10) * scale;
      const bH = (analysis.dimensions.profondeur_totale || 8) * scale;

      // Position centrée dans zone constructible
      const bX = zoneX + (zoneW - bW) * (posX / 100);
      const bY = zoneY + (zoneH - bH) * (posY / 100);

      // Ombre portée
      ctx.shadowColor = 'rgba(0,0,0,.15)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;

      // Bâtiment
      ctx.fillStyle = 'rgba(26,86,219,.15)'; ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2.5;
      ctx.shadowColor = 'transparent';
      ctx.fillRect(bX, bY, bW, bH); ctx.strokeRect(bX, bY, bW, bH);

      // Hachures toiture
      ctx.save(); ctx.beginPath(); ctx.rect(bX, bY, bW, bH); ctx.clip();
      ctx.strokeStyle = 'rgba(26,86,219,.12)'; ctx.lineWidth = 8;
      for (let i = -bH; i < bW + bH; i += 15) {
        ctx.beginPath(); ctx.moveTo(bX + i, bY); ctx.lineTo(bX + i + bH, bY + bH); ctx.stroke();
      }
      ctx.restore();

      // Pièces depuis analyse
      if (analysis.elements?.pieces) {
        const pieces = analysis.elements.pieces;
        const pieceW = bW / Math.ceil(Math.sqrt(pieces.length));
        const pieceH = bH / Math.ceil(pieces.length / Math.ceil(Math.sqrt(pieces.length)));
        pieces.forEach((p, i) => {
          const px = bX + (i % Math.ceil(Math.sqrt(pieces.length))) * pieceW;
          const py = bY + Math.floor(i / Math.ceil(Math.sqrt(pieces.length))) * pieceH;
          ctx.strokeStyle = 'rgba(26,86,219,.3)'; ctx.lineWidth = 0.5;
          ctx.strokeRect(px + 1, py + 1, pieceW - 2, pieceH - 2);
          ctx.fillStyle = '#1d4ed8'; ctx.font = '8px Arial'; ctx.textAlign = 'center';
          ctx.fillText(p.substring(0, 8), px + pieceW/2, py + pieceH/2 + 3);
        });
        ctx.textAlign = 'left';
      }

      // Porte d'entrée
      ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5;
      ctx.fillRect(bX + bW/2 - 8, bY + bH - 3, 16, 3);

      // Label surface
      ctx.fillStyle = '#1d4ed8'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
      ctx.fillText(`${analysis.dimensions.surface_plancher_estimee || '?'} m²`, bX + bW/2, bY + bH/2);
      ctx.font = '9px Arial';
      ctx.fillText(`${analysis.dimensions.largeur_totale}m × ${analysis.dimensions.profondeur_totale}m`, bX + bW/2, bY + bH/2 + 12);
      ctx.textAlign = 'left';

      // Cotations
      ctx.strokeStyle = '#374151'; ctx.fillStyle = '#374151'; ctx.lineWidth = 0.8; ctx.font = '9px Arial';
      // Largeur
      ctx.beginPath(); ctx.moveTo(bX, bY - 10); ctx.lineTo(bX + bW, bY - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bX, bY - 14); ctx.lineTo(bX, bY - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bX + bW, bY - 14); ctx.lineTo(bX + bW, bY - 6); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillText(`${analysis.dimensions.largeur_totale}m`, bX + bW/2, bY - 13); ctx.textAlign = 'left';
      // Profondeur
      ctx.save(); ctx.translate(bX - 10, bY + bH/2); ctx.rotate(-Math.PI/2);
      ctx.textAlign = 'center'; ctx.fillText(`${analysis.dimensions.profondeur_totale}m`, 0, -4); ctx.restore();

      // Recul voirie mesuré
      ctx.strokeStyle = '#059669'; ctx.fillStyle = '#059669'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bX + bW/2, parcelY); ctx.lineTo(bX + bW/2, bY); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillText(`${reculVoirie}m`, bX + bW/2, parcelY + (bY - parcelY)/2 + 4); ctx.textAlign = 'left';

      // Reculs latéraux
      ctx.beginPath(); ctx.moveTo(parcelX, bY + bH/2); ctx.lineTo(bX, bY + bH/2); ctx.stroke();
      ctx.fillText(`${reculLimite}m`, parcelX + 2, bY + bH/2 - 2);
    }

    // Flèche Nord
    ctx.save(); ctx.translate(W - 45, 45);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(0, -18); ctx.lineTo(6, 5); ctx.closePath();
    ctx.fillStyle = '#111'; ctx.fill();
    ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.fillText('N', 0, 35); ctx.restore();

    // Légende
    const lX = 10, lY = H - 90;
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fillRect(lX - 4, lY - 14, 180, 88);
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5; ctx.strokeRect(lX - 4, lY - 14, 180, 88);
    ctx.fillStyle = '#333'; ctx.font = 'bold 9px Arial'; ctx.fillText('LÉGENDE', lX, lY);
    [['#f59e0b','rgba(251,191,36,.3)','Parcelle cadastrale'],['rgba(26,86,219,.5)','rgba(26,86,219,.15)','Projet'],['#ef4444','rgba(239,68,68,.06)','Zone recul PLU'],['#4ade80','rgba(74,222,128,.08)','Zone constructible']].forEach(([c,f,l],i)=>{
      ctx.fillStyle=f; ctx.fillRect(lX,lY+10+i*16,12,10); ctx.strokeStyle=c; ctx.lineWidth=1.5; ctx.strokeRect(lX,lY+10+i*16,12,10);
      ctx.fillStyle='#333'; ctx.font='9px Arial'; ctx.fillText(l,lX+16,lY+19+i*16);
    });

    // Titre + infos PLU
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fillRect(0, 0, W, 28);
    ctx.fillStyle = '#111'; ctx.font = 'bold 11px Arial';
    ctx.fillText('Plan de masse — PC2/DP2', 10, 17);
    if (pluRegles) {
      ctx.fillStyle = '#555'; ctx.font = '9px Arial';
      ctx.fillText(`Zone PLU · H max: ${pluRegles.hauteur_max}m · Recul voirie: ${reculVoirie}m · Recul limite: ${reculLimite}m · Emprise max: ${(pluRegles.emprise_max*100).toFixed(0)}%`, 200, 17);
    }

    // Échelle
    const scaleBarX = W - 130, scaleBarY = H - 15, bar = 10 * scale;
    ctx.fillStyle = '#333'; ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(scaleBarX, scaleBarY); ctx.lineTo(scaleBarX+bar, scaleBarY); ctx.stroke();
    [0, bar].forEach(dx => { ctx.beginPath(); ctx.moveTo(scaleBarX+dx, scaleBarY-4); ctx.lineTo(scaleBarX+dx, scaleBarY+4); ctx.stroke(); });
    ctx.font = '9px Arial'; ctx.textAlign = 'center'; ctx.fillText('10m', scaleBarX+bar/2, scaleBarY-6); ctx.textAlign = 'left';
  }

  function save() {
    const data = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a'); a.href=data; a.download='plan-masse-PC2-archi.png'; a.click();
    if (onSave) onSave(data, 'PC2'); setSaved(true);
  }

  return (
    <div>
      {analysis && (
        <div style={{ padding:'8px 12px',background:'rgba(74,222,128,.06)',border:'0.5px solid rgba(74,222,128,.2)',borderRadius:8,fontSize:11,color:'#4ade80',marginBottom:10 }}>
          ✅ Plan de masse généré depuis votre plan — {analysis.dimensions.largeur_totale}m × {analysis.dimensions.profondeur_totale}m · {analysis.dimensions.surface_plancher_estimee}m²
        </div>
      )}
      {!analysis && (
        <div style={{ padding:'12px',background:'rgba(160,120,32,.06)',border:'0.5px solid rgba(160,120,32,.2)',borderRadius:8,fontSize:12,color:'#a07820',marginBottom:10 }}>
          ⬆️ Uploadez et analysez votre plan à l'étape précédente pour générer automatiquement
        </div>
      )}
      <div style={{ display:'flex',gap:10,marginBottom:10,flexWrap:'wrap',padding:'10px 12px',background:'#111118',borderRadius:10 }}>
        {[['Recul voirie (m)',reculVoirie,setReculVoirie],['Recul limite (m)',reculLimite,setReculLimite]].map(([label,val,set])=>(
          <div key={label} style={{ display:'flex',flexDirection:'column',gap:2 }}>
            <label style={{ fontSize:9,color:'#5a5650',textTransform:'uppercase' }}>{label}</label>
            <input type="number" value={val} step={0.5}
              onChange={e=>set(parseFloat(e.target.value)||0)}
              style={{ width:70,background:'#0a0a14',border:'0.5px solid #1c1c2a',borderRadius:6,padding:'4px 6px',fontSize:12,color:'#f2efe9',fontFamily:'inherit',outline:'none' }} />
          </div>
        ))}
        <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
          <label style={{ fontSize:9,color:'#5a5650',textTransform:'uppercase' }}>Position X (%)</label>
          <input type="range" min={0} max={90} value={posX} onChange={e=>setPosX(parseInt(e.target.value))}
            style={{ width:100 }} />
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
          <label style={{ fontSize:9,color:'#5a5650',textTransform:'uppercase' }}>Position Y (%)</label>
          <input type="range" min={0} max={90} value={posY} onChange={e=>setPosY(parseInt(e.target.value))}
            style={{ width:100 }} />
        </div>
        {planData&&<a href={planData.geoportail} target="_blank" rel="noreferrer" style={{ fontSize:11,padding:'6px 10px',background:'rgba(160,120,32,.1)',border:'0.5px solid rgba(160,120,32,.3)',borderRadius:6,color:'#a07820',textDecoration:'none',alignSelf:'flex-end' }}>🗺️ Géoportail →</a>}
      </div>
      <canvas ref={canvasRef} width={680} height={520}
        style={{ border:'1px solid #1c1c2a',borderRadius:10,display:'block',background:'#f8f8f4',maxWidth:'100%' }} />
      <button onClick={save} style={{ marginTop:8,padding:'9px 18px',background:saved?'rgba(74,222,128,.1)':'linear-gradient(90deg,#a07820,#c4960a)',border:saved?'0.5px solid rgba(74,222,128,.3)':'none',borderRadius:8,color:saved?'#4ade80':'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
        {saved?'✓ PC2 sauvegardé':'⬇ Télécharger PC2 — Plan de masse'}
      </button>
    </div>
  );
}

// ── PLAN EN COUPE ARCHI (depuis analyse IA) ──────────────────
function PlanCoupeArchi({ analysis, batimentsData, pluRegles, onSave }) {
  const canvasRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [v, setV] = useState({
    hRDC: 2.8, hCombles: 1.6, tn: 0, tf: 0.2,
    recul: pluRegles?.recul_limite || 3,
    hBatEx: batimentsData?.batiments?.[0]?.hauteur || 6.5,
    lBatEx: 10,
  });

  useEffect(() => {
    if (analysis) {
      setV(x => ({
        ...x,
        hRDC: analysis.dimensions.hauteur_estimee || 2.8,
        hCombles: analysis.elements.type_toiture === 'plat' ? 0.2 : 1.6,
        recul: pluRegles?.recul_limite || 3,
      }));
    }
    if (batimentsData?.regles) {
      setV(x => ({ ...x, recul: batimentsData.regles.recul_limite || 3 }));
    }
    if (batimentsData?.batiments?.[0]?.hauteur) {
      setV(x => ({ ...x, hBatEx: parseFloat(batimentsData.batiments[0].hauteur) || 6.5 }));
    }
  }, [analysis, batimentsData, pluRegles]);

  useEffect(() => { draw(); }, [v, analysis, batimentsData]);

  function draw() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 720, H = 420, sX = 32, sY = 36, baseY = H - 60, startX = 70;
    ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#ebebeb'; ctx.lineWidth = 0.5;
    for (let x=0;x<W;x+=sX){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for (let y=0;y<H;y+=sY){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    const tnY = baseY - v.tn * sY, tfY = baseY - v.tf * sY;
    ctx.fillStyle = 'rgba(139,100,20,.18)'; ctx.fillRect(0, tnY, W, H - tnY);
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5; ctx.setLineDash([6,3]);
    ctx.beginPath(); ctx.moveTo(0,tnY); ctx.lineTo(W,tnY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#92400e'; ctx.font = '9px Arial'; ctx.fillText(`TN +${v.tn.toFixed(2)}m NGF`, 4, tnY - 3);
    ctx.strokeStyle = '#5c4a1e'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0,tfY); ctx.lineTo(W,tfY); ctx.stroke();
    ctx.fillStyle = '#5c4a1e'; ctx.fillText(`TF +${v.tf.toFixed(2)}m`, 4, tfY - 3);
    ctx.fillStyle = 'rgba(180,140,80,.28)'; ctx.fillRect(0, tfY, W, tnY - tfY);

    // Bâtiment existant
    const bX = startX, bW = v.lBatEx * sX, bH = v.hBatEx * sY, bY = tfY - bH;
    ctx.fillStyle = 'rgba(107,114,128,.2)'; ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 2;
    ctx.fillRect(bX,bY,bW,bH); ctx.strokeRect(bX,bY,bW,bH);
    const tHex = bH * 0.3;
    ctx.beginPath(); ctx.moveTo(bX-14,bY); ctx.lineTo(bX+bW/2,bY-tHex); ctx.lineTo(bX+bW+14,bY); ctx.closePath();
    ctx.fillStyle = 'rgba(107,114,128,.28)'; ctx.fill(); ctx.strokeStyle='#6b7280'; ctx.stroke();
    ctx.fillStyle='#6b7280'; ctx.font='bold 10px Arial'; ctx.textAlign='center';
    ctx.fillText('EXISTANT', bX+bW/2, bY+bH/2+4); ctx.textAlign='left';

    // Projet depuis analyse IA
    if (analysis) {
      const pW = (analysis.dimensions.largeur_totale || 10) * sX;
      const pX = bX + bW + v.recul * sX;
      const pH = (analysis.dimensions.hauteur_estimee || v.hRDC) * sY;
      const pY = tfY - 0.22 * sY - pH;
      const cH = v.hCombles * sY;
      const pente = analysis.elements?.pente_toiture_estimee || 35;

      // Dalle béton
      ctx.fillStyle = 'rgba(156,163,175,.35)';
      ctx.fillRect(pX, tfY - 0.22*sY, pW, 0.22*sY);

      // Murs avec texture
      ctx.fillStyle = 'rgba(26,86,219,.1)'; ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2.5;
      ctx.fillRect(pX, pY, pW, pH); ctx.strokeRect(pX, pY, pW, pH);

      // Hachures murs
      ctx.save(); ctx.beginPath(); ctx.rect(pX, pY, pW, pH); ctx.clip();
      ctx.strokeStyle = 'rgba(26,86,219,.07)'; ctx.lineWidth = 1;
      for (let i=0; i<pW+pH; i+=10) { ctx.beginPath(); ctx.moveTo(pX+i, pY); ctx.lineTo(pX, pY+i); ctx.stroke(); }
      ctx.restore();

      // Toiture selon type détecté
      if (pente > 5) {
        ctx.beginPath(); ctx.moveTo(pX-16, pY); ctx.lineTo(pX+pW/2, pY-cH); ctx.lineTo(pX+pW+16, pY); ctx.closePath();
        ctx.fillStyle = 'rgba(26,86,219,.18)'; ctx.fill(); ctx.strokeStyle='#1d4ed8'; ctx.lineWidth=2; ctx.stroke();
        // Angle pente
        ctx.fillStyle='#1d4ed8'; ctx.font='8px Arial';
        ctx.fillText(`${pente}°`, pX+pW+18, pY-cH/2);
      } else {
        ctx.fillStyle='rgba(26,86,219,.15)'; ctx.fillRect(pX-10, pY-cH, pW+20, cH); ctx.strokeRect(pX-10, pY-cH, pW+20, cH);
        ctx.fillStyle='#1d4ed8'; ctx.font='8px Arial'; ctx.fillText('Toit plat', pX+pW/2-15, pY-cH/2+4);
      }

      // Fenêtres
      ctx.fillStyle='rgba(200,230,255,.8)'; ctx.strokeStyle='#3b82f6'; ctx.lineWidth=1.5;
      const nbFen = Math.min(analysis.facade_principale?.nombre_fenetres || 2, 4);
      for (let i=0; i<nbFen; i++) {
        const fx = pX + (i+1) * pW/(nbFen+1) - 0.5*sX;
        ctx.fillRect(fx, pY+pH*0.25, sX, sY*0.8); ctx.strokeRect(fx, pY+pH*0.25, sX, sY*0.8);
        // Croisillon fenêtre
        ctx.beginPath(); ctx.moveTo(fx+sX/2, pY+pH*0.25); ctx.lineTo(fx+sX/2, pY+pH*0.25+sY*0.8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx, pY+pH*0.25+sY*0.4); ctx.lineTo(fx+sX, pY+pH*0.25+sY*0.4); ctx.stroke();
      }

      // Porte
      ctx.fillStyle='rgba(251,191,36,.6)'; ctx.strokeStyle='#d97706'; ctx.lineWidth=1.5;
      ctx.fillRect(pX+pW/2-sX*0.6, pY+pH-sY*0.8, sX*1.2, sY*0.8);
      ctx.strokeRect(pX+pW/2-sX*0.6, pY+pH-sY*0.8, sX*1.2, sY*0.8);

      // Label
      ctx.fillStyle='#1d4ed8'; ctx.font='bold 10px Arial'; ctx.textAlign='center';
      ctx.fillText(analysis.elements?.pieces?.[0] || 'Projet', pX+pW/2, pY+pH/2+4); ctx.textAlign='left';

      // Cotations
      const cR = pX+pW+20;
      ctx.strokeStyle='#374151'; ctx.lineWidth=0.8; ctx.fillStyle='#374151'; ctx.font='9px Arial';
      ctx.beginPath(); ctx.moveTo(cR,tfY); ctx.lineTo(cR,pY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cR-4,tfY); ctx.lineTo(cR+4,tfY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cR-4,pY); ctx.lineTo(cR+4,pY); ctx.stroke();
      ctx.fillText(`${analysis.dimensions.hauteur_estimee||v.hRDC}m`, cR+5, (tfY+pY)/2+4);

      const topY = pente > 5 ? pY-cH : pY-cH;
      ctx.beginPath(); ctx.moveTo(cR+18,tfY); ctx.lineTo(cR+18,topY); ctx.stroke();
      ctx.fillStyle='#dc2626';
      ctx.fillText(`H=${(analysis.dimensions.hauteur_estimee||v.hRDC)+v.hCombles}m tot`, cR+22, (tfY+topY)/2+4);

      // Recul mesuré
      ctx.strokeStyle='#059669'; ctx.fillStyle='#059669'; ctx.lineWidth=1.5;
      const reculY = tfY+16;
      ctx.beginPath(); ctx.moveTo(bX+bW, reculY); ctx.lineTo(pX, reculY); ctx.stroke();
      ctx.fillText(`Recul: ${v.recul}m`, bX+bW+(v.recul*sX)/2-20, reculY+12);

      // H max PLU
      if (pluRegles?.hauteur_max) {
        const hMaxY = tfY - pluRegles.hauteur_max * sY;
        ctx.strokeStyle='rgba(239,68,68,.5)'; ctx.setLineDash([4,4]); ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(pX-20, hMaxY); ctx.lineTo(pX+pW+20, hMaxY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle='#ef4444'; ctx.font='9px Arial';
        ctx.fillText(`H max PLU: ${pluRegles.hauteur_max}m`, pX, hMaxY-4);
      }

      // Vérification conformité
      const totalH = (analysis.dimensions.hauteur_estimee||v.hRDC) + v.hCombles;
      const hMax = pluRegles?.hauteur_max || 999;
      const conforme = totalH <= hMax;
      ctx.fillStyle = conforme ? '#4ade80' : '#ef4444';
      ctx.font = 'bold 10px Arial';
      ctx.fillText(conforme ? `✓ Conforme PLU (H=${totalH.toFixed(1)}m ≤ ${hMax}m)` : `⚠ Hors PLU (H=${totalH.toFixed(1)}m > ${hMax}m)`, W - 280, H - 10);
    }

    // Titre
    ctx.fillStyle='rgba(255,255,255,.95)'; ctx.fillRect(0,0,W,22);
    ctx.fillStyle='#111'; ctx.font='bold 10px Arial';
    ctx.fillText(`Plan en coupe — PC3/DP3${analysis?' · '+analysis.elements?.type_toiture+' · Pente '+analysis.elements?.pente_toiture_estimee+'°':''}`, 8, 14);
    ctx.fillStyle='#999'; ctx.font='9px Arial'; ctx.textAlign='right';
    ctx.fillText('← Sud                         Nord →', W-10, 14); ctx.textAlign='left';
  }

  function save() {
    const data = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a'); a.href=data; a.download='plan-coupe-PC3-archi.png'; a.click();
    if (onSave) onSave(data,'PC3'); setSaved(true);
  }

  const Inp = ({label,k,step=0.1}) => (
    <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
      <label style={{ fontSize:9,color:'#5a5650',textTransform:'uppercase',whiteSpace:'nowrap' }}>{label}</label>
      <input type="number" value={v[k]} step={step}
        onChange={e=>setV(x=>({...x,[k]:parseFloat(e.target.value)||0}))}
        style={{ width:68,background:'#0a0a14',border:'0.5px solid #1c1c2a',borderRadius:6,padding:'4px 6px',fontSize:12,color:'#f2efe9',fontFamily:'inherit',outline:'none' }} />
    </div>
  );

  return (
    <div>
      {analysis&&<div style={{ padding:'7px 12px',background:'rgba(74,222,128,.06)',border:'0.5px solid rgba(74,222,128,.2)',borderRadius:8,fontSize:11,color:'#4ade80',marginBottom:8 }}>
        ✅ Coupe générée — Toiture: {analysis.elements?.type_toiture} · Pente: {analysis.elements?.pente_toiture_estimee}° · {analysis.facade_principale?.nombre_fenetres} fenêtres
      </div>}
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:10,padding:'10px 12px',background:'#111118',borderRadius:10 }}>
        <Inp label="TN (m)" k="tn"/><Inp label="TF (m)" k="tf"/>
        <Inp label="H combles (m)" k="hCombles"/><Inp label="Recul (m)" k="recul"/>
        <Inp label="H existant (m)" k="hBatEx"/><Inp label="L existant (m)" k="lBatEx" step={0.5}/>
      </div>
      <canvas ref={canvasRef} width={720} height={420}
        style={{ border:'1px solid #1c1c2a',borderRadius:10,display:'block',background:'#fafaf8',maxWidth:'100%' }} />
      <button onClick={save} style={{ marginTop:8,padding:'9px 18px',background:saved?'rgba(74,222,128,.1)':'linear-gradient(90deg,#a07820,#c4960a)',border:saved?'0.5px solid rgba(74,222,128,.3)':'none',borderRadius:8,color:saved?'#4ade80':'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
        {saved?'✓ PC3 sauvegardé':'⬇ Télécharger PC3 — Plan en coupe'}
      </button>
    </div>
  );
}

// ── FACADE ARCHI (depuis analyse IA) ────────────────────────
function FacadeArchi({ analysis, onSave }) {
  const canvasRef = useRef(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (analysis) draw(); }, [analysis]);

  function draw() {
    if (!analysis) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W=680, H=320, sX=30, sY=30;
    const lW = analysis.dimensions.largeur_totale || 10;
    const bH = analysis.dimensions.hauteur_estimee || 2.8;
    const cH = analysis.elements.type_toiture === 'plat' ? 0.2 : (analysis.elements.hCombles || 1.6);
    const pente = analysis.elements.pente_toiture_estimee || 35;
    const scale = Math.min((W*0.7)/(lW), (H*0.65)/(bH+cH));
    const bW = lW * scale;
    const bH2 = bH * scale;
    const cH2 = cH * scale;
    const baseY = H - 40;
    const bX = (W - bW) / 2;
    const bY = baseY - bH2;

    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    // Sol
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(W, baseY); ctx.stroke();
    ctx.fillStyle = 'rgba(139,100,20,.1)'; ctx.fillRect(0, baseY, W, H-baseY);

    // Murs façade
    const matColor = analysis.materiaux_detectes?.murs === 'brique' ? 'rgba(180,80,40,.2)' : analysis.materiaux_detectes?.murs === 'bois' ? 'rgba(120,80,30,.2)' : 'rgba(220,220,210,.8)';
    ctx.fillStyle = matColor; ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
    ctx.fillRect(bX, bY, bW, bH2); ctx.strokeRect(bX, bY, bW, bH2);

    // Texture murs
    if (analysis.materiaux_detectes?.murs === 'brique') {
      ctx.strokeStyle = 'rgba(180,80,40,.3)'; ctx.lineWidth = 0.5;
      for (let y=bY; y<baseY; y+=10) {
        for (let x=bX+(y%20===0?0:15); x<bX+bW; x+=30) { ctx.strokeRect(x, y, 28, 8); }
      }
    }

    // Toiture
    if (pente > 5) {
      ctx.beginPath(); ctx.moveTo(bX-20, bY); ctx.lineTo(bX+bW/2, bY-cH2); ctx.lineTo(bX+bW+20, bY); ctx.closePath();
      const matToit = analysis.materiaux_detectes?.toiture === 'ardoise' ? 'rgba(60,70,80,.7)' : analysis.materiaux_detectes?.toiture === 'zinc' ? 'rgba(150,160,170,.7)' : 'rgba(180,80,40,.6)';
      ctx.fillStyle = matToit; ctx.fill(); ctx.strokeStyle='#555'; ctx.lineWidth=2; ctx.stroke();
      // Tuiles texture
      if (analysis.materiaux_detectes?.toiture === 'tuiles' || !analysis.materiaux_detectes?.toiture) {
        ctx.strokeStyle='rgba(180,80,40,.3)'; ctx.lineWidth=0.5;
        for (let row=0; row<4; row++) { for (let col=0; col<Math.ceil(bW/20); col++) { ctx.strokeRect(bX+col*20-row*2, bY-row*15, 18, 12); } }
      }
    } else {
      ctx.fillStyle='rgba(100,110,120,.5)'; ctx.fillRect(bX-10,bY-cH2,bW+20,cH2); ctx.strokeRect(bX-10,bY-cH2,bW+20,cH2);
    }

    // Fenêtres
    const nbFen = Math.min(analysis.facade_principale?.nombre_fenetres || 2, 6);
    ctx.fillStyle='rgba(200,230,255,.7)'; ctx.strokeStyle='#4a7fc1'; ctx.lineWidth=1.5;
    for (let i=0; i<nbFen; i++) {
      const fx = bX + (i+1)*bW/(nbFen+1) - scale*0.5;
      const fy = bY + bH2*0.2;
      const fw = scale*1.2, fh = scale*1.4;
      ctx.fillRect(fx,fy,fw,fh); ctx.strokeRect(fx,fy,fw,fh);
      ctx.strokeStyle='#4a7fc1'; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(fx+fw/2,fy); ctx.lineTo(fx+fw/2,fy+fh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx,fy+fh*0.45); ctx.lineTo(fx+fw,fy+fh*0.45); ctx.stroke();
    }

    // Porte d'entrée
    ctx.fillStyle='rgba(139,90,30,.5)'; ctx.strokeStyle='#7c5a2a'; ctx.lineWidth=1.5;
    const portW=scale*1.0, portH=scale*2.0;
    ctx.fillRect(bX+bW/2-portW/2, bY+bH2-portH, portW, portH);
    ctx.strokeRect(bX+bW/2-portW/2, bY+bH2-portH, portW, portH);
    ctx.fillStyle='#d97706'; ctx.beginPath(); ctx.arc(bX+bW/2+portW/2-6, bY+bH2-portH/2, 2.5, 0, Math.PI*2); ctx.fill();

    // Cotations
    ctx.strokeStyle='#374151'; ctx.fillStyle='#374151'; ctx.lineWidth=0.8; ctx.font='9px Arial';
    ctx.beginPath(); ctx.moveTo(bX, baseY+14); ctx.lineTo(bX+bW, baseY+14); ctx.stroke();
    [0,bW].forEach(dx=>{ ctx.beginPath(); ctx.moveTo(bX+dx,baseY+10); ctx.lineTo(bX+dx,baseY+18); ctx.stroke(); });
    ctx.textAlign='center'; ctx.fillText(`${lW}m`, bX+bW/2, baseY+26); ctx.textAlign='left';
    ctx.beginPath(); ctx.moveTo(bX-20, bY); ctx.lineTo(bX-20, baseY); ctx.stroke();
    ctx.save(); ctx.translate(bX-24, (bY+baseY)/2); ctx.rotate(-Math.PI/2);
    ctx.textAlign='center'; ctx.fillText(`${bH}m`, 0, -4); ctx.restore();

    // Matériaux labels
    ctx.fillStyle='#555'; ctx.font='10px Arial';
    ctx.fillText(`Façade: ${analysis.materiaux_detectes?.murs||'enduit'}`, bX+bW+10, bY+bH2/2);
    ctx.fillText(`Toiture: ${analysis.materiaux_detectes?.toiture||'tuiles'}`, bX+bW+10, bY+bH2/2+15);

    // Titre
    ctx.fillStyle='rgba(255,255,255,.95)'; ctx.fillRect(0,0,W,22);
    ctx.fillStyle='#111'; ctx.font='bold 10px Arial';
    ctx.fillText('Plans des façades — PC4/DP4 — Façade principale', 8, 14);

    // Légende matériaux
    ctx.fillStyle='#666'; ctx.font='9px Arial';
    ctx.fillText(`Matériaux: ${analysis.materiaux_detectes?.murs||'non spécifié'} · ${analysis.materiaux_detectes?.toiture||'non spécifié'} · ${analysis.elements?.type_toiture||'standard'}`, 8, H-8);
  }

  function save() {
    const data = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a'); a.href=data; a.download='facade-PC4-archi.png'; a.click();
    if (onSave) onSave(data,'PC4'); setSaved(true);
  }

  return (
    <div>
      {analysis ? (
        <>
          <div style={{ padding:'7px 12px',background:'rgba(74,222,128,.06)',border:'0.5px solid rgba(74,222,128,.2)',borderRadius:8,fontSize:11,color:'#4ade80',marginBottom:8 }}>
            ✅ Façade générée — {analysis.dimensions.largeur_totale}m large · {analysis.facade_principale?.nombre_fenetres} fenêtres · {analysis.materiaux_detectes?.murs} / {analysis.materiaux_detectes?.toiture}
          </div>
          <canvas ref={canvasRef} width={680} height={320}
            style={{ border:'1px solid #1c1c2a',borderRadius:10,display:'block',background:'#fff',maxWidth:'100%' }} />
          <button onClick={save} style={{ marginTop:8,padding:'9px 18px',background:saved?'rgba(74,222,128,.1)':'linear-gradient(90deg,#a07820,#c4960a)',border:saved?'0.5px solid rgba(74,222,128,.3)':'none',borderRadius:8,color:saved?'#4ade80':'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
            {saved?'✓ PC4 sauvegardé':'⬇ Télécharger PC4 — Façades'}
          </button>
        </>
      ) : (
        <div style={{ padding:'16px',background:'rgba(160,120,32,.06)',border:'0.5px solid rgba(160,120,32,.2)',borderRadius:8,fontSize:12,color:'#a07820' }}>
          ⬆️ Uploadez et analysez votre plan pour générer les façades automatiquement
        </div>
      )}
    </div>
  );
}

// ── NOTICE ARCHI (depuis analyse IA) ────────────────────────
function NoticeArchi({ analysis, formData, cerfaId, onSave }) {
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (analysis && formData?.adresse_terrain) generateNotice();
  }, [analysis]);

  async function generateNotice() {
    setLoading(true);
    try {
      const r = await fetch('/api/cerfa/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_cerfa: cerfaId,
          ...formData,
          // Enrichi avec données analyse IA
          surface_plancher: formData.surface_plancher || analysis?.dimensions?.surface_plancher_estimee,
          hauteur_projet: analysis?.dimensions?.hauteur_estimee,
          materiaux_facade: formData.materiaux_facade || analysis?.materiaux_detectes?.murs,
          materiaux_toiture: formData.materiaux_toiture || analysis?.materiaux_detectes?.toiture,
          type_toiture: analysis?.elements?.type_toiture,
          nombre_pieces: analysis?.elements?.nombre_pieces,
          pieces: analysis?.elements?.pieces?.join(', '),
          description_ia: analysis?.notice_elements?.description_projet,
        }),
      });
      const d = await r.json();
      setNotice(d.notice || '');
    } catch { setNotice('Erreur. Réessayez.'); }
    finally { setLoading(false); }
  }

  function download() {
    const blob = new Blob([notice],{type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`notice-architecturale-${cerfaId}.txt`; a.click();
    URL.revokeObjectURL(url);
    if (onSave) onSave(notice,'PC7'); setSaved(true);
  }

  return (
    <div>
      {loading ? (
        <div style={{ padding:'16px',textAlign:'center',fontSize:13,color:'#a07820' }}>⏳ Génération de la notice professionnelle...</div>
      ) : !notice ? (
        <button onClick={generateNotice}
          style={{ padding:'10px 20px',background:'linear-gradient(90deg,#a07820,#c4960a)',border:'none',borderRadius:8,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
          ✨ Générer la notice
        </button>
      ) : (
        <div>
          <div style={{ padding:'7px 12px',background:'rgba(74,222,128,.06)',border:'0.5px solid rgba(74,222,128,.2)',borderRadius:8,fontSize:11,color:'#4ade80',marginBottom:8 }}>
            ✅ Notice professionnelle générée depuis l'analyse IA du plan
          </div>
          <textarea value={notice} onChange={e=>setNotice(e.target.value)} rows={12}
            style={{ width:'100%',background:'#0a0a14',border:'0.5px solid #1c1c2a',borderRadius:8,padding:12,fontSize:11,color:'#f2efe9',fontFamily:'monospace',outline:'none',resize:'vertical',boxSizing:'border-box',lineHeight:1.7 }} />
          <div style={{ display:'flex',gap:8,marginTop:8 }}>
            <button onClick={download} style={{ padding:'8px 16px',background:saved?'rgba(74,222,128,.1)':'linear-gradient(90deg,#a07820,#c4960a)',border:saved?'0.5px solid rgba(74,222,128,.3)':'none',borderRadius:8,color:saved?'#4ade80':'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
              {saved?'✓ Téléchargé':'⬇ Télécharger PC7'}
            </button>
            <button onClick={generateNotice} style={{ padding:'8px 12px',background:'transparent',border:'0.5px solid #1c1c2a',borderRadius:8,color:'#5a5650',fontSize:11,cursor:'pointer',fontFamily:'inherit' }}>🔄 Régénérer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AUTOCOMPLETE ADRESSE ────────────────────────────────────
function AdresseField({ value, onChange, onSelect }) {
  const [sugg, setSugg] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const search = val => {
    onChange(val); clearTimeout(timer.current);
    if (!val) { setSugg([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/address?q='+encodeURIComponent(val)+'&limit=6');
        const d = await r.json();
        const s = (d.features||[]).map(f=>({ label:f.properties.label,city:f.properties.city,postcode:f.properties.postcode,citycode:f.properties.citycode,context:f.properties.context,lat:f.geometry?.coordinates?.[1],lon:f.geometry?.coordinates?.[0] }));
        setSugg(s); setOpen(s.length>0);
      } catch { setSugg([]); }
    }, 300);
  };
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',zIndex:2,fontSize:15,color:value?'#a07820':'#3e3a34' }}>📍</span>
      <input type="text" value={value} autoComplete="off" spellCheck="false"
        onChange={e=>search(e.target.value)}
        placeholder="Ex: 12 avenue des Fleurs, Paris 75011"
        style={{ width:'100%',background:'#0a0a14',border:'0.5px solid #1c1c2a',borderRadius:8,padding:'11px 14px 11px 38px',fontSize:13,color:'#f2efe9',fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} />
      {open&&sugg.length>0&&(
        <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:9999,background:'#0e0e1a',border:'0.5px solid rgba(160,120,32,.4)',borderRadius:10,overflow:'hidden',boxShadow:'0 12px 48px rgba(0,0,0,.9)' }}>
          {sugg.map((s,i)=>(
            <button key={i} type="button"
              onMouseDown={e=>{e.preventDefault();onSelect(s);onChange(s.label);setOpen(false);setSugg([]);}}
              style={{ width:'100%',display:'flex',flexDirection:'column',padding:'11px 14px',background:'transparent',border:'none',borderBottom:i<sugg.length-1?'0.5px solid #111118':'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(160,120,32,.08)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{ fontSize:13,color:'#f2efe9',fontWeight:500 }}>{s.label}</span>
              <span style={{ fontSize:10,color:'#3e3a34',marginTop:2 }}>{s.context}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── UPLOAD PHOTOS ────────────────────────────────────────────
function PhotoUploader({ code, description, onSave }) {
  const [photos, setPhotos] = useState([]);
  function handle(e) {
    Array.from(e.target.files).forEach(file=>{
      const reader=new FileReader();
      reader.onload=ev=>{
        setPhotos(prev=>{const u=[...prev,{name:file.name,data:ev.target.result,id:Date.now()+Math.random()}];if(onSave)onSave(u,code);return u;});
      };
      reader.readAsDataURL(file);
    });
  }
  return (
    <div>
      <div style={{ fontSize:11,color:'#5a5650',marginBottom:8 }}>{description}</div>
      <label style={{ display:'block',padding:'16px',border:'1.5px dashed #1c1c2a',borderRadius:10,textAlign:'center',cursor:'pointer',marginBottom:8 }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='#a07820'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='#1c1c2a'}>
        <input type="file" accept="image/*,.pdf" multiple onChange={handle} style={{ display:'none' }} />
        <div style={{ fontSize:22,marginBottom:4 }}>📁</div>
        <div style={{ fontSize:12,color:'#5a5650' }}>Uploader photos ou PDF</div>
      </label>
      {photos.length>0&&(
        <div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:6 }}>
            {photos.map(p=>(
              <div key={p.id} style={{ borderRadius:8,overflow:'hidden',border:'0.5px solid #1c1c2a' }}>
                {p.data.startsWith('data:image')?<img src={p.data} alt={p.name} style={{ width:'100%',height:70,objectFit:'cover',display:'block' }} />:<div style={{ width:'100%',height:70,background:'#111118',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>📄</div>}
                <div style={{ padding:'3px 6px',fontSize:9,color:'#5a5650',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.name}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:11,color:'#4ade80' }}>✓ {photos.length} fichier(s)</div>
        </div>
      )}
    </div>
  );
}

// ── WIZARD PRINCIPAL ─────────────────────────────────────────
function WizardContent() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [cerfaId, setCerfaId] = useState(params.get('cerfa')||'');
  const [addrCoords, setAddrCoords] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [batimentsData, setBatimentsData] = useState(null);
  const [planAnalysis, setPlanAnalysis] = useState(null);
  const [planPreview, setPlanPreview] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [piecesData, setPiecesData] = useState({});
  const [form, setForm] = useState({
    civilite:'M.',nom:'',prenom:'',telephone:'',email:'',
    adresse_terrain:params.get('adresse')||'',
    commune:params.get('commune')||'',
    code_postal:params.get('postcode')||'',
    code_insee:params.get('citycode')||'',
    reference_cadastrale:'',surface_terrain:'',
    nature_travaux:params.get('type')||'',
    surface_creee:params.get('surface')||'',
    surface_plancher:'',emprise_sol:'',hauteur_projet:'',
    destination:'Habitation',materiaux_facade:'',materiaux_toiture:'',
    description_libre:'',zone_abf:false,
  });

  const setField = useCallback((k,v)=>setForm(f=>({...f,[k]:v})),[]);
  const savePiece = useCallback((data,code)=>setPiecesData(prev=>({...prev,[code]:data})),[]);

  function handleParcelSelect(p) {
    if(p.reference) setField('reference_cadastrale',p.reference);
    if(p.surface) setField('surface_terrain',Math.round(p.surface));
    if(p.commune_code) setField('code_insee',p.commune_code);
  }

  async function handleAddrSelect(item) {
    setForm(f=>({...f,adresse_terrain:item.label,commune:item.city||'',code_postal:item.postcode||'',code_insee:item.citycode||''}));
    if(!item.lat||!item.lon) return;
    setAddrCoords({lat:item.lat,lon:item.lon});
    setLoadingAddr(true);
    try {
      const [pRes,bRes]=await Promise.all([
        fetch(`/api/plan-situation?lat=${item.lat}&lon=${item.lon}`),
        fetch(`/api/batiments?lat=${item.lat}&lon=${item.lon}&code_insee=${item.citycode}`),
      ]);
      const [pData,bData]=await Promise.all([pRes.json(),bRes.json()]);
      setPlanData(pData); setBatimentsData(bData);
      if(bData.parcelle?.reference) setField('reference_cadastrale',bData.parcelle.reference);
      if(bData.parcelle?.contenance) setField('surface_terrain',Math.round(bData.parcelle.contenance));
    } catch {}
    finally { setLoadingAddr(false); }
  }

  function handleAnalysisComplete(analysis, preview) {
    setPlanAnalysis(analysis);
    setPlanPreview(preview);
    // Auto-remplir depuis analyse
    if (analysis.dimensions.surface_plancher_estimee) setField('surface_plancher', analysis.dimensions.surface_plancher_estimee);
    if (analysis.dimensions.hauteur_estimee) setField('hauteur_projet', analysis.dimensions.hauteur_estimee);
    if (analysis.materiaux_detectes?.murs !== 'non détecté') setField('materiaux_facade', analysis.materiaux_detectes.murs);
    if (analysis.materiaux_detectes?.toiture !== 'non détecté') setField('materiaux_toiture', analysis.materiaux_detectes.toiture);
  }

  const cerfa = CERFA_DATA[cerfaId];
  const iStyle = {width:'100%',background:'#0a0a14',border:'0.5px solid #1c1c2a',borderRadius:8,padding:'11px 14px',fontSize:13,color:'#f2efe9',fontFamily:'inherit',outline:'none',boxSizing:'border-box'};
  const lStyle = {display:'block',fontSize:10,color:'#5a5650',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6};
  const steps = ['Type','Demandeur','Terrain','Plan + Projet','Pièces archi','Dossier'];

  function downloadFinal() {
    const c = cerfa||CERFA_DATA['13406'];
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dossier ${c.numero}</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:820px;margin:0 auto;color:#333}h1{color:#a07820;border-bottom:3px solid #a07820;padding-bottom:10px}h2{color:#555;font-size:15px;margin-top:24px;border-bottom:1px solid #eee;padding-bottom:5px}.f{display:flex;padding:8px 12px;margin:3px 0;background:#f8f8f8;border-radius:5px}.l{font-size:11px;color:#888;text-transform:uppercase;min-width:190px;flex-shrink:0}.v{font-size:14px;font-weight:500}.ok{padding:9px 12px;border-left:3px solid #4ade80;margin:5px 0;background:#f0fff4;font-size:12px}.nok{padding:9px 12px;border-left:3px solid #ef4444;margin:5px 0;background:#fff5f5;font-size:12px}.footer{margin-top:40px;padding-top:12px;border-top:1px solid #eee;font-size:11px;color:#aaa;text-align:center}</style></head><body>
<h1>📋 Dossier ${c.numero} — PermitAI</h1>
<p style="color:#888;font-size:12px">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
<h2>👤 Demandeur</h2>
<div class="f"><span class="l">Identité</span><span class="v">${form.civilite} ${form.prenom} ${form.nom}</span></div>
<div class="f"><span class="l">Contact</span><span class="v">${form.telephone||'—'} · ${form.email||'—'}</span></div>
<h2>📍 Terrain</h2>
<div class="f"><span class="l">Adresse</span><span class="v">${form.adresse_terrain}</span></div>
<div class="f"><span class="l">Commune</span><span class="v">${form.commune} (${form.code_postal}) — INSEE ${form.code_insee}</span></div>
<div class="f"><span class="l">Réf. cadastrale</span><span class="v">${form.reference_cadastrale||'—'}</span></div>
<div class="f"><span class="l">Surface terrain</span><span class="v">${form.surface_terrain||'—'} m²</span></div>
<h2>🏗 Projet</h2>
<div class="f"><span class="l">Nature</span><span class="v">${form.nature_travaux}</span></div>
<div class="f"><span class="l">Surface plancher</span><span class="v">${form.surface_plancher||form.surface_creee} m²</span></div>
<div class="f"><span class="l">Hauteur</span><span class="v">${form.hauteur_projet||'—'} m</span></div>
<div class="f"><span class="l">Façades</span><span class="v">${form.materiaux_facade||'—'}</span></div>
<div class="f"><span class="l">Toiture</span><span class="v">${form.materiaux_toiture||'—'}</span></div>
${planAnalysis?`<h2>🤖 Analyse IA du plan</h2>
<div class="f"><span class="l">Dimensions détectées</span><span class="v">${planAnalysis.dimensions.largeur_totale}m × ${planAnalysis.dimensions.profondeur_totale}m</span></div>
<div class="f"><span class="l">Pièces détectées</span><span class="v">${planAnalysis.elements.pieces.join(', ')}</span></div>
<div class="f"><span class="l">Type toiture</span><span class="v">${planAnalysis.elements.type_toiture} — Pente ${planAnalysis.elements.pente_toiture_estimee}°</span></div>
<div class="f"><span class="l">Matériaux détectés</span><span class="v">${planAnalysis.materiaux_detectes.murs} / ${planAnalysis.materiaux_detectes.toiture}</span></div>`:''}
<h2>📎 Pièces</h2>
${c.pieces.map(p=>{const done=piecesData[p.code]||p.generation==='auto';return `<div class="${done?'ok':'nok'}"><strong>${done?'✅':'❌'} ${p.code} — ${p.nom}</strong></div>`;}).join('')}
<div class="footer">PermitAI · permitai.eu · ${new Date().toLocaleDateString('fr-FR')}</div>
</body></html>`;
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`dossier-archi-${cerfaId}-${(form.commune||'commune').replace(/ /g,'-')}.html`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight:'100vh',background:'#06060e',fontFamily:"'DM Sans', sans-serif" }}>
      <nav style={{ padding:'14px 52px',borderBottom:'0.5px solid #1c1c2a',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex',alignItems:'center',gap:8,textDecoration:'none' }}>
          <div style={{ width:28,height:28,background:'#a07820',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.3"/><rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white"/></svg>
          </div>
          <span style={{ color:'#f2efe9',fontWeight:500,fontSize:15 }}>PermitAI</span>
        </Link>
        <Link href="/cerfa" style={{ fontSize:12,color:'#5a5650',textDecoration:'none' }}>← Tous les CERFA</Link>
      </nav>

      <div style={{ maxWidth:900,margin:'0 auto',padding:'40px 20px' }}>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ fontSize:10,color:'#a07820',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6 }}>✨ Wizard CERFA · Niveau Architecte</div>
          <h1 style={{ fontSize:26,color:'#f2efe9',fontWeight:500,marginBottom:4 }}>Uploadez votre plan — <em style={{ color:'#e8b420',fontStyle:'italic' }}>tout se génère</em></h1>
          <p style={{ fontSize:12,color:'#5a5650' }}>Claude Vision analyse votre plan · Cadastre IGN · Plans archi générés automatiquement</p>
        </div>

        <div style={{ display:'flex',alignItems:'center',marginBottom:24 }}>
          {steps.map((s,i)=>(
            <div key={i} style={{ display:'flex',alignItems:'center',flex:i<steps.length-1?1:0 }}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                <div onClick={()=>i+1<step&&setStep(i+1)}
                  style={{ width:28,height:28,borderRadius:'50%',background:i+1<step?'#a07820':i+1===step?'rgba(160,120,32,.15)':'#111118',border:i+1===step?'1.5px solid #a07820':i+1<step?'none':'0.5px solid #1c1c2a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:i+1<step?'#fff':i+1===step?'#a07820':'#2a2a38',cursor:i+1<step?'pointer':'default' }}>
                  {i+1<step?'✓':i+1}
                </div>
                <span style={{ fontSize:9,color:i+1===step?'#a07820':'#2a2a38',whiteSpace:'nowrap' }}>{s}</span>
              </div>
              {i<steps.length-1&&<div style={{ flex:1,height:'0.5px',background:i+1<step?'#a07820':'#1c1c2a',margin:'0 4px',marginBottom:14 }} />}
            </div>
          ))}
        </div>

        <div style={{ background:'#0e0e1a',border:'0.5px solid #1c1c2a',borderRadius:14,padding:24 }}>

          {step===1&&(
            <div>
              <h2 style={{ color:'#f2efe9',fontSize:15,fontWeight:500,marginBottom:20 }}>Quel est votre projet ?</h2>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                {[['construction','🏠','Construction neuve','13406','Permis de construire PC'],
                  ['extension','📐','Extension de maison','auto','< 20m² DP · 20-150m² PC'],
                  ['piscine','🏊','Piscine','13703','Déclaration préalable'],
                  ['cloture','🚧','Clôture','13703','Déclaration préalable'],
                  ['ravalement','🎨','Ravalement façade','13703','Déclaration préalable'],
                  ['abri','🏚','Abri / Garage','auto','< 20m² DP · > 20m² PC'],
                  ['certificat','📜',"Certificat d'urbanisme",'13410','CUa ou CUb'],
                  ['doc','🚧','Ouverture chantier','13414','DOC obligatoire'],
                  ['daact','✅','Achèvement travaux','13408','DAACT 90 jours'],
                ].map(([val,icon,label,id,desc])=>(
                  <button key={val} onClick={()=>{ setField('nature_travaux',val); if(id!=='auto') setCerfaId(id); setStep(2); }}
                    style={{ display:'flex',alignItems:'flex-start',gap:10,padding:'12px 14px',background:form.nature_travaux===val?'rgba(160,120,32,.08)':'#111118',border:`0.5px solid ${form.nature_travaux===val?'#a07820':'#1c1c2a'}`,borderRadius:10,cursor:'pointer',fontFamily:'inherit',color:'#f2efe9',textAlign:'left' }}>
                    <span style={{ fontSize:20,flexShrink:0 }}>{icon}</span>
                    <div><div style={{ fontSize:13,fontWeight:500,marginBottom:2 }}>{label}</div><div style={{ fontSize:10,color:'#3e3a34' }}>{desc}</div></div>
                  </button>
                ))}
              </div>
              {(form.nature_travaux==='extension'||form.nature_travaux==='abri')&&(
                <div style={{ marginTop:12,padding:'12px 14px',background:'#111118',borderRadius:10 }}>
                  <label style={lStyle}>Surface créée (m²)</label>
                  <input type="number" value={form.surface_creee}
                    onChange={e=>{ const s=e.target.value; setField('surface_creee',s); const d=detectCerfa(s,form.nature_travaux); if(d) setCerfaId(d); }}
                    placeholder="Ex: 25" style={{ ...iStyle,width:120 }} />
                  {form.surface_creee&&<div style={{ marginTop:8,fontSize:12,color:parseInt(form.surface_creee)>150?'#ef4444':'#a07820',fontWeight:500 }}>
                    → {parseInt(form.surface_creee)<=20?'CERFA 13703 — Déclaration préalable (1 mois)':parseInt(form.surface_creee)<=150?'CERFA 13406 — Permis de construire (2 mois)':'⚖️ Architecte obligatoire > 150m²'}
                  </div>}
                </div>
              )}
            </div>
          )}

          {step===2&&(
            <div>
              <h2 style={{ color:'#f2efe9',fontSize:15,fontWeight:500,marginBottom:20 }}>👤 Vos informations</h2>
              <div style={{ display:'grid',gridTemplateColumns:'110px 1fr 1fr',gap:10,marginBottom:12 }}>
                <div><label style={lStyle}>Civilité</label>
                  <select value={form.civilite} onChange={e=>setField('civilite',e.target.value)} style={iStyle}><option>M.</option><option>Mme</option></select>
                </div>
                <div><label style={lStyle}>Prénom *</label><input type="text" value={form.prenom} onChange={e=>setField('prenom',e.target.value)} placeholder="Jean" style={iStyle} /></div>
                <div><label style={lStyle}>Nom *</label><input type="text" value={form.nom} onChange={e=>setField('nom',e.target.value)} placeholder="Dupont" style={iStyle} /></div>
              </div>
              <div style={{ marginBottom:12 }}><label style={lStyle}>Téléphone</label><input type="tel" value={form.telephone} onChange={e=>setField('telephone',e.target.value)} placeholder="06 12 34 56 78" style={iStyle} /></div>
              <div><label style={lStyle}>Email</label><input type="email" value={form.email} onChange={e=>setField('email',e.target.value)} placeholder="jean.dupont@email.fr" style={iStyle} /></div>
            </div>
          )}

          {step===3&&(
            <div>
              <h2 style={{ color:'#f2efe9',fontSize:15,fontWeight:500,marginBottom:16 }}>📍 Localisation + Cadastre</h2>
              <div style={{ marginBottom:12 }}>
                <label style={lStyle}>Adresse complète *</label>
                <AdresseField value={form.adresse_terrain} onChange={v=>setField('adresse_terrain',v)} onSelect={handleAddrSelect} />
              </div>
              {loadingAddr&&<div style={{ padding:'8px 12px',background:'rgba(160,120,32,.06)',border:'0.5px solid rgba(160,120,32,.2)',borderRadius:8,fontSize:11,color:'#a07820',marginBottom:12 }}>🔍 Chargement données IGN cadastre + bâtiments + PLU...</div>}
              {form.commune&&(
                <div style={{ padding:'8px 12px',background:'rgba(74,222,128,.06)',border:'0.5px solid rgba(74,222,128,.2)',borderRadius:8,fontSize:11,color:'#4ade80',marginBottom:12,display:'flex',gap:16,flexWrap:'wrap' }}>
                  <span>✓ {form.commune}</span><span>{form.code_postal}</span>
                  <span style={{ color:'#3e3a34' }}>INSEE: {form.code_insee}</span>
                  {batimentsData?.plu?.zone&&<span style={{ color:'#e8b420',fontWeight:600 }}>Zone PLU: {batimentsData.plu.zone}</span>}
                </div>
              )}
              {addrCoords?(
                <div style={{ marginBottom:16 }}>
                  <CadastreMap lat={addrCoords.lat} lon={addrCoords.lon} onParcelSelect={handleParcelSelect} defaultParcelle={batimentsData?.parcelle} />
                </div>
              ):(
                <div style={{ padding:'20px',background:'#111118',border:'1.5px dashed #1c1c2a',borderRadius:10,textAlign:'center',fontSize:12,color:'#3e3a34',marginBottom:16 }}>
                  🗺️ Entrez votre adresse ci-dessus pour afficher la carte cadastrale IGN
                </div>
              )}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12 }}>
                <div><label style={lStyle}>Référence cadastrale (auto depuis carte)</label><input type="text" value={form.reference_cadastrale} onChange={e=>setField('reference_cadastrale',e.target.value)} placeholder="Ex: AB 123" style={iStyle} /></div>
                <div><label style={lStyle}>Surface terrain m² (auto cadastre)</label><input type="number" value={form.surface_terrain} onChange={e=>setField('surface_terrain',e.target.value)} placeholder="Auto" style={iStyle} /></div>
              </div>
              {batimentsData?.regles&&(
                <div style={{ padding:'8px 12px',background:'rgba(26,86,219,.06)',border:'0.5px solid rgba(26,86,219,.2)',borderRadius:8,fontSize:11,color:'#60a5fa',display:'flex',gap:16,flexWrap:'wrap' }}>
                  <span>Zone {batimentsData.plu?.zone}</span>
                  <span>H max: <strong>{batimentsData.regles.hauteur_max}m</strong></span>
                  <span>Recul: <strong>{batimentsData.regles.recul_limite}m</strong></span>
                  <span>Emprise: <strong>{(batimentsData.regles.emprise_max*100).toFixed(0)}%</strong></span>
                </div>
              )}
            </div>
          )}

          {step===4&&(
            <div>
              <h2 style={{ color:'#f2efe9',fontSize:15,fontWeight:500,marginBottom:16 }}>🏠 Uploadez votre plan + décrivez le projet</h2>
              <PlanUploader onAnalysisComplete={handleAnalysisComplete} surface={form.surface_creee||form.surface_plancher} natureTravaux={form.nature_travaux} />
              {planAnalysis&&(
                <div style={{ marginTop:16,padding:'12px 14px',background:'rgba(74,222,128,.06)',border:'0.5px solid rgba(74,222,128,.2)',borderRadius:10 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:'#4ade80',marginBottom:10 }}>✅ Analyse IA complète — champs auto-remplis</div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,fontSize:12,color:'#c4bfb8' }}>
                    <div>Dimensions: <strong>{planAnalysis.dimensions.largeur_totale}m × {planAnalysis.dimensions.profondeur_totale}m</strong></div>
                    <div>Surface: <strong>{planAnalysis.dimensions.surface_plancher_estimee} m²</strong></div>
                    <div>Toiture: <strong>{planAnalysis.elements.type_toiture}</strong></div>
                    <div>Pente: <strong>{planAnalysis.elements.pente_toiture_estimee}°</strong></div>
                    <div>Pièces: <strong>{planAnalysis.elements.pieces.join(', ')}</strong></div>
                    <div>Matériaux: <strong>{planAnalysis.materiaux_detectes.murs} / {planAnalysis.materiaux_detectes.toiture}</strong></div>
                  </div>
                </div>
              )}
              <div style={{ marginTop:16 }}>
                {cerfa&&<div style={{ padding:'8px 12px',background:'rgba(160,120,32,.06)',border:'0.5px solid rgba(160,120,32,.2)',borderRadius:8,fontSize:12,color:'#e8b420',fontWeight:600,marginBottom:12 }}>{cerfa.emoji} CERFA {cerfa.numero} — {cerfa.nom} · Délai: {cerfa.delai}</div>}
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <div><label style={lStyle}>Surface plancher créée (m²)</label><input type="number" value={form.surface_plancher} onChange={e=>setField('surface_plancher',e.target.value)} placeholder={planAnalysis?.dimensions?.surface_plancher_estimee||'35'} style={iStyle} /></div>
                  <div><label style={lStyle}>Emprise au sol (m²)</label><input type="number" value={form.emprise_sol} onChange={e=>setField('emprise_sol',e.target.value)} placeholder="35" style={iStyle} /></div>
                  <div><label style={lStyle}>Hauteur (m) — auto depuis analyse</label><input type="number" value={form.hauteur_projet} onChange={e=>setField('hauteur_projet',e.target.value)} placeholder={planAnalysis?.dimensions?.hauteur_estimee||'3.5'} style={iStyle} /></div>
                  <div><label style={lStyle}>Destination</label>
                    <select value={form.destination} onChange={e=>setField('destination',e.target.value)} style={iStyle}><option>Habitation</option><option>Hébergement</option><option>Commerce</option></select>
                  </div>
                </div>
                <div style={{ marginBottom:12,marginTop:10 }}><label style={lStyle}>Matériaux façade — auto depuis analyse</label><input type="text" value={form.materiaux_facade} onChange={e=>setField('materiaux_facade',e.target.value)} placeholder={planAnalysis?.materiaux_detectes?.murs||'Enduit blanc...'} style={iStyle} /></div>
                <div><label style={lStyle}>Matériaux toiture — auto depuis analyse</label><input type="text" value={form.materiaux_toiture} onChange={e=>setField('materiaux_toiture',e.target.value)} placeholder={planAnalysis?.materiaux_detectes?.toiture||'Tuiles terre cuite...'} style={iStyle} /></div>
              </div>
            </div>
          )}

          {step===5&&(
            <div>
              <h2 style={{ color:'#f2efe9',fontSize:15,fontWeight:500,marginBottom:6 }}>📐 Documents architecturaux</h2>
              <p style={{ fontSize:12,color:'#5a5650',marginBottom:20 }}>Tous les plans sont générés depuis votre plan uploadé et l'analyse IA — comme un architecte.</p>
              {!planAnalysis&&(
                <div style={{ padding:'16px',background:'rgba(239,68,68,.06)',border:'0.5px solid rgba(239,68,68,.2)',borderRadius:10,fontSize:12,color:'#ef4444',marginBottom:20 }}>
                  ⚠️ Retournez à l'étape 4 pour uploader et analyser votre plan — les documents se génèrent automatiquement
                </div>
              )}
              <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
                {cerfa?.pieces.map((p,i)=>(
                  <div key={i} style={{ background:'#111118',border:`0.5px solid ${piecesData[p.code]||p.generation==='auto'?'rgba(74,222,128,.3)':'#1c1c2a'}`,borderRadius:12,padding:16 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
                      <span style={{ fontSize:14,fontWeight:700,color:'#e8b420' }}>{p.code}</span>
                      <span style={{ fontSize:13,fontWeight:500,color:'#f2efe9' }}>{p.nom}</span>
                      {p.obligatoire&&<span style={{ fontSize:10,padding:'1px 7px',background:'rgba(239,68,68,.1)',color:'#ef4444',borderRadius:20 }}>Obligatoire</span>}
                      <span style={{ fontSize:10,padding:'1px 7px',background:'rgba(160,120,32,.1)',color:'#a07820',borderRadius:20 }}>
                        {p.generation==='auto'?'🤖 Auto IGN':p.generation==='ai_masse'?'🤖 IA + Cadastre':p.generation==='ai_coupe'?'🤖 IA Coupe':p.generation==='ai_facade'?'🤖 IA Façade':p.generation==='ai_notice'?'🤖 IA Notice':'📁 Upload'}
                      </span>
                      {(piecesData[p.code]||p.generation==='auto')&&<span style={{ fontSize:10,padding:'1px 7px',background:'rgba(74,222,128,.1)',color:'#4ade80',borderRadius:20,marginLeft:'auto' }}>✓ Prêt</span>}
                    </div>

                    {p.generation==='auto'&&(
                      planData?<div>
                        <div style={{ fontSize:11,color:'#4ade80',marginBottom:8 }}>✅ Plan de situation généré — données IGN officielles</div>
                        <iframe src={planData.embed_url} width="100%" height="180" style={{ border:'none',borderRadius:8,marginBottom:8 }} title="Plan situation" />
                        <a href={planData.geoportail} target="_blank" rel="noreferrer" style={{ fontSize:11,padding:'6px 12px',background:'#a07820',color:'#fff',borderRadius:6,textDecoration:'none' }}>Géoportail → imprimer PDF</a>
                        <div style={{ fontSize:10,color:'#3e3a34',marginTop:6 }}>💡 Géoportail → Cmd+P → Enregistrer PDF</div>
                      </div>:<div style={{ fontSize:11,color:'#5a5650' }}>Entrez une adresse à l'étape Terrain.</div>
                    )}
                    {p.generation==='ai_masse'&&<PlanMasseArchi analysis={planAnalysis} planData={planData} parcelData={batimentsData?.parcelle} pluRegles={batimentsData?.regles} onSave={savePiece} />}
                    {p.generation==='ai_coupe'&&<PlanCoupeArchi analysis={planAnalysis} batimentsData={batimentsData} pluRegles={batimentsData?.regles} onSave={savePiece} />}
                    {p.generation==='ai_facade'&&<FacadeArchi analysis={planAnalysis} onSave={savePiece} />}
                    {p.generation==='ai_notice'&&<NoticeArchi analysis={planAnalysis} formData={form} cerfaId={cerfaId} onSave={savePiece} />}
                    {(p.generation==='upload'||p.generation==='photo')&&<PhotoUploader code={p.code} description={p.description||p.nom} onSave={savePiece} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step===6&&(
            <div>
              <div style={{ textAlign:'center',marginBottom:24 }}>
                <div style={{ fontSize:36,marginBottom:8 }}>🎉</div>
                <h2 style={{ color:'#f2efe9',fontSize:20,fontWeight:500,marginBottom:4 }}>Dossier professionnel finalisé</h2>
                <p style={{ fontSize:12,color:'#5a5650' }}>{form.civilite} {form.prenom} {form.nom} · {form.commune} · CERFA {cerfaId}</p>
              </div>
              {cerfa&&<div style={{ padding:'10px 14px',background:'rgba(160,120,32,.06)',border:'0.5px solid rgba(160,120,32,.2)',borderRadius:8,fontSize:12,color:'#e8b420',fontWeight:600,marginBottom:16 }}>{cerfa.emoji} {cerfa.numero} — {cerfa.nom} · Délai: {cerfa.delai}</div>}
              <div style={{ background:'#111118',borderRadius:10,padding:16,marginBottom:16 }}>
                <div style={{ fontSize:12,fontWeight:600,color:'#f2efe9',marginBottom:10 }}>Statut des pièces</div>
                {cerfa?.pieces.map((p,i)=>{const done=piecesData[p.code]||p.generation==='auto';return(<div key={i} style={{ display:'flex',alignItems:'center',gap:6,padding:'5px 0',borderBottom:'0.5px solid #1a1a28',fontSize:12 }}><span style={{ color:done?'#4ade80':p.obligatoire?'#ef4444':'#e8b420',fontSize:14 }}>{done?'✓':p.obligatoire?'✗':'○'}</span><span style={{ color:done?'#c4bfb8':p.obligatoire?'#ef4444':'#5a5650' }}>{p.code} — {p.nom}</span></div>);})}
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                <button onClick={downloadFinal}
                  style={{ width:'100%',padding:'14px',background:'linear-gradient(90deg,#a07820,#c4960a)',border:'none',borderRadius:10,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
                  ⬇ Télécharger le dossier complet
                </button>
                <Link href={`/depot?adresse=${encodeURIComponent(form.adresse_terrain)}&commune=${encodeURIComponent(form.commune)}&cerfa=${cerfaId}`} style={{ textDecoration:'none' }}>
                  <button style={{ width:'100%',padding:'12px',background:'transparent',border:'0.5px solid rgba(160,120,32,.3)',borderRadius:10,color:'#a07820',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
                    📬 Dépôt mairie assisté — 199€ →
                  </button>
                </Link>
              </div>
            </div>
          )}

          <div style={{ display:'flex',gap:8,marginTop:24,paddingTop:20,borderTop:'0.5px solid #111118' }}>
            {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{ padding:'11px 20px',background:'transparent',border:'0.5px solid #1c1c2a',borderRadius:9,color:'#5a5650',fontSize:12,cursor:'pointer',fontFamily:'inherit' }}>← Retour</button>}
            {step<6&&<button onClick={()=>setStep(s=>s+1)} style={{ flex:1,padding:'11px',background:'linear-gradient(90deg,#a07820,#c4960a)',border:'none',borderRadius:9,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
              {step===5?'Voir le dossier final →':'Continuer →'}
            </button>}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#06060e',display:'flex',alignItems:'center',justifyContent:'center',color:'#f2efe9' }}>Chargement...</div>}>
      <WizardContent />
    </Suspense>
  );
}
