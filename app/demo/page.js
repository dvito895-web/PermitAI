'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Lock, FileText } from 'lucide-react';

const LOADING_STEPS = [
  'Identification commune…',
  'Récupération PLU…',
  'Analyse des règles…',
];

export default function DemoPage() {
  const [adresse, setAdresse] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  // Address autocomplete inline state
  const [addrSuggestions, setAddrSuggestions] = useState([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const addrRef = useRef(null);
  const addrTimer = useRef(null);

  useEffect(() => {
    function closeAddr(e) { if (addrRef.current && !addrRef.current.contains(e.target)) setAddrOpen(false); }
    document.addEventListener('mousedown', closeAddr);
    return () => document.removeEventListener('mousedown', closeAddr);
  }, []);

  function handleAddrChange(val) {
    setAdresse(val);
    clearTimeout(addrTimer.current);
    if (val.length < 1) { setAddrSuggestions([]); setAddrOpen(false); return; }
    addrTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=6&autocomplete=1`);
        const data = await res.json();
        const s = data.features?.map(f => ({ label: f.properties.label, context: f.properties.context })) || [];
        setAddrSuggestions(s);
        setAddrOpen(s.length > 0);
      } catch(e) { setAddrSuggestions([]); }
    }, 200);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adresse) return;
    setLoading(true); setResult(null); setStep(0);

    // Animate loading steps
    const t1 = setTimeout(() => setStep(1), 700);
    const t2 = setTimeout(() => setStep(2), 1400);

    // Try real API call (silent fail → fallback mock)
    let apiResult = null;
    try {
      const r = await fetch('/api/plu/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adresse, description: description || 'Projet de construction' }),
      });
      if (r.ok) apiResult = await r.json();
    } catch {}

    // Wait at least 2s total for UX
    await new Promise(r => setTimeout(r, 2000));
    clearTimeout(t1); clearTimeout(t2);

    setResult(apiResult?.regles_applicables ? {
      zone: apiResult.zone || 'UB — Résidentiel',
      score: apiResult.score_confiance || 87,
      verdict: apiResult.verdict || 'Conforme',
      regles_visibles: (apiResult.regles_applicables || []).slice(0, 2).map(r => ({
        article: r.article || 'Art. R.111',
        label: (r.contenu || r.regle || '').split('.')[0].slice(0, 60),
        value: (r.contenu || r.regle || '').slice(0, 80),
      })),
      cerfa: 'CERFA 13406 — Permis de construire',
    } : {
      zone: 'UB — Résidentiel pavillonnaire',
      score: 87,
      verdict: 'Conforme',
      regles_visibles: [
        { article: 'Art. UB 10', label: 'Hauteur maximale', value: '9 m maximum au faîtage' },
        { article: 'Art. UB 9', label: 'Emprise au sol', value: '40 % maximum de la surface du terrain' },
      ],
      cerfa: 'CERFA 13406 — Permis de construire',
    });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#f2efe9' }}>
            <Building2 size={20} color="#e8b420" />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500 }}>PermitAI</span>
          </Link>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8d887f', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Retour
          </Link>
        </div>
      </nav>

      <section style={{ paddingTop: 60, paddingBottom: 40, padding: '60px 52px 40px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, border: '0.5px solid rgba(74,222,128,.25)', background: 'rgba(74,222,128,.06)', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 500 }}>Sans inscription</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1, marginBottom: 14 }}>
            Démo live —<br /><em style={{ color: '#e8b420' }}>analysez gratuitement</em>
          </h1>
          <p style={{ fontSize: 14, color: '#5a5650', maxWidth: 540, margin: '0 auto' }}>
            Tapez une adresse française, décrivez votre projet, recevez un aperçu d'analyse PLU en 2 secondes. Aucune carte bancaire requise.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 52px 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 16, padding: 30, marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8, fontWeight: 500 }}>Adresse du projet</label>
            <div style={{ marginBottom: 18 }}>
              <div ref={addrRef} style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2 }}>📍</span>
                <input
                  type="text"
                  value={adresse}
                  onChange={e => handleAddrChange(e.target.value)}
                  onFocus={() => adresse.length >= 1 && setAddrOpen(addrSuggestions.length > 0)}
                  placeholder="Tapez une adresse en France…"
                  autoComplete="off"
                  style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 16px 13px 38px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }}
                />
                {addrOpen && addrSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999, background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.8)' }}>
                    {addrSuggestions.map((s, i) => (
                      <button key={i} type="button"
                        onMouseDown={e => { e.preventDefault(); setAdresse(s.label); setAddrOpen(false); setAddrSuggestions([]); }}
                        style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: i < addrSuggestions.length-1 ? '0.5px solid #111118' : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: 12.5, color: '#f2efe9', fontWeight: 500 }}>{s.label}</span>
                        <span style={{ fontSize: 10, color: '#3e3a34', marginTop: 2 }}>{s.context}</span>
                      </button>
                    ))}
                    <div style={{ padding: '5px 14px', fontSize: 10, color: '#1a1a28', borderTop: '0.5px solid #111118' }}>api-adresse.data.gouv.fr · Données officielles</div>
                  </div>
                )}
              </div>
            </div>

            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8, fontWeight: 500 }}>Description du projet (optionnel)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Ex : Extension 30 m² à l'arrière de ma maison"
              style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 16px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', resize: 'none', height: 80, marginBottom: 22 }} />

            <button type="submit" disabled={loading || !adresse}
              style={{ width: '100%', padding: '14px 0', background: loading ? '#1c1c2a' : 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: loading || !adresse ? 'not-allowed' : 'pointer', opacity: !adresse ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading ? (<><Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> {LOADING_STEPS[step]}</>) : 'Analyser gratuitement'}
            </button>
          </form>

          {result && (
            <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 16, padding: 30 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Résultat partiel</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: '#f2efe9' }}>{result.zone}</div>
                </div>
                <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(74,222,128,.1)', border: '0.5px solid rgba(74,222,128,.3)', fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
                  {result.verdict} {result.score}%
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: '#5a5650' }}>Score de conformité</span>
                  <span style={{ color: '#e8b420', fontWeight: 600 }}>{result.score}%</span>
                </div>
                <div style={{ height: 5, background: '#14141f', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${result.score}%`, background: 'linear-gradient(90deg, #a07820, #e8b420)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
                {result.regles_visibles.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: 14, background: '#14141f', borderRadius: 10 }}>
                    <CheckCircle2 size={18} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 2 }}>{r.label || r.article}</div>
                      <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 3 }}>{r.article}</div>
                      <div style={{ fontSize: 12, color: '#4ade80' }}>{r.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CERFA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 10, marginBottom: 18 }}>
                <FileText size={16} color="#a07820" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#8d887f', marginBottom: 2 }}>CERFA recommandé</div>
                  <div style={{ fontSize: 13, color: '#e8b420', fontWeight: 500 }}>{result.cerfa}</div>
                </div>
              </div>

              {/* Locked rules */}
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'grid', gap: 8, filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ padding: 14, background: '#14141f', borderRadius: 10 }}>
                      <div style={{ height: 12, width: '60%', background: '#5a5650', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 10, width: '90%', background: '#5a5650', borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,6,14,.55)', borderRadius: 10 }}>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Lock size={28} color="#e8b420" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: 14, color: '#f2efe9', fontWeight: 500, marginBottom: 4 }}>🔒 Créez un compte pour voir les 12 règles restantes</div>
                    <div style={{ fontSize: 12, color: '#8d887f' }}>Gratuit · sans carte bancaire</div>
                  </div>
                </div>
              </div>

              <Link href="/sign-up" style={{ display: 'block', marginTop: 24 }}>
                <button style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Voir l'analyse complète gratuitement <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
