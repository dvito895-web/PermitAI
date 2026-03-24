'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Check, Building2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function TarifsPage() {
  const { isSignedIn } = useUser();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Gratuit',
      price: billingCycle === 'monthly' ? 0 : 0,
      period: '',
      description: 'Pour decouvrir',
      features: [
        '1 seule analyse PLU',
        '2 regles visibles sur 15+',
        'Resume de 1 phrase',
        'CERFA non disponible',
        'Depot en mairie non disponible',
        'Aucune alerte',
        'Aucun suivi'
      ],
      cta: 'Commencer gratuitement',
      ctaLink: '/sign-up',
      popular: false,
    },
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 29 : 290,
      period: billingCycle === 'monthly' ? '/mois' : '/an',
      description: 'Pour les particuliers',
      features: [
        '8 analyses PLU completes par mois',
        'Toutes les regles visibles',
        '3 CERFA avec PDF officiel (PC MI, DP MI, CU)',
        '2 depots en mairie par mois',
        'Liste des pieces obligatoires',
        'Notice descriptive IA',
        'Alertes delais legaux',
        'Suivi de 3 dossiers max',
        'Support email sous 48h'
      ],
      highlight: '1 refus evite = 30 mois d abonnement',
      cta: 'Choisir Starter',
      ctaLink: '/sign-up',
      popular: false,
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? 89 : 890,
      period: billingCycle === 'monthly' ? '/mois' : '/an',
      description: 'Pour les professionnels',
      features: [
        'Analyses PLU illimitees',
        'Les 13 CERFA illimites avec PDF',
        'Depots illimites via PLAT AU et LRAR',
        '5 utilisateurs inclus',
        'Extension Chrome',
        'Alertes PLU sur communes suivies',
        'Export historique PDF',
        'Suivi illimite de dossiers',
        'Support prioritaire sous 4h'
      ],
      highlight: 'Le plus populaire',
      cta: 'Choisir Pro',
      ctaLink: '/sign-up',
      popular: true,
    },
    {
      name: 'Cabinet',
      price: billingCycle === 'monthly' ? 199 : 1990,
      period: billingCycle === 'monthly' ? '/mois' : '/an',
      description: 'Pour les cabinets',
      features: [
        'Tout Pro inclus',
        'Utilisateurs illimites',
        'Gestion multi-clients',
        'Tableau de bord equipe',
        'Acces API (2000 appels/mois)',
        'Export comptable CSV',
        'Support dedie sous 2h'
      ],
      cta: 'Choisir Cabinet',
      ctaLink: '/sign-up',
      popular: false,
    }
  ];

  return (
    <div className="min-h-screen bg-[#06060e] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-[#E8B420]" />
              <span className="text-2xl font-fraunces font-bold">PermitAI</span>
            </Link>
            <Link href="/">
              <button className="text-sm hover:text-[#E8B420] transition-colors">
                Retour a l accueil
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-fraunces font-bold mb-6">
            Tarifs simples et <span className="text-[#E8B420] italic">transparents</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Choisissez le plan qui correspond a vos besoins
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#A07820] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-[#A07820] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Annuel
              <span className="ml-2 text-xs bg-[#E8B420] text-black px-2 py-1 rounded">2 mois offerts</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white/5 border ${
                  plan.popular ? 'border-[#E8B420]' : 'border-white/10'
                } rounded-lg p-6 hover:bg-white/10 transition-all ${
                  plan.popular ? 'transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#E8B420] text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Le plus populaire
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-fraunces font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-[#E8B420]">{plan.price}</span>
                    {plan.price > 0 && <span className="text-xl text-gray-400">EUR</span>}
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                  
                  {plan.highlight && (
                    <div className="mt-3 text-xs text-[#E8B420] italic">{plan.highlight}</div>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-[#E8B420] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href={plan.ctaLink}>
                  <button
                    className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-[#A07820] hover:bg-[#E8B420] text-white'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-fraunces font-bold text-center mb-12">
            PermitAI vs Methode classique
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Architecte classique</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Prix : 800 a 2000 EUR par analyse</p>
                <p>Delai : 3 a 6 semaines</p>
                <p>Risque d erreur : Moyen</p>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Concurrents</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Prix : 150 EUR/mois</p>
                <p>Sans IA</p>
                <p>Interface complexe</p>
              </div>
            </div>
            
            <div className="bg-[#A07820]/20 border border-[#E8B420] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E8B420]">PermitAI Pro</h3>
              <div className="space-y-2 text-sm">
                <p>Prix : 89 EUR/mois</p>
                <p>Resultat : 3 minutes</p>
                <p>IA de pointe</p>
                <p className="text-[#E8B420] font-semibold">3 200 EUR economises en moyenne</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto text-center text-sm text-gray-400">
          <p>© 2025 PermitAI. Tous droits reserves.</p>
        </div>
      </footer>
    </div>
  );
}
