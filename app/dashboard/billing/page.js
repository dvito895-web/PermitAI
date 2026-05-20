'use client';
// app/dashboard/billing/page.js
// Page Billing — Status Subscription, plan, crédits, Customer Portal Stripe
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { CreditCard, Check, AlertCircle, Sparkles, ExternalLink, ArrowLeft, Calendar, TrendingUp, Receipt } from 'lucide-react';

const PLAN_VISUAL = {
  free:    { color: '#8d887f', accent: 'rgba(141,136,127,.12)', label: 'Découverte',  emoji: '🌱' },
  starter: { color: '#e8b420', accent: 'rgba(232,180,32,.12)',  label: 'Starter',     emoji: '⭐' },
  pro:     { color: '#a07820', accent: 'rgba(160,120,32,.18)',  label: 'Pro',         emoji: '💎' },
  cabinet: { color: '#7e3aed', accent: 'rgba(126,58,237,.16)',  label: 'Cabinet',     emoji: '🏛' },
};

const STATUS_VISUAL = {
  active:    { color: '#4ade80', label: 'Actif' },
  trialing:  { color: '#60a5fa', label: 'Période d\'essai' },
  past_due:  { color: '#ef4444', label: 'Paiement échoué' },
  canceled:  { color: '#5a5650', label: 'Annulé' },
  inactive:  { color: '#5a5650', label: 'Inactif' },
  unpaid:    { color: '#ef4444', label: 'Impayé' },
};

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    fetch('/api/me/subscription')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [isLoaded]);

  async function openPortal() {
    setPortalLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erreur Customer Portal');
      window.location.href = j.url;
    } catch (e) {
      setError(e.message);
      setPortalLoading(false);
    }
  }

  if (!isLoaded || loading) {
    return <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8d887f', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Chargement…</div>;
  }

  const plan = data?.plan || 'free';
  const status = data?.status || 'inactive';
  const planVis = PLAN_VISUAL[plan] || PLAN_VISUAL.free;
  const statusVis = STATUS_VISUAL[status] || STATUS_VISUAL.inactive;
  const limit = data?.limit || { credits: 1, price: 0 };
  const credits = data?.credits ?? 0;
  const creditsUsed = data?.credits_used ?? 0;
  const totalCredits = limit.credits || 1;
  const pct = Math.max(0, Math.min(100, (credits / totalCredits) * 100));

  const periodEnd = data?.current_period_end ? new Date(data.current_period_end) : null;
  const daysLeft = periodEnd ? Math.max(0, Math.ceil((periodEnd - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div data-testid="billing-page" style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      {/* Header */}
      <header style={{ padding: '24px 36px', borderBottom: '0.5px solid #151520', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link href="/dashboard" style={{ color: '#8d887f', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, textDecoration: 'none' }} data-testid="back-to-dashboard">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, color: '#f2efe9', margin: 0 }}>Abonnement & Facturation</h1>
          <p style={{ fontSize: 12, color: '#5a5650', margin: '4px 0 0' }}>Gérez votre plan, vos crédits et votre moyen de paiement.</p>
        </div>
      </header>

      <main style={{ padding: '36px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Carte principale — Plan actuel */}
        <section style={{ background: `linear-gradient(135deg, #0c0c18, ${planVis.accent})`, border: `0.5px solid ${planVis.color}40`, borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Plan actuel</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 36 }}>{planVis.emoji}</span>
                <h2 data-testid="current-plan" style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, color: planVis.color, margin: 0 }}>{planVis.label}</h2>
                <span style={{ fontSize: 13, color: '#8d887f' }}>{limit.price ? `${limit.price} € / mois` : 'Gratuit'}</span>
              </div>
            </div>
            <div data-testid="subscription-status" style={{ padding: '8px 16px', background: `${statusVis.color}15`, color: statusVis.color, borderRadius: 24, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusVis.color }} />
              {statusVis.label}
            </div>
          </div>

          {/* Crédits */}
          <div style={{ background: '#0a0a14', borderRadius: 12, padding: 22, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color={planVis.color} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Crédits d'analyse</span>
              </div>
              <span data-testid="credits-counter" style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: planVis.color }}>
                {credits} <span style={{ fontSize: 13, color: '#5a5650' }}>/ {totalCredits}</span>
              </span>
            </div>
            <div style={{ height: 6, background: '#1c1c2a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${planVis.color}, #e8b420)`, transition: 'width .3s' }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#5a5650' }}>
              {creditsUsed} analyse{creditsUsed > 1 ? 's' : ''} utilisée{creditsUsed > 1 ? 's' : ''} ce mois · {credits} restante{credits > 1 ? 's' : ''}
              {daysLeft !== null && ` · Renouvellement dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {data?.has_portal ? (
              <button onClick={openPortal} disabled={portalLoading} data-testid="open-portal-btn"
                style={{ padding: '12px 22px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: portalLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
                <CreditCard size={14} /> {portalLoading ? 'Ouverture…' : 'Gérer mon abonnement'} <ExternalLink size={12} />
              </button>
            ) : (
              <Link href="/tarifs">
                <button data-testid="upgrade-btn" style={{ padding: '12px 22px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
                  <Sparkles size={14} /> Souscrire à un plan
                </button>
              </Link>
            )}
            <Link href="/tarifs">
              <button data-testid="change-plan-btn" style={{ padding: '12px 22px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 10, color: '#f2efe9', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
                Changer de plan
              </button>
            </Link>
          </div>

          {error && (
            <div data-testid="billing-error" style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(239,68,68,.08)', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 8, fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </section>

        {/* Détails */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
          <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Calendar size={14} color="#a07820" />
              <span style={{ fontSize: 12, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px' }}>Prochaine facturation</span>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: '#f2efe9' }}>
              {periodEnd ? periodEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#5a5650', marginTop: 4 }}>
              {limit.price ? `${limit.price} € sera prélevé` : 'Aucun prélèvement (plan gratuit)'}
            </div>
          </div>

          <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <TrendingUp size={14} color="#a07820" />
              <span style={{ fontSize: 12, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px' }}>Stripe Customer</span>
            </div>
            <div style={{ fontSize: 13, color: '#f2efe9', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {data?.stripe_customer_id || '—'}
            </div>
            <div style={{ fontSize: 11, color: '#5a5650', marginTop: 4 }}>
              Subscription : {data?.stripe_subscription_id || '—'}
            </div>
          </div>

          <div style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Receipt size={14} color="#a07820" />
              <span style={{ fontSize: 12, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.5px' }}>Compte</span>
            </div>
            <div style={{ fontSize: 13, color: '#f2efe9' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: 11, color: '#5a5650', marginTop: 4, wordBreak: 'break-all' }}>
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </section>

        {/* Avantages plan */}
        <section style={{ background: '#0c0c18', border: '0.5px solid #151520', borderRadius: 12, padding: 30 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: '#f2efe9', marginBottom: 16 }}>Inclus dans votre plan {planVis.label}</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {[
              `${totalCredits} analyse${totalCredits > 1 ? 's' : ''} PLU IA par mois`,
              'CERFA PCMI / DP / PDEMO / CU illimités',
              "Plans de masse, coupe & façades SVG niveau architecte",
              'Notice descriptive Claude Sonnet 4.5 (DOCX + PDF)',
              'Photomontage IA d\'insertion paysagère (PCMI6)',
              plan !== 'free' && 'Dépôt PLAT\'AU assisté',
              (plan === 'pro' || plan === 'cabinet') && 'Webhooks de révision PLU + alertes email',
              plan === 'cabinet' && 'API d\'export + multi-utilisateurs',
            ].filter(Boolean).map((feat, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#c4bfb8', fontSize: 12 }}>
                <Check size={14} color={planVis.color} style={{ flexShrink: 0, marginTop: 2 }} /> {feat}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
