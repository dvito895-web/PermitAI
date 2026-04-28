import Link from 'next/link';

export const metadata = {
  title: 'Politique de cookies | PermitAI',
  description: 'Cookies utilisés par PermitAI : Clerk session et Plausible Analytics. Aucune publicité, aucun tracking tiers.',
};

export default function CookiesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', padding: '0 52px' }}>
        <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: '#f2efe9', textDecoration: 'none' }}>PermitAI</Link>
      </nav>
      <section style={{ padding: '80px 52px', maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 500, marginBottom: 24 }}>Politique de cookies</h1>
        <p style={{ fontSize: 13, color: '#8d887f', marginBottom: 28 }}>Dernière mise à jour : juin 2025</p>

        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginTop: 36, marginBottom: 14 }}>Cookies utilisés</h2>
        <p style={{ fontSize: 14, color: '#8d887f', marginBottom: 14 }}>PermitAI utilise un nombre minimal de cookies, strictement nécessaires au fonctionnement du service.</p>

        <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 24, marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e8b420', marginBottom: 6 }}>Clerk Session (essentiel)</div>
          <div style={{ fontSize: 13, color: '#8d887f' }}>Cookie d'authentification permettant de garder votre session active. Strictement nécessaire — pas de consentement requis. Durée : 30 jours.</div>
        </div>

        <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 12, padding: 24, marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e8b420', marginBottom: 6 }}>Plausible Analytics (anonymisé)</div>
          <div style={{ fontSize: 13, color: '#8d887f' }}>Mesure d'audience anonymisée et conforme RGPD sans cookie. Aucune donnée personnelle, aucun tracking cross-site.</div>
        </div>

        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginTop: 36, marginBottom: 14 }}>Ce que nous n'utilisons pas</h2>
        <ul style={{ fontSize: 14, color: '#8d887f', paddingLeft: 20 }}>
          <li>Aucun cookie publicitaire</li>
          <li>Aucun tracker Meta / Google Ads</li>
          <li>Aucune revente de données</li>
          <li>Aucun partage avec des courtiers en données</li>
        </ul>

        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginTop: 36, marginBottom: 14 }}>Vos droits</h2>
        <p style={{ fontSize: 14, color: '#8d887f' }}>Vous pouvez supprimer les cookies depuis votre navigateur à tout moment. Cela vous déconnectera mais n'affectera pas l'accès au service. Pour toute question : <a href="mailto:contact@permitai.eu" style={{ color: '#e8b420' }}>contact@permitai.eu</a>.</p>
      </section>
    </div>
  );
}
