'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Bell, FileText, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import texts from '@/lib/texts.ts';

export default function SuiviPage() {
  const [filter, setFilter] = useState('all');

  const mockDossiers = [
    { id: '001', type: 'PC MI', commune: 'Paris 1er', status: 'en_instruction', date: '2025-03-15', daysLeft: 45 },
    { id: '002', type: 'DP', commune: 'Lyon 3ème', status: 'depose', date: '2025-03-20', daysLeft: 28 },
  ];

  const mockAlertes = [
    { type: 'delai', message: 'Délai de complément expire dans 7 jours', dossier: '001', date: '2025-03-30' },
  ];

  const statusConfig = {
    brouillon: { icon: FileText, color: 'text-[#8a857d]', label: texts.suivi.filters.draft },
    depose: { icon: Clock, color: 'text-blue-500', label: texts.suivi.filters.submitted },
    en_instruction: { icon: AlertCircle, color: 'text-amber-500', label: texts.suivi.filters.inProgress },
    accorde: { icon: CheckCircle2, color: 'text-green-500', label: texts.suivi.filters.approved },
    refuse: { icon: XCircle, color: 'text-red-500', label: texts.suivi.filters.rejected },
  };

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">{texts.nav.logo}</span>
          </Link>
          <Link href="/dashboard">
            <button className="btn-secondary">{texts.nav.dashboard}</button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="hero-title mb-6 text-center">
            {texts.suivi.title} <span className="text-[#e8b420] italic">{texts.suivi.titleHighlight}</span>
          </h1>
          <p className="hero-subtitle text-center mb-12">{texts.suivi.subtitle}</p>

          {mockAlertes.length > 0 && (
            <div className="card-premium mb-8 border-amber-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-amber-500" />
                <h3 className="text-[16px] font-medium">{texts.suivi.alerts}</h3>
              </div>
              {mockAlertes.map((alerte, i) => (
                <div key={i} className="bg-[#14141f] border border-[#272736] rounded-[8px] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[14px] text-[#f0ede8] mb-1">{alerte.message}</div>
                      <div className="text-[12px] text-[#8a857d]">Dossier #{alerte.dossier}</div>
                    </div>
                    <div className="badge-premium">{alerte.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-[8px] text-[13px] transition-all ${
                  filter === key ?
                  'bg-[#a07820] text-white' :
                  'bg-[#14141f] text-[#8a857d] hover:bg-[#1e1e2c]'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mockDossiers.map((dossier) => {
              const StatusIcon = statusConfig[dossier.status].icon;
              const statusColor = statusConfig[dossier.status].color;
              
              return (
                <div key={dossier.id} className="card-premium hover:border-[#a07820]/50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <StatusIcon className={`w-6 h-6 ${statusColor}`} />
                      <div>
                        <div className="text-[16px] font-medium mb-1">Dossier #{dossier.id}</div>
                        <div className="text-[13px] text-[#8a857d]">{dossier.type} - {dossier.commune}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="badge-premium mb-2">{dossier.daysLeft} jours restants</div>
                      <div className="text-[12px] text-[#8a857d]">Déposé le {dossier.date}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {mockDossiers.length === 0 && (
            <div className="card-premium text-center py-12">
              <FileText className="w-12 h-12 text-[#8a857d] mx-auto mb-4" />
              <p className="text-[14px] text-[#8a857d]">Aucun dossier en cours</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
