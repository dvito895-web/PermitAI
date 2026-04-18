'use client';

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 12 — Page /parrainage
// Emplacement : app/app/parrainage/page.js
// Crée le dossier : app/app/parrainage/
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Check, Gift, Users, Zap } from 'lucide-react';

const C = {
  bg: '#06060e', surface: '#09090f', surface2: '#0e0e1a',
  border: '#1c1c2a', gold: '#a07820', goldL: '#e8b420',
  cream: '#f2efe9', muted: '#5a5650', dim: '#3e3a34',
};

// Simule le lien de parrainage — en prod, récupérer depuis Clerk/DB
const REFERRAL_LINK = 'https://permitai.eu/sign-up?ref=USER_CODE';
const REFERRAL_CODE = 'PERMIT-XXXX';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      style={{
        padding: '10px 16px',
        background: copied ? 'rgba(74,222,128,.1)' : 'rgba(160,120,32,.08)',
        border: `0.5px solid ${copied ? 'rgba(74,222,128,.25)' : 'rgba(160,120,32,.25)'}`,
        borderRadius: 9, color: copied ? '#4ade80' : C.gold,
        fontSize: 12, fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all .2s', flexShrink: 0,
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copié !' : 'Copier'}
    </button>
  );
}

export default function ParrainagePage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function sendInvite(e) {
    e.preventDefault();
    if (!email.trim()) return;
    // En prod : appeler /api/referral/invite avec { email }
    setSent(true);
    setTimeout(() => { setSent(false); setEmail(''); }, 3000);
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.cream }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: `0.5px solid ${C.border}`, background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '0 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.2" /><rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white" /></svg>
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: C.cream }}>PermitAI</span>
          </Link>
          <Link href="/dashboard" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: '60px 52px 0', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', border: '0.5px solid rgba(232,180,32,.2)', borderRadius: 20, background: 'rgba(232,180,32,.06)', marginBottom: 24 }}>
          <Gift size={12} color={C.gold} />
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 500 }}>Programme de parrainage</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 500, color: C.cream, letterSpacing: -1.2, lineHeight: 1.06, marginBottom: 14 }}>
          Partagez PermitAI.<br /><em style={{ fontStyle: 'italic', color: C.goldL }}>Gagnez 1 mois gratuit.</em>
        </h1>
        <p style={{ fontSize: 15, color: C.muted, fontWeight: 300, maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7 }}>
          Pour chaque ami qui s'inscrit et passe à un plan payant,<br />
          vous recevez <strong style={{ color: C.cream }}>1 mois gratuit</strong> — et lui aussi.
        </p>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <div style={{ padding: '0 52px 52px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 48 }}>
          {[
            { num: '01', icon: <Copy size={20} color={C.gold} />, title: 'Copiez votre lien', desc: 'Partagez votre lien unique par email, WhatsApp ou LinkedIn.' },
            { num: '02', icon: <Users size={20} color={C.gold} />, title: 'Votre ami s\'inscrit', desc: 'Il crée un compte PermitAI avec votre lien et passe au plan payant.' },
            { num: '03', icon: <Gift size={20} color={C.gold} />, title: 'Vous recevez 1 mois', desc: '1 mois gratuit ajouté à votre compte. Lui aussi bénéficie de 1 mois offert.' },
          ].map(({ num, icon, title, desc }) => (
            <div key={num} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '24px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: 'rgba(160,120,32,.25)', fontWeight: 500, lineHeight: 1 }}>{num}</div>
                <div style={{ width: 36, height: 36, background: 'rgba(160,120,32,.08)', border: `0.5px solid rgba(160,120,32,.15)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.cream, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* LIEN DE PARRAINAGE */}
        <div style={{ background: 'linear-gradient(135deg,#0d0d1c,rgba(160,120,32,.05))', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 18, padding: '36px 40px', marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: C.cream, marginBottom: 24 }}>Votre lien de parrainage</h2>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: '#0a0a14', border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: C.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{REFERRAL_LINK}</span>
            </div>
            <CopyButton text={REFERRAL_LINK} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
            <div style={{ flex: 1, height: '0.5px', background: C.border }} />
            <span style={{ fontSize: 11, color: C.dim }}>ou partagez votre code</span>
            <div style={{ flex: 1, height: '0.5px', background: C.border }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
            <div style={{ flex: 1, background: '#0a0a14', border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: C.goldL, fontWeight: 500, letterSpacing: 2 }}>{REFERRAL_CODE}</span>
            </div>
            <CopyButton text={REFERRAL_CODE} />
          </div>
        </div>

        {/* INVITER PAR EMAIL */}
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '28px 32px', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, color: C.cream, marginBottom: 6 }}>Inviter directement par email</h2>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Envoyez une invitation personnalisée avec votre lien.</p>
          <form onSubmit={sendInvite} style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemple.fr"
              style={{ flex: 1, background: '#0a0a14', border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: C.cream, fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
            />
            <button
              type="submit"
              style={{ padding: '12px 24px', background: sent ? 'rgba(74,222,128,.1)' : `linear-gradient(90deg, ${C.gold}, #c4960a)`, border: sent ? '0.5px solid rgba(74,222,128,.25)' : 'none', borderRadius: 10, color: sent ? '#4ade80' : '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all .2s', whiteSpace: 'nowrap' }}
            >
              {sent ? <><Check size={14} /> Envoyé !</> : <>Envoyer l'invitation <ArrowRight size={13} /></>}
            </button>
          </form>
        </div>

        {/* STATS PARRAINAGE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 48 }}>
          {[
            { val: '0', label: 'Filleuls actifs', color: C.goldL },
            { val: '0', label: 'Mois gagnés', color: '#4ade80' },
            { val: '0€', label: 'Économies totales', color: C.goldL },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '20px 22px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color, fontWeight: 500, letterSpacing: -.5, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: C.dim }}>{label}</div>
            </div>
          ))}
        </div>

        {/* RÈGLES */}
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '24px 28px' }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 500, color: C.cream, marginBottom: 16 }}>Conditions du programme</h3>
          {[
            'Votre filleul doit utiliser votre lien ou code lors de son inscription.',
            'Le mois gratuit est crédité dès que votre filleul passe à un plan payant (Starter, Pro ou Cabinet).',
            'Le mois gratuit est non-cumulable avec d\'autres offres promotionnelles.',
            'Il n\'y a pas de limite au nombre de parrainages — invitez autant de personnes que vous voulez.',
            'Les mois gagnés sont ajoutés à votre prochain cycle de facturation.',
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < 4 ? `0.5px solid ${C.border}` : 'none' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.dim, flexShrink: 0, marginTop: 6 }} />
              <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `0.5px solid ${C.border}`, padding: '20px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>© 2025 PermitAI</span>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>contact@permitai.eu</span>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Parrainage — 1 mois gratuit pour vous et vos amis | PermitAI',
  description: 'Parrainez un ami et recevez 1 mois gratuit. Lui aussi bénéficie d\'1 mois offert. Programme de parrainage PermitAI.',
};