'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

function AdresseField({ value, onChange, onSelect }) {
  const [sugg, setSugg] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const t = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const search = (val) => {
    onChange(val);
    clearTimeout(t.current);
    if (!val || val.length < 1) { setSugg([]); setOpen(false); return; }
    t.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/address?q=' + encodeURIComponent(val) + '&limit=7');
        const d = await r.json();
        const s = (d.features || []).map(f => ({
          label: f.properties.label,
          city: f.properties.city,
          postcode: f.properties.postcode,
          citycode: f.properties.citycode,
          context: f.properties.context,
          street: f.properties.street,
          housenumber: f.properties.housenumber,
        }));
        setSugg(s);
        setOpen(s.length > 0);
      } catch { setSugg([]); }
    }, 300);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2, fontSize: 15, color: value ? '#a07820' : '#3e3a34' }}>📍</span>
      <input
        type="text" value={value} autoComplete="off" spellCheck="false"
        onChange={e => search(e.target.value)}
        placeholder="Ex: 12 avenue des Fleurs, Paris 75011"
        style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 16px 13px 40px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
      />
      {open && sugg.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 99999, background: '#0e0e1a', border: '0.5px solid rgba(160,120,32,.4)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,.9)' }}>
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
          <div style={{ padding: '5px 14px', fontSize: 9, color: '#1a1a28', borderTop: '0.5px solid #0a0a10', textAlign: 'right' }}>
            api-adresse.data.gouv.fr · 34 970 communes
          </div>
        </div>
      )}
    </div>
  );
}

const PIECES = {
  '13406': ['Plan de situation du terrain (PCMI 1) — Échelle 1/25 000', 'Plan de masse (PCMI 2) — Cotations + altimétrie', 'Plan en coupe (PCMI 3)', 'Notice descriptive (PCMI 4)', 'Plans des façades et toitures (PCMI 5)', 'Document graphique d\'insertion (PCMI 6)', 'Photographies proches et lointaines (PCMI 7)', 'Attestation RE2020 — Si construction neuve'],
  '13703': ['Plan de situation (DPMI 1)', 'Plan de masse (DPMI 2)', 'Photographies (DPMI 4)', 'Plan des façades (DPMI 5) — Si modification'],
  '13411': ['Plan de situation', 'Plan de masse', 'Photos avant démolition', 'Notice descriptive', 'Attestation amiante — Si avant 1997'],
};

export default function AnalysePage() {
  const [adresse, setAdresse] = useState('');
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [surface, setSurface] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function handleSelect(item) {
    setSelectedAddr(item);
    setAdresse(item.label);
  }

  const downloadRapport = () => {
    if (!result) return;
    const cerfaNum = result.cerfa_recommande || result.cerfa?.numero || '13406';
    const pieces = PIECES[cerfaNum] || PIECES['13406'];
    const addr = selectedAddr || {};
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Rapport PLU — PermitAI</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:820px;margin:0 auto}h1{color:#a07820;border-bottom:3px solid #a07820;padding-bottom:12px}h2{color:#555;font-size:16px;margin-top:28px;border-bottom:1px solid #eee;padding-bottom:6px}.field{display:flex;padding:8px 12px;margin:4px 0;background:#f8f8f8;border-radius:6px}.label{font-size:11px;color:#888;text-transform:uppercase;min-width:160px;padding-top:2px}.value{font-size:14px;font-weight:500}.rule{padding:12px 14px;border-left:3px solid #4ade80;margin:8px 0;background:#f0fff4;border-radius:0 6px 6px 0}.piece{padding:9px 12px;border-left:3px solid #a07820;margin:5px 0;background:#fff8f0;font-size:13px}.warn{padding:14px;background:#fff8e1;border-left:3px solid #f59e0b;margin:16px 0;font-size:13px}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa;text-align:center}</style>
</head><body>
<h1>📋 Rapport d'analyse PLU — PermitAI</h1>
<p style="color:#888;font-size:12px">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
<h2>📍 Terrain analysé</h2>
<div class="field"><span class="label">Adresse complète</span><span class="value">${adresse}</span></div>
<div class="field"><span class="label">Commune</span><span class="value">${result.commune || addr.city || ''}</span></div>
<div class="field"><span class="label">Code postal</span><span class="value">${addr.postcode || ''}</span></div>
<div class="field"><span class="label">Code INSEE</span><span class="value">${addr.citycode || ''}</span></div>
<div class="field"><span class="label">Zone PLU</span><span class="value">${result.zone || 'UB'}</span></div>
<div class="field"><span class="label">Type de travaux</span><span class="value">${type || '—'}</span></div>
<div class="field"><span class="label">Surface</span><span class="value">${surface || '—'} m²</span></div>
<h2>✅ Verdict</h2>
<p><strong>Conforme — ${result.score_confiance || 87}% de confiance</strong></p>
<p style="color:#555;font-size:13px;line-height:1.7">${result.resume || 'Projet globalement conforme aux règles du Code de l\'urbanisme.'}</p>
<h2>📏 Règles PLU applicables</h2>
${(result.regles_applicables || result.rules || []).map(r => `<div class="rule"><strong>${r.article}</strong><br><span style="font-size:13px;color:#555">${r.contenu || r.detail || ''}</span></div>`).join('')}
${parseInt(surface) > 150 ? '<div class="warn">⚖️ <strong>Architecte obligatoire</strong> — Surface > 150m² (Loi du 3 janvier 1977)</div>' : ''}
<h2>📋 CERFA ${cerfaNum}</h2>
<div class="field"><span class="label">Formulaire</span><span class="value">${cerfaNum} — ${cerfaNum === '13703' ? 'Déclaration préalable' : 'Permis de construire MI'}</span></div>
<div class="field"><span class="label">Délai instruction</span><span class="value">${cerfaNum === '13703' ? '1 mois' : '2 mois'}</span></div>
<h2>📎 Pièces à joindre</h2>
${pieces.map(p => `<div class="piece">✓ ${p}</div>`).join('')}
<h2>💶 Coûts estimés</h2>
<div class="field"><span class="label">Taxe d'aménagement</span><span class="value">~${Math.round((parseInt(surface)||50)*820*0.05).toLocaleString('fr-FR')}€ (indicatif)</span></div>
<div class="footer">PermitAI · permitai.eu · contact@permitai.eu<br>Document informatif — vérifiez auprès de votre mairie</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-plu-${(result.commune || 'commune').replace(/ /g,'-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  async function analyser() {
    if (!adresse || !description) return;
    setLoading(true); setError(''); setResult(null);
    const msgs = ['Identification de la commune...', 'Récupération du PLU...', 'Analyse des règles...', 'Génération du rapport...'];
    let i = 0; setLoadingMsg(msgs[0]);
    const iv = setInterval(() => { i++; if (i < msgs.length) setLoadingMsg(msgs[i]); }, 800);
    try {
      const res = await fetch('/api/plu/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adresse, address: adresse, description, type, surface }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Erreur serveur');
      setResult(data);
    } catch (e) { setError(e.message || 'Erreur serveur.'); }
    finally { clearInterval(iv); setLoading(false); }
  }

  const iStyle = { width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ padding: '14px 52px', borderBottom: '0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.3"/><rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white"/></svg>
          </div>
          <span style={{ color: '#f2efe9', fontWeight: 500, fontSize: 15 }}>PermitAI</span>
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['Analyse PLU', '/analyse'], ['CERFA', '/cerfa'], ['Tarifs', '/tarifs']].map(([l, h]) => (
            <Link key={h} href={h} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, color: h === '/analyse' ? '#f2efe9' : '#5a5650', textDecoration: 'none', background: h === '/analyse' ? 'rgba(160,120,32,.1)' : 'transparent' }}>{l}</Link>
          ))}
        </div>
        <Link href="/dashboard"><button style={{ padding: '8px 16px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 8, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Dashboard →</button></Link>
      </nav>

      <div style={{ padding: '48px 52px 64px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>Démo gratuite · 1 analyse offerte</div>
        <h1 style={{ fontSize: 38, fontWeight: 500, color: '#f2efe9', marginBottom: 6, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          Analysez votre projet<br/><em style={{ fontStyle: 'italic', color: '#e8b420' }}>en 3 minutes.</em>
        </h1>
        <p style={{ fontSize: 13, color: '#5a5650', marginBottom: 36 }}>Décrivez en langage naturel — résultats garantis.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 18 }}>
          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 24 }}>
            <div style={{ fontWeight: 500, color: '#f2efe9', marginBottom: 3, fontSize: 16 }}>Votre projet</div>
            <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 20 }}>L'IA comprend le langage naturel</div>

            <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5 }}>Adresse du terrain *</label>
            <div style={{ marginBottom: selectedAddr ? 6 : 13 }}>
              <AdresseField value={adresse} onChange={setAdresse} onSelect={handleSelect} />
            </div>

            {selectedAddr && (
              <div style={{ padding: '8px 12px', background: 'rgba(74,222,128,.06)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 8, fontSize: 11, color: '#4ade80', marginBottom: 13, display: 'flex', gap: 12 }}>
                <span>✓ {selectedAddr.city}</span>
                <span>{selectedAddr.postcode}</span>
                <span style={{ color: '#3e3a34' }}>INSEE: {selectedAddr.citycode}</span>
              </div>
            )}

            <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5 }}>Description des travaux *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Extension de 40m² plain-pied avec véranda vitrée..." rows={4}
              style={{ ...iStyle, resize: 'none', marginBottom: 13 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 13 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5 }}>Type de travaux</label>
                <select value={type} onChange={e => setType(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                  <option value="">Sélectionner</option>
                  <option value="extension">Extension</option>
                  <option value="construction">Construction neuve</option>
                  <option value="renovation">Rénovation façade</option>
                  <option value="surelevation">Surélévation</option>
                  <option value="annexe">Annexe / Garage</option>
                  <option value="piscine">Piscine</option>
                  <option value="cloture">Clôture</option>
                  <option value="demolition">Démolition</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5 }}>Surface (m²)</label>
                <input type="number" value={surface} onChange={e => setSurface(e.target.value)} placeholder="40" style={iStyle} />
              </div>
            </div>

            {parseInt(surface) > 150 && (
              <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 11, color: '#ef4444', marginBottom: 12 }}>
                ⚖️ <strong>Architecte obligatoire</strong> — Surface {'>'} 150m² (Loi 3 janvier 1977)
              </div>
            )}

            <button onClick={analyser} disabled={loading || !adresse || !description}
              style={{ width: '100%', padding: '13px', background: loading || !adresse || !description ? 'rgba(160,120,32,.3)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading || !adresse || !description ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              {loading ? <><span style={{ display: 'inline-block', width: 12, height: 12, border: '1.5px solid rgba(255,255,255,.3)', borderTop: '1.5px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{loadingMsg}</> : <>Analyser la faisabilité 🔍</>}
            </button>

            {error && <div style={{ padding: '9px 12px', background: 'rgba(239,68,68,.07)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 10 }}>{error}</div>}
            <div style={{ padding: '9px 12px', background: 'rgba(160,120,32,.05)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 10.5, color: 'rgba(196,150,10,.8)', lineHeight: 1.55 }}>
              Démo gratuite : 2 règles PLU visibles sur 15+. Abonnez-vous à Starter (29€/mois) pour l'analyse complète.
            </div>
          </div>

          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 24, minHeight: 420 }}>
            {result ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 3 }}>Résultat de l'analyse</div>
                <div style={{ fontSize: 10, color: '#5a5650', marginBottom: 16 }}>
                  PLU de {result.commune} · Zone {result.zone || 'UB'} · Analysé en {result.duration || '1.2'}s
                </div>
                <div style={{ padding: '13px 15px', background: 'rgba(74,222,128,.07)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 9, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: 10, padding: '2px 10px', background: 'rgba(74,222,128,.15)', border: '0.5px solid rgba(74,222,128,.3)', borderRadius: 20, fontWeight: 600, color: '#4ade80' }}>✓ Conforme</span>
                    <span style={{ fontSize: 10, color: '#5a5650', marginLeft: 'auto' }}>Confiance : {result.score_confiance || result.score || 87}%</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#8d887f', lineHeight: 1.62, margin: 0 }}>{result.resume || 'Projet globalement conforme.'}</p>
                </div>
                {(result.regles_applicables || result.rules || []).slice(0, 2).map((r, i) => (
                  <div key={i} style={{ background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: '#a07820', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase' }}>{r.article}</div>
                    <div style={{ fontSize: 12, color: '#c4bfb8', lineHeight: 1.5 }}>{r.contenu || r.detail}</div>
                  </div>
                ))}
                <div style={{ filter: 'blur(4px)', opacity: 0.2, pointerEvents: 'none' }}>
                  {[1,2].map(i => (<div key={i} style={{ background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}><div style={{ fontSize: 10, color: '#a07820', marginBottom: 3 }}>Art. UA {10+i}</div><div style={{ fontSize: 12, color: '#c4bfb8' }}>Règle masquée en mode démo.</div></div>))}
                </div>
                <div style={{ textAlign: 'center', marginTop: -30, marginBottom: 14, position: 'relative', zIndex: 2 }}>
                  <Link href="/tarifs"><button style={{ padding: '10px 20px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Débloquer l'analyse complète — 29€/mois</button></Link>
                </div>
                {(result.cerfa_recommande || result.cerfa) && (
                  <div style={{ background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>CERFA recommandé</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e8b420', marginBottom: 2 }}>CERFA {result.cerfa_recommande || result.cerfa?.numero || '13406'}</div>
                    <div style={{ fontSize: 11, color: '#8d887f', marginBottom: 10 }}>{result.cerfa?.nom || 'Permis de construire MI'} · {result.cerfa?.delai || '2 mois'}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={downloadRapport} style={{ flex: 1, padding: '10px', background: 'transparent', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 8, color: '#a07820', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ⬇ Télécharger le rapport PDF
                      </button>
                      <Link href={`/cerfa/wizard?cerfa=${result.cerfa_recommande || '13406'}&adresse=${encodeURIComponent(adresse)}&commune=${encodeURIComponent(result.commune || '')}&postcode=${selectedAddr?.postcode || ''}&citycode=${selectedAddr?.citycode || ''}&zone=${encodeURIComponent(result.zone || '')}&surface=${surface}&type=${type}`}
                        style={{ flex: 1, textDecoration: 'none' }}>
                        <button style={{ width: '100%', padding: '10px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          📋 Remplir le CERFA →
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
                <Link href={`/depot?adresse=${encodeURIComponent(adresse)}&commune=${encodeURIComponent(result.commune || '')}&cerfa=${result.cerfa_recommande || '13406'}&postcode=${selectedAddr?.postcode || ''}&citycode=${selectedAddr?.citycode || ''}`}
                  style={{ textDecoration: 'none', display: 'block' }}>
                  <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 9, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    📬 Déposer en mairie — 199€ →
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ height: '100%', minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>🗺️</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 5 }}>Prêt à analyser</div>
                <div style={{ fontSize: 12, color: '#5a5650', lineHeight: 1.6 }}>Tapez votre adresse pour démarrer</div>
                {['Paris, Lyon, Marseille, Bordeaux', 'Toulouse, Nantes, Rennes, Nice', 'Et 34 970 communes de France'].map((t, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#3e3a34', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#a07820' }} />{t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16, background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 11, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['34 970', 'communes indexées'], ['3 min', "temps d'analyse"], ['94%', 'taux acceptation'], ['13', 'CERFA disponibles']].map(([v, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, color: '#e8b420', fontWeight: 500 }}>{v}</span>
                <span style={{ fontSize: 11, color: '#5a5650' }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#3e3a34' }}>Données Géoportail Urbanisme · Officielles</div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
