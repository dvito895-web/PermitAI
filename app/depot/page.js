'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function DepotPage() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse_terrain: '', commune: '', code_postal: '', code_insee: '',
    type_projet: '', surface: '', cerfa: '13406', description: '',
  });
  const [sugg, setSugg] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const addrRef = useRef(null);
  const addrTimer = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        prenom: user.firstName || '',
        nom: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('adresse')) setForm(f => ({ ...f, adresse_terrain: params.get('adresse') || '' }));
    if (params.get('commune')) setForm(f => ({ ...f, commune: params.get('commune') || '' }));
    if (params.get('cerfa')) setForm(f => ({ ...f, cerfa: params.get('cerfa') || '13406' }));
  }, []);

  useEffect(() => {
    const close = (e) => { if (addrRef.current && !addrRef.current.contains(e.target)) setShowSugg(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const searchAddr = (val) => {
    setForm(f => ({ ...f, adresse_terrain: val }));
    clearTimeout(addrTimer.current);
    if (!val) { setSugg([]); setShowSugg(false); return; }
    addrTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=6&autocomplete=1`);
        const d = await res.json();
        const results = (d.features || []).map(f => ({
          label: f.properties.label, city: f.properties.city,
          postcode: f.properties.postcode, citycode: f.properties.citycode,
          context: f.properties.context,
        }));
        setSugg(results); setShowSugg(results.length > 0);
      } catch { setSugg([]); }
    }, 200);
  };

  const selectAddr = (item) => {
    setForm(f => ({ ...f, adresse_terrain: item.label, commune: item.city || '', code_postal: item.postcode || '', code_insee: item.citycode || '' }));
    setShowSugg(false); setSugg([]);
  };

  const downloadDossier = () => {
    const pieces = form.cerfa === '13703'
      ? ['Plan de situation (DPMI 1)', 'Plan de masse (DPMI 2)', 'Photos du terrain (DPMI 4)']
      : ['Plan de situation (PCMI 1)', 'Plan de masse (PCMI 2)', 'Plan en coupe (PCMI 3)', 'Notice descriptive (PCMI 4)', 'Plans des façades et toitures (PCMI 5)', 'Document graphique d\'insertion (PCMI 6)', 'Photographies proches et lointaines (PCMI 7)'];
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Dossier dépôt mairie — PermitAI</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:800px;margin:0 auto}h1{color:#a07820;border-bottom:2px solid #a07820;padding-bottom:10px}h2{color:#555;font-size:15px;margin-top:28px}.field{margin:8px 0;padding:10px 14px;background:#f8f8f8;border-radius:6px}.label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.5px}.value{font-size:14px;font-weight:500;margin-top:3px;color:#222}.piece{padding:10px 14px;border-left:3px solid #4ade80;margin:6px 0;background:#f0fff4;font-size:13px}.warn{padding:14px;background:#fff8e1;border-left:3px solid #f59e0b;margin:16px 0;font-size:13px}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa}</style>
</head><body>
<h1>📋 Dossier de dépôt en mairie — PermitAI</h1>
<p style="color:#888;font-size:12px">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
<h2>👤 Demandeur</h2>
<div class="field"><div class="label">Nom complet</div><div class="value">${form.prenom} ${form.nom}</div></div>
<div class="field"><div class="label">Email</div><div class="value">${form.email}</div></div>
<div class="field"><div class="label">Téléphone</div><div class="value">${form.telephone || 'Non renseigné'}</div></div>
<h2>📍 Terrain</h2>
<div class="field"><div class="label">Adresse complète</div><div class="value">${form.adresse_terrain}</div></div>
<div class="field"><div class="label">Commune</div><div class="value">${form.commune}</div></div>
<div class="field"><div class="label">Code postal</div><div class="value">${form.code_postal}</div></div>
<div class="field"><div class="label">Code INSEE</div><div class="value">${form.code_insee}</div></div>
<h2>🏗 Projet</h2>
<div class="field"><div class="label">Type de travaux</div><div class="value">${form.type_projet}</div></div>
<div class="field"><div class="label">Surface</div><div class="value">${form.surface} m²</div></div>
<div class="field"><div class="label">CERFA applicable</div><div class="value">${form.cerfa} — ${form.cerfa === '13703' ? 'Déclaration préalable' : 'Permis de construire MI'}</div></div>
<div class="field"><div class="label">Description</div><div class="value">${form.description}</div></div>
${parseInt(form.surface) > 150 ? '<div class="warn">⚖️ <strong>Architecte obligatoire</strong> — Surface plancher > 150m² (Loi du 3 janvier 1977). La signature doit être effectuée par un architecte inscrit à l\'Ordre.</div>' : ''}
<h2>📎 Pièces à joindre obligatoirement</h2>
${pieces.map(p => `<div class="piece">✓ ${p}</div>`).join('')}
${parseInt(form.surface) > 50 ? '<div class="piece" style="border-left-color:#f59e0b;background:#fff8e1">⚠ Attestation RE2020 — Obligatoire pour constructions neuves (Décret 2021-1004)</div>' : ''}
<h2>📬 Mairie compétente</h2>
<div class="field"><div class="label">Commune</div><div class="value">Mairie de ${form.commune}</div></div>
<div class="field"><div class="label">Délai légal d'instruction</div><div class="value">${form.cerfa === '13703' ? '1 mois' : '2 mois'} à compter du récépissé</div></div>
<div class="field"><div class="label">Mode de dépôt</div><div class="value">PLAT'AU (en ligne) ou en mairie avec accusé de réception</div></div>
<div class="field"><div class="label">Accord tacite</div><div class="value">À défaut de réponse dans le délai, permis accordé tacitement</div></div>
<div class="footer">Dossier préparé par PermitAI · permitai.eu · contact@permitai.eu<br>Ce document est fourni à titre informatif et de préparation. Vérifiez les exigences spécifiques de votre mairie.</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier-depot-${(form.commune || 'mairie').replace(/ /g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const iStyle = { width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const Field = ({ label, k, type = 'text', ph = '', readOnly = false }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>{label}</label>
      <input type={type} value={form[k]} onChange={e => !readOnly && setForm(f => ({ ...f, [k]: e.target.value }))}
        placeholder={ph} readOnly={readOnly}
        style={{ ...iStyle, background: readOnly ? '#080810' : '#0a0a14', color: readOnly ? '#3e3a34' : '#f2efe9' }} />
    </div>
  );

  const steps = ['Demandeur', 'Terrain', 'Projet', 'Dossier'];

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ padding: '14px 52px', borderBottom: '0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏠</div>
          <span style={{ color: '#f2efe9', fontWeight: 500, fontSize: 15 }}>PermitAI</span>
        </Link>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '7px 14px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 8, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Dashboard →</button>
        </Link>
      </nav>

      <div style={{ maxWidth: 660, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>📬 Dépôt en mairie</div>
          <h1 style={{ fontSize: 28, color: '#f2efe9', fontWeight: 500, marginBottom: 6 }}>Déposez votre dossier <em style={{ color: '#e8b420', fontStyle: 'italic' }}>en ligne</em></h1>
          <p style={{ fontSize: 13, color: '#5a5650' }}>Remplissez le formulaire — dossier complet généré et téléchargeable</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: i + 1 < step ? '#a07820' : i + 1 === step ? 'rgba(160,120,32,.15)' : '#111118', border: i + 1 === step ? '1.5px solid #a07820' : i + 1 < step ? 'none' : '0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: i + 1 < step ? '#fff' : i + 1 === step ? '#a07820' : '#2a2a38' }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i + 1 === step ? '#a07820' : '#2a2a38', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: '0.5px', background: i + 1 < step ? '#a07820' : '#1c1c2a', margin: '0 6px', marginBottom: 16 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 28 }}>
          {step === 1 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>👤 Informations du demandeur</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Prénom *" k="prenom" ph="Jean" />
                <Field label="Nom *" k="nom" ph="Dupont" />
              </div>
              <Field label="Email *" k="email" type="email" ph="jean.dupont@email.fr" />
              <Field label="Téléphone" k="telephone" type="tel" ph="06 12 34 56 78" />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>📍 Informations du terrain</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>Adresse complète du terrain *</label>
                <div ref={addrRef} style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2, fontSize: 14 }}>📍</span>
                  <input type="text" value={form.adresse_terrain} onChange={e => searchAddr(e.target.value)}
                    onFocus={() => form.adresse_terrain && sugg.length > 0 && setShowSugg(true)}
                    placeholder="3 rue Albert Dupeyron, 33150 Cenon" autoComplete="off"
                    style={{ ...iStyle, paddingLeft: 38 }} />
                  {showSugg && sugg.length > 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999, background: '#0e0e1a', border: '0.5px solid rgba(160,120,32,.4)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.9)' }}>
                      {sugg.map((s, i) => (
                        <button key={i} type="button"
                          onMouseDown={e => { e.preventDefault(); selectAddr(s); }}
                          style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: i < sugg.length - 1 ? '0.5px solid #111118' : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500 }}>{s.label}</span>
                          <span style={{ fontSize: 10, color: '#3e3a34', marginTop: 2 }}>{s.context}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Commune (auto-rempli)" k="commune" ph="Auto" />
                <Field label="Code postal (auto-rempli)" k="code_postal" ph="Auto" />
              </div>
              <Field label="Code INSEE (auto-rempli)" k="code_insee" ph="Auto" />
              {form.commune && (
                <div style={{ padding: '8px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80', marginTop: 4 }}>
                  ✓ Commune identifiée : {form.commune} ({form.code_postal})
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>🏗 Description du projet</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>Type de travaux *</label>
                <select value={form.type_projet}
                  onChange={e => setForm(f => ({ ...f, type_projet: e.target.value, cerfa: ['construction', 'extension', 'surelevation'].includes(e.target.value) ? '13406' : e.target.value === 'demolition' ? '13411' : '13703' }))}
                  style={iStyle}>
                  <option value="">Sélectionner...</option>
                  <option value="construction">Construction neuve</option>
                  <option value="extension">Extension</option>
                  <option value="renovation">Rénovation façade</option>
                  <option value="surelevation">Surélévation</option>
                  <option value="annexe">Annexe / Garage</option>
                  <option value="piscine">Piscine</option>
                  <option value="cloture">Clôture</option>
                  <option value="demolition">Démolition</option>
                </select>
              </div>
              <Field label="Surface (m²) *" k="surface" type="number" ph="120" />
              {parseInt(form.surface) > 150 && (
                <div style={{ padding: '11px 14px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 12 }}>
                  ⚖️ <strong>Architecte obligatoire</strong> — Surface plancher {'>'} 150m² (Loi du 3 janvier 1977)
                </div>
              )}
              <div style={{ padding: '10px 14px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 12, color: '#e8b420', fontWeight: 500, marginBottom: 12 }}>
                📋 CERFA applicable : {form.cerfa} — {form.cerfa === '13703' ? 'Déclaration préalable' : form.cerfa === '13411' ? 'Permis de démolir' : 'Permis de construire MI'}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>Description du projet</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Extension de 35m² plain-pied avec véranda vitrée..." rows={4}
                  style={{ ...iStyle, resize: 'vertical' }} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <h2 style={{ color: '#f2efe9', fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Dossier complet</h2>
                <p style={{ fontSize: 13, color: '#5a5650' }}>{form.prenom} {form.nom} · {form.commune} {form.code_postal}</p>
              </div>
              <div style={{ background: '#111118', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                {[
                  ['Demandeur', `${form.prenom} ${form.nom} · ${form.email}`],
                  ['Terrain', `${form.adresse_terrain}`],
                  ['Commune', `${form.commune} · ${form.code_postal} · INSEE ${form.code_insee}`],
                  ['Projet', `${form.type_projet} · ${form.surface}m²`],
                  ['CERFA', `${form.cerfa} · Délai ${form.cerfa === '13703' ? '1 mois' : '2 mois'}`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '0.5px solid #1a1a28', fontSize: 12, gap: 12 }}>
                    <span style={{ color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.3px', fontSize: 10, flexShrink: 0 }}>{l}</span>
                    <span style={{ color: '#c4bfb8', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={downloadDossier}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  ⬇ Télécharger le dossier complet (HTML)
                </button>
                <a href={`mailto:contact@permitai.eu?subject=Dépôt mairie — ${form.commune}&body=Demandeur: ${form.prenom} ${form.nom}%0AEmail: ${form.email}%0AAdresse terrain: ${form.adresse_terrain}%0ACommune: ${form.commune} ${form.code_postal}%0ACERFA: ${form.cerfa}%0AProjet: ${form.type_projet} ${form.surface}m²`} style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 10, color: '#a07820', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    📬 Demander le dépôt assisté — 199€
                  </button>
                </a>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 9, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Dashboard →</button>
                  </Link>
                  <Link href="/cerfa" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 9, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Voir les CERFA →</button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 20, borderTop: '0.5px solid #111118' }}>
            {step > 1 && step < 5 && (
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
