'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

function LogoMark() {
  return (
    <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
        <path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.2" />
        <rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white" />
      </svg>
    </div>
  );
}

/* ─── PRICING DATA ───────────────────────────────────────
   MENSUEL  : prix + barré (pas de %)
   ANNUEL   : total/an + barré + % réel + equiv mensuelle
───────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    segment: 'Pour découvrir sans engagement',
    monthlyPrice: 0,   monthlyOrig: 0,
    annualTotal: 0,    annualOrig: 0,   annualMonthly: 0,  annualPct: 0,
    bonus: null,
    showSub: false,
    features: ['1 analyse PLU par mois', '2 règles visibles sur 15+', 'Résumé en 1 phrase', 'IA Standard'],
    locked: ['CERFA + PDF officiel', 'Dépôt en mairie', 'Alertes PLU'],
    cta: 'Commencer gratuitement',
    ctaStyle: 'ghost',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    segment: 'Pour les particuliers',
    monthlyPrice: 29,  monthlyOrig: 49,
    annualTotal: 228,  annualOrig: 348,  annualMonthly: 19, annualPct: 34,
    bonus: '1 refus évité = 86 mois d\'abonnement',
    showSub: true,
    features: ['⭐ IA Premium', '8 analyses PLU / mois', 'Toutes les règles PLU applicables', '3 CERFA + PDF officiel', '2 dépôts mairie / mois', 'Notice descriptive IA', 'Alertes délais légaux', 'Suivi 3 dossiers · Support 48h'],
    locked: [],
    cta: 'Choisir Starter',
    ctaStyle: 'outline',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro Immobilier',
    segment: 'Pour les agents et constructeurs',
    monthlyPrice: 89,  monthlyOrig: 129,
    annualTotal: 588,  annualOrig: 1068, annualMonthly: 49, annualPct: 45,
    bonus: '3 analyses / jour · ROI dès le 1er mois',
    showSub: true,
    features: ['⭐ IA Premium', 'Analyses PLU illimitées', 'Les 13 CERFA illimités + PDF', 'Dépôts illimités PLAT\'AU + LRAR', '5 utilisateurs inclus', 'Extension Chrome agents immo', 'Alertes révisions PLU communes', 'Export historique · Support 4h'],
    locked: [],
    cta: 'Choisir Pro',
    ctaStyle: 'primary',
    popular: true,
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    segment: 'Pour les cabinets et promoteurs',
    monthlyPrice: 199, monthlyOrig: 299,
    annualTotal: 1188, annualOrig: 2388, annualMonthly: 99, annualPct: 50,
    bonus: '< 1h facturée à un client · Rentable J+1',
    showSub: true,
    features: ['⭐ IA Premium', 'Tout Pro inclus', 'Utilisateurs illimités', 'Multi-clients & projets', 'API 2 000 req / mois', 'Account manager dédié', 'Export comptable CSV', 'Support dédié < 2h'],
    locked: [],
    cta: 'Nous contacter',
    ctaStyle: 'outline',
    popular: false,
  },
];

const COMPARISON = [
  ['Durée analyse PLU',   '3 minutes',          '3 à 6 semaines',    '4 à 8 semaines'],
  ['Coût vérification',   '29€/mois',           '800 à 2 000€',      'Inclus mais lent'],
  ['CERFA pré-remplis',   'Automatique',        'Manuel',            'Non'],
  ['Dépôt en mairie',     '1 clic PLAT\'AU',    'Déplacement',       'Déplacement'],
  ['Suivi dossier',       'Alertes auto',       'Relances manuelles','Non suivi'],
  ['Révisions PLU',       'Alertes temps réel', 'Non surveillé',     'Non surveillé'],
  ['Disponibilité',       '24h/24 7j/7',        'Heures bureau',     'Heures bureau'],
];

const FAQ_ITEMS = [
  { q: 'Mes données sont-elles sécurisées ?',           a: 'Oui. Toutes les données sont chiffrées en transit et au repos. Hébergement sur infrastructure européenne, conforme RGPD. Vos dossiers sont accessibles uniquement à vous.' },
  { q: 'Puis-je annuler à tout moment ?',               a: 'Oui. Sans engagement, sans frais. Résiliez en 1 clic depuis votre dashboard. Vous conservez l\'accès jusqu\'à la fin de la période payée.' },
  { q: 'Les analyses sont-elles fiables ?',             a: 'PermitAI cite les articles exacts du PLU de votre commune, issus du Géoportail Urbanisme officiel. Outil d\'aide à la décision — ne remplace pas un conseil juridique pour les cas très complexes.' },
  { q: 'Est-ce que ma commune est couverte ?',          a: 'Oui. Les 36 000 communes de France sont indexées. Que vous soyez dans une grande ville, une ville moyenne ou un village, votre PLU est disponible et analysé en temps réel.' },
  { q: 'Quelle différence entre IA Standard et Premium ?', a: 'L\'IA Standard (gratuit) affiche 2 règles et un résumé en 1 phrase. L\'IA Premium (plans payants) cite toutes les règles applicables, génère la notice descriptive et fournit un score de confiance précis.' },
  { q: 'Le dépôt en mairie est-il légal ?',             a: 'Oui. PermitAI utilise PLAT\'AU, la plateforme nationale officielle, et La Poste LRAR pour les mairies non raccordées. L\'accusé de réception a pleine valeur légale.' },
];

const GUARANTEES = [
  { icon: '🔒', title: 'Sans engagement',     sub: 'Résiliez en 1 clic' },
  { icon: '⚡', title: '3 minutes',            sub: 'Résultat garanti' },
  { icon: '🏛', title: 'Données officielles',  sub: 'Géoportail Urbanisme' },
  { icon: '★',  title: '94% accordés',         sub: 'Contre 70% sans outil' },
  { icon: '🗺', title: '36 000',               sub: 'Communes PLU indexées' },
];

function fmt(n) { return n > 999 ? n.toLocaleString('fr-FR') : String(n); }

function CheckIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="7" cy="7" r="6" fill={`${color}14`} stroke={`${color}36`} strokeWidth="1" />
      <path d="M4.5 7l2 2L9.5 5" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="7" cy="7" r="6" fill="rgba(232,180,32,.1)" stroke="rgba(232,180,32,.3)" strokeWidth="1" />
      <path d="M4.5 7l2 2L9.5 5" stroke="#e8b420" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <line x1="4.5" y1="4.5" x2="9.5" y2="9.5" stroke="#1a1a2c" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9.5" y1="4.5" x2="4.5" y2="9.5" stroke="#1a1a2c" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function TarifsPage() {
  const [billing, setBilling] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const isAnnual = billing === 'annual';

  return (
    <div style={{ minHeight: '100vh', background: '#04040c', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(4,4,12,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <LogoMark />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: '#f2efe9' }}>PermitAI</span>
          </Link>
          <Link href="/" style={{ fontSize: 12, color: '#5a5650', textDecoration: 'none' }}>← Retour à l'accueil</Link>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <div style={{ padding: '60px 52px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(160,120,32,.06), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* LIVE DOT */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 20, background: 'rgba(239,68,68,.06)', marginBottom: 26 }}>
            <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,.18)' }} />
            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>30% des dossiers refusés au 1er dépôt en France</span>
          </div>

          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 500, color: '#f2efe9', letterSpacing: -1.4, lineHeight: 1.06, marginBottom: 12 }}>
            Simple, transparent,<br />
            <em style={{ fontStyle: 'italic', color: '#e8b420' }}>sans surprise.</em>
          </h1>
          <p style={{ fontSize: 14, color: '#5a5650', fontWeight: 300, marginBottom: 4 }}>
            Un refus de permis = <strong style={{ color: '#f2efe9', fontWeight: 500 }}>6 mois de retard</strong> et jusqu'à <strong style={{ color: '#f2efe9', fontWeight: 500 }}>15 000€.</strong>
          </p>
          <p style={{ fontSize: 15, color: '#f2efe9', marginBottom: 28 }}>
            PermitAI à 29€/mois — <span style={{ color: '#4ade80', fontWeight: 500 }}>60× moins cher que l'alternative.</span>
          </p>

          {/* TOGGLE */}
          <div style={{ display: 'inline-flex', background: '#0c0c16', border: '0.5px solid #1e1e2c', borderRadius: 10, padding: 3, gap: 2, marginBottom: isAnnual ? 12 : 44 }}>
            <button onClick={() => setBilling('monthly')} style={{ padding: '9px 24px', background: !isAnnual ? '#14141e' : 'transparent', color: !isAnnual ? '#f2efe9' : '#5a5650', borderRadius: 7, fontSize: 12, fontWeight: !isAnnual ? 500 : 400, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Mensuel
            </button>
            <button onClick={() => setBilling('annual')} style={{ padding: '9px 24px', background: isAnnual ? '#14141e' : 'transparent', color: isAnnual ? '#f2efe9' : '#5a5650', borderRadius: 7, fontSize: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: isAnnual ? 500 : 400, fontFamily: "'DM Sans', sans-serif" }}>
              Annuel
              <span style={{ background: '#a07820', color: '#fff', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700, letterSpacing: '.3px' }}>Jusqu'à -50%</span>
            </button>
          </div>
          {isAnnual && (
            <div style={{ fontSize: 11, color: '#3e3a34', marginBottom: 44 }}>
              Starter 19€/mois · Pro 49€/mois · Cabinet 99€/mois — facturés annuellement
            </div>
          )}
        </div>
      </div>

      {/* ── PLANS ── */}
      <div style={{ padding: '0 52px 52px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 1200, margin: '0 auto' }}>
        {PLANS.map((plan) => {
          const price  = isAnnual ? plan.annualTotal    : plan.monthlyPrice;
          const orig   = isAnnual ? plan.annualOrig     : plan.monthlyOrig;
          const equiv  = isAnnual ? plan.annualMonthly  : null;
          const pct    = isAnnual ? plan.annualPct      : 0;
          const isHot  = plan.popular;
          const ckColor = isHot ? '#e8b420' : '#a07820';
          const fcol    = isHot ? '#8d887f' : '#5a5650';

          return (
            <div key={plan.id} style={{
              border: isHot ? '1.5px solid rgba(232,180,32,.3)' : '0.5px solid rgba(255,255,255,.05)',
              borderRadius: 18,
              padding: '26px 22px',
              background: isHot ? '#0c0c1c' : '#080810',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isHot ? '0 0 70px rgba(160,120,32,.07)' : 'none',
            }}>
              {/* TOP LINE PRO */}
              {isHot && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #a07820, #e8b420)' }} />}

              {/* BADGE */}
              {isHot && (
                <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', background: '#a07820', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 14px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '.5px' }}>
                  ⭐ Le plus populaire
                </div>
              )}

              {/* NOM + SEGMENT */}
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 500, color: '#f2efe9', letterSpacing: -.2, marginBottom: 3, marginTop: isHot ? 18 : 0 }}>{plan.name}</div>
              <div style={{ fontSize: 11, color: '#3e3a34', marginBottom: 18 }}>{plan.segment}</div>

              {/* PRIX */}
              {plan.id === 'free' ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 48, color: '#f2efe9', fontWeight: 500, letterSpacing: -1.4, lineHeight: 1, marginBottom: 3 }}>0€</div>
                  <div style={{ fontSize: 11, color: '#3e3a34' }}>Pour découvrir sans engagement</div>
                </div>
              ) : !isAnnual ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 48, color: '#e8b420', fontWeight: 500, letterSpacing: -1.4, lineHeight: 1 }}>{price}€</span>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: '#252535', textDecoration: 'line-through', fontWeight: 400 }}>{orig}€</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#5a5650' }}>/mois · sans engagement</div>
                </div>
              ) : (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 48, color: '#e8b420', fontWeight: 500, letterSpacing: -1.4, lineHeight: 1 }}>{fmt(price)}€</span>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: '#252535', textDecoration: 'line-through', fontWeight: 400 }}>{fmt(orig)}€</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#5a5650' }}>/an · soit <span style={{ color: '#4ade80', fontWeight: 500 }}>{equiv}€/mois</span></div>
                    </div>
                    <div style={{ background: 'rgba(232,180,32,.12)', border: '0.5px solid rgba(232,180,32,.28)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#e8b420', fontWeight: 700, marginTop: 5, flexShrink: 0 }}>-{pct}%</div>
                  </div>
                </div>
              )}

              {/* BONUS */}
              {plan.bonus && (
                isAnnual ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: 'linear-gradient(90deg, rgba(74,222,128,.09), rgba(74,222,128,.04))', border: '0.5px solid rgba(74,222,128,.22)', borderRadius: 9, marginBottom: 16 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="7" cy="7" r="6" fill="rgba(74,222,128,.15)" stroke="rgba(74,222,128,.32)" strokeWidth="1" />
                      <path d="M4.5 7l2 2L9.5 5" stroke="#4ade80" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 500 }}>{plan.bonus}</span>
                  </div>
                ) : (
                  <div style={{ padding: '7px 12px', borderLeft: `2px solid ${isHot ? 'rgba(232,180,32,.45)' : 'rgba(160,120,32,.35)'}`, background: isHot ? 'rgba(232,180,32,.04)' : 'rgba(160,120,32,.03)', borderRadius: '0 7px 7px 0', fontSize: 11, color: isHot ? '#c4960a' : '#a07820', fontStyle: 'italic', marginBottom: 16 }}>
                    {plan.bonus}
                  </div>
                )
              )}
              {!plan.bonus && <div style={{ height: 14 }} />}

              {/* SÉPARATEUR */}
              <div style={{ height: '0.5px', background: isHot ? 'rgba(232,180,32,.12)' : '#1a1a24', marginBottom: 14 }} />

              {/* FEATURES */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map((f, j) => {
                  const isIA = f.startsWith('⭐');
                  return (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: plan.id === 'free' ? '#5a5650' : isIA ? '#e8b420' : fcol, fontWeight: isIA ? 600 : 400, lineHeight: 1.45 }}>
                      {isIA ? <StarCheckIcon /> : <CheckIcon color={plan.id === 'free' ? '#3a3a4a' : ckColor} />}
                      <span>{isIA ? 'IA Premium' : f}</span>
                    </div>
                  );
                })}
                {plan.locked.length > 0 && (
                  <>
                    <div style={{ height: '0.5px', background: '#1a1a24', margin: '4px 0' }} />
                    {plan.locked.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1a1a2c' }}>
                        <CrossIcon /><span>{f}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* CTA */}
              <button style={{
                width: '100%', marginTop: 20,
                padding: isHot ? '14px 0' : '12px 0',
                background: plan.ctaStyle === 'primary' ? 'linear-gradient(90deg, #a07820, #c4960a)' : 'transparent',
                border: plan.ctaStyle === 'primary' ? 'none' : `0.5px solid ${plan.id === 'free' ? '#1c1c2a' : 'rgba(160,120,32,.3)'}`,
                borderRadius: 10,
                color: plan.ctaStyle === 'primary' ? '#fff' : plan.id === 'free' ? '#3e3a34' : '#c4960a',
                fontSize: isHot ? 13 : 12,
                fontWeight: isHot ? 600 : 500,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}>
                {plan.cta}
              </button>
              {plan.showSub && (
                <div style={{ textAlign: 'center', marginTop: 7, fontSize: 10, color: '#3e3a34' }}>
                  Sans engagement · Résiliation en 1 clic
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── GARANTIES ── */}
      <div style={{ padding: '0 52px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 13, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', overflow: 'hidden' }}>
          {GUARANTEES.map((g, i) => (
            <div key={i} style={{ padding: 16, borderRight: i < 4 ? '0.5px solid #1c1c2a' : 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ fontSize: 17, flexShrink: 0 }}>{g.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#f2efe9', marginBottom: 1 }}>{g.title}</div>
                <div style={{ fontSize: 10, color: '#3e3a34' }}>{g.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPARAISON ── */}
      <div style={{ padding: '0 52px 52px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 600, marginBottom: 8 }}>COMPARAISON</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, color: '#f2efe9', letterSpacing: -.4, marginBottom: 24 }}>PermitAI vs la méthode classique</h2>
        <div style={{ border: '0.5px solid #1c1c2a', borderRadius: 12, overflow: 'hidden', background: '#09090f', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: '0.5px solid #1c1c2a' }}>
            {['CRITÈRE', 'PERMITAI PRO', 'ARCHITECTE', 'SERVICE URBANISME'].map((h, i) => (
              <div key={i} style={{ fontSize: 10, color: i === 1 ? '#a07820' : '#3e3a34', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 500 }}>{h}</div>
            ))}
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: i < COMPARISON.length - 1 ? '0.5px solid #111118' : 'none', background: i % 2 !== 0 ? 'rgba(255,255,255,.01)' : 'transparent' }}>
              <div style={{ fontSize: 13, color: '#8d887f' }}>{row[0]}</div>
              <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6l2.5 2.5L9 4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" /></svg>
                {row[1]}
              </div>
              <div style={{ fontSize: 12, color: '#3e3a34' }}>{row[2]}</div>
              <div style={{ fontSize: 12, color: '#3e3a34' }}>{row[3]}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[['94%', 'des dossiers acceptés avec PermitAI', '#4ade80'], ['4 800+', 'utilisateurs actifs en France', '#e8b420'], ['€3 200', 'économies moyennes par refus évité', '#e8b420']].map((s, i) => (
            <div key={i} style={{ border: '0.5px solid #1c1c2a', borderRadius: 10, padding: '20px 22px', background: '#09090f', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, color: s[2], fontWeight: 500, letterSpacing: -.5, flexShrink: 0 }}>{s[0]}</div>
              <div style={{ fontSize: 12, color: '#5a5650', lineHeight: 1.5 }}>{s[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ 3 — GRILLE 2×3 ── */}
      <div style={{ padding: '0 52px 56px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1.4px', fontWeight: 600, marginBottom: 10 }}>FAQ</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, color: '#f2efe9', letterSpacing: -.6, lineHeight: 1.08, marginBottom: 8 }}>Questions fréquentes.</h2>
          <p style={{ fontSize: 13, color: '#3e3a34', fontWeight: 300 }}>
            Une question ? <a href="mailto:contact@permitai.eu" style={{ color: '#a07820', textDecoration: 'none' }}>contact@permitai.eu</a>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {FAQ_ITEMS.map((f, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                background: openFaq === i ? 'linear-gradient(175deg, #0c0c1c, rgba(160,120,32,.04))' : '#09090f',
                border: `0.5px solid ${openFaq === i ? 'rgba(160,120,32,.28)' : '#1a1a26'}`,
                borderRadius: 14,
                padding: '20px 22px',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* NUMÉRO */}
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: openFaq === i ? 'rgba(160,120,32,.4)' : 'rgba(255,255,255,.05)', fontWeight: 500, lineHeight: 1, flexShrink: 0, letterSpacing: -1, minWidth: 32, transition: 'color .2s' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: openFaq === i ? '#f2efe9' : '#8d887f', lineHeight: 1.45, marginBottom: openFaq === i ? 10 : 0, transition: 'color .2s' }}>
                    {f.q}
                  </div>
                  {openFaq === i && (
                    <div style={{ fontSize: 12, color: '#5a5650', lineHeight: 1.65, fontWeight: 300 }}>{f.a}</div>
                  )}
                </div>
                <div style={{ fontSize: 16, color: openFaq === i ? '#a07820' : '#2a2a38', flexShrink: 0, fontWeight: 300, marginTop: 2 }}>
                  {openFaq === i ? '−' : '+'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div style={{ margin: '0 52px 60px', maxWidth: 1200 - 104, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #0c0c1c, rgba(160,120,32,.05))', border: '0.5px solid rgba(160,120,32,.15)', borderRadius: 20, padding: '56px 52px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, color: '#f2efe9', letterSpacing: -.8, lineHeight: 1.06, marginBottom: 8 }}>
              Commencez gratuitement.<br /><em style={{ fontStyle: 'italic', color: '#e8b420' }}>Sans carte bancaire.</em>
            </h2>
            <p style={{ fontSize: 13, color: '#3e3a34', fontWeight: 300 }}>1 analyse offerte · 3 minutes · Résiliation en 1 clic</p>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <Link href="/sign-up">
              <button style={{ padding: '14px 32px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                Essayer gratuitement →
              </button>
            </Link>
            <span style={{ fontSize: 10, color: '#1e1e28' }}>4 800+ utilisateurs · 94% accordés</span>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid #111118', padding: '44px 52px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
            <div style={{ maxWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <LogoMark />
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 500, color: '#f2efe9' }}>PermitAI</span>
              </div>
              <p style={{ fontSize: 12, color: '#2a2a38', lineHeight: 1.7, fontWeight: 300 }}>La plateforme IA pour les permis de construire en France.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
              {[
                ['Produit', ['Analyse PLU', 'CERFA', 'Dépôt mairie', 'Tarifs']],
                ['Support', ['Documentation', 'Blog', 'Support']],
                ['Légal', ['CGU', 'Confidentialité', 'Mentions légales']],
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ fontSize: 9.5, color: '#1e1e28', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 12 }}>{col[0]}</div>
                  {col[1].map((l) => (
                    <div key={l} style={{ fontSize: 12, color: '#2a2a38', padding: '3.5px 0' }}>{l}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '0.5px solid #111118', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#1e1e28' }}>© 2025 PermitAI</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 10, color: '#2a2a38' }}>Systèmes opérationnels</span>
            </div>
            <span style={{ fontSize: 11, color: '#1e1e28' }}>contact@permitai.eu</span>
          </div>
        </div>
      </footer>

    </div>
  );
}