'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Upload, 
  AlertTriangle,
  MapPin,
  Shield,
  Zap,
  Building2,
  Star,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-[#06060e] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#06060e]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-[#E8B420]" />
              <span className="text-2xl font-fraunces font-bold">PermitAI</span>
            </Link>
            
            <div className="hidden md:flex space-x-8 text-sm">
              <Link href="#fonctionnalites" className="hover:text-[#E8B420] transition-colors">Fonctionnalités</Link>
              <Link href="#comment-ca-marche" className="hover:text-[#E8B420] transition-colors">Comment ça marche</Link>
              <Link href="#temoignages" className="hover:text-[#E8B420] transition-colors">Témoignages</Link>
              <Link href="/tarifs" className="hover:text-[#E8B420] transition-colors">Tarifs</Link>
            </div>
            
            <div className="flex space-x-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <button className="bg-[#A07820] hover:bg-[#E8B420] px-6 py-2 rounded-lg transition-all">
                    Tableau de bord
                  </button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="hover:text-[#E8B420] px-6 py-2 transition-colors">
                      Connexion
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-[#A07820] hover:bg-[#E8B420] px-6 py-2 rounded-lg transition-all">
                      Commencer
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-fraunces font-bold mb-6 leading-tight">
            Votre permis de construire.
            <br />
            <span className="text-[#E8B420] italic">Sans les mauvaises surprises.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            PermitAI indexe les <span className="text-[#E8B420] font-semibold">36 000 Plans Locaux d Urbanisme</span> de France, 
            génère vos <span className="text-[#E8B420] font-semibold">CERFA officiels</span> et dépose votre dossier directement en mairie. 
            <br />
            <span className="text-white font-semibold">Résultat en 3 minutes.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/analyse">
              <button className="bg-[#A07820] hover:bg-[#E8B420] text-white text-lg px-12 py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                Analyser mon terrain gratuitement
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <button className="border-2 border-[#A07820] text-[#A07820] hover:bg-[#A07820] hover:text-white text-lg px-12 py-4 rounded-lg transition-all">
              Voir une démo
            </button>
          </div>
          
          {/* Statistics Band */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[
              { value: '500 000', label: 'permis par an en France' },
              { value: '30%', label: 'refusés au premier dépôt' },
              { value: '6 mois', label: 'de retard en moyenne' },
              { value: '36 000', label: 'PLU indexés' },
              { value: '15 000 EUR', label: 'coût max d un refus' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-2xl md:text-3xl font-bold text-[#E8B420] mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Sources Section */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-fraunces font-bold text-center mb-12">
            Sources officielles et partenaires
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Géoportail Urbanisme', desc: 'Données PLU officielles' },
              { name: 'API Adresse', desc: 'Gouvernement français' },
              { name: 'IGN Cadastre', desc: 'Références parcellaires' },
              { name: 'PLAT AU', desc: 'Dépôt numérique mairie' },
              { name: 'La Poste LRAR', desc: 'Dépôt postal certifié' },
              { name: 'Claude by Anthropic', desc: 'Analyse IA' }
            ].map((partner, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
                <div className="text-lg font-semibold mb-2">{partner.name}</div>
                <div className="text-xs text-gray-400">{partner.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-fraunces font-bold text-center mb-16">
            Fonctionnalités
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <MapPin className="w-8 h-8" />,
                title: 'Analyse PLU instantanée sur 36 000 communes',
                desc: 'Vérification automatique de la conformité de votre projet avec le PLU local'
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: '13 CERFA pré-remplis automatiquement',
                desc: 'Tous les formulaires officiels générés en quelques clics'
              },
              {
                icon: <Upload className="w-8 h-8" />,
                title: 'Dépôt numérique en mairie via PLAT AU ou LRAR',
                desc: 'Envoi certifié de votre dossier directement depuis l application'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Notice descriptive et pièces rédigées par IA',
                desc: 'Documents techniques générés automatiquement par intelligence artificielle'
              },
              {
                icon: <AlertTriangle className="w-8 h-8" />,
                title: 'Alertes légales et suivi des délais d instruction',
                desc: 'Notifications automatiques pour ne manquer aucune échéance'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Veille automatique des révisions PLU',
                desc: 'Surveillance continue des modifications réglementaires'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 rounded-lg p-6">
                <div className="text-[#E8B420] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="comment-ca-marche" className="py-20 px-6 bg-white/5">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-fraunces font-bold text-center mb-16">
            Comment ça marche
          </h2>
          <div className="max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Entrez votre adresse et décrivez votre projet', desc: 'Renseignez simplement votre adresse et expliquez vos travaux en langage naturel' },
              { step: '2', title: 'L IA analyse le PLU de votre commune', desc: 'Notre intelligence artificielle examine toutes les règles d urbanisme applicables' },
              { step: '3', title: 'Votre CERFA est pré-rempli automatiquement', desc: 'Le formulaire officiel est généré avec toutes vos informations' },
              { step: '4', title: 'Dépôt en mairie en un clic', desc: 'Envoi sécurisé et certifié de votre dossier complet' },
              { step: '5', title: 'Suivi jusqu à la décision finale', desc: 'Alertes automatiques à chaque étape de l instruction' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 mb-8">
                <div className="flex-shrink-0 w-16 h-16 bg-[#A07820] rounded-full flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="temoignages" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-fraunces font-bold text-center mb-16">
            Témoignages
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Marc D.',
                role: 'Propriétaire à Lyon',
                text: 'PermitAI a détecté que mon extension dépassait de 12cm la hauteur autorisée. Sans cet outil j aurais eu 8 mois de retard et 6 200 euros d honoraires.',
                gain: '8 mois + 6 200 EUR économisés'
              },
              {
                name: 'Sophie L.',
                role: 'Agent immobilier à Bordeaux',
                text: 'Je l utilise avant chaque compromis de vente. J ai sauvé 3 transactions cette année grâce à PermitAI.',
                gain: '3 transactions sauvées'
              },
              {
                name: 'Cabinet Moreau Urbanisme',
                role: 'Paris',
                text: 'PermitAI a divisé notre temps d instruction par 8. Le ROI est immédiat.',
                gain: '340 heures gagnées par an'
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#E8B420] text-[#E8B420]" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">&quot;{testimonial.text}&quot;</p>
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400 mb-3">{testimonial.role}</div>
                  <div className="text-[#E8B420] font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {testimonial.gain}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            {[
              { value: '4 800', label: 'utilisateurs actifs' },
              { value: '94%', label: 'de dossiers acceptés' },
              { value: '4,9★', label: 'sur 5' },
              { value: '3 200 EUR', label: 'd économie moyenne' }
            ].map((metric, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold text-[#E8B420] mb-2">{metric.value}</div>
                <div className="text-sm text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-fraunces font-bold mb-6">
            Analysez votre terrain gratuitement maintenant
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            1 analyse offerte. Aucune carte bancaire.
          </p>
          <Link href="/analyse">
            <button className="bg-[#A07820] hover:bg-[#E8B420] text-white text-lg px-12 py-6 rounded-lg transition-all inline-flex items-center gap-2">
              Commencer l analyse gratuite
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="w-6 h-6 text-[#E8B420]" />
                <span className="text-xl font-fraunces font-bold">PermitAI</span>
              </div>
              <p className="text-sm text-gray-400">
                La référence nationale pour les permis de construire en France.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/analyse" className="hover:text-[#E8B420]">Analyse PLU</Link></li>
                <li><Link href="/cerfa" className="hover:text-[#E8B420]">CERFA</Link></li>
                <li><Link href="/depot" className="hover:text-[#E8B420]">Dépôt mairie</Link></li>
                <li><Link href="/tarifs" className="hover:text-[#E8B420]">Tarifs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/documentation" className="hover:text-[#E8B420]">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-[#E8B420]">API</Link></li>
                <li><Link href="/support" className="hover:text-[#E8B420]">Support</Link></li>
                <li><Link href="/blog" className="hover:text-[#E8B420]">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/mentions-legales" className="hover:text-[#E8B420]">Mentions légales</Link></li>
                <li><Link href="/cgu" className="hover:text-[#E8B420]">CGU</Link></li>
                <li><Link href="/confidentialite" className="hover:text-[#E8B420]">Confidentialité</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 PermitAI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
