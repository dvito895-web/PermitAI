import Link from 'next/link';
import { ArrowRight, Code, Zap, Layers } from 'lucide-react';

export const metadata = {
  title: 'PermitAI pour Architectes — Analysez 50 PLU en 1 heure',
  description: 'API dédiée pour cabinets d\'architectes. Workflow accéléré, analyses parallèles, intégration sur mesure.',
};

export default function ArchitectePage() {
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
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'rgba(192,132,252,.1)', border: '0.5px solid rgba(192,132,252,.3)', fontSize: 11, color: '#c084fc', marginBottom: 20, fontWeight: 500 }}>Pour architectes & cabinets</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 20 }}>
            Analysez le PLU<br />de vos 50 projets<br /><em style={{ color: '#e8b420' }}>en 1 heure.</em>
          </h1>
          <p style={{ fontSize: 16, color: '#8d887f', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Une API dédiée, des analyses parallèles et un workflow pensé pour les cabinets qui gèrent des dizaines de dossiers simultanés.
          </p>
          <Link href="/sign-up"><button style={{ padding: '14px 28px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Démarrer <ArrowRight size={16} /></button></Link>
        </div>
      </section>

      <section style={{ padding: '60px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div style={{ background: '#0c0c18', border: '0.5px solid rgba(239,68,68,.2)', borderRadius: 14, padding: 30 }}>
            <div style={{ fontSize: 11, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12, fontWeight: 600 }}>Avant</div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Process traditionnel</h3>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, color: '#8d887f', lineHeight: 2 }}>
              <li>– 2-3h de recherche PLU manuelle par projet</li>
              <li>– Erreurs de lecture des règlements</li>
              <li>– Pas de version unifiée pour l'équipe</li>
              <li>– Mises à jour PLU manquées</li>
            </ul>
          </div>
          <div style={{ background: '#0c0c18', border: '0.5px solid rgba(74,222,128,.25)', borderRadius: 14, padding: 30 }}>
            <div style={{ fontSize: 11, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12, fontWeight: 600 }}>Avec PermitAI</div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Process accéléré</h3>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, color: '#f2efe9', lineHeight: 2 }}>
              <li>+ 3 min par analyse PLU</li>
              <li>+ Citations exactes des articles</li>
              <li>+ API REST pour vos outils</li>
              <li>+ Alertes auto révisions PLU</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 52px', borderTop: '0.5px solid #1c1c2a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: Code, title: 'API REST dédiée', desc: 'Intégrez l\'analyse PLU dans vos outils internes (Revit, ArchiCAD, ERP).' },
            { icon: Zap, title: 'Analyses parallèles', desc: 'Lancez 100 analyses simultanément, recevez les résultats en 5 min.' },
            { icon: Layers, title: 'Multi-projets', desc: 'Organisez par client, par chantier, exportez en CSV/PDF.' },
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
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, marginBottom: 14 }}>Pour cabinets exigeants</h2>
        <p style={{ fontSize: 14, color: '#8d887f', marginBottom: 28 }}>Plan Cabinet à partir de 499 €/mois — utilisateurs illimités</p>
        <Link href="/sign-up"><button style={{ padding: '14px 32px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Démarrer maintenant <ArrowRight size={16} /></button></Link>
      </section>
    </div>
  );
}
