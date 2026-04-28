import Link from 'next/link';
import { ArrowRight, CheckCircle2, TrendingUp, Clock, Shield } from 'lucide-react';

export const metadata = {
  title: 'PermitAI pour Agents Immobiliers — Vérifiez le PLU avant chaque compromis',
  description: 'Vérifiez la constructibilité avant chaque compromis de vente. Évitez les rétractations, sauvez vos commissions. 149€/mois.',
};

export default function AgentImmobilierPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: '#f2efe9', textDecoration: 'none' }}>PermitAI</Link>
          <Link href="/sign-up"><button style={{ padding: '10px 22px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Essai gratuit</button></Link>
        </div>
      </nav>

      <section style={{ padding: '80px 52px', textAlign: 'center' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'rgba(96,165,250,.1)', border: '0.5px solid rgba(96,165,250,.3)', fontSize: 11, color: '#60a5fa', marginBottom: 20, fontWeight: 500 }}>Pour agents immobiliers</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 20 }}>
            Vérifiez le PLU<br />avant chaque compromis.<br /><em style={{ color: '#e8b420' }}>En 3 minutes.</em>
          </h1>
          <p style={{ fontSize: 16, color: '#8d887f', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Évitez les rétractations clients, sauvez vos commissions, sécurisez vos mandats. PermitAI analyse instantanément la constructibilité de chaque terrain.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/sign-up"><button style={{ padding: '14px 28px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Essai gratuit 14 jours <ArrowRight size={16} /></button></Link>
            <Link href="/demo"><button style={{ padding: '14px 28px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 10, color: '#f2efe9', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Voir la démo</button></Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 52px', borderTop: '0.5px solid #1c1c2a', borderBottom: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { v: '94%', l: 'dossiers accordés', sub: 'vs 70% sans outil' },
            { v: '15h', l: 'économisées / semaine', sub: 'temps de vérification PLU' },
            { v: '0', l: 'refus technique', sub: 'compromis sécurisés' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '36px 28px', background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 14 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 56, color: '#e8b420', fontWeight: 500, lineHeight: 1, marginBottom: 8 }}>{s.v}</div>
              <div style={{ fontSize: 15, color: '#f2efe9', fontWeight: 500, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 12, color: '#5a5650' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 52px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, marginBottom: 20 }}>ROI immédiat</h2>
          <div style={{ background: 'linear-gradient(135deg, #0c0c1c, rgba(160,120,32,.04))', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 16, padding: 40 }}>
            <p style={{ fontSize: 18, color: '#f2efe9', lineHeight: 1.6, marginBottom: 14 }}>1 vente sauvée = <span style={{ color: '#4ade80', fontWeight: 600 }}>8 000 €</span> de commission.</p>
            <p style={{ fontSize: 16, color: '#8d887f', marginBottom: 24 }}>PermitAI Pro = <span style={{ color: '#e8b420', fontWeight: 600 }}>149 €/mois</span> — soit 1 788 €/an.</p>
            <p style={{ fontSize: 14, color: '#5a5650' }}>Une seule transaction sauvée par an = <strong style={{ color: '#4ade80' }}>447% de ROI</strong>.</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, textAlign: 'center', marginBottom: 40 }}>Tout ce qu'il vous faut</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: Clock, title: 'Vérification 3 min', desc: 'Tapez l\'adresse. Constructibilité instantanée.' },
              { icon: Shield, title: 'Sécurisez le compromis', desc: 'Pas de mauvaise surprise après signature.' },
              { icon: TrendingUp, title: 'Plus de mandats', desc: 'Argument différenciateur face à vos concurrents.' },
              { icon: CheckCircle2, title: 'Extension Chrome', desc: 'Vérifiez direct depuis SeLoger ou Logic-Immo.' },
              { icon: CheckCircle2, title: '5 utilisateurs inclus', desc: 'Toute votre équipe dans le plan Pro.' },
              { icon: CheckCircle2, title: 'Support prioritaire', desc: 'Réponse en moins de 4 heures.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 24 }}>
                  <Icon size={20} color="#e8b420" style={{ marginBottom: 14 }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#5a5650', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 52px', textAlign: 'center', background: 'linear-gradient(180deg, #06060e, #0a0a14)' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, marginBottom: 14 }}>Prêt à sécuriser vos ventes ?</h2>
        <p style={{ fontSize: 14, color: '#8d887f', marginBottom: 28 }}>14 jours d'essai gratuit · sans carte bancaire</p>
        <Link href="/sign-up"><button style={{ padding: '14px 32px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Démarrer maintenant <ArrowRight size={16} /></button></Link>
      </section>
    </div>
  );
}
