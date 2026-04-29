'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { MapPin, Search, ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import AddressInput from '../../components/AddressInput';
import { analyzeLegalConstraints, PIECES_OBLIGATOIRES, UPSELL_SERVICES } from '../../lib/legalEngine';

function LogoMark() {
  return (
    <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
        <path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.2" />
        <rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white" />
      </svg>
    </div>
  );
}

const VERDICT_CONFIG = {
  conforme: {
    label: 'Conforme',
    icon: <CheckCircle2 size={14} />,
    bg: 'rgba(74,222,128,.07)',
    border: 'rgba(74,222,128,.2)',
    color: '#4ade80',
  },
  non_conforme: {
    label: 'Non conforme',
    icon: <AlertCircle size={14} />,
    bg: 'rgba(239,68,68,.07)',
    border: 'rgba(239,68,68,.2)',
    color: '#ef4444',
  },
  conforme_sous_conditions: {
    label: 'Conforme sous conditions',
    icon: '⚠',
    bg: 'rgba(232,180,32,.07)',
    border: 'rgba(232,180,32,.2)',
    color: '#e8b420',
  },
  incertain: {
    label: 'Incertain',
    icon: '?',
    bg: 'rgba(100,100,100,.07)',
    border: 'rgba(100,100,100,.2)',
    color: '#8d887f',
  },
};

export default function AnalysePageWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#06060e' }} />}>
      <AnalysePage />
    </Suspense>
  );
}

function AnalysePage() {
  const { isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [surface, setSurface] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
    setAddress(val);
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

  // Pre-fill from ?adresse= query param
  useEffect(() => {
    const a = searchParams?.get('adresse');
    if (a) setAddress(a);
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!address || !description) return;
    if (!isSignedIn) {
      setError('Connectez-vous pour lancer une analyse.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const resp = await fetch('/api/plu/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adresse: address, description, is_demo: true }),
      });
      if (!resp.ok) throw new Error('Erreur serveur');
      setResult(await resp.json());
    } catch {
      setError('Adresse introuvable ou erreur serveur. Vérifiez et réessayez.');
    }
    setLoading(false);
  };

  const verdict = result ? (VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.incertain) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav className="nav-premium">
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LogoMark />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: '#f2efe9' }}>PermitAI</span>
          </Link>
          <div style={{ display: 'flex', gap: 2 }}>
            <Link href="/analyse" className="nav-link" style={{ color: '#f2efe9' }}>Analyse PLU</Link>
            <Link href="/cerfa" className="nav-link">CERFA</Link>
            <Link href="/tarifs" className="nav-link">Tarifs</Link>
          </div>
          <Link href="/dashboard">
            <button className="btn-secondary" style={{ fontSize: 12 }}>Dashboard →</button>
          </Link>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ paddingTop: 80, paddingBottom: 64, padding: '80px 52px 64px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 500, marginBottom: 8 }}>
          Démo gratuite · 1 analyse offerte
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 500, color: '#f2efe9', letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>
          Analysez votre projet<br /><em style={{ fontStyle: 'italic', color: '#e8b420' }}>en 3 minutes.</em>
        </h1>
        <p style={{ fontSize: 14, color: '#8d887f', marginBottom: 36, fontWeight: 300 }}>
          Décrivez en langage naturel — pas de jargon, pas de formation requise.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 18 }}>

          {/* FORMULAIRE */}
          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 26 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: '#f2efe9', marginBottom: 3 }}>Votre projet</div>
            <div style={{ fontSize: 11, color: '#3e3a34', marginBottom: 22 }}>L'IA comprend le langage naturel</div>

            <label className="input-label" style={{ display: 'block', fontSize: 10, color: '#8d887f', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5, fontWeight: 500 }}>Adresse du terrain *</label>
            <div style={{ marginBottom: 13 }}>
              <div ref={addrRef} style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2 }}>📍</span>
                <input
                  type="text"
                  value={address}
                  onChange={e => handleAddrChange(e.target.value)}
                  onFocus={() => address.length >= 1 && setAddrOpen(addrSuggestions.length > 0)}
                  placeholder="47 avenue Victor Hugo, 69003 Lyon"
                  autoComplete="off"
                  style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 16px 13px 38px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }}
                />
                {addrOpen && addrSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999, background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.8)' }}>
                    {addrSuggestions.map((s, i) => (
                      <button key={i} type="button"
                        onMouseDown={e => { e.preventDefault(); setAddress(s.label); setAddrOpen(false); setAddrSuggestions([]); }}
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

            <label style={{ display: 'block', fontSize: 10, color: '#8d887f', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5, fontWeight: 500 }}>Description des travaux *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Extension de 40m² plain-pied avec véranda vitrée sur le côté de ma maison..."
              className="input-premium"
              style={{ height: 80, resize: 'none', marginBottom: 13 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 13 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#8d887f', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5, fontWeight: 500 }}>Type de travaux</label>
                <select value={projectType} onChange={e => setProjectType(e.target.value)} className="input-premium" style={{ cursor: 'pointer' }}>
                  <option value="">Sélectionner</option>
                  <option value="extension">Extension</option>
                  <option value="construction">Construction neuve</option>
                  <option value="renovation">Rénovation façade</option>
                  <option value="surélévation">Surélévation</option>
                  <option value="annexe">Annexe / Garage</option>
                  <option value="piscine">Piscine</option>
                  <option value="cloture">Clôture</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#8d887f', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 5, fontWeight: 500 }}>Surface (m²)</label>
                <input value={surface} onChange={e => setSurface(e.target.value)} placeholder="40 m²" className="input-premium" />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !address || !description}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: loading || !address || !description ? 0.45 : 1 }}
            >
              {loading ? 'Analyse en cours...' : 'Analyser la faisabilité'}
              {!loading && <Search size={14} />}
            </button>

            {error && (
              <div style={{ marginTop: 10, padding: '8px 11px', background: 'rgba(239,68,68,.07)', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 7, fontSize: 12, color: '#ef4444' }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: 11, padding: '9px 11px', background: 'rgba(160,120,32,.06)', border: '0.5px solid rgba(160,120,32,.14)', borderRadius: 7, fontSize: 10.5, color: 'rgba(196,150,10,.8)', lineHeight: 1.55 }}>
              Démo gratuite : 2 règles PLU visibles sur 15+. Abonnez-vous à Starter (29€/mois) pour l'analyse complète, les CERFA et le dépôt en mairie.
            </div>
          </div>

          {/* RÉSULTAT */}
          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 24, minHeight: 420 }}>
            {result ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 3 }}>Résultat de l'analyse</div>
                <div style={{ fontSize: 10, color: '#3e3a34', marginBottom: 16 }}>
                  PLU de {result.commune} · Zone {result.zone || 'UA'} · Analysé en {result.duration || '2,4'}s
                  {result.geoportail_url && <> · <a href={result.geoportail_url} target="_blank" rel="noreferrer" style={{ color: '#a07820', textDecoration: 'none' }}>Voir sur Géoportail →</a></>}
                </div>

                {/* VERDICT BLOCK */}
                <div style={{ padding: '13px 15px', background: verdict.bg, border: `0.5px solid ${verdict.border}`, borderRadius: 9, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 11px', background: `${verdict.color}14`, border: `0.5px solid ${verdict.color}30`, borderRadius: 20, fontSize: 10, fontWeight: 600, color: verdict.color }}>
                      {verdict.icon} {verdict.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#3e3a34', marginLeft: 'auto' }}>
                      Confiance : {result.score_confiance || 85}%
                    </div>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#8d887f', lineHeight: 1.62, margin: 0 }}>{result.resume}</p>
                </div>

                {/* RÈGLES VISIBLES */}
                {result.regles_applicables?.slice(0, 3).map((r, i) => (
                  <div key={i} className="rule-row">
                    <div className="rule-article">{r.article}</div>
                    <div className="rule-text">{r.contenu}</div>
                    {r.impact && (
                      <div style={{ fontSize: 9, marginTop: 3, color: r.impact === 'favorable' ? '#4ade80' : r.impact === 'defavorable' ? '#ef4444' : '#8d887f', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.3px' }}>
                        Impact : {r.impact}
                      </div>
                    )}
                  </div>
                ))}

                {/* RÈGLES MASQUÉES */}
                {result.demo_mode && (result.regles_masquees || 0) > 0 && (
                  <>
                    <div style={{ filter: 'blur(4px)', opacity: 0.2, pointerEvents: 'none' }}>
                      {[1, 2].map(j => (
                        <div key={j} className="rule-row">
                          <div className="rule-article">Art. UA {10 + j} — Règle masquée</div>
                          <div className="rule-text">Contenu de la règle masqué en mode démo. Passez à Starter pour voir toutes les règles applicables à votre projet.</div>
                        </div>
                      ))}
                    </div>
                    <div className="upgrade-strip">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 9 }}>
                        <Lock size={12} color="#a07820" />
                        <span style={{ fontSize: 12, color: '#8d887f' }}>+{result.regles_masquees} règles PLU · CERFA 13406 pré-rempli · Dépôt PLAT'AU · Notice descriptive IA</span>
                      </div>
                      <Link href="/tarifs">
                        <button className="btn-primary" style={{ justifyContent: 'center' }}>
                          Débloquer — Starter à 29€/mois
                          <ArrowRight size={13} />
                        </button>
                      </Link>
                    </div>
                  </>
                )}

                {/* CERFA RECOMMANDÉ */}
                {result.cerfa_recommande && (
                  <div style={{ marginTop: 10, padding: '11px 14px', background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 2 }}>CERFA recommandé</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#f2efe9' }}>{result.cerfa_recommande} — Permis de construire MI</div>
                    </div>
                    <Link href={`/cerfa/wizard?cerfa=${encodeURIComponent(result.cerfa_recommande)}&adresse=${encodeURIComponent(address)}&commune=${encodeURIComponent(result.commune || '')}&zone=${encodeURIComponent(result.zone || '')}&surface=${encodeURIComponent(surface || '')}&type=${encodeURIComponent(projectType || '')}`}>
                      <button style={{ padding: '6px 14px', background: 'rgba(160,120,32,.1)', border: '0.5px solid rgba(160,120,32,.25)', borderRadius: 7, fontSize: 11, color: '#c4960a', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                        Remplir le CERFA automatiquement →
                      </button>
                    </Link>
                  </div>
                )}

                {/* CTA Wizard always (even without cerfa_recommande) */}
                {!result.cerfa_recommande && result.commune && (
                  <Link href={`/cerfa/wizard?adresse=${encodeURIComponent(address)}&commune=${encodeURIComponent(result.commune || '')}&zone=${encodeURIComponent(result.zone || '')}&surface=${encodeURIComponent(surface || '')}&type=${encodeURIComponent(projectType || '')}`}>
                    <button style={{ width: '100%', marginTop: 10, padding: '11px 0', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      Remplir le CERFA automatiquement →
                    </button>
                  </Link>
                )}

                {/* === OBLIGATIONS LÉGALES & ALERTES === */}
                {(() => {
                  const legal = analyzeLegalConstraints({
                    surface: parseInt(surface) || 0,
                    type: projectType,
                    commune: result.commune,
                    zone: result.zone,
                    description: description,
                  });
                  return (
                    <>
                      <div style={{ marginTop: 18, marginBottom: 10, fontSize: 11, color: '#8d887f', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>
                        Obligations légales & alertes
                      </div>
                      {legal.alerts.map((alert, i) => {
                        const palette = alert.niveau === 'obligatoire'
                          ? { bg: 'rgba(239,68,68,.06)', border: 'rgba(239,68,68,.2)' }
                          : alert.niveau === 'attention'
                          ? { bg: 'rgba(232,180,32,.06)', border: 'rgba(232,180,32,.2)' }
                          : { bg: 'rgba(96,165,250,.06)', border: 'rgba(96,165,250,.2)' };
                        const upsellSrv = alert.upsell ? UPSELL_SERVICES[alert.upsell.action] : null;
                        return (
                          <div key={i} style={{ padding: '12px 14px', background: palette.bg, border: `0.5px solid ${palette.border}`, borderRadius: 10, marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{alert.icone}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#f2efe9', marginBottom: 3 }}>
                                  {alert.niveau === 'obligatoire' && (
                                    <span style={{ fontSize: 9, background: 'rgba(239,68,68,.15)', color: '#ef4444', padding: '1px 7px', borderRadius: 20, marginRight: 6, fontWeight: 700, letterSpacing: '.3px' }}>OBLIGATOIRE</span>
                                  )}
                                  {alert.titre}
                                </div>
                                <div style={{ fontSize: 11, color: '#8d887f', lineHeight: 1.55 }}>{alert.texte}</div>
                                <div style={{ fontSize: 10, color: '#3e3a34', marginTop: 5 }}>📖 {alert.loi}</div>
                                {alert.upsell && upsellSrv && (
                                  <a href={upsellSrv.action} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7, padding: '5px 11px', background: 'rgba(160,120,32,.1)', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 6, fontSize: 10, color: '#a07820', textDecoration: 'none', fontWeight: 600 }}>
                                    {alert.upsell.label} →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Pièces obligatoires */}
                      {result.cerfa_recommande && PIECES_OBLIGATOIRES[result.cerfa_recommande] && (
                        <div style={{ marginTop: 14, padding: '12px 14px', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#f2efe9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                            📎 Pièces obligatoires — CERFA {result.cerfa_recommande}
                          </div>
                          {PIECES_OBLIGATOIRES[result.cerfa_recommande].map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: i < PIECES_OBLIGATOIRES[result.cerfa_recommande].length - 1 ? '0.5px solid #111118' : 'none' }}>
                              <span style={{ fontSize: 11, color: p.obligatoire ? '#4ade80' : '#e8b420', flexShrink: 0, marginTop: 1 }}>{p.obligatoire ? '✓' : '○'}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11.5, color: '#c4bfb8', fontWeight: 500 }}>{p.code} — {p.nom}</div>
                                {p.description && <div style={{ fontSize: 10, color: '#3e3a34', marginTop: 2 }}>{p.description}</div>}
                              </div>
                              <span style={{ fontSize: 10, color: p.obligatoire ? '#4ade80' : '#e8b420', flexShrink: 0, fontWeight: 500 }}>{p.obligatoire ? 'Obligatoire' : 'Selon cas'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div style={{ height: '100%', minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗺</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 5 }}>Prêt à analyser</div>
                  <div style={{ fontSize: 12, color: '#3e3a34', lineHeight: 1.6 }}>
                    Entrez une adresse et décrivez<br />votre projet pour lancer l'analyse
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {['Paris, Lyon, Marseille, Bordeaux', 'Toulouse, Nantes, Rennes, Nice', 'Et 34 970 communes de France'].map((t, i) => (
                    <div key={i} style={{ fontSize: 10, color: '#3e3a34', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#a07820' }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INFO STRIP */}
        <div style={{ marginTop: 16, background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 11, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['34 970', 'communes indexées'], ['3 min', 'temps d\'analyse'], ['94%', 'taux acceptation'], ['13', 'CERFA disponibles']].map(([v, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: '#e8b420', fontWeight: 500 }}>{v}</span>
                <span style={{ fontSize: 11, color: '#3e3a34' }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#3e3a34' }}>Données Géoportail Urbanisme · Officielles</div>
        </div>
      </div>
    </div>
  );
}