'use client';
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function DepotPage() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse_terrain: '',
    commune: '',
    code_postal: '',
    code_insee: '',
    type_projet: '',
    surface: '',
    cerfa: '',
    description: '',
  });
  const [sugg, setSugg] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const addrRef = useRef(null);
  const addrTimer = useRef(null);

  // Pré-remplir depuis Clerk
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
          label: f.properties.label,
          city: f.properties.city,
          postcode: f.properties.postcode,
          citycode: f.properties.citycode,
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
    const html = `<!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Dossier dépôt mairie — PermitAI</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
      h1 { color: #a07820; border-bottom: 2px solid #a07820; padding-bottom: 10px; }
      h2 { color: #555; font-size: 16px; margin-top: 24px; }
      .field { margin: 8px 0; padding: 8px 12px; background: #f8f8f8; border-radius: 4px; }
      .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .5px; }
      .value { font-size: 14px; font-weight: 500; margin-top: 2px; }
      .piece { padding: 10px 12px; border-left: 3px solid #4ade80; margin: 6px 0; background: #f0fff4; }
      .warning { padding: 12px; background: #fff8e1; border-left: 3px solid #f59e0b; margin: 16px 0; font-size: 13px; }
      .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; }
    </style></head>
    <body>
      <h1>📋 Dossier de dépôt — PermitAI</h1>
      <p style="color:#888;font-size:13px">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>

      <h2>👤 Informations du demandeur</h2>
      <div class="field"><div class="label">Nom complet</div><div class="value">${form.prenom} ${form.nom}</div></div>
      <div class="field"><div class="label">Email</div><div class="value">${form.email}</div></div>
      <div class="field"><div class="label">Téléphone</div><div class="value">${form.telephone || 'Non renseigné'}</div></div>

      <h2>📍 Informations du terrain</h2>
      <div class="field"><div class="label">Adresse complète</div><div class="value">${form.adresse_terrain}</div></div>
      <div class="field"><div class="label">Commune</div><div class="value">${form.commune}</div></div>
      <div class="field"><div class="label">Code postal</div><div class="value">${form.code_postal}</div></div>
      <div class="field"><div class="label">Code INSEE</div><div class="value">${form.code_insee}</div></div>

      <h2>🏗 Description du projet</h2>
      <div class="field"><div class="label">Type de travaux</div><div class="value">${form.type_projet}</div></div>
      <div class="field"><div class="label">Surface</div><div class="value">${form.surface} m²</div></div>
      <div class="field"><div class="label">CERFA</div><div class="value">${form.cerfa || '13406'}</div></div>
      <div class="field"><div class="label">Description</div><div class="value">${form.description}</div></div>

      ${parseInt(form.surface) > 150 ? '<div class="warning">⚖️ <strong>Architecte obligatoire</strong> — Surface > 150m² (Loi du 3 janvier 1977). La signature du dossier doit être effectuée par un architecte inscrit à l’Ordre.</div>' : ''}

      <h2>📎 Pièces à joindre obligatoirement</h2>
      <div class="piece">✓ Plan de situation du terrain (PCMI 1) — Échelle 1/25 000</div>
      <div class="piece">✓ Plan de masse (PCMI 2) — Vue de dessus avec cotations</div>
      <div class="piece">✓ Plan en coupe (PCMI 3) — Profil du terrain naturel</div>
      <div class="piece">✓ Notice descriptive (PCMI 4) — Description complète du projet</div>
      <div class="piece">✓ Plans des façades et toitures (PCMI 5) — Toutes les façades</div>
      <div class="piece">✓ Document graphique d'insertion (PCMI 6) — Simulation visuelle</div>
      <div class="piece">✓ Photographies proches et lointaines (PCMI 7) — Depuis l'espace public</div>
      ${parseInt(form.surface) > 50 ? '<div class="piece">✓ Attestation RE2020 — Obligatoire pour constructions neuves</div>' : ''}

      <h2>📬 Mairie compétente</h2>
      <div class="field"><div class="label">Commune</div><div class="value">Mairie de ${form.commune || 'votre commune'}</div></div>
      <div class="field"><div class="label">Délai instruction</div><div class="value">${form.cerfa === '13703' ? '1 mois' : '2 mois'} à compter du dépôt</div></div>
      <div class="field"><div class="label">Dépôt</div><div class="value">En ligne via PLAT'AU ou en mairie avec récépissé</div></div>

      <div class="footer">
        Dossier préparé par PermitAI · permitai.eu · contact@permitai.eu<br>
        Ce document est fourni à titre informatif. Vérifiez les exigences spécifiques de votre commune.
      </div>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier-depot-${form.commune || 'mairie'}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Field = ({ label, stateKey, type = 'text', placeholder = '' }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[stateKey]} onChange={e => setForm(f => ({ ...f, [stateKey]: e.target.value }))}
        placeholder={placeholder}
        style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );

  const steps = ['Demandeur', 'Terrain', 'Projet', 'Dossier'];

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ padding: '16px 52px', borderBottom: '0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏠</div>
          <span style={{ color: '#f2efe9', fontWeight: 500, fontSize: 15 }}>PermitAI</span>
        </a>
        <span style={{ fontSize: 12, color: '#3e3a34' }}>Dépôt en mairie</span>
      </nav>

      <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Dépôt mairie</div>
          <h1 style={{ fontSize: 28, color: '#f2efe9', fontWeight: 500, marginBottom: 6 }}>Déposez votre dossier <em style={{ color: '#e8b420', fontStyle: 'italic' }}>en ligne</em></h1>
          <p style={{ fontSize: 13, color: '#5a5650' }}>Remplissez le formulaire — nous générons votre dossier complet prêt à déposer</p>
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
              <h2 style={{ color: '#f2efe9', fontSize: 16, fontWeight: 500, marginBottom: 20 }}>👤 Informations du demandeur</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Prénom" stateKey="prenom" placeholder="Jean" />
                <Field label="Nom" stateKey="nom" placeholder="Dupont" />
              </div>
              <Field label="Email" stateKey="email" type="email" placeholder="jean.dupont@email.fr" />
              <Field label="Téléphone" stateKey="telephone" type="tel" placeholder="06 12 34 56 78" />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 16, fontWeight: 500, marginBottom: 20 }}>📍 Informations du terrain</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Adresse complète du terrain *</label>
                <div ref={addrRef} style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2, fontSize: 14 }}>📍</span>
                  <input type="text" value={form.adresse_terrain} onChange={e => searchAddr(e.target.value)}
                    onFocus={() => form.adresse_terrain && sugg.length > 0 && setShowSugg(true)}
                    placeholder="3 rue Albert Dupeyron, 33150 Cenon" autoComplete="off"
                    style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px 11px 38px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  {showSugg && sugg.length > 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999, background: '#0e0e1a', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.9)' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Commune (auto)" stateKey="commune" placeholder="Auto-rempli" />
                <Field label="Code postal (auto)" stateKey="code_postal" placeholder="Auto-rempli" />
              </div>
              <Field label="Code INSEE (auto)" stateKey="code_insee" placeholder="Auto-rempli" />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ color: '#f2efe9', fontSize: 16, fontWeight: 500, marginBottom: 20 }}>🏗 Description du projet</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Type de travaux</label>
                <select value={form.type_projet} onChange={e => setForm(f => ({ ...f, type_projet: e.target.value, cerfa: ['construction', 'extension'].includes(e.target.value) ? '13406' : '13703' }))}
                  style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }}>
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
              <Field label="Surface (m²)" stateKey="surface" type="number" placeholder="120" />
              {parseInt(form.surface) > 150 && (
                <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 14 }}>
                  ⚖️ <strong>Architecte obligatoire</strong> — Surface plancher &gt; 150m² (Loi du 3 janvier 1977)
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>CERFA applicable</label>
                <div style={{ padding: '11px 14px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 8, fontSize: 13, color: '#e8b420', fontWeight: 500 }}>
                  {form.cerfa || '13406'} — {form.cerfa === '13703' ? 'Déclaration préalable' : 'Permis de construire maison individuelle'}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Description du projet</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Extension de 35m² plain-pied avec véranda vitrée sur le côté de la maison..."
                  rows={4} style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <h2 style={{ color: '#f2efe9', fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Dossier prêt</h2>
                <p style={{ fontSize: 13, color: '#5a5650' }}>{form.prenom} {form.nom} · {form.adresse_terrain}</p>
              </div>
              <div style={{ background: '#111118', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[['Demandeur', `${form.prenom} ${form.nom} · ${form.email}`], ['Terrain', `${form.adresse_terrain} · ${form.commune} ${form.code_postal}`], ['Projet', `${form.type_projet} · ${form.surface}m² · CERFA ${form.cerfa || '13406'}`]].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #1a1a28', fontSize: 12 }}>
                    <span style={{ color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.3px', fontSize: 10 }}>{label}</span>
                    <span style={{ color: '#c4bfb8', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={downloadDossier}
                  style={{ width: '100%', padding: '13px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  ⬇ Télécharger le dossier complet
                </button>
                <a href={`mailto:contact@permitai.eu?subject=Dépôt mairie — ${form.commune}&body=Demandeur: ${form.prenom} ${form.nom}%0AAdresse: ${form.adresse_terrain}%0ACommune: ${form.commune} ${form.code_postal}%0AProjet: ${form.type_projet} ${form.surface}m²`}
                  style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 10, color: '#a07820', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    📬 Demander le dépôt assisté — 199€
                  </button>
                </a>
                <a href="/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '11px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 10, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Voir mon dashboard →
                  </button>
                </a>
              </div>
            </div>
          )}

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
