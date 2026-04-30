'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PIECES = {
  '13406': [
    { code: 'PCMI 1', nom: 'Plan de situation du terrain', obligatoire: true, desc: 'Échelle 1/25 000 ou 1/5 000 — localise le terrain dans la commune' },
    { code: 'PCMI 2', nom: 'Plan de masse des constructions', obligatoire: true, desc: 'Vue de dessus avec cotations, altimétrie et implantation du projet' },
    { code: 'PCMI 3', nom: 'Plan en coupe du terrain', obligatoire: true, desc: 'Profil du terrain naturel et de la construction' },
    { code: 'PCMI 4', nom: 'Notice descriptive', obligatoire: true, desc: 'Description complète du terrain et du projet' },
    { code: 'PCMI 5', nom: 'Plans des façades et toitures', obligatoire: true, desc: 'Toutes les façades avec matériaux et couleurs' },
    { code: 'PCMI 6', nom: 'Document graphique d\'insertion', obligatoire: true, desc: 'Simulation visuelle du projet dans son environnement' },
    { code: 'PCMI 7', nom: 'Photographies proches et lointaines', obligatoire: true, desc: 'Depuis et vers le terrain depuis l\'espace public' },
    { code: 'AT1', nom: 'Attestation RE2020', obligatoire: true, desc: 'Obligatoire pour toute construction neuve — réglementation thermique' },
  ],
  '13703': [
    { code: 'DPMI 1', nom: 'Plan de situation', obligatoire: true, desc: 'Localisation du terrain dans la commune' },
    { code: 'DPMI 2', nom: 'Plan de masse', obligatoire: true, desc: 'Implantation des travaux avec cotations' },
    { code: 'DPMI 3', nom: 'Plan en coupe', obligatoire: false, desc: 'Si modification du profil du terrain naturel' },
    { code: 'DPMI 4', nom: 'Photographies du terrain', obligatoire: true, desc: 'État actuel et intégration dans l\'environnement' },
    { code: 'DPMI 5', nom: 'Plan des façades', obligatoire: false, desc: 'Si modification des façades' },
  ],
  '13411': [
    { code: 'PD 1', nom: 'Plan de situation', obligatoire: true, desc: 'Localisation dans la commune' },
    { code: 'PD 2', nom: 'Plan de masse', obligatoire: true, desc: 'Bâtiment à démolir avec cotations' },
    { code: 'PD 3', nom: 'Photographies avant démolition', obligatoire: true, desc: 'État actuel du bâtiment sous tous les angles' },
    { code: 'PD 4', nom: 'Notice descriptive de démolition', obligatoire: true, desc: 'Description des travaux et techniques utilisées' },
    { code: 'PD 5', nom: 'Attestation amiante', obligatoire: true, desc: 'Obligatoire si bâtiment construit avant 1997' },
  ],
};

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
          label: f.properties.label,
          city: f.properties.city,
          postcode: f.properties.postcode,
          citycode: f.properties.citycode,
          context: f.properties.context,
        }));
        setSugg(s); setOpen(s.length > 0);
      } catch { setSugg([]); }
    }, 300);
  };

  const iStyle = { width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px 11px 38px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

  return (
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
  );
}

function WizardContent() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    cerfa: params.get('cerfa') || '',
    adresse: params.get('adresse') || '',
    commune: params.get('commune') || '',
    code_postal: params.get('postcode') || '',
    code_insee: params.get('citycode') || '',
    zone: params.get('zone') || '',
    surface: params.get('surface') || '',
    type: params.get('type') || '',
    prenom: '',
    nom: '',
    description: '',
  });

  useEffect(() => {
    if (params.get('adresse') && params.get('cerfa')) setStep(3);
    else if (params.get('adresse')) setStep(2);
  }, []);

  const iStyle = { width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

  const downloadRapport = () => {
    const pieces = PIECES[data.cerfa] || PIECES['13406'];
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Dossier CERFA — PermitAI</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:820px;margin:0 auto}h1{color:#a07820;border-bottom:3px solid #a07820;padding-bottom:12px}h2{color:#555;font-size:16px;margin-top:28px;border-bottom:1px solid #eee;padding-bottom:6px}.field{display:flex;padding:8px 12px;margin:4px 0;background:#f8f8f8;border-radius:6px}.label{font-size:11px;color:#888;text-transform:uppercase;min-width:160px;padding-top:2px}.value{font-size:14px;font-weight:500}.piece{padding:10px 14px;border-left:3px solid #4ade80;margin:6px 0;background:#f0fff4;font-size:13px}.piece.opt{border-left-color:#f59e0b;background:#fff8e1}.warn{padding:14px;background:#fff8e1;border-left:3px solid #f59e0b;margin:16px 0;font-size:13px}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa;text-align:center}</style>
</head><body>
<h1>📋 Dossier CERFA — PermitAI</h1>
<p style="color:#888;font-size:12px">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
<h2>👤 Demandeur</h2>
<div class="field"><span class="label">Nom complet</span><span class="value">${data.prenom} ${data.nom}</span></div>
<h2>📍 Terrain</h2>
<div class="field"><span class="label">Adresse</span><span class="value">${data.adresse}</span></div>
<div class="field"><span class="label">Commune</span><span class="value">${data.commune}</span></div>
<div class="field"><span class="label">Code postal</span><span class="value">${data.code_postal}</span></div>
<div class="field"><span class="label">Code INSEE</span><span class="value">${data.code_insee}</span></div>
<div class="field"><span class="label">Zone PLU</span><span class="value">${data.zone || 'À vérifier en mairie'}</span></div>
<h2>🏗 Projet</h2>
<div class="field"><span class="label">Type de travaux</span><span class="value">${data.type}</span></div>
<div class="field"><span class="label">Surface</span><span class="value">${data.surface} m²</span></div>
<div class="field"><span class="label">Description</span><span class="value">${data.description}</span></div>
<div class="field"><span class="label">CERFA applicable</span><span class="value">${data.cerfa} — ${data.cerfa === '13703' ? 'Déclaration préalable' : data.cerfa === '13411' ? 'Permis de démolir' : 'Permis de construire MI'}</span></div>
<div class="field"><span class="label">Délai instruction</span><span class="value">${data.cerfa === '13703' ? '1 mois' : '2 mois'}</span></div>
${parseInt(data.surface) > 150 ? '<div class="warn">⚖️ <strong>Architecte obligatoire</strong> — Surface plancher > 150m² (Loi du 3 janvier 1977)</div>' : ''}
<h2>📎 Pièces à joindre</h2>
${pieces.map(p => `<div class="piece${p.obligatoire ? '' : ' opt'}"><strong>${p.code} — ${p.nom}</strong>${p.obligatoire ? ' <span style="color:#065f46;font-size:11px">(obligatoire)</span>' : ' <span style="color:#92400e;font-size:11px">(selon cas)</span>'}<br><span style="font-size:12px;color:#555">${p.desc}</span></div>`).join('')}
<h2>💶 Coûts estimés</h2>
<div class="field"><span class="label">Taxe d'aménagement</span><span class="value">~${Math.round((parseInt(data.surface)||50)*820*0.05).toLocaleString('fr-FR')}€ (indicatif — calculée par la commune)</span></div>
<div class="footer">Dossier préparé par PermitAI · permitai.eu · contact@permitai.eu<br>Document informatif — vérifiez les exigences spécifiques auprès de votre mairie</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cerfa-${data.cerfa}-${(data.commune || 'commune').replace(/ /g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const steps = ['Type', 'Terrain', 'Projet', 'Dossier'];
  const pieces = PIECES[data.cerfa] || PIECES['13406'];

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

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>✨ Assistant CERFA</div>
          <h1 style={{ fontSize: 32, color: '#f2efe9', fontWeight: 500, marginBottom: 6 }}>Remplissez votre CERFA <em style={{ color: '#e8b420', fontStyle: 'italic' }}>en 5 minutes</em></h1>
          <p style={{ fontSize: 13, color: '#5a5650' }}>4 étapes guidées · PDF officiel à télécharger</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div onClick={() => i + 1 < step && setStep(i + 1)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: i + 1 < step ? '#a07820' : i + 1 === step ? 'rgba(160,120,32,.15)' : '#111118', border: i + 1 === step ? '1.5px solid #a07820' : i + 1 < step ? 'none' : '0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: i + 1 < step ? '#fff' : i + 1 === step ? '#a07820' : '#2a2a38', cursor: i + 1 < step ? 'pointer' : 'default' }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i + 1 === step ? '#a07820' : '#2a2a38', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: '0.5px', background: i + 1 < step ? '#a07820' : '#1c1c2a', margin: '0 6px', marginBottom: 16 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 28 }}>

          {/* ÉTAPE 1 — Type */}
          {step === 1 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Type de projet</h2>
              <p style={{ fontSize: 12, color: '#5a5650', marginBottom: 20 }}>Sélectionnez le type de travaux</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['construction', '🏠', 'Construction neuve', '13406'],
                  ['extension', '📐', 'Extension', '13406'],
                  ['renovation', '🔨', 'Rénovation façade', '13703'],
                  ['surelevation', '⬆️', 'Surélévation', '13406'],
                  ['piscine', '🏊', 'Piscine', '13703'],
                  ['cloture', '🚧', 'Clôture', '13703'],
                  ['annexe', '🏚', 'Annexe / Garage', '13703'],
                  ['demolition', '💥', 'Démolition', '13411'],
                ].map(([val, icon, label, cerfa]) => (
                  <button key={val}
                    onClick={() => { setData(d => ({ ...d, type: val, cerfa })); setStep(2); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: data.type === val ? 'rgba(160,120,32,.08)' : '#111118', border: data.type === val ? '0.5px solid #a07820' : '0.5px solid #1c1c2a', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#f2efe9', fontSize: 13, textAlign: 'left' }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: 10, color: '#3e3a34' }}>CERFA {cerfa}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — Terrain */}
          {step === 2 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Informations du terrain</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Adresse complète *</label>
                <AdresseField
                  value={data.adresse}
                  onChange={val => setData(d => ({ ...d, adresse: val }))}
                  onSelect={item => setData(d => ({ ...d, adresse: item.label, commune: item.city || '', code_postal: item.postcode || '', code_insee: item.citycode || '' }))}
                />
              </div>
              {data.commune && (
                <div style={{ padding: '8px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80', marginBottom: 14, display: 'flex', gap: 16 }}>
                  <span>✓ {data.commune}</span>
                  <span>{data.code_postal}</span>
                  <span style={{ color: '#3e3a34' }}>INSEE: {data.code_insee}</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Prénom</label>
                  <input type="text" value={data.prenom} onChange={e => setData(d => ({ ...d, prenom: e.target.value }))} placeholder="Jean" style={iStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Nom</label>
                  <input type="text" value={data.nom} onChange={e => setData(d => ({ ...d, nom: e.target.value }))} placeholder="Dupont" style={iStyle} />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Projet */}
          {step === 3 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Détails du projet</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Surface (m²) *</label>
                <input type="number" value={data.surface} onChange={e => setData(d => ({ ...d, surface: e.target.value }))} placeholder="120" style={iStyle} />
              </div>
              {parseInt(data.surface) > 150 && (
                <div style={{ padding: '11px 14px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 14 }}>
                  ⚖️ <strong>Architecte obligatoire</strong> — Surface plancher {'>'} 150m² (Loi du 3 janvier 1977)
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Description du projet</label>
                <textarea value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))}
                  placeholder="Extension de 35m² plain-pied avec véranda vitrée..." rows={3}
                  style={{ ...iStyle, resize: 'vertical' }} />
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 12, color: '#e8b420', fontWeight: 600 }}>
                📋 CERFA {data.cerfa} — {data.cerfa === '13703' ? 'Déclaration préalable' : data.cerfa === '13411' ? 'Permis de démolir' : 'Permis de construire MI'} · Délai : {data.cerfa === '13703' ? '1 mois' : '2 mois'}
              </div>
            </div>
          )}

          {/* ÉTAPE 4 — Dossier */}
          {step === 4 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <h2 style={{ color: '#f2efe9', fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Dossier complet</h2>
                <p style={{ fontSize: 12, color: '#5a5650' }}>{data.prenom} {data.nom} · {data.commune} {data.code_postal}</p>
              </div>

              <div style={{ background: '#111118', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                {[
                  ['CERFA', `${data.cerfa} — ${data.cerfa === '13703' ? 'Déclaration préalable' : 'Permis de construire MI'}`],
                  ['Adresse', data.adresse],
                  ['Commune', `${data.commune} · ${data.code_postal} · INSEE ${data.code_insee}`],
                  ['Projet', `${data.type} · ${data.surface}m²`],
                  ['Délai instruction', data.cerfa === '13703' ? '1 mois' : '2 mois'],
                  ['Taxe aménagement estimée', `~${Math.round((parseInt(data.surface)||50)*820*0.05).toLocaleString('fr-FR')}€`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '0.5px solid #1a1a28', fontSize: 12, gap: 12 }}>
                    <span style={{ color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.3px', fontSize: 10, flexShrink: 0 }}>{l}</span>
                    <span style={{ color: '#c4bfb8', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f2efe9', marginBottom: 12 }}>📎 Pièces à joindre ({pieces.filter(p => p.obligatoire).length} obligatoires)</div>
                {pieces.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #111118' }}>
                    <span style={{ color: p.obligatoire ? '#4ade80' : '#e8b420', fontSize: 13, flexShrink: 0, marginTop: 1 }}>{p.obligatoire ? '✓' : '○'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: '#f2efe9', fontWeight: 500 }}>{p.code} — {p.nom}</div>
                      <div style={{ fontSize: 10, color: '#3e3a34', marginTop: 2 }}>{p.desc}</div>
                    </div>
                    <span style={{ fontSize: 10, color: p.obligatoire ? '#4ade80' : '#e8b420', flexShrink: 0 }}>{p.obligatoire ? 'Obligatoire' : 'Selon cas'}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={downloadRapport}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  ⬇ Télécharger le dossier complet
                </button>
                <Link href={`/depot?adresse=${encodeURIComponent(data.adresse)}&commune=${encodeURIComponent(data.commune)}&cerfa=${data.cerfa}&postcode=${data.code_postal}&citycode=${data.code_insee}`} style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 10, color: '#a07820', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    📬 Déposer en mairie — 199€ →
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
              <button onClick={() => setStep(s => s - 1)}
                style={{ padding: '11px 20px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 9, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                ← Retour
              </button>
            )}
            {step < 4 && (
              <button onClick={() => setStep(s => s + 1)}
                style={{ flex: 1, padding: '11px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Continuer →
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
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f2efe9', fontSize: 14 }}>
        Chargement...
      </div>
    }>
      <WizardContent />
    </Suspense>
  );
}
