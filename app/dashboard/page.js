'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  Home, FileText, Upload, Bell, Gift, ArrowRight, Plus, ChevronRight,
  CheckCircle2, AlertCircle, XCircle, Clock, FilePlus, Sparkles, Download, Send,
  TrendingUp, Copy, Mail
} from 'lucide-react';

// ====== MOCK DATA (remplacé par DB si dispo) ======
const MOCK_ANALYSES = [
  { id: 1, adresse: '47 av. Victor Hugo, 69003 Lyon', commune: 'Lyon', zone: 'UA', verdict: 'conforme', score: 91, date: '2025-06-12', cerfa: '13406' },
  { id: 2, adresse: '12 rue des Lilas, 33150 Cenon', commune: 'Cenon', zone: 'UB', verdict: 'attention', score: 74, date: '2025-06-10', cerfa: '13703' },
  { id: 3, adresse: '8 place de la Victoire, 33000 Bordeaux', commune: 'Bordeaux', zone: 'UC', verdict: 'conforme', score: 88, date: '2025-06-08', cerfa: '13406' },
  { id: 4, adresse: '23 rue Paradis, 13006 Marseille', commune: 'Marseille', zone: 'UA', verdict: 'refus', score: 42, date: '2025-06-05', cerfa: null },
  { id: 5, adresse: '15 allée des Roses, 31000 Toulouse', commune: 'Toulouse', zone: 'UB', verdict: 'conforme', score: 95, date: '2025-06-02', cerfa: '13703' },
];

const MOCK_CERFA = [
  { id: 1, numero: '13406', nom: 'Permis de construire MI', adresse: '47 av. Victor Hugo, Lyon', date: '2025-06-12', status: 'pret' },
  { id: 2, numero: '13703', nom: 'Déclaration préalable', adresse: '12 rue des Lilas, Cenon', date: '2025-06-10', status: 'pret' },
  { id: 3, numero: '13406', nom: 'Permis de construire MI', adresse: '8 place de la Victoire, Bordeaux', date: '2025-06-08', status: 'brouillon' },
];

const MOCK_DEPOTS = [
  { id: 1, dossier: 'PC-2025-0342', adresse: '47 av. Victor Hugo, Lyon', methode: 'PLAT\'AU', status: 'en_cours', dateDepot: '2025-06-12', delaiRestant: '47 jours' },
  { id: 2, dossier: 'DP-2025-0118', adresse: '12 rue des Lilas, Cenon', methode: 'LRAR', status: 'accepte', dateDepot: '2025-05-10', delaiRestant: 'Accordé le 12/06' },
];

const MOCK_ALERTES = [
  { id: 1, type: 'critique', titre: 'Révision PLU Lyon 3e', message: 'Le PLU de Lyon 3e a été révisé. Vos analyses pourraient être impactées.', date: '2025-06-13' },
  { id: 2, type: 'info', titre: 'Délai instruction à surveiller', message: 'Votre PC-2025-0342 arrive à échéance dans 7 jours.', date: '2025-06-11' },
  { id: 3, type: 'success', titre: 'Permis accordé', message: 'DP-2025-0118 accordé par la mairie de Cenon.', date: '2025-06-09' },
];

const VERDICT_STYLES = {
  conforme: { bg: 'rgba(74,222,128,.1)', color: '#4ade80', label: 'Conforme', icon: CheckCircle2 },
  attention: { bg: 'rgba(232,180,32,.1)', color: '#e8b420', label: 'Attention', icon: AlertCircle },
  refus: { bg: 'rgba(239,68,68,.1)', color: '#ef4444', label: 'Refus probable', icon: XCircle },
};

const SECTION_TITLES = {
  dashboard: { t: 'Tableau de bord', s: 'Vue d\'ensemble de vos projets' },
  analyses: { t: 'Analyses PLU', s: 'Toutes vos analyses urbanisme' },
  cerfa: { t: 'CERFA', s: 'Formulaires générés' },
  depots: { t: 'Dépôts mairie', s: 'Suivi de vos dossiers' },
  alertes: { t: 'Alertes PLU', s: 'Notifications et révisions' },
  parrainage: { t: 'Parrainage', s: '1 mois offert par parrain' },
};

function LogoMark() {
  return (
    <div style={{ width: 30, height: 30, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.2" />
        <rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white" />
      </svg>
    </div>
  );
}

function VerdictBadge({ verdict }) {
  const cfg = VERDICT_STYLES[verdict] || VERDICT_STYLES.conforme;
  const Icon = cfg.icon;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: cfg.bg, fontSize: 11, color: cfg.color, fontWeight: 600 }}>
      <Icon size={12} /> {cfg.label}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [active, setActive] = useState('dashboard');
  const [analysesFilter, setAnalysesFilter] = useState('all');

  if (!isLoaded) {
    return <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8d887f', fontSize: 13 }}>Chargement…</div>;
  }

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analyses', label: 'Analyses PLU', icon: TrendingUp },
    { id: 'cerfa', label: 'CERFA', icon: FileText },
    { id: 'depots', label: 'Dépôts mairie', icon: Upload },
    { id: 'alertes', label: 'Alertes PLU', icon: Bell, badge: MOCK_ALERTES.filter(a => a.type === 'critique').length },
    { id: 'parrainage', label: 'Parrainage', icon: Gift },
  ];

  const filteredAnalyses = analysesFilter === 'all' ? MOCK_ANALYSES : MOCK_ANALYSES.filter(a => a.verdict === analysesFilter);
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const chart = [3, 5, 2, 7, 4, 1, 6];
  const maxBar = Math.max(...chart);

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", display: 'flex' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, background: '#07070f', borderRight: '0.5px solid #151520', position: 'fixed', top: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '20px 22px', borderBottom: '0.5px solid #151520', textDecoration: 'none' }}>
          <LogoMark />
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 500, color: '#f2efe9' }}>PermitAI</span>
        </Link>

        <nav style={{ flex: 1, padding: '14px 12px' }}>
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', marginBottom: 3, borderRadius: 8, background: isActive ? 'rgba(160,120,32,.1)' : 'transparent', border: 'none', cursor: 'pointer', color: isActive ? '#f2efe9' : '#8d887f', fontSize: 13, fontFamily: 'inherit', fontWeight: isActive ? 500 : 400, textAlign: 'left', transition: 'all .15s' }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#0c0c18'; e.currentTarget.style.color = '#f2efe9'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8d887f'; } }}>
                <Icon size={16} color={isActive ? '#e8b420' : '#5a5650'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{ minWidth: 18, height: 18, padding: '0 6px', borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* PLAN ACTUEL */}
        <div style={{ padding: 14, borderTop: '0.5px solid #151520' }}>
          <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4, fontWeight: 600 }}>Plan actuel</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 8 }}>Starter</div>
            <div style={{ height: 4, background: '#1c1c2a', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: '80%', background: 'linear-gradient(90deg, #a07820, #e8b420)' }} />
            </div>
            <div style={{ fontSize: 10, color: '#8d887f', marginBottom: 10 }}>8 / 10 analyses</div>
            <Link href="/tarifs">
              <button style={{ width: '100%', padding: '8px 0', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Sparkles size={11} /> Passer à Pro
              </button>
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#e8b420', fontWeight: 600 }}>
              {(user?.firstName?.[0] || 'U').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: '#f2efe9', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName || 'Utilisateur'}</div>
              <div style={{ fontSize: 9, color: '#5a5650', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.primaryEmailAddress?.emailAddress || 'email@permitai.eu'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>

        {/* TOPBAR */}
        <header style={{ background: '#07070f', borderBottom: '0.5px solid #111118', padding: '20px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: '#f2efe9', marginBottom: 2 }}>{SECTION_TITLES[active].t}</h1>
            <p style={{ fontSize: 12, color: '#5a5650' }}>{SECTION_TITLES[active].s}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/analyse">
              <button style={{ padding: '10px 16px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 8, color: '#f2efe9', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Nouvelle analyse
              </button>
            </Link>
            <Link href="/cerfa/wizard">
              <button style={{ padding: '10px 16px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={14} /> Déposer en mairie
              </button>
            </Link>
          </div>
        </header>

        <div style={{ padding: 36 }}>

          {/* ===== DASHBOARD ===== */}
          {active === 'dashboard' && (
            <>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                {[
                  { label: 'Analyses ce mois', value: '8 / 10', sub: 'Plan Starter', color: '#e8b420' },
                  { label: 'CERFA générés', value: MOCK_CERFA.length, sub: '13406, 13703', color: '#4ade80' },
                  { label: 'Dépôts mairie', value: MOCK_DEPOTS.length, sub: '1 en instruction', color: '#60a5fa' },
                  { label: 'Refus évités', value: '€8 200', sub: '6 mois retard évités', color: '#a07820' },
                ].map((k, i) => (
                  <div key={i} style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
                    <div style={{ fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10, fontWeight: 500 }}>{k.label}</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, color: k.color, marginBottom: 4, lineHeight: 1 }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: '#8d887f' }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* CHART + RECENT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14, marginBottom: 20 }}>
                {/* Graph 7 jours */}
                <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 4 }}>Activité 7 jours</div>
                  <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 22 }}>Analyses lancées</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, marginBottom: 10 }}>
                    {chart.map((v, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                        <div style={{ fontSize: 10, color: '#8d887f' }}>{v}</div>
                        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                          <div style={{ width: '100%', height: `${(v / maxBar) * 100}%`, background: 'linear-gradient(180deg, #e8b420, #a07820)', borderRadius: '4px 4px 0 0', opacity: i === 6 ? 1 : 0.7 }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#5a5650' }}>{days[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent analyses */}
                <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 2 }}>Dernières analyses</div>
                      <div style={{ fontSize: 11, color: '#5a5650' }}>5 dernières</div>
                    </div>
                    <button onClick={() => setActive('analyses')} style={{ background: 'transparent', border: 'none', color: '#a07820', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>Voir tout <ArrowRight size={11} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {MOCK_ANALYSES.slice(0, 4).map(a => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '0.5px solid #111118' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#14141f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🏠</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: '#f2efe9', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.adresse}</div>
                          <div style={{ fontSize: 10, color: '#5a5650' }}>Zone {a.zone} · {a.commune}</div>
                        </div>
                        <VerdictBadge verdict={a.verdict} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CERFA + ALERTES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9' }}>CERFA récents</div>
                    <button onClick={() => setActive('cerfa')} style={{ background: 'transparent', border: 'none', color: '#a07820', fontSize: 11, cursor: 'pointer' }}>Voir tout</button>
                  </div>
                  {MOCK_CERFA.slice(0, 3).map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid #111118' }}>
                      <div style={{ padding: '4px 8px', background: 'rgba(160,120,32,.1)', color: '#e8b420', borderRadius: 5, fontSize: 10, fontWeight: 600 }}>{c.numero}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#f2efe9', marginBottom: 1 }}>{c.nom}</div>
                        <div style={{ fontSize: 10, color: '#5a5650', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.adresse}</div>
                      </div>
                      <Download size={14} color="#5a5650" style={{ cursor: 'pointer' }} />
                    </div>
                  ))}
                </div>

                <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9' }}>Alertes actives</div>
                    <button onClick={() => setActive('alertes')} style={{ background: 'transparent', border: 'none', color: '#a07820', fontSize: 11, cursor: 'pointer' }}>Voir tout</button>
                  </div>
                  {MOCK_ALERTES.slice(0, 3).map(a => {
                    const col = a.type === 'critique' ? '#ef4444' : a.type === 'success' ? '#4ade80' : '#60a5fa';
                    return (
                      <div key={a.id} style={{ padding: '10px 12px', marginBottom: 8, background: '#0a0a14', borderLeft: `3px solid ${col}`, borderRadius: 6 }}>
                        <div style={{ fontSize: 12, color: '#f2efe9', fontWeight: 500, marginBottom: 2 }}>{a.titre}</div>
                        <div style={{ fontSize: 10, color: '#8d887f', lineHeight: 1.5 }}>{a.message}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ===== ANALYSES ===== */}
          {active === 'analyses' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {['all', 'conforme', 'attention', 'refus'].map(f => (
                  <button key={f} onClick={() => setAnalysesFilter(f)}
                    style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, background: analysesFilter === f ? '#a07820' : '#0c0c18', color: analysesFilter === f ? '#fff' : '#8d887f', border: '0.5px solid ' + (analysesFilter === f ? '#a07820' : '#1c1c2a'), cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit' }}>
                    {f === 'all' ? 'Toutes' : f === 'refus' ? 'Refus probable' : f}
                  </button>
                ))}
              </div>
              <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, overflow: 'hidden' }}>
                {filteredAnalyses.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center' }}>
                    <FilePlus size={32} color="#5a5650" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 14, color: '#8d887f', marginBottom: 14 }}>Aucune analyse pour ce filtre</div>
                    <Link href="/analyse"><button style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Lancer une analyse</button></Link>
                  </div>
                ) : filteredAnalyses.map((a, i) => (
                  <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 140px 30px', gap: 14, padding: '14px 22px', borderBottom: i < filteredAnalyses.length - 1 ? '0.5px solid #111118' : 'none', alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#14141f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏠</div>
                    <div>
                      <div style={{ fontSize: 12, color: '#f2efe9', marginBottom: 2 }}>{a.adresse}</div>
                      <div style={{ fontSize: 10, color: '#5a5650' }}>Zone {a.zone} · {a.commune}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#8d887f' }}>Score {a.score}%</div>
                    <div style={{ fontSize: 11, color: '#5a5650' }}>{a.date}</div>
                    <VerdictBadge verdict={a.verdict} />
                    <ChevronRight size={14} color="#5a5650" />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ===== CERFA ===== */}
          {active === 'cerfa' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                <Link href="/cerfa/wizard">
                  <button style={{ padding: '10px 16px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} /> Wizard CERFA
                  </button>
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {MOCK_CERFA.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 60, textAlign: 'center' }}>
                    <FileText size={32} color="#5a5650" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 14, color: '#8d887f' }}>Aucun CERFA généré</div>
                  </div>
                ) : MOCK_CERFA.map(c => (
                  <div key={c.id} style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ padding: '4px 10px', background: 'rgba(160,120,32,.1)', color: '#e8b420', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>CERFA {c.numero}</div>
                      <div style={{ padding: '3px 8px', background: c.status === 'pret' ? 'rgba(74,222,128,.1)' : 'rgba(160,120,32,.1)', color: c.status === 'pret' ? '#4ade80' : '#e8b420', borderRadius: 5, fontSize: 10, fontWeight: 600 }}>{c.status === 'pret' ? 'Prêt' : 'Brouillon'}</div>
                    </div>
                    <div style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500, marginBottom: 6 }}>{c.nom}</div>
                    <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 16 }}>{c.adresse}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, padding: '8px 0', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 6, color: '#f2efe9', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Download size={11} /> PDF
                      </button>
                      <Link href="/cerfa/wizard" style={{ flex: 1 }}>
                        <button style={{ width: '100%', padding: '8px 0', background: '#a07820', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Éditer</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ===== DEPOTS ===== */}
          {active === 'depots' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {MOCK_DEPOTS.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 60, textAlign: 'center' }}>
                  <Upload size={32} color="#5a5650" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 14, color: '#8d887f' }}>Aucun dépôt mairie</div>
                </div>
              ) : MOCK_DEPOTS.map(d => {
                const statusCfg = d.status === 'accepte' ? { c: '#4ade80', l: 'Accordé' } : { c: '#e8b420', l: 'En instruction' };
                return (
                  <div key={d.id} style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 2 }}>Dossier</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', fontFamily: 'monospace' }}>{d.dossier}</div>
                      </div>
                      <div style={{ padding: '4px 12px', background: `${statusCfg.c}1a`, color: statusCfg.c, borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{statusCfg.l}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#8d887f', marginBottom: 16 }}>{d.adresse}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, paddingTop: 14, borderTop: '0.5px solid #111118' }}>
                      <div><div style={{ fontSize: 9, color: '#5a5650', textTransform: 'uppercase', marginBottom: 2 }}>Méthode</div><div style={{ fontSize: 11, color: '#f2efe9' }}>{d.methode}</div></div>
                      <div><div style={{ fontSize: 9, color: '#5a5650', textTransform: 'uppercase', marginBottom: 2 }}>Dépôt</div><div style={{ fontSize: 11, color: '#f2efe9' }}>{d.dateDepot}</div></div>
                      <div><div style={{ fontSize: 9, color: '#5a5650', textTransform: 'uppercase', marginBottom: 2 }}>Délai</div><div style={{ fontSize: 11, color: statusCfg.c, fontWeight: 500 }}>{d.delaiRestant}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== ALERTES ===== */}
          {active === 'alertes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_ALERTES.map(a => {
                const col = a.type === 'critique' ? '#ef4444' : a.type === 'success' ? '#4ade80' : '#60a5fa';
                const Icon = a.type === 'critique' ? AlertCircle : a.type === 'success' ? CheckCircle2 : Bell;
                return (
                  <div key={a.id} style={{ background: '#0c0c18', border: '0.5px solid #151520', borderLeft: `3px solid ${col}`, borderRadius: 8, padding: 18, display: 'flex', gap: 14 }}>
                    <Icon size={20} color={col} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9' }}>{a.titre}</div>
                        <div style={{ fontSize: 11, color: '#5a5650' }}>{a.date}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#8d887f', lineHeight: 1.6 }}>{a.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== PARRAINAGE ===== */}
          {active === 'parrainage' && (
            <div style={{ maxWidth: 720 }}>
              <div style={{ background: 'linear-gradient(135deg, #0c0c18, rgba(160,120,32,.04))', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 14, padding: 30, marginBottom: 20 }}>
                <Gift size={28} color="#e8b420" style={{ marginBottom: 14 }} />
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 500, color: '#f2efe9', marginBottom: 8 }}>Parrainez et gagnez 1 mois offert</h2>
                <p style={{ fontSize: 13, color: '#8d887f', lineHeight: 1.7, marginBottom: 22 }}>Pour chaque ami abonné à PermitAI Pro via votre lien, vous gagnez 1 mois gratuit. Vos parrains bénéficient également de -20 % sur leur premier mois.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
                  {[
                    { v: '0', l: 'Filleuls actifs' },
                    { v: '0', l: 'Mois gagnés' },
                    { v: '0€', l: 'Crédit cumulé' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: '#0a0a14', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: '#e8b420', marginBottom: 4 }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: '#5a5650' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <code style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, color: '#e8b420', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    https://permitai.eu/?ref={user?.id?.slice(-8) || 'ABC12345'}
                  </code>
                  <button onClick={() => navigator.clipboard?.writeText(`https://permitai.eu/?ref=${user?.id?.slice(-8) || 'ABC12345'}`)} style={{ padding: '8px 14px', background: '#a07820', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Copy size={12} /> Copier</button>
                </div>
                <button style={{ width: '100%', padding: '12px 0', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 8, color: '#f2efe9', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Mail size={14} /> Inviter par email
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
