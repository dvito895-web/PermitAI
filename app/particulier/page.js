import Link from 'next/link';
import { ArrowRight, MapPin, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'PermitAI pour Particuliers — Votre permis de construire sans avocat',
  description: 'Analysez votre PLU, remplissez le CERFA, déposez en mairie. Sans avocat, sans architecte. À partir de 49€/mois.',
};

export default function ParticulierPage() {
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
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'rgba(232,180,32,.1)', border: '0.5px solid rgba(232,180,32,.3)', fontSize: 11, color: '#e8b420', marginBottom: 20, fontWeight: 500 }}>Pour particuliers</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 20 }}>
            Votre permis<br />de construire<br /><em style={{ color: '#e8b420' }}>sans avocat.</em>
          </h1>
          <p style={{ fontSize: 16, color: '#8d887f', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Analyse PLU, remplissage CERFA et dépôt en mairie. Sans architecte pour les projets ≤ 150 m². Sans avocat pour les recours.
          </p>
          <Link href="/sign-up"><button style={{ padding: '14px 28px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Démarrer gratuitement <ArrowRight size={16} /></button></Link>
        </div>
      </section>

      <section style={{ padding: '60px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { n: '1', icon: MapPin, title: 'Analyse PLU', desc: 'Tapez l\'adresse. L\'IA vérifie toutes les règles d\'urbanisme.' },
            { n: '2', icon: FileText, title: 'CERFA pré-rempli', desc: 'Le formulaire officiel est généré automatiquement.' },
            { n: '3', icon: CheckCircle2, title: 'Dépôt mairie', desc: 'PLAT\'AU pour les mairies raccordées, sinon LRAR.' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, background: '#a07820', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontWeight: 600 }}>{s.n}</div>
                  <Icon size={22} color="#e8b420" />
                </div>
                <div style={{ fontSize: 17, fontWeight: 500, color: '#f2efe9', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#5a5650', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: '80px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, textAlign: 'center', marginBottom: 32 }}>Comparatif des coûts</h2>
          <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 14, overflow: 'hidden' }}>
            {[
              ['Architecte (étude PLU)', '800 – 2 000 €', '#ef4444'],
              ['Avocat en urbanisme', '1 500 – 4 000 €', '#ef4444'],
              ['PermitAI Starter', '49 €/mois (sans engagement)', '#4ade80'],
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '18px 24px', borderBottom: i < 2 ? '0.5px solid #1c1c2a' : 'none' }}>
                <span style={{ fontSize: 14, color: '#f2efe9' }}>{row[0]}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: row[2], textAlign: 'right' }}>{row[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 52px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, marginBottom: 14 }}>1 analyse offerte</h2>
        <p style={{ fontSize: 14, color: '#8d887f', marginBottom: 28 }}>Sans carte bancaire · résiliation en 1 clic</p>
        <Link href="/sign-up"><button style={{ padding: '14px 32px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Tester maintenant <ArrowRight size={16} /></button></Link>
      </section>
    </div>
  );
}
