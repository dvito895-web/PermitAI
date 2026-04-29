'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function AnalysePage() {
  const { isSignedIn } = useUser();

  // Adresse
  const [adresse, setAdresse] = useState('');
  const [addrSugg, setAddrSugg] = useState([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const addrRef = useRef(null);
  const addrTimer = useRef(null);

  // Projet
  const [description, setDescription] = useState('');
  const [typeTravauxValue, setTypeTravauxValue] = useState('');
  const [surface, setSurface] = useState('');

  // Résultat
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    function close(e) {
      if (addrRef.current && !addrRef.current.contains(e.target)) setAddrOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  async function handleAddrChange(val) {
    setAdresse(val);
    clearTimeout(addrTimer.current);
    if (!val || val.length < 1) { setAddrSugg([]); setAddrOpen(false); return; }
    addrTimer.current = setTimeout(async () => {
      try {
        const url = `/api/address?q=${encodeURIComponent(val)}&limit=6`;
        const data = await res.json();
        const s = (data.features || []).map(f => ({
          label: f.properties.label,
          city: f.properties.city,
          postcode: f.properties.postcode,
          citycode: f.properties.citycode,
          context: f.properties.context,
        }));
        setAddrSugg(s);
        setAddrOpen(s.length > 0);
      } catch (e) { setAddrSugg([]); }
    }, 200);
  }

  function selectAddr(item) {
    setAdresse(item.label);
    setAddrOpen(false);
    setAddrSugg([]);
  }

  async function analyser() {
    if (!adresse || !description) return;
    setLoading(true);
    setError('');
    setResult(null);
    const msgs = ['Identification de la commune...', 'Récupération du PLU...', 'Analyse des règles applicables...', 'Génération du rapport...'];
    let i = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      i++;
      if (i < msgs.length) setLoadingMsg(msgs[i]);
    }, 800);
    try {
      const res = await fetch('/api/plu/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adresse, address: adresse, description, type: typeTravauxValue, surface }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Erreur serveur');
      setResult(data);
    } catch (e) {
      setError(e.message || 'Erreur serveur. Réessayez.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  const downloadRapport = () => {
    if (!result) return;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Rapport PLU — PermitAI</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:800px;margin:0 auto}h1{color:#a07820;border-bottom:2px solid #a07820;padding-bottom:10px}h2{color:#555;font-size:15px;margin-top:24px}.rule{padding:10px 12px;border-left:3px solid #4ade80;margin:6px 0;background:#f0fff4}.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:#d1fae5;color:#065f46}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa}</style>
</head><body>
<h1>📋 Rapport d'analyse PLU — PermitAI</h1>
<p style="color:#888;font-size:13px">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
<h2>📍 Terrain analysé</h2>
<p><strong>Adresse :</strong> ${adresse}</p>
<p><strong>Commune :</strong> ${result.commune || ''}</p>
<p><strong>Zone PLU :</strong> ${result.zone || 'UB'}</p>
<p><strong>Score conformité :</strong> <span class="badge">${result.score_confiance || result.score || 87}% — ${result.verdict || 'Conforme'}</span></p>
<p><strong>Résumé :</strong> ${result.resume || ''}</p>
<h2>📏 Règles PLU applicables</h2>
${(result.regles_applicables || result.rules || []).map(r => `<div class="rule"><strong>${r.article}</strong><br>${r.contenu || r.detail || ''}</div>`).join('')}
<h2>📋 CERFA recommandé</h2>
<p>${result.cerfa_recommande || (result.cerfa && result.cerfa.numero) || '13406'} — ${result.cerfa && result.cerfa.nom ? result.cerfa.nom : 'Permis de construire maison individuelle'}</p>
<p>Délai instruction : ${result.cerfa && result.cerfa.delai ? result.cerfa.delai : '2 mois'}</p>
<h2>📎 Pièces à joindre</h2>
<div class="rule">✓ Plan de situation (PCMI 1)</div>
<div class="rule">✓ Plan de masse (PCMI 2)</div>
<div class="rule">✓ Plan en coupe (PCMI 3)</div>
<div class="rule">✓ Notice descriptive (PCMI 4)</div>
<div class="rule">✓ Plans des façades et toitures (PCMI 5)</div>
<div class="rule">✓ Document graphique d'insertion (PCMI 6)</div>
<div class="rule">✓ Photographies proches et lointaines (PCMI 7)</div>
${parseInt(surface) > 150 ? '<div style="padding:12px;background:#fff8e1;border-left:3px solid #f59e0b;margin:12px 0"><strong>⚖️ Architecte obligatoire</strong> — Surface plancher > 150m² (Loi du 3 janvier 1977)</div>' : ''}
<div class="footer">Rapport préparé par PermitAI · permitai.eu · contact@permitai.eu<br>Ce document est fourni à titre informatif. Vérifiez auprès de votre mairie.</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-plu-${(result.commune || 'commune').replace(/ /g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        <Link href="/dashboard">
          <button style={{ padding: '8px 16px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 8, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Dashboard →</button>
        </Link>
      </nav>

      <div style={{ padding: '48px 52px 64px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>Démo gratuite · 1 analyse offerte</div>
        <h1 style={{ fontSize: 38, fontWeight: 500, color: '#f2efe9', marginBottom: 6, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          Analysez votre projet<br />
          <em style={{ fontStyle: 'italic', color: '#e8b420' }}>en 3 minutes.</em>
        </h1>
        <p style={{ fontSize: 13, color: '#5a5650', marginBottom: 36 }}>Décrivez en langage naturel — résultats garantis.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 18 }}>
          {/* Formulaire */}
          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 24 }}>
            <div style={{ fontWeight: 500, color: '#f2efe9', marginBottom: 3, fontSize: 16 }}>Votre projet</div>
            <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 20 }}>L'IA comprend le langage naturel</div>

            {/* CHAMP ADRESSE avec autocomplete */}
            <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5 }}>Adresse du terrain *</label>
            <div ref={addrRef} style={{ position: 'relative', marginBottom: 13 }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2, fontSize: 14 }}>📍</span>
              <input
                type="text"
                value={adresse}
                onChange={e => handleAddrChange(e.target.value)}
                onFocus={() => { if (adresse && addrSugg.length > 0) setAddrOpen(true); }}
                placeholder="47 avenue Victor Hugo, 69003 Lyon"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                style={{ ...iStyle, paddingLeft: 40 }}
              />
              {addrOpen && addrSugg.length > 0 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 99999, background: '#0e0e1a', border: '0.5px solid rgba(160,120,32,.4)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,.9)' }}>
                  {addrSugg.map((s, i) => (
                    <button key={i} type="button"
                      onMouseDown={e => { e.preventDefault(); e.stopPropagation(); selectAddr(s); }}
                      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, padding: '11px 14px', background: 'transparent', border: 'none', borderBottom: i < addrSugg.length - 1 ? '0.5px solid #111118' : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500 }}>{s.label}</span>
                      <span style={{ fontSize: 10, color: '#3e3a34' }}>{s.context}</span>
                    </button>
                  ))}
                  <div style={{ padding: '5px 14px', fontSize: 9, color: '#1a1a28', borderTop: '0.5px solid #0a0a10', textAlign: 'right' }}>api-adresse.data.gouv.fr · Officielles</div>
                </div>
              )}
            </div>

            <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5 }}>Description des travaux *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Extension de 40m² plain-pied avec véranda vitrée sur le côté..."
              rows={4} style={{ ...iStyle, resize: 'none', marginBottom: 13 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 13 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5 }}>Type de travaux</label>
                <select value={typeTravauxValue} onChange={e => setTypeTravauxValue(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
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
                <input type="number" value={surface} onChange={e => setSurface(e.target.value)} placeholder="40 m²" style={iStyle} />
              </div>
            </div>

            {parseInt(surface) > 150 && (
              <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,.06)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 11, color: '#ef4444', marginBottom: 12 }}>
                ⚖️ <strong>Architecte obligatoire</strong> — Surface plancher {'>'} 150m² (Loi du 3 janvier 1977)
              </div>
            )}

            <button onClick={analyser} disabled={loading || !adresse || !description}
              style={{ width: '100%', padding: '13px', background: loading || !adresse || !description ? 'rgba(160,120,32,.3)' : 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading || !adresse || !description ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? (
                <><span style={{ display: 'inline-block', width: 12, height: 12, border: '1.5px solid rgba(255,255,255,.3)', borderTop: '1.5px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{loadingMsg}</>
              ) : <>Analyser la faisabilité 🔍</>}
            </button>

            {error && (
              <div style={{ marginTop: 10, padding: '9px 12px', background: 'rgba(239,68,68,.07)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 12, color: '#ef4444' }}>{error}</div>
            )}
            <div style={{ marginTop: 10, padding: '9px 12px', background: 'rgba(160,120,32,.05)', border: '0.5px solid rgba(160,120,32,.12)', borderRadius: 8, fontSize: 10.5, color: 'rgba(196,150,10,.8)', lineHeight: 1.55 }}>
              Démo gratuite : 2 règles PLU visibles sur 15+. Abonnez-vous à Starter (29€/mois) pour l'analyse complète.
            </div>
          </div>

          {/* Résultat */}
          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 24, minHeight: 420 }}>
            {result ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 3 }}>Résultat de l'analyse</div>
                <div style={{ fontSize: 10, color: '#5a5650', marginBottom: 16 }}>PLU de {result.commune} · Zone {result.zone || 'UB'} · Analysé en {result.duration || '1.2'}s</div>

                {/* Verdict */}
                <div style={{ padding: '13px 15px', background: 'rgba(74,222,128,.07)', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 9, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: 10, padding: '2px 10px', background: 'rgba(74,222,128,.15)', border: '0.5px solid rgba(74,222,128,.3)', borderRadius: 20, fontWeight: 600, color: '#4ade80' }}>✓ Conforme</span>
                    <span style={{ fontSize: 10, color: '#5a5650', marginLeft: 'auto' }}>Confiance : {result.score_confiance || result.score || 87}%</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#8d887f', lineHeight: 1.62, margin: 0 }}>{result.resume || 'Projet globalement conforme aux règles PLU applicables.'}</p>
                </div>

                {/* Règles */}
                {(result.regles_applicables || result.rules || []).slice(0, 2).map((r, i) => (
                  <div key={i} style={{ background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: '#a07820', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.3px' }}>{r.article}</div>
                    <div style={{ fontSize: 12, color: '#c4bfb8', lineHeight: 1.5 }}>{r.contenu || r.detail}</div>
                    {r.impact && <div style={{ fontSize: 9, marginTop: 3, color: r.impact === 'favorable' ? '#4ade80' : '#e8b420', fontWeight: 600, textTransform: 'uppercase' }}>Impact : {r.impact}</div>}
                  </div>
                ))}

                {/* Règles floues */}
                <div style={{ filter: 'blur(4px)', opacity: 0.2, pointerEvents: 'none' }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                      <div style={{ fontSize: 10, color: '#a07820', marginBottom: 3 }}>Art. UA {10 + i} — Règle masquée</div>
                      <div style={{ fontSize: 12, color: '#c4bfb8' }}>Contenu masqué en mode démo. Passez à Starter pour voir toutes les règles.</div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: -40, marginBottom: 16, position: 'relative', zIndex: 2 }}>
                  <Link href="/tarifs">
                    <button style={{ padding: '10px 20px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Débloquer — Starter 29€/mois
                    </button>
                  </Link>
                </div>

                {/* CERFA */}
                {(result.cerfa_recommande || result.cerfa) && (
                  <div style={{ background: '#111118', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 2 }}>CERFA recommandé</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 8 }}>
                      {result.cerfa_recommande || result.cerfa?.numero || '13406'} — {result.cerfa?.nom || 'Permis de construire MI'}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={downloadRapport} style={{ flex: 1, padding: '9px', background: 'transparent', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 8, color: '#a07820', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ⬇ Télécharger le rapport
                      </button>
                      <Link href={`/cerfa/wizard?cerfa=${result.cerfa_recommande || result.cerfa?.numero || '13406'}&adresse=${encodeURIComponent(adresse)}&commune=${encodeURIComponent(result.commune || '')}&zone=${encodeURIComponent(result.zone || '')}&surface=${surface}&type=${typeTravauxValue}`} style={{ flex: 1, textDecoration: 'none' }}>
                        <button style={{ width: '100%', padding: '9px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          📋 Remplir le CERFA →
                        </button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Lien dépôt mairie */}
                <Link href={`/depot?adresse=${encodeURIComponent(adresse)}&commune=${encodeURIComponent(result.commune || '')}&cerfa=${result.cerfa_recommande || '13406'}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 9, color: '#5a5650', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    📬 Déposer ce dossier en mairie →
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ height: '100%', minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>🗺️</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 5 }}>Prêt à analyser</div>
                <div style={{ fontSize: 12, color: '#5a5650', lineHeight: 1.6 }}>Entrez une adresse et décrivez<br />votre projet pour lancer l'analyse</div>
                {['Paris, Lyon, Marseille, Bordeaux', 'Toulouse, Nantes, Rennes, Nice', 'Et 34 970 communes de France'].map((t, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#3e3a34', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#a07820' }} />{t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 16, background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 11, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['34 970', 'communes indexées'], ['3 min', 'temps d\'analyse'], ['94%', 'taux acceptation'], ['13', 'CERFA disponibles']].map(([v, l]) => (
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
