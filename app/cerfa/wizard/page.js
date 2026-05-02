'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PlanMasseAuto from '@/components/PlanMasseAuto';
import PlanCoupeAuto from '@/components/PlanCoupeAuto';
const CERFA_DATA = {
  '13406': { numero: '13406*07', nom: 'Permis de construire — maison individuelle', emoji: '🏠', delai: '2 mois', pieces: [
    { code: 'PC1', nom: 'Plan de situation', obligatoire: true, generation: 'auto_api', description: 'Généré automatiquement via API IGN' },
    { code: 'PC2', nom: 'Plan de masse', obligatoire: true, generation: 'cadastre', description: 'Fond cadastral + projet à dessiner' },
    { code: 'PC3', nom: 'Plan en coupe', obligatoire: true, generation: 'upload', description: 'Coupe du terrain — à uploader' },
    { code: 'PC4', nom: 'Plans des façades et toitures', obligatoire: true, generation: 'upload', description: 'Toutes les façades — à uploader' },
    { code: 'PC5', nom: 'Document graphique d\'insertion', obligatoire: true, generation: 'upload', description: 'Simulation dans l\'environnement' },
    { code: 'PC6', nom: 'Photographies', obligatoire: true, generation: 'upload', description: 'Photos depuis et vers le terrain' },
    { code: 'PC7', nom: 'Notice descriptive', obligatoire: true, generation: 'ia_generated', description: 'Générée automatiquement par PermitAI' },
    { code: 'PC8', nom: 'Justificatifs demandeur', obligatoire: true, generation: 'upload', description: 'Titre de propriété ou autorisation' },
  ]},
  '13703': { numero: '13703*11', nom: 'Déclaration préalable — maison individuelle', emoji: '📋', delai: '1 mois', pieces: [
    { code: 'DP1', nom: 'Plan de situation', obligatoire: true, generation: 'auto_api', description: 'Généré automatiquement via API IGN' },
    { code: 'DP2', nom: 'Plan de masse', obligatoire: true, generation: 'cadastre', description: 'Fond cadastral automatique' },
    { code: 'DP3', nom: 'Plan en coupe', obligatoire: false, generation: 'upload', description: 'Si modification du terrain' },
    { code: 'DP4', nom: 'Plans des façades', obligatoire: true, generation: 'upload', description: 'Façades avant/après' },
    { code: 'DP5', nom: 'Représentation extérieure', obligatoire: true, generation: 'upload', description: 'Photo + simulation du projet' },
    { code: 'DP6', nom: 'Photographies', obligatoire: true, generation: 'upload', description: 'Photos du terrain' },
    { code: 'DP7', nom: 'Notice descriptive', obligatoire: true, generation: 'ia_generated', description: 'Générée automatiquement' },
  ]},
  '13410': { numero: '13410*06', nom: 'Certificat d\'urbanisme', emoji: '📜', delai: '1 mois / 2 mois', pieces: [
    { code: 'CU1', nom: 'Plan de situation', obligatoire: true, generation: 'auto_api', description: 'Généré automatiquement' },
    { code: 'CU2', nom: 'Note descriptive (CUb)', obligatoire: false, generation: 'ia_generated', description: 'Pour CUb uniquement' },
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

// Composant autocomplete adresse
function AdresseField({ value, onChange, onSelect, label = 'Adresse du terrain *' }) {
  const [sugg, setSugg] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const search = async (val) => {
    onChange(val);
    clearTimeout(timer.current);
    if (!val || val.length < 1) { setSugg([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/address?q=' + encodeURIComponent(val) + '&limit=6');
        const d = await r.json();
        const s = (d.features || []).map(f => ({
          label: f.properties.label,
          city: f.properties.city,
          postcode: f.properties.postcode,
          citycode: f.properties.citycode,
          context: f.properties.context,
          lat: f.geometry?.coordinates?.[1],
          lon: f.geometry?.coordinates?.[0],
        }));
        setSugg(s); setOpen(s.length > 0);
      } catch { setSugg([]); }
    }, 300);
  };

  const iStyle = { width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px 11px 38px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{label}</label>
      <div ref={ref} style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2, fontSize: 15, color: value ? '#a07820' : '#3e3a34' }}>📍</span>
        <input type="text" value={value} autoComplete="off" spellCheck="false"
          onChange={e => search(e.target.value)}
          placeholder="Ex: 12 avenue des Fleurs, Paris 75011"
          style={iStyle} />
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
    </div>
  );
}

function WizardContent() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [cerfaId, setCerfaId] = useState(params.get('cerfa') || '');
  const [addrData, setAddrData] = useState(null);
  const [cadastreData, setCadastreData] = useState(null);
  const [planSituation, setPlanSituation] = useState(null);
  const [notice, setNotice] = useState('');
  const [loadingCadastre, setLoadingCadastre] = useState(false);
  const [loadingNotice, setLoadingNotice] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const [form, setForm] = useState({
    civilite: 'M.',
    nom: '',
    prenom: '',
    adresse_demandeur: '',
    telephone: '',
    email: '',
    adresse_terrain: params.get('adresse') || '',
    commune: params.get('commune') || '',
    code_postal: params.get('postcode') || '',
    code_insee: params.get('citycode') || '',
    reference_cadastrale: '',
    surface_terrain: '',
    nature_travaux: params.get('type') || '',
    surface_creee: params.get('surface') || '',
    surface_plancher: '',
    emprise_sol: '',
    hauteur_projet: '',
    destination: 'Habitation',
    materiaux_facade: '',
    materiaux_toiture: '',
    description_libre: '',
    zone_abf: false,
    reference_permis: '',
    date_obtention_permis: '',
    date_ouverture: '',
    date_achevement: '',
    type_cu: 'CUa',
  });

  // Auto-detect cerfa
  useEffect(() => {
    if (!cerfaId && form.nature_travaux && form.surface_creee) {
      const detected = detectCerfa(form.surface_creee, form.nature_travaux);
      if (detected) setCerfaId(detected);
    }
  }, [form.nature_travaux, form.surface_creee]);

  // Fetch cadastre when address selected
  async function fetchCadastre(addrItem) {
    if (!addrItem?.lat || !addrItem?.lon) return;
    setLoadingCadastre(true);
    try {
      const r = await fetch(`/api/cadastre?lat=${addrItem.lat}&lon=${addrItem.lon}&code_insee=${addrItem.citycode}`);
      const d = await r.json();
      setCadastreData(d);
      if (d.parcelle?.reference) {
        setForm(f => ({ ...f, reference_cadastrale: d.parcelle.reference }));
      }
      if (d.parcelle?.surface) {
        setForm(f => ({ ...f, surface_terrain: Math.round(d.parcelle.surface) }));
      }

      // Plan de situation
      const planR = await fetch(`/api/plan-situation?lat=${addrItem.lat}&lon=${addrItem.lon}`);
      const planD = await planR.json();
      setPlanSituation(planD);
    } catch (e) {
      console.error('Cadastre error:', e);
    } finally {
      setLoadingCadastre(false);
    }
  }

  async function handleAddrSelect(item) {
    const batRes = await fetch(`/api/batiments?lat=${item.lat}&lon=${item.lon}&code_insee=${item.citycode}`);
const batData = await batRes.json();
setBatimentsData(batData);
    setAddrData(item);
    setForm(f => ({
      ...f,
      adresse_terrain: item.label,
      commune: item.city || '',
      code_postal: item.postcode || '',
      code_insee: item.citycode || '',
    }));
    fetchCadastre(item);
  }

  async function generateNotice() {
    setLoadingNotice(true);
    try {
      const r = await fetch('/api/cerfa/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_cerfa: cerfaId,
          ...form,
        }),
      });
      const d = await r.json();
      setNotice(d.notice || '');
    } catch (e) {
      setNotice('Erreur génération notice');
    } finally {
      setLoadingNotice(false);
    }
  }

  function handleFileUpload(code, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedFiles(prev => ({ ...prev, [code]: { name: file.name, data: e.target.result, type: file.type } }));
    };
    reader.readAsDataURL(file);
  }

  function downloadDossier() {
    const cerfa = CERFA_DATA[cerfaId] || CERFA_DATA['13406'];
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Dossier ${cerfa.numero} — PermitAI</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:820px;margin:0 auto}
  h1{color:#a07820;border-bottom:3px solid #a07820;padding-bottom:12px;font-size:22px}
  h2{color:#555;font-size:15px;margin-top:28px;border-bottom:1px solid #eee;padding-bottom:6px}
  .field{display:flex;padding:8px 12px;margin:4px 0;background:#f8f8f8;border-radius:6px}
  .label{font-size:11px;color:#888;text-transform:uppercase;min-width:200px;padding-top:2px;flex-shrink:0}
  .value{font-size:14px;font-weight:500;color:#222}
  .piece-ok{padding:10px 14px;border-left:3px solid #4ade80;margin:6px 0;background:#f0fff4;font-size:13px;border-radius:0 6px 6px 0}
  .piece-upload{padding:10px 14px;border-left:3px solid #a07820;margin:6px 0;background:#fff8f0;font-size:13px;border-radius:0 6px 6px 0}
  .piece-missing{padding:10px 14px;border-left:3px solid #ef4444;margin:6px 0;background:#fff5f5;font-size:13px;border-radius:0 6px 6px 0}
  .warn{padding:14px;background:#fff8e1;border-left:3px solid #f59e0b;margin:16px 0;border-radius:0 6px 6px 0}
  .notice{white-space:pre-line;font-size:13px;line-height:1.8;padding:16px;background:#f8f8f8;border-radius:6px;border:1px solid #eee}
  .map-link{display:inline-block;padding:8px 16px;background:#a07820;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;margin-top:8px}
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa;text-align:center}
  @media print{.no-print{display:none}}
</style></head>
<body>
<h1>📋 Dossier ${cerfa.numero} — PermitAI</h1>
<p style="color:#888;font-size:12px">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
<div class="warn">⚠️ Ce dossier est un outil de préparation. Vérifiez les exigences spécifiques de votre mairie avant le dépôt final.</div>

<h2>📋 Formulaire CERFA</h2>
<div class="field"><span class="label">CERFA</span><span class="value">${cerfa.numero} — ${cerfa.nom}</span></div>
<div class="field"><span class="label">Délai instruction</span><span class="value">${cerfa.delai}</span></div>

<h2>👤 Demandeur</h2>
<div class="field"><span class="label">Identité</span><span class="value">${form.civilite} ${form.prenom} ${form.nom}</span></div>
<div class="field"><span class="label">Téléphone</span><span class="value">${form.telephone || '—'}</span></div>
<div class="field"><span class="label">Email</span><span class="value">${form.email || '—'}</span></div>

<h2>📍 Terrain</h2>
<div class="field"><span class="label">Adresse complète</span><span class="value">${form.adresse_terrain}</span></div>
<div class="field"><span class="label">Commune</span><span class="value">${form.commune}</span></div>
<div class="field"><span class="label">Code postal</span><span class="value">${form.code_postal}</span></div>
<div class="field"><span class="label">Code INSEE</span><span class="value">${form.code_insee}</span></div>
<div class="field"><span class="label">Référence cadastrale</span><span class="value">${form.reference_cadastrale || '— (à compléter depuis le cadastre.gouv.fr)'}</span></div>
<div class="field"><span class="label">Surface du terrain</span><span class="value">${form.surface_terrain || '—'} m²${cadastreData?.parcelle?.surface ? ' (données cadastrales officielles)' : ''}</span></div>

${planSituation ? `
<h2>🗺️ Plan de situation (PC1/DP1)</h2>
<p style="font-size:13px;color:#555">Plan de situation généré automatiquement via les données officielles IGN.</p>
<a class="map-link" href="${planSituation.geoportail}" target="_blank">Voir sur Géoportail Urbanisme →</a>
<br><a class="map-link" href="${planSituation.embed_url}" target="_blank" style="background:#555;margin-left:8px">Voir sur OpenStreetMap →</a>
` : ''}

<h2>🏗 Projet</h2>
<div class="field"><span class="label">Nature des travaux</span><span class="value">${form.nature_travaux}</span></div>
<div class="field"><span class="label">Surface créée</span><span class="value">${form.surface_creee} m²</span></div>
<div class="field"><span class="label">Surface plancher totale</span><span class="value">${form.surface_plancher || form.surface_creee} m²</span></div>
<div class="field"><span class="label">Emprise au sol</span><span class="value">${form.emprise_sol || '—'} m²</span></div>
<div class="field"><span class="label">Hauteur du projet</span><span class="value">${form.hauteur_projet || '—'} m</span></div>
<div class="field"><span class="label">Destination</span><span class="value">${form.destination}</span></div>
<div class="field"><span class="label">Matériaux façade</span><span class="value">${form.materiaux_facade || '—'}</span></div>
<div class="field"><span class="label">Matériaux toiture</span><span class="value">${form.materiaux_toiture || '—'}</span></div>
${parseInt(form.surface_creee) > 150 ? '<div class="warn">⚖️ <strong>Architecte obligatoire</strong> — Surface plancher > 150m² (Loi du 3 janvier 1977)</div>' : ''}
${form.zone_abf ? '<div class="warn">🏛️ <strong>Zone ABF</strong> — Accord de l\'Architecte des Bâtiments de France requis avant dépôt</div>' : ''}

<h2>📎 Pièces à joindre</h2>
${cerfa.pieces.map(p => {
  const uploaded = uploadedFiles[p.code];
  const isAuto = p.generation === 'auto_api' || p.generation === 'cadastre';
  const isIA = p.generation === 'ia_generated';
  if (uploaded) return `<div class="piece-ok"><strong>✅ ${p.code} — ${p.nom}</strong> <span style="color:#065f46;font-size:11px">(${uploaded.name} · uploadé)</span><br><span style="font-size:12px;color:#555">${p.description}</span></div>`;
  if (isAuto) return `<div class="piece-ok"><strong>🤖 ${p.code} — ${p.nom}</strong> <span style="color:#065f46;font-size:11px">(généré automatiquement)</span><br><span style="font-size:12px;color:#555">${p.description}</span></div>`;
  if (isIA) return `<div class="piece-ok"><strong>✍️ ${p.code} — ${p.nom}</strong> <span style="color:#065f46;font-size:11px">(généré par IA — voir ci-dessous)</span></div>`;
  return `<div class="${p.obligatoire ? 'piece-missing' : 'piece-upload'}"><strong>${p.obligatoire ? '❌' : '○'} ${p.code} — ${p.nom}</strong> <span style="font-size:11px;color:${p.obligatoire ? '#dc2626' : '#92400e'}">(${p.obligatoire ? 'obligatoire — À FOURNIR' : 'selon cas'})</span><br><span style="font-size:12px;color:#555">${p.description}</span></div>`;
}).join('')}

${notice ? `
<h2>📝 Notice descriptive (PC7/DP7) — Générée par IA</h2>
<div class="notice">${notice}</div>
` : ''}

<h2>💶 Informations administratives</h2>
<div class="field"><span class="label">Taxe d'aménagement estimée</span><span class="value">~${Math.round((parseInt(form.surface_creee)||0) * 820 * 0.05).toLocaleString('fr-FR')}€ (indicatif)</span></div>
<div class="field"><span class="label">Accord tacite</span><span class="value">Permis accordé tacitement si pas de réponse dans le délai légal</span></div>
<div class="field"><span class="label">Recours</span><span class="value">Recours gracieux possible dans les 2 mois suivant un refus</span></div>

<div class="footer">Dossier préparé par PermitAI · permitai.eu · contact@permitai.eu<br>
Document informatif — vérifiez les exigences de votre mairie · ${new Date().toLocaleDateString('fr-FR')}</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier-${cerfaId}-${(form.commune||'commune').replace(/ /g,'-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const iStyle = { width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 };
  const Field = ({ label, k, type='text', ph='', required=false }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}{required && <span style={{color:'#ef4444'}}> *</span>}</label>
      <input type={type} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={iStyle} />
    </div>
  );

  const cerfa = CERFA_DATA[cerfaId];
  const steps = ['Type', 'Demandeur', 'Terrain', 'Projet', 'Pièces', 'Dossier'];

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

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>✨ Assistant CERFA</div>
          <h1 style={{ fontSize: 28, color: '#f2efe9', fontWeight: 500, marginBottom: 4 }}>Remplissez votre CERFA <em style={{ color: '#e8b420', fontStyle: 'italic' }}>en 5 minutes</em></h1>
          <p style={{ fontSize: 12, color: '#5a5650' }}>Cadastre + Plan de situation + Notice descriptive — générés automatiquement</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 40 }}>
                <div onClick={() => i + 1 < step && setStep(i + 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: i+1<step?'#a07820':i+1===step?'rgba(160,120,32,.15)':'#111118', border: i+1===step?'1.5px solid #a07820':i+1<step?'none':'0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: i+1<step?'#fff':i+1===step?'#a07820':'#2a2a38', cursor: i+1<step?'pointer':'default' }}>
                  {i+1<step?'✓':i+1}
                </div>
                <span style={{ fontSize: 9, color: i+1===step?'#a07820':'#2a2a38', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length-1 && <div style={{ flex: 1, height: '0.5px', background: i+1<step?'#a07820':'#1c1c2a', margin: '0 4px', marginBottom: 14 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 24 }}>

          {/* ÉTAPE 1 — Type de projet */}
          {step === 1 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Quel est votre projet ?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  ['construction', '🏠', 'Construction neuve', '13406', '< 150m² — Permis de construire'],
                  ['extension', '📐', 'Extension de maison', 'auto', '< 20m² DP / 20-150m² PC'],
                  ['piscine', '🏊', 'Piscine', '13703', 'Déclaration préalable'],
                  ['cloture', '🚧', 'Clôture', '13703', 'Déclaration préalable'],
                  ['ravalement', '🎨', 'Ravalement façade', '13703', 'Déclaration préalable'],
                  ['abri', '🏚', 'Abri de jardin / Garage', 'auto', '< 20m² DP / > 20m² PC'],
                  ['certificat', '📜', 'Certificat d\'urbanisme', '13410', 'Renseignements PLU'],
                  ['doc', '🚧', 'Ouverture de chantier', '13414', 'Déclaration DOC'],
                  ['daact', '✅', 'Achèvement travaux', '13408', 'Déclaration DAACT'],
                ].map(([val, icon, label, cerfa_id, desc]) => (
                  <button key={val} onClick={() => {
                    setForm(f => ({ ...f, nature_travaux: val }));
                    if (cerfa_id !== 'auto') setCerfaId(cerfa_id);
                    setStep(2);
                  }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: form.nature_travaux===val?'rgba(160,120,32,.08)':'#111118', border: form.nature_travaux===val?'0.5px solid #a07820':'0.5px solid #1c1c2a', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#f2efe9', fontSize: 13, textAlign: 'left' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 10, color: '#3e3a34' }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              {form.nature_travaux === 'extension' && (
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>Surface de l'extension (m²) — détermine le CERFA requis</label>
                  <input type="number" value={form.surface_creee} onChange={e => {
                    const s = e.target.value;
                    setForm(f => ({ ...f, surface_creee: s }));
                    const detected = detectCerfa(s, 'extension');
                    if (detected) setCerfaId(detected);
                  }} placeholder="Ex: 25" style={iStyle} />
                  {form.surface_creee && (
                    <div style={{ marginTop: 6, padding: '8px 12px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 11, color: '#a07820' }}>
                      → CERFA requis : {parseInt(form.surface_creee) <= 20 ? '13703 (Déclaration préalable)' : parseInt(form.surface_creee) <= 150 ? '13406 (Permis de construire)' : '⚖️ Architecte obligatoire > 150m²'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2 — Demandeur */}
          {step === 2 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>👤 Vos informations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Civilité</label>
                  <select value={form.civilite} onChange={e => setForm(f => ({ ...f, civilite: e.target.value }))} style={iStyle}>
                    <option>M.</option><option>Mme</option>
                  </select>
                </div>
                <Field label="Prénom *" k="prenom" ph="Jean" required />
                <Field label="Nom *" k="nom" ph="Dupont" required />
              </div>
              <Field label="Téléphone" k="telephone" type="tel" ph="06 12 34 56 78" />
              <Field label="Email" k="email" type="email" ph="jean.dupont@email.fr" />
              <Field label="Adresse du demandeur (si différente du terrain)" k="adresse_demandeur" ph="12 rue de la Paix, 75001 Paris" />
            </div>
          )}

          {/* ÉTAPE 3 — Terrain */}
          {step === 3 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>📍 Localisation du terrain</h2>
              <AdresseField
                value={form.adresse_terrain}
                onChange={val => setForm(f => ({ ...f, adresse_terrain: val }))}
                onSelect={handleAddrSelect}
              />
              {form.commune && (
                <div style={{ padding: '8px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80', marginBottom: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>✓ {form.commune}</span>
                  <span>{form.code_postal}</span>
                  <span style={{ color: '#3e3a34' }}>INSEE: {form.code_insee}</span>
                </div>
              )}
              {loadingCadastre && (
                <div style={{ padding: '10px 14px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 12, color: '#a07820', marginBottom: 14 }}>
                  🔍 Récupération des données cadastrales en cours...
                </div>
              )}
              {cadastreData?.parcelle?.reference && (
                <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 12, color: '#4ade80', marginBottom: 14 }}>
                  📐 Données cadastrales récupérées · Référence: {cadastreData.parcelle.reference}
                  {cadastreData.parcelle.surface && ` · Surface: ${Math.round(cadastreData.parcelle.surface)}m²`}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Référence cadastrale (auto-remplie si disponible)</label>
                  <input type="text" value={form.reference_cadastrale} onChange={e => setForm(f=>({...f,reference_cadastrale:e.target.value}))} placeholder="Ex: AB 123" style={iStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Surface du terrain (m²)</label>
                  <input type="number" value={form.surface_terrain} onChange={e => setForm(f=>({...f,surface_terrain:e.target.value}))} placeholder="Auto-rempli si cadastre" style={iStyle} />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#f2efe9' }}>
                  <input type="checkbox" checked={form.zone_abf} onChange={e => setForm(f=>({...f,zone_abf:e.target.checked}))} />
                  Mon terrain est en zone ABF (périmètre monument historique)
                </label>
                {form.zone_abf && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(232,180,32,.06)', border: '0.5px solid rgba(232,180,32,.2)', borderRadius: 8, fontSize: 11, color: '#e8b420' }}>
                    🏛️ Accord de l'Architecte des Bâtiments de France requis avant dépôt
                  </div>
                )}
              </div>
              {planSituation && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600, marginBottom: 6 }}>✅ Plan de situation (PC1) généré</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <a href={planSituation.geoportail} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: '5px 10px', background: '#a07820', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>Géoportail Urbanisme →</a>
                    <a href={planSituation.embed_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: '5px 10px', background: '#1c1c2a', color: '#f2efe9', borderRadius: 6, textDecoration: 'none' }}>OpenStreetMap →</a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 4 — Projet */}
          {step === 4 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>🏗 Description du projet</h2>
              {cerfa && (
                <div style={{ padding: '8px 14px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 12, color: '#e8b420', fontWeight: 600, marginBottom: 16 }}>
                  {cerfa.emoji} CERFA {cerfa.numero} — {cerfa.nom} · Délai : {cerfa.delai}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Surface de plancher créée (m²) *" k="surface_plancher" type="number" ph="Ex: 35" required />
                <Field label="Emprise au sol créée (m²) *" k="emprise_sol" type="number" ph="Ex: 35" required />
                <Field label="Hauteur maximale (m)" k="hauteur_projet" type="number" ph="Ex: 3.5" />
                <div>
                  <label style={labelStyle}>Destination</label>
                  <select value={form.destination} onChange={e => setForm(f=>({...f,destination:e.target.value}))} style={iStyle}>
                    <option>Habitation</option>
                    <option>Hébergement hôtelier</option>
                    <option>Commerce et activités de service</option>
                    <option>Équipements d'intérêt collectif</option>
                  </select>
                </div>
              </div>
              <Field label="Matériaux de façade *" k="materiaux_facade" ph="Ex: Enduit blanc, bardage bois Douglas" required />
              <Field label="Matériaux de toiture *" k="materiaux_toiture" ph="Ex: Tuiles terre cuite, zinc, bac acier" required />
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Description libre du projet</label>
                <textarea value={form.description_libre} onChange={e => setForm(f=>({...f,description_libre:e.target.value}))}
                  placeholder="Décrivez votre projet en détail : emplacement par rapport à la maison existante, usage prévu, impact sur les voisins..." rows={4}
                  style={{ ...iStyle, resize: 'vertical' }} />
              </div>
              {parseInt(form.surface_plancher) > 150 && (
                <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 12, color: '#ef4444' }}>
                  ⚖️ <strong>Architecte obligatoire</strong> — Surface plancher {'>'} 150m² (Loi du 3 janvier 1977)
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 5 — Pièces jointes */}
          {step === 5 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>📎 Pièces à joindre</h2>
              <p style={{ fontSize: 12, color: '#5a5650', marginBottom: 20 }}>Certaines pièces sont générées automatiquement. Uploadez les autres.</p>
              {cerfa?.pieces.map((p, i) => {
                const uploaded = uploadedFiles[p.code];
                const isAuto = p.generation === 'auto_api' || p.generation === 'cadastre';
                const isIA = p.generation === 'ia_generated';
                return (
                  <div key={i} style={{ padding: '14px', background: '#111118', border: uploaded||isAuto||isIA ? '0.5px solid rgba(74,222,128,.3)' : `0.5px solid ${p.obligatoire ? 'rgba(239,68,68,.2)' : '#1c1c2a'}`, borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f2efe9', marginBottom: 3 }}>
                          {uploaded ? '✅' : isAuto ? '🤖' : isIA ? '✍️' : p.obligatoire ? '🔴' : '⚪'} {p.code} — {p.nom}
                          {p.obligatoire && !uploaded && !isAuto && !isIA && <span style={{ color: '#ef4444', fontSize: 10, marginLeft: 6 }}>OBLIGATOIRE</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#5a5650', marginBottom: isAuto||isIA ? 0 : 8 }}>{p.description}</div>
                        {isAuto && planSituation && (
                          <div style={{ fontSize: 11, color: '#4ade80' }}>✓ Généré automatiquement · <a href={planSituation.geoportail} target="_blank" rel="noreferrer" style={{ color: '#a07820' }}>Voir sur Géoportail →</a></div>
                        )}
                        {isIA && (
                          <div style={{ fontSize: 11, color: '#4ade80' }}>✓ Notice générée automatiquement par PermitAI</div>
                        )}
                        {!isAuto && !isIA && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => e.target.files[0] && handleFileUpload(p.code, e.target.files[0])} style={{ display: 'none' }} id={`file-${p.code}`} />
                            <label htmlFor={`file-${p.code}`}
                              style={{ padding: '6px 14px', background: uploaded ? 'rgba(74,222,128,.1)' : 'rgba(160,120,32,.08)', border: `0.5px solid ${uploaded ? 'rgba(74,222,128,.3)' : 'rgba(160,120,32,.3)'}`, borderRadius: 7, fontSize: 11, color: uploaded ? '#4ade80' : '#a07820', cursor: 'pointer' }}>
                              {uploaded ? `✓ ${uploaded.name}` : '📁 Uploader ce document'}
                            </label>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8 }}>
                <button onClick={generateNotice} disabled={loadingNotice}
                  style={{ padding: '8px 16px', background: loadingNotice ? 'rgba(160,120,32,.3)' : '#a07820', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {loadingNotice ? '⏳ Génération...' : '✍️ Générer la notice descriptive (PC7/DP7)'}
                </button>
                {notice && <div style={{ marginTop: 8, fontSize: 11, color: '#4ade80' }}>✓ Notice générée ({notice.length} caractères)</div>}
              </div>
            </div>
          )}

          {/* ÉTAPE 6 — Récap + téléchargement */}
          {step === 6 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <h2 style={{ color: '#f2efe9', fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Dossier prêt</h2>
                <p style={{ fontSize: 12, color: '#5a5650' }}>{form.civilite} {form.prenom} {form.nom} · {form.commune} {form.code_postal}</p>
              </div>
              <div style={{ background: '#111118', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                {[
                  ['CERFA', cerfa ? `${cerfa.numero} — ${cerfa.nom}` : cerfaId],
                  ['Demandeur', `${form.civilite} ${form.prenom} ${form.nom}`],
                  ['Adresse terrain', form.adresse_terrain],
                  ['Commune', `${form.commune} (${form.code_postal}) · INSEE: ${form.code_insee}`],
                  ['Référence cadastrale', form.reference_cadastrale || '— à compléter'],
                  ['Surface terrain', `${form.surface_terrain || '—'} m²`],
                  ['Nature travaux', form.nature_travaux],
                  ['Surface créée', `${form.surface_plancher || form.surface_creee} m²`],
                  ['Délai instruction', cerfa?.delai || '2 mois'],
                  ['Taxe aménagement estimée', `~${Math.round((parseInt(form.surface_plancher||form.surface_creee)||0)*820*0.05).toLocaleString('fr-FR')}€`],
                ].map(([l,v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '0.5px solid #1a1a28', fontSize: 12, gap: 12 }}>
                    <span style={{ color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.3px', fontSize: 10, flexShrink: 0 }}>{l}</span>
                    <span style={{ color: '#c4bfb8', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#111118', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#f2efe9', marginBottom: 8 }}>Statut des pièces</div>
                {cerfa?.pieces.map((p, i) => {
                  const uploaded = uploadedFiles[p.code];
                  const isAuto = p.generation === 'auto_api' || p.generation === 'cadastre';
                  const isIA = p.generation === 'ia_generated';
                  const ok = uploaded || isAuto || isIA;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 11 }}>
                      <span style={{ color: ok ? '#4ade80' : p.obligatoire ? '#ef4444' : '#e8b420' }}>{ok ? '✓' : p.obligatoire ? '✗' : '○'}</span>
                      <span style={{ color: ok ? '#c4bfb8' : p.obligatoire ? '#ef4444' : '#5a5650' }}>{p.code} — {p.nom}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={downloadDossier}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  ⬇ Télécharger le dossier complet
                </button>
                <Link href={`/depot?adresse=${encodeURIComponent(form.adresse_terrain)}&commune=${encodeURIComponent(form.commune)}&cerfa=${cerfaId}&postcode=${form.code_postal}&citycode=${form.code_insee}`} style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 10, color: '#a07820', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    📬 Déposer en mairie assisté — 199€ →
                  </button>
                </Link>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 9, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Voir mon dashboard →
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 20, borderTop: '0.5px solid #111118' }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s-1)}
                style={{ padding: '11px 20px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 9, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                ← Retour
              </button>
            )}
            {step < 6 && (
              <button onClick={() => setStep(s => s+1)}
                style={{ flex: 1, padding: '11px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {step === 5 ? 'Voir le récapitulatif →' : 'Continuer →'}
              </button>
            )}
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
