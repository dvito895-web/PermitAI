import Link from 'next/link';
import { ArrowRight, Building2, BarChart3, Shield } from 'lucide-react';

export const metadata = {
  title: 'PermitAI pour Promoteurs — Due diligence PLU instantanée',
  description: 'Analyse PLU instantanée sur tous vos terrains. Évitez les acquisitions à risque, optimisez votre pipeline.',
};

export default function PromoteurPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: '#f2efe9', textDecoration: 'none' }}>PermitAI</Link>
          <Link href="/enterprise"><button style={{ padding: '10px 22px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Demander un devis</button></Link>
        </div>
      </nav>

      <section style={{ padding: '80px 52px', textAlign: 'center' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'rgba(74,222,128,.1)', border: '0.5px solid rgba(74,222,128,.3)', fontSize: 11, color: '#4ade80', marginBottom: 20, fontWeight: 500 }}>Pour promoteurs immobiliers</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 20 }}>
            Due diligence PLU<br /><em style={{ color: '#e8b420' }}>instantanée</em><br />sur tous vos terrains.
          </h1>
          <p style={{ fontSize: 16, color: '#8d887f', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Analysez 100 terrains avant offre. Évitez les acquisitions à risque, optimisez votre pipeline d'opportunités.
          </p>
          <Link href="/enterprise"><button style={{ padding: '14px 28px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Demander un devis Enterprise <ArrowRight size={16} /></button></Link>
        </div>
      </section>

      <section style={{ padding: '60px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, marginBottom: 14 }}>ROI Promoteur</h2>
          <div style={{ background: 'linear-gradient(135deg, #0c0c1c, rgba(74,222,128,.05))', border: '0.5px solid rgba(74,222,128,.2)', borderRadius: 16, padding: 40 }}>
            <p style={{ fontSize: 18, color: '#f2efe9', lineHeight: 1.6, marginBottom: 12 }}>1 terrain non conforme évité = <span style={{ color: '#4ade80', fontWeight: 600 }}>50 000 €</span> économisés.</p>
            <p style={{ fontSize: 14, color: '#8d887f' }}>Études d'urbanisme, frais notariaux, mois perdus.</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: Building2, title: 'Multi-terrains', desc: 'Comparez 50 terrains en 1 dashboard. Score de conformité, COS, hauteur autorisée.' },
            { icon: BarChart3, title: 'Analyse de marché', desc: 'Données croisées : PLU + cadastre + transactions DVF récentes.' },
            { icon: Shield, title: 'SLA 99,9%', desc: 'Disponibilité garantie, support dédié, account manager.' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 28 }}>
                <Icon size={22} color="#e8b420" style={{ marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 500, color: '#f2efe9', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#5a5650', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: '80px 52px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, marginBottom: 14 }}>Plan Enterprise sur mesure</h2>
        <p style={{ fontSize: 14, color: '#8d887f', marginBottom: 28 }}>Tarif négocié selon volume · Onboarding inclus</p>
        <Link href="/enterprise"><button style={{ padding: '14px 32px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Contacter notre équipe <ArrowRight size={16} /></button></Link>
      </section>
    </div>
  );
}
