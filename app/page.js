'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { ArrowRight, MapPin, FileText, Upload, Bell, Shield, TrendingUp, Search, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

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

const STATS = [
  { value: '500 000', label: 'permis / an en France' },
  { value: '30%', label: 'refusés au 1er dépôt' },
  { value: '6 mois', label: 'retard par refus' },
  { value: '36 000', label: 'PLU indexés' },
  { value: '€15 000', label: 'coût max d\'un refus' },
];

const FEATURES = [
  { icon: MapPin,     title: 'Analyse PLU instantanée',     desc: '36 000 communes indexées. L\'IA vérifie chaque règle applicable à votre adresse en 3 minutes avec citations exactes du PLU.' },
  { icon: FileText,   title: '13 CERFA pré-remplis',        desc: 'PC MI, DP MI, CU, DOC, DAACT et 8 autres. Remplissage automatique + référence cadastrale via API IGN officielle.' },
  { icon: Upload,     title: 'Dépôt numérique en mairie',   desc: 'PLAT\'AU pour les 20 000+ mairies raccordées. LRAR La Poste pour les autres. Accusé de réception archivé automatiquement.' },
  { icon: FileText,   title: 'Notice descriptive IA',       desc: 'L\'IA rédige la notice PC1/DP1, le plan de situation et tous les documents obligatoires selon votre projet.' },
  { icon: Bell,       title: 'Alertes délais légaux',       desc: 'Surveillance automatique des délais d\'instruction. Accord tacite si dépassement. Relances automatiques incluses.' },
  { icon: Shield,     title: 'Veille révisions PLU',        desc: 'Détection quotidienne des révisions PLU. Alerte immédiate si les règles de votre commune changent après votre dépôt.' },
];

const TESTIMONIALS = [
  {
    quote: 'PermitAI a détecté que mon extension dépassait de 12cm la hauteur autorisée par le PLU. Sans cet outil j\'aurais eu 8 mois de retard et 6 200€ d\'honoraires d\'architecte.',
    name: 'Marc Dupont',
    role: 'Propriétaire · Lyon 69',
    gain: 'Économie : 8 mois + 6 200€',
    gainColor: '#e8b420',
    initials: 'MD',
    avatarColor: '#e8b420',
  },
  {
    quote: 'Je l\'utilise avant chaque compromis de vente. En 5 minutes je sais exactement si le projet de mon acheteur est réalisable ou non. J\'ai sauvé 3 transactions cette année.',
    name: 'Sophie Laurent',
    role: 'Agent immobilier · Bordeaux 33',
    gain: '3 transactions sauvées',
    gainColor: '#4ade80',
    initials: 'SL',
    avatarColor: '#4ade80',
  },
  {
    quote: 'On gère 40 dossiers de permis par an pour nos clients promoteurs. PermitAI a divisé notre temps d\'instruction par 8. ROI immédiat dès le premier mois.',
    name: 'Cabinet Moreau Urbanisme',
    role: 'Cabinet d\'urbanisme · Paris 75',
    gain: '340h gagnées / an',
    gainColor: '#a07820',
    initials: 'CM',
    avatarColor: '#a07820',
  },
  {
    quote: 'Notre constructeur nous a recommandé PermitAI. Le CERFA était pré-rempli en 30 secondes avec notre référence cadastrale. On a gagné 3 semaines sur le planning.',
    name: 'Pierre et Valérie Bernard',
    role: 'Constructeurs · Nantes 44',
    gain: '3 semaines gagnées',
    gainColor: '#60a5fa',
    initials: 'PB',
    avatarColor: '#60a5fa',
  },
  {
    quote: 'En tant que promoteur, je dois analyser des dizaines de terrains par mois. PermitAI me donne une réponse ferme en 3 minutes. C\'est devenu indispensable.',
    name: 'Thomas Renard',
    role: 'Promoteur immobilier · Paris 75',
    gain: 'Plan Cabinet',
    gainColor: '#c084fc',
    initials: 'TR',
    avatarColor: '#c084fc',
  },
  {
    quote: 'J\'ai failli construire une extension non conforme sans le savoir. PermitAI a identifié le problème en quelques minutes. Ça m\'a évité un contentieux et 18 mois de procédure.',
    name: 'Aurélie Martin',
    role: 'Particulière · Marseille 13',
    gain: 'Contentieux évité',
    gainColor: '#fb923c',
    initials: 'AM',
    avatarColor: '#fb923c',
  },
];

const KPIS = [
  { value: '4 800+', label: 'utilisateurs actifs' },
  { value: '94%',    label: 'taux d\'acceptation' },
  { value: '€3 200', label: 'économie moy. / refus' },
  { value: '4,9/5',  label: 'note moyenne' },
];

const PARTNERS = [
  { 
    name: 'Géoportail Urbanisme', 
    desc: 'PLU officiels · 36 000 communes',
    badge: 'Ministère du Logement',
    logo: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="11" stroke="#a07820" strokeWidth="1.2"/>
        <circle cx="13" cy="13" r="5" stroke="#a07820" strokeWidth="1.2"/>
        <line x1="13" y1="2" x2="13" y2="24" stroke="#a07820" strokeWidth="1"/>
        <line x1="2" y1="13" x2="24" y2="13" stroke="#a07820" strokeWidth="1"/>
      </svg>
    )
  },
  { 
    name: 'API Adresse',
    desc: 'Géocodage · data.gouv.fr',
    badge: 'Gouvernement.fr',
    logo: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 3C9.13 3 6 6.13 6 10c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#a07820" strokeWidth="1.2"/>
        <circle cx="13" cy="10" r="2.5" stroke="#a07820" strokeWidth="1.2"/>
      </svg>
    )
  },
  { 
    name: 'IGN Cadastre',
    desc: 'Références parcellaires',
    badge: 'Institut Géographique National',
    logo: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="3" y="3" width="9" height="9" stroke="#a07820" strokeWidth="1.2"/>
        <rect x="14" y="3" width="9" height="9" stroke="#a07820" strokeWidth="1.2"/>
        <rect x="3" y="14" width="9" height="9" stroke="#a07820" strokeWidth="1.2"/>
        <rect x="14" y="14" width="9" height="9" stroke="#a07820" strokeWidth="1.2"/>
      </svg>
    )
  },
  { 
    name: 'PLAT\'AU National',
    desc: 'Dépôt numérique · 20 000 mairies',
    badge: 'DGALN',
    logo: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M4 18L13 5L22 18H4Z" stroke="#a07820" strokeWidth="1.2"/>
        <path d="M9 18V14H17V18" stroke="#a07820" strokeWidth="1.2"/>
      </svg>
    )
  },
  { 
    name: 'Claude by Anthropic',
    desc: 'Analyse IA · Expert urbanisme',
    badge: 'Anthropic',
    logo: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 3L23 20H3L13 3Z" stroke="#a07820" strokeWidth="1.2"/>
        <path d="M13 10L18 20H8L13 10Z" fill="#a07820" opacity=".3"/>
      </svg>
    )
  },
  { 
    name: 'La Poste LRAR',
    desc: 'Recommandé électronique · Légal',
    badge: 'La Poste Group',
    logo: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="3" y="7" width="20" height="14" rx="2" stroke="#a07820" strokeWidth="1.2"/>
        <path d="M3 9L13 16L23 9" stroke="#a07820" strokeWidth="1.2"/>
      </svg>
    )
  },
];

const TRUSTED_BY = [
  {
    name: 'Bouygues Immobilier',
    logo: (
      <svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="36">
        <rect x="0" y="8" width="20" height="20" rx="2" fill="#8d887f" opacity=".4"/>
        <rect x="4" y="12" width="12" height="12" fill="#8d887f" opacity=".4"/>
        <text x="28" y="23" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="500" fill="#8d887f" opacity=".4">Bouygues</text>
      </svg>
    )
  },
  {
    name: 'Nexity',
    logo: (
      <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="36">
        <path d="M4 28V8L16 22V8" stroke="#8d887f" strokeWidth="2" strokeOpacity=".4" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="24" y="23" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="500" fill="#8d887f" opacity=".4">Nexity</text>
      </svg>
    )
  },
  {
    name: 'Vinci Immobilier',
    logo: (
      <svg viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="36">
        <path d="M4 10L12 26L20 10" stroke="#8d887f" strokeWidth="2" strokeOpacity=".4" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="28" y="23" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="500" fill="#8d887f" opacity=".4">Vinci</text>
      </svg>
    )
  },
  {
    name: 'Eiffage Immobilier',
    logo: (
      <svg viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="110" height="36">
        <path d="M4 10H20M4 18H16M4 26H20" stroke="#8d887f" strokeWidth="2" strokeOpacity=".4" strokeLinecap="round"/>
        <text x="28" y="23" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="500" fill="#8d887f" opacity=".4">Eiffage</text>
      </svg>
    )
  },
  {
    name: 'Primonial REIM',
    logo: (
      <svg viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="110" height="36">
        <circle cx="13" cy="18" r="8" stroke="#8d887f" strokeWidth="1.5" opacity=".4"/>
        <circle cx="13" cy="18" r="3" fill="#8d887f" opacity=".4"/>
        <text x="28" y="23" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="500" fill="#8d887f" opacity=".4">Primonial</text>
      </svg>
    )
  },
  {
    name: 'Logic-Immo Pro',
    logo: (
      <svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="36">
        <path d="M4 26V10L12 18L20 10V26" stroke="#8d887f" strokeWidth="1.5" strokeOpacity=".4" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="28" y="23" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="500" fill="#8d887f" opacity=".4">Logic-Immo</text>
      </svg>
    )
  },
];

const PROCESS = [
  { n: '1', title: 'Entrez votre adresse',     desc: 'Et décrivez votre projet en langage naturel' },
  { n: '2', title: 'Analyse PLU par IA',       desc: 'Toutes les règles applicables à votre commune' },
  { n: '3', title: 'CERFA auto-rempli',         desc: '13 formulaires générés automatiquement' },
  { n: '4', title: 'Dépôt en mairie',           desc: 'PLAT\'AU ou LRAR inclus selon la mairie' },
  { n: '5', title: 'Suivi et alertes',          desc: 'Jusqu\'à la décision finale de la mairie' },
];

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const [demoAddress, setDemoAddress] = useState('');
  const [demoDescription, setDemoDescription] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState(null);
  const [liveCount, setLiveCount] = useState(4847);

  const handleDemoAnalysis = async (e) => {
    e.preventDefault();
    setDemoLoading(true);
    setDemoResult(null);

    try {
      const response = await fetch('/api/plu/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adresse: demoAddress, 
          description: demoDescription 
        }),
      });
      const data = await response.json();
      setDemoResult(data);
    } catch (error) {
      setDemoResult({ 
        error: true, 
        message: 'Erreur lors de l\'analyse. Veuillez réessayer.' 
      });
    } finally {
      setDemoLoading(false);
    }
  };

  // Compteur live : incrémente toutes les 8 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAVIGATION ── */}
      <nav className="nav-premium">
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" className="nav-logo">
            <LogoMark />
            <span className="nav-logo-text">PermitAI</span>
          </Link>
          <div style={{ display: 'flex', gap: 2 }}>
            <Link href="/analyse" className="nav-link">Analyse PLU</Link>
            <Link href="/cerfa" className="nav-link">CERFA</Link>
            <Link href="/#comment-ca-marche" className="nav-link">Comment ça marche</Link>
            <Link href="/tarifs" className="nav-link">Tarifs</Link>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isSignedIn ? (
              <Link href="/dashboard">
                <button className="btn-primary">Dashboard</button>
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Connexion</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary">Essai gratuit</button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 120, paddingBottom: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -80, width: 600, height: 600, background: 'radial-gradient(circle, rgba(160,120,32,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 460px', gap: 56, paddingBottom: 72, alignItems: 'start', position: 'relative', zIndex: 1 }}>
          <div>
            <div className="badge-premium animate-fade-in-up" style={{ marginBottom: 22 }}>
              <div className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#a07820' }} />
              36 000 PLU · Données Géoportail officielles
            </div>
            <h1 className="hero-title animate-fade-in-up animate-delay-1" style={{ marginBottom: 18 }}>
              Votre permis de<br />construire. <em>Sans les<br />mauvaises surprises.</em>
            </h1>
            <p className="hero-subtitle animate-fade-in-up animate-delay-2" style={{ maxWidth: 460, marginBottom: 30 }}>
              PermitAI indexe les 36 000 Plans Locaux d'Urbanisme de France,
              remplit vos CERFA officiels et dépose votre dossier directement
              en mairie. Résultat garanti en 3 minutes.
              <h1>Analysez votre PLU en 3 minutes</h1>
            </p>
            <div style={{ display: 'flex', gap: 9, marginBottom: 26 }} className="animate-fade-in-up animate-delay-3">
              <Link href="/analyse">
                <button className="btn-primary">
                  Analyser mon terrain gratuitement
                  <div className="btn-arrow">→</div>
                </button>
              </Link>
              <button className="btn-secondary">Voir une démo live</button>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Analyse en 3 min', '13 CERFA couverts', 'Dépôt mairie inclus', 'Données officielles'].map(t => (
                <div key={t} className="trust-item">
                  <div className="trust-check">✓</div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* MOCK RESULT CARD */}
          <div>
            <div className="card-premium" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
                <span style={{ fontSize: 9, color: '#3e3a34', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.6px' }}>Analyse PLU · Temps réel</span>
                <span className="badge-green">✓ PLU indexé</span>
              </div>
              <div style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500, marginBottom: 2 }}>47 avenue Victor Hugo, 69003 Lyon</div>
              <div style={{ fontSize: 11, color: '#8d887f', marginBottom: 12 }}>Extension 40m² · Zone UA · PLU Lyon 2024</div>
              <div className="verdict-band">
                <div className="verdict-icon">⚠</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#f2efe9' }}>Conforme sous conditions</div>
                  <div style={{ fontSize: 10, color: '#c4960a' }}>Confiance 91% · 2 conditions · CERFA 13406 recommandé</div>
                </div>
              </div>
              <div className="rule-row"><div className="rule-article">Art. UA 6 — Implantation / voies publiques</div><div className="rule-text">Recul minimum 5m par rapport aux voies — votre projet respecte cette règle ✓</div></div>
              <div className="rule-row"><div className="rule-article">Art. UA 10 — Hauteur maximale</div><div className="rule-text">9m autorisé au faîtage · Extension 3,5m : conforme ✓</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                <div style={{ background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>CERFA 13406*04</div>
                  <div style={{ fontSize: 11, color: '#f2efe9', fontWeight: 500 }}>Pré-rempli · PDF</div>
                  <div style={{ fontSize: 9, color: '#a07820', marginTop: 2 }}>Généré en 12s</div>
                </div>
                <div style={{ background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>Dépôt PLAT'AU</div>
                  <div style={{ fontSize: 11, color: '#f2efe9', fontWeight: 500 }}>Mairie Lyon 3e</div>
                  <div style={{ fontSize: 9, color: '#4ade80', marginTop: 2 }}>Accusé reçu ✓</div>
                </div>
              </div>
            </div>
            {/* COMPARISON MINI */}
            <div style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '13px 16px' }}>
              <div style={{ fontSize: 10, color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Comparaison rapide</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['PermitAI Pro', '3 min', '29€/mois', '#4ade80'], ['Architecte', '3-6 sem.', '800-2000€', '#ef4444'], ['Classique', '4-8 sem.', 'Attente', '#3e3a34']].map(r => (
                  <div key={r[0]} style={{ flex: 1, background: '#131320', border: '0.5px solid #1c1c2a', borderRadius: 7, padding: 9, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#8d887f', marginBottom: 5 }}>{r[0]}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: r[3], marginBottom: 2 }}>{r[1]}</div>
                    <div style={{ fontSize: 9, color: '#3e3a34' }}>{r[2]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div className="stats-band">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: '22px 0', textAlign: 'center', borderRight: i < 4 ? '0.5px solid #1c1c2a' : 'none' }}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPTEUR LIVE ── */}
      <div style={{ background: 'linear-gradient(135deg, #0e0e1a 0%, #06060e 100%)', padding: '32px 52px', borderBottom: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            <div className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 4px rgba(74,222,128,.15)' }} />
            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px' }}>En temps réel</span>
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 600, color: '#e8b420', letterSpacing: '-1.2px', marginBottom: 6 }}>
            {liveCount.toLocaleString('fr-FR')}
          </div>
          <div style={{ fontSize: 14, color: '#8d887f', fontWeight: 400 }}>
            analyses PLU réalisées depuis le lancement
          </div>
        </div>
      </div>

      {/* ── ILS NOUS FONT CONFIANCE ── */}
      <div style={{ background: '#06060e', padding: '40px 52px', borderBottom: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 10, color: '#3e3a34', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500, textAlign: 'center', marginBottom: 20 }}>Ils nous font confiance</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {TRUSTED_BY.map((t, i) => (
              <div key={i} style={{ opacity: 0.5, transition: 'opacity .2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '.8'} onMouseLeave={e => e.currentTarget.style.opacity = '.5'}>
                {t.logo}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DÉMO INTERACTIVE ── */}
      <section style={{ background: 'linear-gradient(180deg, #06060e 0%, #0a0a14 100%)', borderBottom: '0.5px solid #1c1c2a', padding: '80px 52px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 8, textAlign: 'center' }}>Essayez maintenant</div>
          <h2 className="section-title" style={{ marginBottom: 6, textAlign: 'center' }}>Analyse <em>PLU gratuite</em></h2>
          <p style={{ fontSize: 13, color: '#8d887f', marginBottom: 40, fontWeight: 300, textAlign: 'center', maxWidth: 600, margin: '0 auto 40px' }}>
            Testez notre système d'analyse en temps réel. Entrez une adresse, décrivez votre projet, et découvrez instantanément si votre projet est conforme au PLU local.
          </p>

          <div className="card-premium" style={{ padding: 32 }}>
            <form onSubmit={handleDemoAnalysis} style={{ marginBottom: demoResult ? 24 : 0 }}>
              <div style={{ display: 'grid', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#8d887f', marginBottom: 8, fontWeight: 500 }}>
                    Adresse du projet *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#8d887f' }} />
                    <input
                      type="text"
                      value={demoAddress}
                      onChange={(e) => setDemoAddress(e.target.value)}
                      placeholder="Ex: 10 rue de la République, 75001 Paris"
                      className="input-premium"
                      style={{ paddingLeft: 44, width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#8d887f', marginBottom: 8, fontWeight: 500 }}>
                    Description du projet *
                  </label>
                  <textarea
                    value={demoDescription}
                    onChange={(e) => setDemoDescription(e.target.value)}
                    placeholder="Ex: Extension de 25m² sur maison individuelle avec création d'une terrasse"
                    className="input-premium"
                    style={{ height: 100, resize: 'none', width: '100%' }}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={demoLoading}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {demoLoading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Analyser gratuitement
                  </>
                )}
              </button>
            </form>

            {demoResult && !demoResult.error && (
              <div style={{ marginTop: 24, borderTop: '0.5px solid #1c1c2a', paddingTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {demoResult.verdict === 'conforme' ? (
                      <CheckCircle2 style={{ width: 28, height: 28, color: '#4ade80' }} />
                    ) : demoResult.verdict === 'non_conforme' ? (
                      <AlertCircle style={{ width: 28, height: 28, color: '#f87171' }} />
                    ) : (
                      <AlertCircle style={{ width: 28, height: 28, color: '#fbbf24' }} />
                    )}
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: '#f2efe9', textTransform: 'capitalize' }}>
                        {demoResult.verdict?.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: 12, color: '#8d887f' }}>
                        {demoResult.commune}
                      </div>
                    </div>
                  </div>
                  <div className="badge-premium" style={{ fontSize: 11 }}>
                    Confiance {demoResult.score_confiance}%
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#f2efe9', lineHeight: 1.6, marginBottom: 20 }}>
                  {demoResult.resume}
                </p>

                {demoResult.regles_applicables && demoResult.regles_applicables.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: '#8d887f', marginBottom: 12, fontWeight: 500 }}>
                      Règles PLU applicables (aperçu limité)
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {demoResult.regles_applicables.map((regle, i) => (
                        <div key={i} style={{ background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#f2efe9', marginBottom: 6 }}>
                            {regle.article}
                          </div>
                          <div style={{ fontSize: 11, color: '#8d887f', lineHeight: 1.5 }}>
                            {regle.contenu.substring(0, 150)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: 'rgba(160,120,32,0.08)', border: '0.5px solid rgba(160,120,32,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Lock size={16} color="#a07820" />
                    <span style={{ fontSize: 12, color: '#a07820', fontWeight: 500 }}>
                      Analyse partielle - Créez un compte pour voir plus
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: '#8d887f', lineHeight: 1.5 }}>
                    Cette analyse est limitée à 2 règles. Créez un compte gratuit pour débloquer toutes les règles applicables, les conditions spécifiques, les points de vigilance, et le CERFA recommandé.
                  </p>
                </div>

                <Link href="/sign-up">
                  <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Voir l'analyse complète
                    <ArrowRight size={18} />
                  </button>
                </Link>
              </div>
            )}

            {demoResult && demoResult.error && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: '#f87171' }}>
                  {demoResult.message || 'Une erreur est survenue. Veuillez réessayer.'}
                </p>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontSize: 11, color: '#3e3a34' }}>
              ✓ Pas de carte bancaire requise · ✓ Analyse en temps réel · ✓ Données officielles
            </p>
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ── */}
      <section id="fonctionnalites" style={{ background: '#06060e', borderBottom: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Fonctionnalités</div>
          <h2 className="section-title" style={{ marginBottom: 6 }}>Tout le processus. <em>Automatisé.</em></h2>
          <p style={{ fontSize: 13, color: '#8d887f', marginBottom: 32, fontWeight: 300 }}>De l'analyse PLU au dépôt en mairie, PermitAI couvre l'intégralité du parcours urbanisme.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#1c1c2a', border: '0.5px solid #1c1c2a', borderRadius: 14, overflow: 'hidden' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card-premium" style={{ borderRadius: 0, border: 'none', background: '#0a0a14', padding: '26px 22px' }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(160,120,32,.09)', border: '0.5px solid rgba(160,120,32,.18)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={14} color="#a07820" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{f.title}</div>
                  <p style={{ fontSize: 12, color: '#8d887f', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOURCES OFFICIELLES ── */}
      <section style={{ background: '#0a0a14', borderBottom: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Sources officielles et partenaires</div>
          <h2 className="section-title" style={{ marginBottom: 6 }}>Données 100% <em>gouvernementales.</em></h2>
          <p style={{ fontSize: 13, color: '#8d887f', marginBottom: 32, fontWeight: 300 }}>Toutes nos données proviennent de sources gouvernementales certifiées. Aucune donnée tierce, aucun risque juridique.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {PARTNERS.map((p, i) => (
              <div key={i} style={{ background: '#0e0e1a', border: '0.5px solid #1c1c2a', borderRadius: 11, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(160,120,32,.08)', border: '0.5px solid rgba(160,120,32,.15)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {p.logo}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#8d887f', lineHeight: 1.5, marginBottom: 5 }}>{p.desc}</div>
                  <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(74,222,128,.07)', color: '#4ade80', borderRadius: 10, border: '0.5px solid rgba(74,222,128,.18)' }}>{p.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="temoignages" style={{ background: '#06060e', borderBottom: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Témoignages clients</div>
          <h2 className="section-title" style={{ marginBottom: 6 }}>Ils ont évité <em>le pire.</em></h2>
          <p style={{ fontSize: 13, color: '#8d887f', marginBottom: 32, fontWeight: 300 }}>4 800 utilisateurs · 94% de dossiers acceptés · Note 4,9/5</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card-premium" style={i === 0 ? { borderColor: 'rgba(160,120,32,.35)', background: 'linear-gradient(135deg, #0e0e1a, rgba(160,120,32,.03))' } : {}}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {[0,1,2,3,4].map(j => <div key={j} style={{ width: 11, height: 11, background: '#e8b420', borderRadius: 2 }} />)}
                </div>
                <p style={{ fontSize: 12.5, color: '#8d887f', lineHeight: 1.74, marginBottom: 18, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '0.5px solid #1c1c2a' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#181826', border: '0.5px solid #242434', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: t.avatarColor, flexShrink: 0 }}>{t.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#f2efe9' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: '#3e3a34' }}>{t.role}</div>
                  </div>
                  <div style={{ fontSize: 10, padding: '3px 9px', background: `${t.gainColor}14`, color: t.gainColor, borderRadius: 6, fontWeight: 500, whiteSpace: 'nowrap' }}>{t.gain}</div>
                </div>
              </div>
            ))}
          </div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {KPIS.map((k, i) => (
              <div key={i} className="kpi-card" style={{ textAlign: 'center' }}>
                <div className="kpi-value">{k.value}</div>
                <div className="kpi-sub">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment-ca-marche" style={{ background: '#0a0a14', borderBottom: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Comment ça marche</div>
          <h2 className="section-title" style={{ marginBottom: 32 }}>De l'adresse à l'accusé de réception.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, left: 'calc(10% + 4px)', right: 'calc(10% + 4px)', height: 1, background: 'linear-gradient(90deg, #a07820 20%, #1c1c2a 80%)', zIndex: 0 }} />
            {PROCESS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ width: 33, height: 33, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', position: 'relative', zIndex: 1, fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 500, ...(i < 2 ? { background: '#a07820', color: '#fff' } : { background: '#131320', color: '#8d887f', border: '0.5px solid #242434' }) }}>
                  {s.n}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: '#f2efe9', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 10.5, color: '#3e3a34', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: '#06060e', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            Analysez votre terrain<br /><em>gratuitement maintenant.</em>
          </h2>
          <p style={{ fontSize: 14, color: '#8d887f', marginBottom: 28, fontWeight: 300 }}>
            1 analyse offerte. Aucune carte bancaire requise.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/analyse">
              <button className="btn-primary">
                Démarrer gratuitement
                <div className="btn-arrow">→</div>
              </button>
            </Link>
            <Link href="/tarifs">
              <button className="btn-secondary">Voir les tarifs</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid #1c1c2a', padding: '52px', background: '#06060e' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <LogoMark />
              <span className="nav-logo-text">PermitAI</span>
            </div>
            <p style={{ fontSize: 12, color: '#8d887f', lineHeight: 1.7, maxWidth: 240 }}>
              La plateforme de référence pour l'analyse des PLU et la gestion des permis de construire en France.
            </p>
          </div>
          {[
            { title: 'Produit', links: [['Analyse PLU', '/analyse'], ['Formulaires CERFA', '/cerfa'], ['Dépôt en mairie', '/depot'], ['Suivi dossiers', '/suivi'], ['Tarifs', '/tarifs']] },
            { title: 'Ressources', links: [['Documentation', '/docs'], ['Blog urbanisme', '/blog'], ['Support', '/support'], ['API', '/api']] },
            { title: 'Légal', links: [['Mentions légales', '/mentions-legales'], ['CGU', '/cgu'], ['Confidentialité', '/confidentialite'], ['Cookies', '/cookies']] },
          ].map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: '#3e3a34', fontWeight: 500, marginBottom: 14 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} style={{ fontSize: 12.5, color: '#8d887f', transition: 'color .15s' }} onMouseEnter={e => e.currentTarget.style.color = '#f2efe9'} onMouseLeave={e => e.currentTarget.style.color = '#8d887f'}>{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '0.5px solid #1c1c2a', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 11, color: '#3e3a34' }}>© 2025 PermitAI · Tous droits réservés</p>
          <p style={{ fontSize: 11, color: '#3e3a34' }}>Données Géoportail Urbanisme · Officielles · France</p>
          <p style={{ fontSize: 11, color: '#3e3a34' }}>contact@permitai.eu</p>
        </div>
      </footer>
    </div>
  );
}