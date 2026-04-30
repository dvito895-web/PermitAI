'use client';
import { useState } from 'react';
import Link from 'next/link';

 const ONESHOTS = [
  { id: 'analyse', emoji: '🔍', titre: 'Analyse PLU + rapport PDF', prix: 49, remplace: 'Cabinet 500€', desc: 'Analyse complète des règles PLU avec rapport PDF officiel téléchargeable' },
  { id: 'cerfa', emoji: '📋', titre: 'CERFA pré-rempli + pièces vérifiées', prix: 99, remplace: 'Architecte 800€', desc: 'CERFA officiel pré-rempli avec liste des pièces vérifiée par IA' },
  { id: 'pack', emoji: '🎁', titre: 'Pack Tout-en-un', prix: 299, prixBarre: 347, remplace: 'Économisez 2 000€+', desc: 'Analyse PLU + CERFA pré-rempli + Dépôt mairie complet', recommande: true },
];

const PLANS = {
  particulier: [
    { nom: 'Gratuit', prix: 0, features: ['1 analyse/mois', '2 règles PLU visibles', 'CERFA basique'], cta: 'Commencer', href: '/sign-up', highlight: false },
    { nom: 'Starter', prix: 29, features: ['3 analyses/mois', '1 CERFA pré-rempli', 'Alertes PLU', 'Rapport PDF', 'Support email'], cta: 'Choisir Starter', href: '/sign-up?plan=starter', highlight: true },
    { nom: 'Pro', prix: 89, features: ['Analyses illimitées', 'CERFA illimités', '2 dépôts/mois', 'API 500 req/mois', 'Support prioritaire 4h'], cta: 'Choisir Pro', href: '/sign-up?plan=pro', highlight: false },
  ],
  agent: [
    { nom: 'Pro', prix: 89, features: ['Analyses illimitées', 'CERFA illimités', '2 dépôts/mois', 'Rapport white-label', 'API 500 req/mois', '5 utilisateurs', 'Support 4h'], cta: 'Choisir Pro', href: '/sign-up?plan=pro', highlight: false },
    { nom: 'Cabinet', prix: 299, badge: 'RECOMMANDÉ', features: ['Tout Pro', 'Multi-clients illimité', 'API 5 000 req/mois', 'Account manager', 'Export CSV comptable', 'Utilisateurs illimités'], cta: 'Choisir Cabinet', href: '/sign-up?plan=cabinet', highlight: true },
  ],
  architecte: [
    { nom: 'Cabinet', prix: 299, badge: 'RECOMMANDÉ', features: ['Multi-clients illimité', 'API 5 000 req/mois', 'Rapport white-label logo', 'Account manager dédié', 'Export CSV', 'Utilisateurs illimités'], cta: 'Choisir Cabinet', href: '/sign-up?plan=cabinet', highlight: true },
    { nom: 'Enterprise', prix: null, features: ['White-label complet', 'API illimitée + SLA 99.9%', 'SSO SAML', 'Formation équipe', 'Onboarding personnalisé'], cta: 'Nous contacter', href: '/enterprise', highlight: false },
  ],
  promoteur: [
    { nom: 'Enterprise', prix: null, badge: 'SUR DEVIS', features: ['White-label complet', 'API illimitée + SLA 99.9%', 'SSO SAML', 'Formation équipe', 'Onboarding sur site', 'Support dédié'], cta: 'Parler à l\'équipe', href: '/enterprise', highlight: true },
  ],
};


export default function TarifsPage() {
  const [profil, setProfil] = useState('particulier');
  const [annuel, setAnnuel] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const plans = PLANS[profil] || PLANS.particulier;

  const faqs = [
    { q: 'Puis-je passer d\'un one-shot à un abonnement ?', r: 'Oui, à tout moment. Si vous achetez un one-shot et décidez de passer en abonnement dans les 30 jours, on déduit le montant de votre premier mois.' },
    { q: 'Les rapports PDF sont-ils officiellement valides ?', r: 'PermitAI génère des analyses basées sur les données PLU officielles. Les rapports sont des outils de préparation. La validation finale reste à la charge de la mairie lors du dépôt.' },
    { q: 'Architecte obligatoire au-dessus de 150m² ?', r: 'Oui. La loi du 3 janvier 1977 impose le recours à un architecte inscrit à l\'Ordre pour tout projet de construction neuve dépassant 150m² de surface de plancher. PermitAI vous prépare le dossier complet.' },
    { q: 'Remboursement si refus de permis ?', r: 'PermitAI est un outil d\'analyse et de préparation. En cas de refus imputable à une erreur de notre analyse PLU, contactez-nous à contact@permitai.eu pour un geste commercial.' },
    { q: 'Facture disponible ?', r: 'Oui, une facture TVA est automatiquement générée et envoyée par email après chaque achat one-shot ou abonnement.' },
  ];

  const btnStyle = (active) => ({
    padding: '8px 18px', borderRadius: 8, border: active ? '0.5px solid #a07820' : '0.5px solid #1c1c2a',
    background: active ? 'rgba(160,120,32,.1)' : 'transparent', color: active ? '#e8b420' : '#5a5650',
    fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
  });

 function acheterOneShot(id) {
  const links = { analyse: '/analyse', cerfa: '/cerfa/wizard', pack: '/depot' };
  window.location.href = links[id] || '/tarifs';
}
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ padding: '14px 52px', borderBottom: '0.5px solid #1c1c2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏠</div>
          <span style={{ color: '#f2efe9', fontWeight: 500, fontSize: 15 }}>PermitAI</span>
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['Analyse PLU', '/analyse'], ['CERFA', '/cerfa'], ['Tarifs', '/tarifs']].map(([l, h]) => (
            <Link key={h} href={h} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, color: h === '/tarifs' ? '#f2efe9' : '#5a5650', textDecoration: 'none', background: h === '/tarifs' ? 'rgba(160,120,32,.1)' : 'transparent' }}>{l}</Link>
          ))}
        </div>
        <Link href="/sign-up"><button style={{ padding: '9px 18px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Essai gratuit</button></Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 10, color: '#a07820', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Tarifs transparents</div>
          <h1 style={{ fontSize: 40, fontWeight: 500, color: '#f2efe9', marginBottom: 10, letterSpacing: '-0.5px' }}>Choisissez votre formule</h1>
          <p style={{ fontSize: 16, color: '#5a5650' }}>Ce que vous payez <strong style={{ color: '#e8b420' }}>3 000€</strong> à un cabinet — faites-le pour <strong style={{ color: '#4ade80' }}>49€</strong></p>
        </div>

        {/* ONE-SHOT */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, color: '#f2efe9', fontWeight: 500, marginBottom: 6 }}>Paiement unique</h2>
            <p style={{ fontSize: 13, color: '#5a5650' }}>Sans abonnement — payez uniquement ce dont vous avez besoin</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {ONESHOTS.map(p => (
              <div key={p.id} style={{ background: '#0c0c18', border: p.recommande ? '1.5px solid rgba(160,120,32,.5)' : '0.5px solid #151520', borderRadius: 12, padding: 20, position: 'relative' }}>
                {p.recommande && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#a07820', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>MEILLEURE VALEUR</div>}
                <div style={{ fontSize: 28, marginBottom: 10 }}>{p.emoji}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, background: 'rgba(74,222,128,.1)', color: '#4ade80', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Paiement unique</span>
                  <span style={{ fontSize: 10, background: 'rgba(160,120,32,.1)', color: '#a07820', padding: '2px 8px', borderRadius: 20 }}>Remplace {p.remplace}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f2efe9', margin: '10px 0 4px' }}>{p.titre}</div>
                <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 14, lineHeight: 1.5 }}>{p.desc}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                  {p.prixBarre && <span style={{ fontSize: 13, color: '#3e3a34', textDecoration: 'line-through' }}>{p.prixBarre}€</span>}
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#e8b420' }}>{p.prix}€</span>
                  <span style={{ fontSize: 11, color: '#3e3a34' }}>HT</span>
                </div>
                <button onClick={() => acheterOneShot(p.id)}
                  style={{ width: '100%', padding: '10px', background: p.recommande ? 'linear-gradient(90deg,#a07820,#c4960a)' : 'transparent', border: p.recommande ? 'none' : '0.5px solid rgba(160,120,32,.3)', borderRadius: 8, color: p.recommande ? '#fff' : '#a07820', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Acheter maintenant →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ABONNEMENTS */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, color: '#f2efe9', fontWeight: 500, marginBottom: 16 }}>Abonnements</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 12, color: '#5a5650' }}>Je suis...</span>
              {[['particulier', '🏠 Particulier'], ['agent', '🤝 Agent immo'], ['architecte', '📐 Architecte'], ['promoteur', '🏗 Promoteur']].map(([k, l]) => (
                <button key={k} onClick={() => setProfil(k)} style={btnStyle(profil === k)}>{l}</button>
              ))}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 30, padding: '5px 8px' }}>
              <button onClick={() => setAnnuel(false)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', background: !annuel ? '#f2efe9' : 'transparent', color: !annuel ? '#06060e' : '#5a5650', fontSize: 12, fontWeight: !annuel ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>Mensuel</button>
              <button onClick={() => setAnnuel(true)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', background: annuel ? '#f2efe9' : 'transparent', color: annuel ? '#06060e' : '#5a5650', fontSize: 12, fontWeight: annuel ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                Annuel <span style={{ fontSize: 10, background: '#4ade80', color: '#000', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>-25%</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: 12, maxWidth: plans.length === 1 ? 400 : 800, margin: '0 auto' }}>
            {plans.map(p => (
              <div key={p.nom} style={{ background: '#0c0c18', border: p.highlight ? '1.5px solid rgba(160,120,32,.5)' : '0.5px solid #151520', borderRadius: 12, padding: 24, position: 'relative' }}>
                {p.badge && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#a07820', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>{p.badge}</div>}
                <div style={{ fontSize: 12, fontWeight: 600, color: p.highlight ? '#a07820' : '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>{p.nom}</div>
                <div style={{ marginBottom: 16 }}>
                  {p.prix === null ? (
                    <span style={{ fontSize: 22, fontWeight: 500, color: '#f2efe9' }}>Sur devis</span>
                  ) : p.prix === 0 ? (
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#f2efe9' }}>Gratuit</span>
                  ) : (
                    <div>
                      <span style={{ fontSize: 30, fontWeight: 700, color: '#e8b420' }}>{annuel ? Math.round(p.prix * 0.75) : p.prix}€</span>
                      <span style={{ fontSize: 12, color: '#3e3a34' }}>/mois</span>
                      {annuel && <div style={{ fontSize: 10, color: '#4ade80', marginTop: 2 }}>Facturé {Math.round(p.prix * 0.75 * 12)}€/an</div>}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 20 }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid #111118', fontSize: 12, color: '#c4bfb8' }}>
                      <span style={{ color: '#4ade80', fontSize: 12, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <Link href={p.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <button style={{ width: '100%', padding: '11px', background: p.highlight ? 'linear-gradient(90deg,#a07820,#c4960a)' : 'transparent', border: p.highlight ? 'none' : '0.5px solid #1c1c2a', borderRadius: 9, color: p.highlight ? '#fff' : '#5a5650', fontSize: 13, fontWeight: p.highlight ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {p.cta} →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* COMPARATIF */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 22, color: '#f2efe9', fontWeight: 500, textAlign: 'center', marginBottom: 28 }}>PermitAI vs les alternatives</h2>
          <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: '0.5px solid #1c1c2a' }}>
              {['', 'PermitAI Pro', 'Géomètre', 'Architecte', 'Cabinet'].map((h, i) => (
                <div key={i} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: i === 1 ? '#a07820' : '#3e3a34', background: i === 1 ? 'rgba(160,120,32,.05)' : 'transparent', textAlign: i > 0 ? 'center' : 'left', borderRight: i < 4 ? '0.5px solid #111118' : 'none' }}>{h}</div>
              ))}
            </div>
            {[
              ['Prix', '89€/mois', '500-1500€', '800-2000€', '500-1500€'],
              ['Délai', '3 minutes', '3-6 semaines', '4-8 semaines', '1-3 semaines'],
              ['Taux succès', '94%', '80%', '85%', '88%'],
              ['CERFA inclus', '✅', '❌', '❌', '❌'],
              ['Dépôt mairie', '✅', '❌', '❌', '❌'],
              ['Disponible 24h/7j', '✅', '❌', '❌', '❌'],
              ['Rapport PDF', '✅', '❌', '✅', '✅'],
              ['Alertes PLU', '✅', '❌', '❌', '❌'],
            ].map(([label, ...vals], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: i < 7 ? '0.5px solid #0e0e1a' : 'none' }}>
                <div style={{ padding: '11px 16px', fontSize: 12, color: '#8d887f', borderRight: '0.5px solid #111118' }}>{label}</div>
                {vals.map((v, j) => (
                  <div key={j} style={{ padding: '11px 16px', fontSize: 12, textAlign: 'center', color: j === 0 ? (v === '✅' ? '#4ade80' : '#e8b420') : v === '✅' ? '#4ade80' : v === '❌' ? '#3e3a34' : '#5a5650', background: j === 0 ? 'rgba(160,120,32,.04)' : 'transparent', borderRight: j < 3 ? '0.5px solid #111118' : 'none', fontWeight: j === 0 ? 600 : 400 }}>{v}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* MENTIONS LÉGALES */}
        <div style={{ background: 'rgba(239,68,68,.04)', border: '0.5px solid rgba(239,68,68,.15)', borderRadius: 10, padding: '16px 20px', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: '#8d887f', lineHeight: 1.8 }}>
            <span style={{ marginRight: 20 }}>⚖️ <strong style={{ color: '#f2efe9' }}>Architecte obligatoire</strong> pour les projets {'>'} 150m² (Loi du 3 janvier 1977)</span>
            <span style={{ marginRight: 20 }}>🌱 <strong style={{ color: '#f2efe9' }}>Étude RE2020</strong> obligatoire pour toute construction neuve</span>
            <span>🏛️ <strong style={{ color: '#f2efe9' }}>Accord ABF</strong> requis en périmètre monument historique</span>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{ fontSize: 22, color: '#f2efe9', fontWeight: 500, textAlign: 'center', marginBottom: 24 }}>Questions fréquentes</h2>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{ width: '100%', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500 }}>{f.q}</span>
                <span style={{ color: '#a07820', fontSize: 16, flexShrink: 0, marginLeft: 10 }}>{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && (
                <div style={{ padding: '0 18px 14px', fontSize: 12, color: '#8d887f', lineHeight: 1.7 }}>{f.r}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
