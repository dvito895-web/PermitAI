'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { TrendingUp, FileText, Bell, ArrowRight, Star, AlertCircle, History, Sparkles, Clock } from 'lucide-react';

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

const QUICK_ACTIONS = [
  {
    title: 'Nouvelle analyse PLU',
    desc: 'Vérifiez la conformité d\'un terrain en 3 minutes',
    icon: TrendingUp,
    link: '/analyse',
    color: '#e8b420',
    bg: 'rgba(232,180,32,.08)',
  },
  {
    title: 'Générer un CERFA',
    desc: 'Remplissage automatique de tous vos formulaires',
    icon: FileText,
    link: '/cerfa',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,.08)',
  },
  {
    title: 'Passer à Pro',
    desc: 'Analyses illimitées, 5 utilisateurs, support prioritaire',
    icon: Star,
    link: '/tarifs',
    color: '#a07820',
    bg: 'rgba(160,120,32,.08)',
  },
];

const DOSSIERS = [
  {
    dot: '#1d4ed8',
    addr: '47 av. Victor Hugo, Lyon 69003',
    meta: 'Extension 40m² · Déposé le 12 mars 2025',
    status: 'En instruction',
    statusBg: 'rgba(59,130,246,.12)',
    statusColor: '#60a5fa',
    delay: '8 jours restants',
    delayColor: '#e8b420',
  },
  {
    dot: '#15803d',
    addr: '12 rue des Lilas, Bordeaux 33000',
    meta: 'Permis construire · Déposé le 5 mars 2025',
    status: 'Accordé',
    statusBg: 'rgba(22,163,74,.12)',
    statusColor: '#4ade80',
    delay: 'DOC à envoyer avant travaux',
    delayColor: '#4ade80',
  },
  {
    dot: '#78350f',
    addr: '8 impasse du Moulin, Nice 06000',
    meta: 'Déclaration préalable · Brouillon',
    status: 'Brouillon',
    statusBg: 'rgba(120,53,15,.18)',
    statusColor: '#fb923c',
    delay: 'À compléter',
    delayColor: '#3e3a34',
  },
  {
    dot: '#4c1d95',
    addr: '22 chemin des Pins, Toulouse 31000',
    meta: 'Rénovation façade · Déposé le 1er mars 2025',
    status: 'Pièces requises',
    statusBg: 'rgba(124,58,237,.12)',
    statusColor: '#a78bfa',
    delay: 'Répondre avant le 5 avril',
    delayColor: '#ef4444',
  },
];

const ALERTS = [
  {
    type: 'URGENT · Écheance dans 8 jours',
    msg: 'La mairie de Lyon doit répondre avant le 2 avril 2025 — accord tacite possible si dépassement.',
    date: '2 avr. 2025',
    color: '#ef4444',
    bg: 'rgba(239,68,68,.06)',
    border: 'rgba(239,68,68,.15)',
  },
  {
    type: 'DOC à envoyer',
    msg: 'Dossier Bordeaux accordé. Déclarez l\'ouverture du chantier avant le premier jour de travaux.',
    date: '15 avr. 2025',
    color: '#e8b420',
    bg: 'rgba(232,180,32,.06)',
    border: 'rgba(232,180,32,.15)',
  },
  {
    type: 'PLU révisé',
    msg: 'La commune de Nice a modifié son PLU le 20 mars. Vérifiez l\'impact sur votre dossier en cours.',
    date: '20 mars 2025',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,.06)',
    border: 'rgba(96,165,250,.15)',
  },
];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [analyses, setAnalyses] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchAnalyses();
    }
  }, [activeTab]);

  const fetchAnalyses = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/analyses/history');
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: '#8d887f' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 64, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LogoMark />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: '#f2efe9' }}>PermitAI</span>
          </Link>
          <div style={{ display: 'flex', gap: 2 }}>
            <Link href="/analyse" className="nav-link">Analyse PLU</Link>
            <Link href="/cerfa" className="nav-link">CERFA</Link>
            <Link href="/depot" className="nav-link">Dépôt mairie</Link>
            <Link href="/suivi" className="nav-link">Suivi</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(160,120,32,.08)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 20, color: '#a07820' }}>
              Plan Starter
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#181826', border: '0.5px solid #242434', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#e8b420' }}>
              {user?.firstName?.[0] || 'U'}
            </div>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 52px 64px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, color: '#f2efe9', letterSpacing: '-0.5px', marginBottom: 5 }}>
            Bonjour, <em style={{ fontStyle: 'italic', color: '#e8b420' }}>{user?.firstName || 'bienvenue'}</em>
          </h1>
          <div style={{ fontSize: 13, color: '#8d887f', fontWeight: 300 }}>Voici l'état de vos dossiers et alertes en cours</div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Analyses ce mois', value: '7 / 8', sub: 'Starter · 1 restante' },
            { label: 'Dossiers actifs', value: '3', sub: '2 en instruction' },
            { label: 'Alertes en cours', value: '2', sub: '1 urgente', valueColor: '#ef4444' },
            { label: 'Prochaine échéance', value: '8j', sub: 'Dossier Lyon UA', valueColor: '#e8b420' },
          ].map((k, i) => (
            <div key={i} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ color: k.valueColor || '#e8b420' }}>{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '0.5px solid #1c1c2a', paddingBottom: 0 }}>
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'history', label: 'Historique', icon: History },
            { id: 'assistant', label: 'Assistant CERFA', icon: Sparkles },
            { id: 'alerts', label: 'Alertes', icon: Bell },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                background: activeTab === tab.id ? 'rgba(160,120,32,.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #a07820' : '2px solid transparent',
                color: activeTab === tab.id ? '#e8b420' : '#8d887f',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 500 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT BASED ON TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* ACTIONS RAPIDES */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 12 }}>Actions rapides</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {QUICK_ACTIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <Link key={i} href={a.link}>
                  <div className="card-premium" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: a.bg, border: `0.5px solid ${a.color}20`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={15} color={a.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 3 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: '#8d887f', lineHeight: 1.55 }}>{a.desc}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: a.color, fontWeight: 500, marginTop: 'auto' }}>
                      Commencer <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>

          {/* DOSSIERS */}
          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '0.5px solid #1c1c2a' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9' }}>Dossiers en cours</span>
              <Link href="/suivi" style={{ fontSize: 11, color: '#a07820', textDecoration: 'none' }}>Voir tout →</Link>
            </div>
            {DOSSIERS.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 18px', borderBottom: i < DOSSIERS.length - 1 ? '0.5px solid #0e0e1a' : 'none', cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = '#131320'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.dot, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#f2efe9', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.addr}</div>
                  <div style={{ fontSize: 10, color: '#3e3a34' }}>{d.meta}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: d.statusBg, color: d.statusColor, fontWeight: 500 }}>{d.status}</div>
                  <div style={{ fontSize: 9, color: d.delayColor }}>{d.delay}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: '12px 18px' }}>
              <Link href="/analyse">
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '10px 0' }}>
                  Nouvelle analyse PLU →
                </button>
              </Link>
            </div>
          </div>

          {/* ALERTES */}
          <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '0.5px solid #1c1c2a' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9' }}>Alertes</span>
              <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 500 }}>2 actives</span>
            </div>
            {ALERTS.map((a, i) => (
              <div key={i} style={{ padding: '13px 16px', borderBottom: '0.5px solid #0e0e1a', background: a.bg, borderLeft: `2px solid ${a.color}` }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: a.color, marginBottom: 3 }}>{a.type}</div>
                <div style={{ fontSize: 11, color: '#8d887f', lineHeight: 1.55, marginBottom: 4 }}>{a.msg}</div>
                <div style={{ fontSize: 9, color: '#3e3a34' }}>{a.date}</div>
              </div>
            ))}
            <div style={{ padding: '14px 16px', borderTop: '0.5px solid #1c1c2a' }}>
              <div style={{ fontSize: 12, color: '#a07820', fontWeight: 500, marginBottom: 3 }}>Passer à Pro →</div>
              <div style={{ fontSize: 10, color: '#3e3a34', lineHeight: 1.5 }}>Alertes illimitées, suivi avancé, support prioritaire</div>
            </div>
          </div>
        </div>
          </div>
        )}

        {/* Historique */}
        {activeTab === 'history' && (
          <div>
            <div className="card-premium mb-6">
              <h2 className="text-[18px] font-medium text-[#f0ede8] mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-[#e8b420]" />
                Historique des analyses PLU
              </h2>
              <p className="text-[13px] text-[#8a857d] mb-6">
                Retrouvez toutes vos analyses PLU passées et téléchargez les rapports.
              </p>

              {loadingHistory ? (
                <div className="text-center py-8 text-[#8a857d] text-[13px]">Chargement...</div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-[48px] mb-4">📊</div>
                  <h3 className="text-[18px] font-medium text-[#f0ede8] mb-2">Aucune analyse pour l'instant</h3>
                  <p className="text-[13px] text-[#8a857d] mb-6">
                    Lancez votre première analyse PLU pour voir l'historique apparaître ici.
                  </p>
                  <Link href="/analyse">
                    <button className="btn-primary">Analyser mon terrain</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((analysis, i) => (
                    <div key={i} className="bg-[#0e0e1a] border border-[#1c1c2a] rounded-lg p-4 flex items-center justify-between hover:border-[#a07820] transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="text-[14px] font-medium text-[#f0ede8] mb-1">{analysis.adresse}</div>
                        <div className="text-[11px] text-[#8a857d]">{new Date(analysis.createdAt).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="badge-premium" style={{ background: analysis.verdict === 'Conforme' ? '#4ade8022' : '#e8b42022', color: analysis.verdict === 'Conforme' ? '#4ade80' : '#e8b420' }}>
                          {analysis.verdict || 'Analysé'}
                        </div>
                        <button className="btn-secondary text-[11px] py-1 px-3">Voir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assistant CERFA */}
        {activeTab === 'assistant' && (
          <div>
            <div className="card-premium mb-6 bg-gradient-to-br from-[#14141f] to-[#0a0a14]">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#e8b420] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-[#e8b420]" />
                </div>
                <div>
                  <h2 className="text-[20px] font-medium text-[#f0ede8] mb-2">Assistant CERFA IA</h2>
                  <p className="text-[14px] text-[#8a857d]">
                    L'IA vous guide pas à pas pour remplir le bon formulaire CERFA selon votre projet.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] text-[#8a857d] mb-2">Décrivez votre projet</label>
                  <textarea
                    placeholder="Ex: Extension de 40m² pour une maison individuelle à Lyon"
                    className="input-premium w-full min-h-[100px]"
                  />
                </div>

                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Identifier mon CERFA
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-[#1c1c2a]">
                <div className="text-[13px] font-medium text-[#f0ede8] mb-3">CERFA les plus utilisés :</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { num: '13406', name: 'Permis maison individuelle' },
                    { num: '13409', name: 'Déclaration préalable' },
                    { num: '13703', name: 'Transfert de permis' },
                    { num: '13702', name: 'Modificatif PC' },
                  ].map(cerfa => (
                    <Link key={cerfa.num} href={`/cerfa/${cerfa.num}`}>
                      <div className="bg-[#0e0e1a] border border-[#1c1c2a] rounded-lg p-3 hover:border-[#a07820] transition-colors cursor-pointer">
                        <div className="text-[11px] text-[#8a857d] mb-1">CERFA {cerfa.num}</div>
                        <div className="text-[13px] text-[#f0ede8]">{cerfa.name}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertes Tab */}
        {activeTab === 'alerts' && (
          <div>
            <div className="card-premium">
              <h2 className="text-[18px] font-medium text-[#f0ede8] mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#ef4444]" />
                Toutes les alertes
              </h2>
              
              <div className="space-y-3">
                {ALERTS.map((a, i) => (
                  <div key={i} className="bg-[#0e0e1a] border-l-2 rounded-lg p-4" style={{ borderColor: a.color, background: a.bg }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="badge-premium text-[10px]" style={{ background: `${a.color}22`, color: a.color }}>
                        {a.type}
                      </div>
                      <div className="text-[10px] text-[#8a857d]">{a.date}</div>
                    </div>
                    <p className="text-[13px] text-[#8a857d] leading-relaxed">{a.msg}</p>
                    <button className="mt-3 text-[12px] text-[#e8b420] font-medium">Voir le dossier →</button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[#0e0e1a] border border-[#1c1c2a] rounded-lg">
                <div className="text-[13px] font-medium text-[#f0ede8] mb-2">Configuration des alertes</div>
                <p className="text-[12px] text-[#8a857d] mb-4">
                  Recevez des notifications par email pour ne jamais manquer une échéance importante.
                </p>
                <div className="space-y-2 text-[12px]">
                  <label className="flex items-center gap-2 text-[#8a857d]">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    Alertes délais légaux
                  </label>
                  <label className="flex items-center gap-2 text-[#8a857d]">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    Révisions PLU
                  </label>
                  <label className="flex items-center gap-2 text-[#8a857d]">
                    <input type="checkbox" className="w-4 h-4" />
                    Nouveaux documents requis
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLAN ACTUEL */}
        <div style={{ marginTop: 14, background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 4 }}>Plan actuel : Starter</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['1 analyse restante', '#e8b420'], ['3 CERFA ce mois', '#60a5fa'], ['2 dépôts inclus', '#4ade80']].map(([t, c]) => (
                <div key={t} style={{ fontSize: 11, color: c, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: c }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
          <Link href="/tarifs">
            <button className="btn-primary" style={{ fontSize: 12 }}>
              Passer à Pro — 89€/mois
              <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}