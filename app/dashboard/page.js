'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Building2, FileText, Upload, TrendingUp, Bell, Star, ArrowRight } from 'lucide-react';
import texts from '@/lib/texts';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#06060e] flex items-center justify-center">
        <div className="text-[#8a857d]">Chargement...</div>
      </div>
    );
  }

  const stats = [
    { label: texts.dashboard.analysesLeft, value: '8', icon: TrendingUp },
    { label: texts.dashboard.activeDossiers, value: '2', icon: FileText },
    { label: texts.dashboard.alerts, value: '1', icon: Bell },
  ];

  const quickActions = [
    { title: texts.dashboard.newAnalysis, desc: texts.dashboard.newAnalysisDesc, icon: TrendingUp, link: '/analyse', color: 'text-[#e8b420]' },
    { title: texts.dashboard.generateCerfa, desc: texts.dashboard.generateCerfaDesc, icon: FileText, link: '/cerfa', color: 'text-blue-500' },
    { title: texts.dashboard.upgradePlan, desc: texts.dashboard.upgradePlanDesc, icon: Star, link: '/tarifs', color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">{texts.nav.logo}</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[14px] font-medium text-[#f0ede8]">{user?.firstName || 'Utilisateur'}</div>
              <div className="text-[12px] text-[#8a857d]">Plan Starter</div>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="hero-title mb-12">
            Bonjour, <span className="text-[#e8b420] italic">{user?.firstName || 'bienvenue'}</span>
          </h1>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="card-premium">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#3c3830]">{stat.label}</div>
                    <Icon className="w-5 h-5 text-[#8a857d]" />
                  </div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              );
            })}
          </div>

          <div>
            <h2 className="text-[28px] font-fraunces font-medium mb-6">Actions rapides</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} href={action.link}>
                    <div className="card-premium cursor-pointer group hover:border-[#a07820]">
                      <div className={`${action.color} mb-4 transition-transform group-hover:scale-110`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-[16px] font-medium mb-2 text-[#f0ede8]">{action.title}</h3>
                      <p className="text-[13px] text-[#8a857d] mb-6">{action.desc}</p>
                      <div className="flex items-center gap-2 text-[13px] text-[#e8b420] font-medium">
                        Commencer
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="card-premium mt-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-medium mb-2">{texts.dashboard.currentPlan}</h3>
                <p className="text-[14px] text-[#8a857d]">8 analyses restantes ce mois-ci</p>
              </div>
              <Link href="/tarifs">
                <button className="btn-primary flex items-center gap-2">
                  Upgrade
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
