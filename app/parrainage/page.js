'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Gift, Copy, Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function ParrainagePage() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  
  // Code de parrainage basé sur l'ID utilisateur
  const referralCode = user ? `PERMITAI-${user.id.slice(0, 8).toUpperCase()}` : 'PERMITAI-XXXXXX';
  const referralLink = `https://permitai.eu?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/dashboard">
            <button className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="badge-premium inline-block mb-6">
              <Gift className="w-4 h-4 inline-block mr-2" />
              Programme de parrainage
            </div>
            <h1 className="hero-title mb-6">
              Invitez vos amis,<br />
              <span className="text-[#e8b420] italic">gagnez ensemble</span>
            </h1>
            <p className="hero-subtitle max-w-2xl mx-auto">
              Pour chaque filleul qui s'inscrit avec votre lien, vous gagnez tous les deux 2 analyses PLU gratuites
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-premium text-center">
              <div className="text-[32px] mb-3">🎁</div>
              <div className="text-[16px] font-medium text-[#f0ede8] mb-2">Partagez votre lien</div>
              <div className="text-[13px] text-[#8a857d]">Envoyez votre lien unique à vos amis</div>
            </div>
            <div className="card-premium text-center">
              <div className="text-[32px] mb-3">✨</div>
              <div className="text-[16px] font-medium text-[#f0ede8] mb-2">Ils s'inscrivent</div>
              <div className="text-[13px] text-[#8a857d]">Votre filleul crée son compte gratuit</div>
            </div>
            <div className="card-premium text-center">
              <div className="text-[32px] mb-3">🎉</div>
              <div className="text-[16px] font-medium text-[#f0ede8] mb-2">Vous gagnez tous les deux</div>
              <div className="text-[13px] text-[#8a857d]">2 analyses PLU offertes chacun</div>
            </div>
          </div>

          {user ? (
            <div className="card-premium max-w-2xl mx-auto">
              <h3 className="text-[18px] font-medium text-[#f0ede8] mb-6">Votre lien de parrainage</h3>
              
              <div className="bg-[#0e0e1a] border border-[#1c1c2a] rounded-lg p-4 mb-4 flex items-center justify-between">
                <code className="text-[13px] text-[#e8b420] font-mono">{referralLink}</code>
                <button
                  onClick={handleCopy}
                  className="btn-secondary flex items-center gap-2 ml-4"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>

              <div className="text-[13px] text-[#8a857d] mb-6">
                Code de parrainage : <span className="text-[#e8b420] font-mono">{referralCode}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0e0e1a] border border-[#1c1c2a] rounded-lg p-4 text-center">
                  <div className="text-[24px] font-medium text-[#e8b420] mb-1">0</div>
                  <div className="text-[11px] text-[#8a857d] uppercase tracking-wide">Parrainages</div>
                </div>
                <div className="bg-[#0e0e1a] border border-[#1c1c2a] rounded-lg p-4 text-center">
                  <div className="text-[24px] font-medium text-[#4ade80] mb-1">0</div>
                  <div className="text-[11px] text-[#8a857d] uppercase tracking-wide">Analyses gagnées</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-premium max-w-2xl mx-auto text-center">
              <p className="text-[14px] text-[#8a857d] mb-6">
                Connectez-vous pour accéder à votre lien de parrainage unique
              </p>
              <Link href="/sign-in">
                <button className="btn-primary">Se connecter</button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
