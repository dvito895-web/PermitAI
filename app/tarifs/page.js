'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, Check, X, Sparkles, ArrowLeft } from 'lucide-react';

// ====== ONE-SHOT PRODUCTS ======
const ONE_SHOT_PRODUCTS = [
  { id: 'analyse', emoji: '🔍', titre: 'Analyse PLU + rapport PDF', prix: 49, badge: 'Remplace 500€ cabinet', desc: 'Analyse complète + règles PLU applicables + rapport PDF officiel téléchargeable.' },
  { id: 'cerfa', emoji: '📋', titre: 'CERFA pré-rempli + pièces vérifiées', prix: 99, badge: 'Remplace 800€ architecte', desc: 'CERFA officiel pré-rempli + liste des pièces à joindre vérifiées par IA.' },
  { id: 'depot', emoji: '📬', titre: 'Dépôt mairie complet + suivi 60j', prix: 199, badge: 'Remplace 500€ géomètre', desc: 'Dépôt PLAT\'AU ou LRAR + tracking statut jusqu\'à décision (60 jours).' },
  { id: 'pack', emoji: '🎁', titre: 'Pack Tout-en-un', prix: 299, prixBarre: 347, badge: 'Économisez 2 000€+', desc: 'Analyse PLU + CERFA + Dépôt mairie — tout compris.', recommande: true },
  { id: 'recours', emoji: '⚖️', titre: 'Recours après refus', prix: 399, badge: 'Remplace avocat 1 500€', desc: 'Lettre de recours gracieux + dossier argumenté + jurisprudence IA.' },
  { id: 'audit', emoji: '🔎', titre: 'Audit terrain avant achat', prix: 149, badge: 'Due diligence 3 min', desc: 'Analyse PLU avant compromis — évitez les mauvaises surprises.' },
];

// ====== ABONNEMENTS ======
const PROFILES = [
  { id: 'particulier', label: 'Particulier' },
  { id: 'agent', label: 'Agent immobilier' },
  { id: 'architecte', label: 'Architecte' },
  { id: 'promoteur', label: 'Promoteur' },
];

const ALL_PLANS = {
  starter: { id: 'starter', name: 'Starter', price: 29, priceAnnual: 22, features: ['3 analyses PLU / mois', '1 CERFA pré-rempli / mois', 'Alertes PLU sur 1 adresse', 'Rapport PDF basique', 'Support email 48h'] },
  pro: { id: 'pro', name: 'Pro', price: 89, priceAnnual: 67, features: ['Analyses PLU illimitées', '13 CERFA illimités + PDF', 'Dépôts PLAT\'AU illimités', '5 utilisateurs inclus', 'API REST 500 req/mois', 'Rapport white-label PDF', 'Extension Chrome agents immo', 'Alertes révisions PLU', 'Support prioritaire 4h'] },
  cabinet: { id: 'cabinet', name: 'Cabinet', price: 299, priceAnnual: 224, features: ['Tout Pro inclus', 'Utilisateurs illimités', 'Multi-clients & projets', 'API 5 000 req/mois', 'Account manager dédié', 'Export comptable CSV', 'Co-branding rapports', 'Support dédié < 2h'] },
  enterprise: { id: 'enterprise', name: 'Enterprise', price: null, priceAnnual: null, features: ['Tout Cabinet inclus', 'Solution white-label', 'API illimitée + SLA 99,9%', 'SSO SAML', 'Onboarding sur site', 'Formation équipe', 'Tarif au volume'] },
};

const PLANS_BY_PROFILE = {
  particulier: [{ ...ALL_PLANS.starter, recommande: false }, { ...ALL_PLANS.pro, recommande: true }],
  agent:       [{ ...ALL_PLANS.pro, recommande: true }, { ...ALL_PLANS.cabinet, recommande: false }],
  architecte:  [{ ...ALL_PLANS.cabinet, recommande: true }, { ...ALL_PLANS.enterprise, recommande: false }],
  promoteur:   [{ ...ALL_PLANS.enterprise, recommande: true }],
};

// ====== COMPARATIF ======
const COMPARATIF = [
  { feature: 'Prix dossier complet', permitai: '299€', geometre: '500€', architecte: '2 000-8 000€', cabinet: '1 500-3 000€', seul: '0€' },
  { feature: 'Délai', permitai: '3 min', geometre: '1-2 sem.', architecte: '4-8 sem.', cabinet: '2-3 sem.', seul: '4 sem.' },
  { feature: 'Taux acceptation', permitai: '94%', geometre: '85%', architecte: '95%', cabinet: '92%', seul: '40%' },
  { feature: 'CERFA inclus', permitai: true, geometre: false, architecte: true, cabinet: true, seul: false },
  { feature: 'Dépôt mairie', permitai: true, geometre: false, architecte: true, cabinet: false, seul: false },
  { feature: 'Disponible 24h/7j', permitai: true, geometre: false, architecte: false, cabinet: false, seul: true },
  { feature: 'Rapport PDF', permitai: true, geometre: true, architecte: true, cabinet: true, seul: false },
  { feature: 'Suivi dossier', permitai: true, geometre: false, architecte: true, cabinet: true, seul: false },
  { feature: 'Alertes PLU automatiques', permitai: true, geometre: false, architecte: false, cabinet: false, seul: false },
];

// ====== FAQ ======
const FAQ = [
  { q: 'Puis-je passer d\'un one-shot à un abonnement ?', a: 'Oui. Si vous achetez un one-shot puis souscrivez à un abonnement dans les 30 jours, le montant payé est déduit de votre premier mois.' },
  { q: 'Les dossiers sont-ils officiellement valides ?', a: 'Oui. Les CERFA générés sont les formulaires officiels publiés par service-public.fr. Les analyses utilisent les données du Géoportail Urbanisme. Les dépôts PLAT\'AU sont des dépôts juridiquement opposables.' },
  { q: 'Remboursement si refus ?', a: 'Pour les packs Dépôt et Pack Tout-en-un, nous remboursons 100% si le dossier est refusé pour un motif de non-conformité PermitAI n\'aurait pas détecté. Détails dans nos CGV.' },
  { q: 'Facture disponible ?', a: 'Oui. Une facture nominative est générée automatiquement et disponible dans votre dashboard, conforme aux exigences fiscales françaises.' },
  { q: 'Différence one-shot vs abonnement ?', a: 'Le one-shot couvre 1 projet ponctuel sans engagement. L\'abonnement convient si vous avez plusieurs projets dans l\'année (particulier multi-travaux), ou un usage professionnel récurrent (agent, architecte).' },
];

export default function TarifsPage() {
  const [profile, setProfile] = useState('particulier');
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleOneShot = async (productId) => {
    setLoading(productId);
    try {
      const r = await fetch('/api/stripe/one-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productId }),
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const plans = PLANS_BY_PROFILE[profile];

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#f2efe9' }}>
            <Building2 size={20} color="#e8b420" />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500 }}>PermitAI</span>
          </Link>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8d887f', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Retour
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section style={{ padding: '60px 36px 40px', textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 500, lineHeight: 1.1, letterSpacing: -1.2, marginBottom: 14 }}>
          Choisissez votre formule
        </h1>
        <p style={{ fontSize: 16, color: '#8d887f', lineHeight: 1.6 }}>
          Ce que vous payez <s style={{ color: '#5a5650' }}>3 000€</s> à un cabinet, faites-le pour <strong style={{ color: '#e8b420' }}>49€</strong>.
        </p>
      </section>

      {/* ===== ONE-SHOT EN HAUT ===== */}
      <section style={{ padding: '0 36px 60px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, background: 'rgba(74,222,128,.1)', border: '0.5px solid rgba(74,222,128,.3)', fontSize: 11, color: '#4ade80', fontWeight: 600, marginBottom: 14 }}>
            ✓ Paiement unique · Sans abonnement
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, marginBottom: 8 }}>Paiement unique <em style={{ color: '#e8b420' }}>sans engagement</em></h2>
          <p style={{ fontSize: 13, color: '#8d887f' }}>Pour 1 projet ponctuel — payez seulement ce dont vous avez besoin.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {ONE_SHOT_PRODUCTS.map(p => (
            <div key={p.id} style={{
              background: '#0c0c18',
              border: `0.5px solid ${p.recommande ? 'rgba(160,120,32,.4)' : '#1c1c2a'}`,
              borderRadius: 14,
              padding: 22,
              position: 'relative',
              boxShadow: p.recommande ? '0 4px 24px rgba(160,120,32,.15)' : 'none',
            }}>
              {p.recommande && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', background: 'linear-gradient(90deg, #a07820, #c4960a)', borderRadius: 20, fontSize: 10, color: '#fff', fontWeight: 700, letterSpacing: '.4px' }}>
                  RECOMMANDÉ
                </div>
              )}
              <div style={{ fontSize: 28, marginBottom: 10 }}>{p.emoji}</div>
              <div style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 5, background: 'rgba(74,222,128,.08)', color: '#4ade80', fontSize: 9, fontWeight: 700, letterSpacing: '.3px', marginBottom: 10 }}>
                PAIEMENT UNIQUE
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#f2efe9', marginBottom: 4, lineHeight: 1.3 }}>{p.titre}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                {p.prixBarre && <span style={{ fontSize: 16, color: '#5a5650', textDecoration: 'line-through' }}>{p.prixBarre}€</span>}
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, color: p.recommande ? '#e8b420' : '#f2efe9', lineHeight: 1 }}>{p.prix}€</span>
              </div>
              <div style={{ fontSize: 10, color: '#a07820', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.3px' }}>{p.badge}</div>
              <div style={{ fontSize: 12, color: '#8d887f', lineHeight: 1.55, marginBottom: 18, minHeight: 50 }}>{p.desc}</div>
              <button onClick={() => handleOneShot(p.id)} disabled={loading === p.id}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  background: p.recommande ? 'linear-gradient(90deg, #a07820, #c4960a)' : '#1a1a28',
                  border: p.recommande ? 'none' : '0.5px solid #2a2a38',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: loading === p.id ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: loading === p.id ? 0.6 : 1,
                }}>
                {loading === p.id ? 'Chargement…' : 'Acheter maintenant →'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABONNEMENTS ===== */}
      <section style={{ padding: '60px 36px', borderTop: '0.5px solid #1c1c2a', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, marginBottom: 8 }}>Abonnements <em style={{ color: '#e8b420' }}>récurrents</em></h2>
          <p style={{ fontSize: 13, color: '#8d887f', marginBottom: 22 }}>Pour les usages réguliers : pros et particuliers multi-projets.</p>

          {/* Profile selector */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: 4, background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 12, marginBottom: 18 }}>
            <span style={{ fontSize: 11, color: '#5a5650', padding: '0 10px' }}>Je suis :</span>
            {PROFILES.map(p => (
              <button key={p.id} onClick={() => setProfile(p.id)}
                style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: profile === p.id ? '#a07820' : 'transparent', color: profile === p.id ? '#fff' : '#8d887f', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Annual toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: !annual ? '#f2efe9' : '#5a5650' }}>Mensuel</span>
            <button onClick={() => setAnnual(!annual)} style={{ width: 44, height: 24, borderRadius: 12, background: annual ? '#a07820' : '#1c1c2a', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: annual ? 23 : 3, transition: 'left .2s' }} />
            </button>
            <span style={{ fontSize: 12, color: annual ? '#f2efe9' : '#5a5650', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Annuel
              <span style={{ background: '#4ade80', color: '#06060e', fontSize: 9, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>-25%</span>
            </span>
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: 14, maxWidth: plans.length === 1 ? 480 : '100%', margin: '0 auto' }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              background: '#0c0c18',
              border: `0.5px solid ${plan.recommande ? '#a07820' : '#1c1c2a'}`,
              borderRadius: 14,
              padding: 26,
              position: 'relative',
              boxShadow: plan.recommande ? '0 8px 32px rgba(160,120,32,.2)' : 'none',
            }}>
              {plan.recommande && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', background: 'linear-gradient(90deg, #a07820, #c4960a)', borderRadius: 20, fontSize: 10, color: '#fff', fontWeight: 700, letterSpacing: '.5px' }}>
                  RECOMMANDÉ
                </div>
              )}
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: '#f2efe9', marginBottom: 6 }}>{plan.name}</div>
              {plan.price !== null ? (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, color: plan.recommande ? '#e8b420' : '#f2efe9', lineHeight: 1 }}>
                      {annual ? plan.priceAnnual : plan.price}€
                    </span>
                    <span style={{ fontSize: 12, color: '#8d887f' }}>/mois</span>
                  </div>
                  {annual && <div style={{ fontSize: 10, color: '#4ade80', marginTop: 4, fontWeight: 600 }}>Facturé {plan.priceAnnual * 12}€/an</div>}
                </div>
              ) : (
                <div style={{ marginBottom: 18 }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, color: '#e8b420' }}>Sur devis</span>
                  <div style={{ fontSize: 11, color: '#8d887f', marginTop: 4 }}>Tarif négocié au volume</div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#c4bfb8' }}>
                    <Check size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                  </div>
                ))}
              </div>
              {plan.id === 'enterprise' ? (
                <Link href="/enterprise"><button style={{ width: '100%', padding: '11px 0', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 8, color: '#f2efe9', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Demander un devis →</button></Link>
              ) : (
                <Link href="/sign-up"><button style={{ width: '100%', padding: '11px 0', background: plan.recommande ? 'linear-gradient(90deg, #a07820, #c4960a)' : '#1a1a28', border: plan.recommande ? 'none' : '0.5px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Choisir {plan.name}</button></Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== TABLEAU COMPARATIF ===== */}
      <section style={{ padding: '60px 36px', borderTop: '0.5px solid #1c1c2a', maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, textAlign: 'center', marginBottom: 30 }}>PermitAI <em style={{ color: '#e8b420' }}>vs</em> les alternatives</h2>
        <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 1fr 1fr 1fr 1fr', borderBottom: '0.5px solid #1c1c2a', background: '#0a0a14' }}>
            {['', 'PermitAI Pro', 'Géomètre', 'Architecte', 'Cabinet urbanisme', 'Seul'].map((h, i) => (
              <div key={i} style={{ padding: '14px 16px', fontSize: 11, color: i === 1 ? '#e8b420' : '#8d887f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', borderRight: i < 5 ? '0.5px solid #1c1c2a' : 'none', textAlign: i === 0 ? 'left' : 'center' }}>
                {h}
              </div>
            ))}
          </div>
          {COMPARATIF.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 1fr 1fr 1fr 1fr', borderBottom: i < COMPARATIF.length - 1 ? '0.5px solid #111118' : 'none' }}>
              <div style={{ padding: '12px 16px', fontSize: 12, color: '#f2efe9', fontWeight: 500, borderRight: '0.5px solid #1c1c2a' }}>{row.feature}</div>
              {['permitai', 'geometre', 'architecte', 'cabinet', 'seul'].map((k, j) => {
                const v = row[k];
                return (
                  <div key={k} style={{ padding: '12px 16px', textAlign: 'center', borderRight: j < 4 ? '0.5px solid #1c1c2a' : 'none', background: k === 'permitai' ? 'rgba(160,120,32,.04)' : 'transparent' }}>
                    {typeof v === 'boolean' ? (
                      v ? <Check size={16} color="#4ade80" style={{ display: 'inline' }} /> : <X size={16} color="#5a5650" style={{ display: 'inline' }} />
                    ) : (
                      <span style={{ fontSize: 12, color: k === 'permitai' ? '#e8b420' : '#c4bfb8', fontWeight: k === 'permitai' ? 600 : 400 }}>{v}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ===== MENTIONS LÉGALES ===== */}
      <section style={{ padding: '50px 36px', borderTop: '0.5px solid #1c1c2a', maxWidth: 880, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, marginBottom: 18, textAlign: 'center' }}>À savoir avant d'acheter</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            { e: '⚖️', t: 'Architecte obligatoire pour les projets > 150m² de surface de plancher (Loi du 3 janvier 1977).' },
            { e: '🌱', t: 'Étude thermique RE2020 obligatoire pour toute construction neuve.' },
            { e: '🏛️', t: 'Accord ABF requis pour les projets en périmètre monument historique.' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 10 }}>
              <span style={{ fontSize: 18 }}>{m.e}</span>
              <span style={{ fontSize: 12, color: '#c4bfb8', lineHeight: 1.6 }}>{m.t}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#5a5650', textAlign: 'center', marginTop: 18, fontStyle: 'italic' }}>
          PermitAI prépare votre dossier complet — certaines validations restent à la charge de professionnels agréés.
        </p>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding: '50px 36px 80px', borderTop: '0.5px solid #1c1c2a', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, marginBottom: 24, textAlign: 'center' }}>Questions fréquentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500 }}>{item.q}</span>
                <span style={{ color: '#a07820', fontSize: 18, transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', fontSize: 12, color: '#8d887f', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
