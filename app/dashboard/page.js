'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { 
  LayoutDashboard, FileText, Upload, Bell, Gift, TrendingUp, 
  ArrowRight, Clock, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSection === 'analyses') {
      fetchAnalyses();
    }
  }, [activeSection]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyses/history');
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#06060e] flex items-center justify-center">
        <div className="text-[13px] text-[#8a857d]">Chargement...</div>
      </div>
    );
  }

  const SIDEBAR_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyses', label: 'Analyses', icon: FileText },
    { id: 'cerfa', label: 'CERFA', icon: FileText },
    { id: 'depots', label: 'Dépôts', icon: Upload },
    { id: 'alertes', label: 'Alertes', icon: Bell },
    { id: 'parrainage', label: 'Parrainage', icon: Gift },
  ];

  const KPIS = [
    { label: 'Analyses ce mois', value: '7 / 8', sub: 'Starter · 1 restante', color: '#e8b420' },
    { label: 'CERFA générés', value: '3', sub: '13406, 13409, 13703', color: '#4ade80' },
    { label: 'Dépôts mairie', value: '2', sub: '1 en cours d\'instruction', color: '#60a5fa' },
    { label: 'Coût refus évités', value: '€8 200', sub: 'Retards évités : 6 mois', color: '#a07820' },
  ];

  return (
    <div className="min-h-screen bg-[#06060e] flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0c0c18] border-r border-[#1c1c2a] fixed h-full">
        <div className="p-6 border-b border-[#1c1c2a]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#a07820] rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                <path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.2" />
                <rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white" />
              </svg>
            </div>
            <span className="text-[16px] font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
        </div>

        <div className="p-4 space-y-1">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-all ${
                activeSection === item.id
                  ? 'bg-[#a07820] bg-opacity-10 text-[#e8b420] font-medium'
                  : 'text-[#8a857d] hover:bg-[#14141f]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 w-64 p-4 border-t border-[#1c1c2a]">
          <div className="bg-[#14141f] rounded-lg p-4">
            <div className="text-[11px] text-[#8a857d] uppercase tracking-wide mb-2">Plan actuel</div>
            <div className="text-[14px] font-medium text-[#f0ede8] mb-1">Starter</div>
            <Link href="/tarifs">
              <button className="text-[12px] text-[#e8b420] hover:underline">Passer à Pro →</button>
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-[32px] font-medium text-[#f0ede8] mb-2">
              Bonjour {user?.firstName || 'Utilisateur'} 👋
            </h1>
            <p className="text-[14px] text-[#8a857d]">
              Gérez vos projets d'urbanisme en temps réel
            </p>
          </div>

          {/* UPSELL BANNER */}
          <div style={{
            background: 'rgba(160,120,32,.08)',
            border: '0.5px solid rgba(160,120,32,.2)',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Sparkles size={20} color="#e8b420" />
              <div>
                <div style={{ fontSize: 13, color: '#f0ede8', fontWeight: 500, marginBottom: 2 }}>
                  8 / 10 analyses utilisées ce mois
                </div>
                <div style={{ fontSize: 11, color: '#8a857d' }}>
                  Passez à Pro pour des analyses illimitées + API + 5 utilisateurs
                </div>
              </div>
            </div>
            <Link href="/tarifs">
              <button style={{
                padding: '10px 20px',
                background: 'linear-gradient(90deg, #a07820, #c4960a)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}>
                Passer à Pro <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* SECTION DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div>
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {KPIS.map((kpi, i) => (
                  <div key={i} className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
                    <div className="text-[12px] text-[#8a857d] mb-2">{kpi.label}</div>
                    <div className="text-[28px] font-medium mb-1" style={{ color: kpi.color }}>
                      {kpi.value}
                    </div>
                    <div className="text-[11px] text-[#8a857d]">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Link href="/analyse">
                  <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6 hover:border-[#a07820] transition-colors cursor-pointer group">
                    <TrendingUp className="w-6 h-6 text-[#e8b420] mb-3" />
                    <h3 className="text-[16px] font-medium text-[#f0ede8] mb-2">Nouvelle analyse PLU</h3>
                    <p className="text-[13px] text-[#8a857d] mb-4">Vérifiez la constructibilité d'un terrain</p>
                    <div className="flex items-center gap-2 text-[#e8b420] text-[13px] font-medium">
                      Lancer
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                <Link href="/cerfa">
                  <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6 hover:border-[#a07820] transition-colors cursor-pointer group">
                    <FileText className="w-6 h-6 text-[#4ade80] mb-3" />
                    <h3 className="text-[16px] font-medium text-[#f0ede8] mb-2">Remplir un CERFA</h3>
                    <p className="text-[13px] text-[#8a857d] mb-4">Générez vos formulaires officiels</p>
                    <div className="flex items-center gap-2 text-[#4ade80] text-[13px] font-medium">
                      Commencer
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                <div className="bg-gradient-to-br from-[#a07820] to-[#c4960a] rounded-lg p-6 cursor-pointer">
                  <Sparkles className="w-6 h-6 text-white mb-3" />
                  <h3 className="text-[16px] font-medium text-white mb-2">Assistant IA</h3>
                  <p className="text-[13px] text-white text-opacity-90 mb-4">Posez vos questions urbanisme</p>
                  <div className="flex items-center gap-2 text-white text-[13px] font-medium">
                    Discuter
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Dernières analyses */}
              <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[18px] font-medium text-[#f0ede8]">Dernières analyses</h2>
                  <button
                    onClick={() => setActiveSection('analyses')}
                    className="text-[13px] text-[#e8b420] hover:underline"
                  >
                    Voir tout →
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { addr: '47 av. Victor Hugo, Lyon 69003', date: 'Il y a 2 jours', status: 'Conforme', color: '#4ade80' },
                    { addr: '12 rue des Lilas, Bordeaux 33000', date: 'Il y a 5 jours', status: 'Sous conditions', color: '#e8b420' },
                  ].map((analysis, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#14141f] rounded-lg">
                      <div className="flex-1">
                        <div className="text-[14px] text-[#f0ede8] mb-1">{analysis.addr}</div>
                        <div className="text-[12px] text-[#8a857d]">{analysis.date}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="px-3 py-1 rounded-full text-[12px] font-medium"
                          style={{ background: `${analysis.color}22`, color: analysis.color }}
                        >
                          {analysis.status}
                        </div>
                        <button className="text-[12px] text-[#e8b420] hover:underline">Voir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION ANALYSES */}
          {activeSection === 'analyses' && (
            <div>
              <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
                <h2 className="text-[20px] font-medium text-[#f0ede8] mb-6">Historique des analyses PLU</h2>
                
                {loading ? (
                  <div className="text-center py-8 text-[#8a857d]">Chargement...</div>
                ) : analyses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-[48px] mb-4">📊</div>
                    <h3 className="text-[18px] font-medium text-[#f0ede8] mb-2">Aucune analyse pour l'instant</h3>
                    <p className="text-[13px] text-[#8a857d] mb-6">
                      Lancez votre première analyse PLU pour voir l'historique apparaître ici.
                    </p>
                    <Link href="/analyse">
                      <button className="px-6 py-3 bg-[#a07820] hover:bg-[#c4960a] text-white rounded-lg text-[14px] font-medium transition-colors">
                        Analyser mon terrain
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyses.map((analysis, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[#14141f] rounded-lg hover:bg-[#1a1a2a] transition-colors">
                        <div className="flex-1">
                          <div className="text-[14px] font-medium text-[#f0ede8] mb-1">{analysis.adresse}</div>
                          <div className="text-[12px] text-[#8a857d]">
                            {new Date(analysis.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="px-3 py-1 rounded-full text-[12px] font-medium"
                            style={{
                              background: analysis.verdict === 'Conforme' ? '#4ade8022' : '#e8b42022',
                              color: analysis.verdict === 'Conforme' ? '#4ade80' : '#e8b420'
                            }}
                          >
                            {analysis.verdict || 'Analysé'}
                          </div>
                          <button className="text-[12px] text-[#e8b420] hover:underline">Voir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AUTRES SECTIONS (placeholder) */}
          {['cerfa', 'depots', 'alertes', 'parrainage'].includes(activeSection) && (
            <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6">
              <h2 className="text-[20px] font-medium text-[#f0ede8] mb-4">
                {SIDEBAR_ITEMS.find(s => s.id === activeSection)?.label}
              </h2>
              <p className="text-[14px] text-[#8a857d]">Section en construction...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
