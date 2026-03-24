'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Building2, FileText, Upload, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#06060e]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060e] text-white">
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-[#E8B420]" />
              <span className="text-2xl font-fraunces font-bold">PermitAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Hello, {user?.firstName}</span>
              <div className="w-8 h-8 rounded-full bg-[#A07820] flex items-center justify-center text-sm font-bold">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-fraunces font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Plan actuel</div>
            <div className="text-2xl font-bold text-[#E8B420]">Free</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Analyses restantes</div>
            <div className="text-2xl font-bold">1</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Dossiers actifs</div>
            <div className="text-2xl font-bold">0</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Alertes en cours</div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/analyse" className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg p-8 transition-all">
            <FileText className="w-12 h-12 text-[#E8B420] mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nouvelle analyse PLU</h3>
            <p className="text-gray-400 text-sm">Analysez la conformite de votre projet</p>
          </Link>
          
          <Link href="/cerfa" className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg p-8 transition-all">
            <Upload className="w-12 h-12 text-[#E8B420] mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generer un CERFA</h3>
            <p className="text-gray-400 text-sm">Remplissez automatiquement vos formulaires</p>
          </Link>
          
          <Link href="/tarifs" className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg p-8 transition-all">
            <TrendingUp className="w-12 h-12 text-[#E8B420] mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upgrade plan</h3>
            <p className="text-gray-400 text-sm">Debloquez toutes les fonctionnalites</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
