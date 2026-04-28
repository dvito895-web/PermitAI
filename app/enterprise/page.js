'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Code, Shield, Users, Headphones, GraduationCap } from 'lucide-react';

export default function EnterprisePage() {
  const [form, setForm] = useState({ nom: '', email: '', entreprise: '', volume: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Demande Enterprise — ${form.entreprise || form.nom}`);
    const body = encodeURIComponent(`Nom : ${form.nom}\nEmail : ${form.email}\nEntreprise : ${form.entreprise}\nVolume estimé : ${form.volume}\n\n${form.message}`);
    window.location.href = `mailto:contact@permitai.eu?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: '#f2efe9', textDecoration: 'none' }}>PermitAI</Link>
          <Link href="/tarifs" style={{ fontSize: 12, color: '#8d887f', textDecoration: 'none' }}>← Voir les autres plans</Link>
        </div>
      </nav>

      <section style={{ padding: '80px 52px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'linear-gradient(90deg, rgba(160,120,32,.12), rgba(232,180,32,.06))', border: '0.5px solid rgba(232,180,32,.3)', fontSize: 11, color: '#e8b420', marginBottom: 22, fontWeight: 600, letterSpacing: '.5px' }}>ENTERPRISE</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 18 }}>
          PermitAI Enterprise<br /><em style={{ color: '#e8b420' }}>sur mesure.</em>
        </h1>
        <p style={{ fontSize: 16, color: '#8d887f', maxWidth: 640, margin: '0 auto' }}>
          Pour les groupes immobiliers, foncières institutionnelles et grands cabinets. Solution white-label, API dédiée, SLA 99,9%.
        </p>
      </section>

      <section style={{ padding: '60px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: Building2, t: 'White-label', d: 'Votre marque, vos couleurs, votre domaine. Solution intégrée à votre image.' },
            { icon: Code, t: 'API dédiée', d: 'Endpoints prioritaires, quota illimité, documentation OpenAPI complète.' },
            { icon: Shield, t: 'SLA 99,9%', d: 'Disponibilité garantie, monitoring 24/7, escalation automatique.' },
            { icon: GraduationCap, t: 'Formation', d: 'Onboarding équipe, sessions personnalisées, certification PermitAI.' },
            { icon: Headphones, t: 'Support dédié', d: 'Account manager direct, Slack partagé, réponse < 2h ouvrées.' },
            { icon: Users, t: 'Utilisateurs illimités', d: 'Pas de limite, gestion des rôles avancée, SSO SAML.' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 28 }}>
                <Icon size={22} color="#e8b420" style={{ marginBottom: 16 }} />
                <div style={{ fontSize: 15, fontWeight: 500, color: '#f2efe9', marginBottom: 8 }}>{f.t}</div>
                <div style={{ fontSize: 12, color: '#5a5650', lineHeight: 1.6 }}>{f.d}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: '80px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, marginBottom: 12, textAlign: 'center' }}>Demander un devis</h2>
          <p style={{ fontSize: 13, color: '#8d887f', textAlign: 'center', marginBottom: 36 }}>Notre équipe revient vers vous sous 24 heures ouvrées.</p>

          <form onSubmit={handleSubmit} style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 16, padding: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Nom</label>
                <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Email pro</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Entreprise</label>
                <input value={form.entreprise} onChange={e => setForm({ ...form, entreprise: e.target.value })} style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Volume estimé</label>
                <select value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' }}>
                  <option value="">Sélectionner</option>
                  <option>&lt; 100 analyses/mois</option>
                  <option>100-500 analyses/mois</option>
                  <option>500-2000 analyses/mois</option>
                  <option>&gt; 2000 analyses/mois</option>
                </select>
              </div>
            </div>
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Votre message</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Décrivez vos besoins…" rows={5} style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none', resize: 'none', marginBottom: 18 }} />
            <button type="submit" style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Envoyer ma demande <ArrowRight size={16} />
            </button>
            <p style={{ fontSize: 10, color: '#5a5650', textAlign: 'center', marginTop: 12 }}>Ou envoyez directement à <a href="mailto:contact@permitai.eu" style={{ color: '#a07820' }}>contact@permitai.eu</a></p>
          </form>
        </div>
      </section>
    </div>
  );
}
