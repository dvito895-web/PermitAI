'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ARTICLES = {
  'analyser-plu': {
    title: 'Comment analyser son PLU en 3 minutes',
    description: 'Guide complet pour comprendre votre Plan Local d\'Urbanisme et vérifier la faisabilité de votre projet de construction.',
    date: '15 janvier 2025',
    readTime: '5 min',
    category: 'Guide PLU',
    content: [
      {
        type: 'intro',
        text: 'Le Plan Local d\'Urbanisme (PLU) est le document de référence qui définit les règles de construction dans chaque commune de France. Avant tout projet de travaux, l\'analyser est indispensable — mais souvent complexe. Voici comment le faire en 3 minutes.',
      },
      {
        type: 'h2',
        text: 'Qu\'est-ce qu\'un PLU ?',
      },
      {
        type: 'p',
        text: 'Le PLU est adopté par la commune et approuvé par le préfet. Il divise le territoire en zones (UA, UB, UC, N, A...) et définit pour chaque zone les règles applicables : hauteur maximale des constructions, emprise au sol, distances par rapport aux limites séparatives, aspect extérieur, etc.',
      },
      {
        type: 'h2',
        text: 'Les 5 règles à vérifier en priorité',
      },
      {
        type: 'list',
        items: [
          'La zone PLU de votre parcelle (constructible ou non ?)',
          'La hauteur maximale autorisée',
          'L\'emprise au sol (pourcentage de la parcelle que vous pouvez couvrir)',
          'Les reculs par rapport aux voies et limites séparatives',
          'Les règles d\'aspect extérieur (matériaux, couleurs)',
        ],
      },
      {
        type: 'h2',
        text: 'Comment accéder au PLU de votre commune ?',
      },
      {
        type: 'p',
        text: 'Vous pouvez consulter le PLU de votre commune sur le Géoportail de l\'Urbanisme (geoportail-urbanisme.gouv.fr), plateforme officielle du gouvernement. Cependant, les documents PLU sont souvent complexes — plusieurs centaines de pages de règlement difficiles à interpréter.',
      },
      {
        type: 'highlight',
        text: 'PermitAI indexe les PLU de 36 000 communes et les analyse automatiquement pour votre adresse. Résultat en 3 minutes, règles exactes citées, score de confiance inclus.',
      },
      {
        type: 'h2',
        text: 'Les erreurs fréquentes qui entraînent un refus',
      },
      {
        type: 'list',
        items: [
          'Ne pas vérifier la zone PLU avant de déposer (certaines zones sont inconstructibles)',
          'Dépasser la hauteur maximale de quelques centimètres',
          'Oublier les règles de recul par rapport aux limites séparatives',
          'Ne pas respecter les règles d\'aspect extérieur (couleur de façade, type de toiture)',
          'Sous-estimer l\'emprise au sol avec l\'extension prévue',
        ],
      },
      {
        type: 'h2',
        text: 'La méthode PermitAI en 3 étapes',
      },
      {
        type: 'steps',
        items: [
          ['Entrez votre adresse', 'PermitAI identifie votre parcelle et la zone PLU applicable en quelques secondes.'],
          ['Décrivez votre projet', 'En langage naturel : "extension de 40m² plain-pied sur le côté de ma maison".'],
          ['Obtenez votre analyse', 'Toutes les règles applicables, un verdict de faisabilité et le CERFA recommandé.'],
        ],
      },
    ],
    related: ['cerfa-permis-construire', 'delais-instruction', 'extension-maison-regles'],
  },
  'cerfa-permis-construire': {
    title: 'CERFA 13406 : remplir votre permis de construire automatiquement',
    description: 'Guide complet du formulaire CERFA 13406 pour le permis de construire. Remplissage automatique avec PermitAI.',
    date: '22 janvier 2025',
    readTime: '7 min',
    category: 'CERFA',
    content: [
      {
        type: 'intro',
        text: 'Le formulaire CERFA 13406 est le document officiel pour déposer un permis de construire une maison individuelle. Voici tout ce que vous devez savoir pour le remplir correctement — ou le faire remplir automatiquement.',
      },
      {
        type: 'h2',
        text: 'Qu\'est-ce que le CERFA 13406 ?',
      },
      {
        type: 'p',
        text: 'Le CERFA 13406*08 (Permis de construire pour une maison individuelle et/ou ses annexes) est le formulaire obligatoire pour tout projet de construction ou d\'extension de maison individuelle. Il est accompagné de plusieurs pièces graphiques obligatoires.',
      },
      {
        type: 'h2',
        text: 'Les pièces obligatoires avec le CERFA 13406',
      },
      {
        type: 'list',
        items: [
          'PC1 : Plan de situation du terrain dans la commune',
          'PC2 : Plan de masse des constructions (vue de dessus)',
          'PC3 : Plan en coupe du terrain et de la construction',
          'PC4 : Notice descriptive du projet',
          'PC5 : Plans des façades et des toitures',
          'PC6 : Document graphique d\'insertion dans l\'environnement',
          'PC7 : Photographies de la situation actuelle',
        ],
      },
      {
        type: 'highlight',
        text: 'PermitAI génère automatiquement le CERFA 13406 pré-rempli avec vos données cadastrales et la notice descriptive IA. Vous n\'avez qu\'à vérifier et déposer.',
      },
      {
        type: 'h2',
        text: 'Délais d\'instruction du permis de construire',
      },
      {
        type: 'p',
        text: 'Le délai d\'instruction d\'un permis de construire pour une maison individuelle est de 2 mois à compter de la réception d\'un dossier complet. Si la mairie ne répond pas dans ce délai, c\'est un accord tacite.',
      },
    ],
    related: ['analyser-plu', 'delais-instruction'],
  },
  'delais-instruction': {
    title: 'Délais d\'instruction du permis de construire : tout savoir',
    description: 'Délais légaux, accord tacite, recours — tout ce que vous devez savoir sur les délais d\'instruction de votre permis de construire.',
    date: '5 février 2025',
    readTime: '6 min',
    category: 'Juridique',
    content: [
      {
        type: 'intro',
        text: 'Les délais d\'instruction sont une étape cruciale de votre projet. Mal maîtrisés, ils peuvent retarder vos travaux de plusieurs mois. Voici ce que dit la loi et comment PermitAI vous aide à les surveiller.',
      },
      {
        type: 'h2',
        text: 'Les délais légaux par type de demande',
      },
      {
        type: 'list',
        items: [
          'Déclaration préalable : 1 mois',
          'Permis de construire maison individuelle : 2 mois',
          'Permis de construire autre : 3 mois',
          'Permis de construire en secteur ABF : 4 mois',
          'Permis d\'aménager : 3 mois',
        ],
      },
      {
        type: 'h2',
        text: 'L\'accord tacite : votre arme si la mairie ne répond pas',
      },
      {
        type: 'p',
        text: 'Si la mairie ne vous répond pas dans le délai légal, votre permis est tacitement accordé. C\'est un droit fondamental souvent méconnu. Vous pouvez alors demander à la mairie un certificat attestant de l\'absence d\'opposition.',
      },
      {
        type: 'highlight',
        text: 'PermitAI surveille automatiquement vos délais et vous alerte avant l\'expiration. En cas de dépassement, vous recevez immédiatement les instructions pour faire valoir votre accord tacite.',
      },
    ],
    related: ['cerfa-permis-construire', 'analyser-plu'],
  },
  'extension-maison-regles': {
    title: 'Extension maison : règles PLU à vérifier avant de commencer',
    description: 'Quelles règles PLU s\'appliquent à votre extension ? Hauteur, emprise, reculs — tout ce qu\'il faut vérifier.',
    date: '12 février 2025',
    readTime: '6 min',
    category: 'Extensions',
    content: [
      {
        type: 'intro',
        text: 'Avant de déposer un permis pour votre extension, vérifier votre PLU est indispensable. 30% des dossiers sont refusés au 1er dépôt — souvent pour des raisons évitables en 3 minutes d\'analyse.',
      },
      {
        type: 'h2',
        text: 'Permis ou déclaration préalable ?',
      },
      {
        type: 'list',
        items: [
          'Extension < 20m² : déclaration préalable',
          'Extension 20m² à 40m² : déclaration préalable (si surface totale < 150m²)',
          'Extension > 40m² : permis de construire obligatoire',
          'Si la surface totale dépasse 150m² : architecte obligatoire',
        ],
      },
      {
        type: 'h2',
        text: 'Les 3 erreurs qui entraînent un refus',
      },
      {
        type: 'list',
        items: [
          'Dépasser la hauteur maximale (souvent 9m en zone UB)',
          'Ne pas respecter le recul par rapport aux limites séparatives (3 à 5m)',
          'Dépasser l\'emprise au sol autorisée (30 à 40% en zone pavillonnaire)',
        ],
      },
      {
        type: 'highlight',
        text: 'PermitAI détecte ces erreurs avant que vous ne déposiez. 1 analyse = 3 minutes = certitude que votre projet est conforme.',
      },
    ],
    related: ['analyser-plu', 'cerfa-permis-construire'],
  },
  'piscine-declaration-permis': {
    title: 'Piscine : déclaration préalable ou permis de construire ?',
    description: 'Faut-il une déclaration préalable ou un permis de construire pour votre piscine ? Les règles selon la taille.',
    date: '20 février 2025',
    readTime: '4 min',
    category: 'Piscines',
    content: [
      {
        type: 'intro',
        text: 'La construction d\'une piscine est soumise à autorisation d\'urbanisme selon sa taille et son emplacement. Voici les règles exactes.',
      },
      {
        type: 'h2',
        text: 'Selon la taille de la piscine',
      },
      {
        type: 'list',
        items: [
          'Piscine < 10m² : aucune formalité',
          'Piscine 10 à 100m² : déclaration préalable',
          'Piscine > 100m² : permis de construire',
          'Piscine couverte ou abri > 1,80m : permis de construire quelle que soit la taille',
        ],
      },
      {
        type: 'highlight',
        text: 'PermitAI vérifie automatiquement les règles PLU de votre commune pour votre piscine : distance par rapport aux limites, zone constructible, règles spécifiques locales.',
      },
    ],
    related: ['analyser-plu', 'cerfa-permis-construire'],
  },
};

const ALL_ARTICLES = Object.entries(ARTICLES).map(([slug, data]) => ({
  slug,
  title: data.title,
  description: data.description,
  date: data.date,
  readTime: data.readTime,
  category: data.category,
}));

function renderContent(content) {
  return content.map((block, i) => {
    switch (block.type) {
      case 'intro':
        return <p key={i} style={{ fontSize: 16, color: '#8d887f', lineHeight: 1.8, fontWeight: 300, marginBottom: 32, borderLeft: '2px solid rgba(160,120,32,.4)', paddingLeft: 16 }}>{block.text}</p>;
      case 'h2':
        return <h2 key={i} style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: '#f2efe9', letterSpacing: -.3, marginTop: 36, marginBottom: 14 }}>{block.text}</h2>;
      case 'p':
        return <p key={i} style={{ fontSize: 14, color: '#8d887f', lineHeight: 1.78, fontWeight: 300, marginBottom: 20 }}>{block.text}</p>;
      case 'list':
        return (
          <ul key={i} style={{ marginBottom: 20, paddingLeft: 0, listStyle: 'none' }}>
            {block.items.map((item, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: '0.5px solid #111118', fontSize: 13, color: '#8d887f' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#a07820', flexShrink: 0, marginTop: 6 }} />
                {item}
              </li>
            ))}
          </ul>
        );
      case 'highlight':
        return (
          <div key={i} style={{ padding: '16px 20px', background: 'linear-gradient(90deg,rgba(160,120,32,.08),rgba(160,120,32,.03))', border: '0.5px solid rgba(160,120,32,.22)', borderLeft: '2px solid #a07820', borderRadius: '0 10px 10px 0', marginBottom: 24, fontSize: 13, color: '#c4960a', lineHeight: 1.7 }}>
            {block.text}
          </div>
        );
      case 'steps':
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            {block.items.map(([title, desc], j) => (
              <div key={j} style={{ background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 10, padding: 16 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: 'rgba(160,120,32,.3)', fontWeight: 500, marginBottom: 8 }}>0{j + 1}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#f2efe9', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 11, color: '#5a5650', lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  });
}

export default function BlogArticlePage({ params }) {
  const article = ARTICLES[params.slug];
  if (!article) return <div>Article non trouvé</div>;

  const relatedArticles = article.related?.map(slug => ARTICLES[slug]).filter(Boolean) || [];

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: '#a07820', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.2" /><rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white" /></svg>
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: '#f2efe9' }}>PermitAI</span>
          </Link>
          <Link href="/blog" style={{ fontSize: 12, color: '#5a5650', textDecoration: 'none' }}>← Tous les articles</Link>
        </div>
      </nav>

      {/* ARTICLE */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 52px' }}>

        {/* META */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(160,120,32,.08)', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 20, color: '#a07820', fontWeight: 600 }}>{article.category}</span>
          <span style={{ fontSize: 11, color: '#3e3a34' }}>{article.date}</span>
          <span style={{ fontSize: 11, color: '#3e3a34' }}>· {article.readTime} de lecture</span>
        </div>

        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, color: '#f2efe9', letterSpacing: -.8, lineHeight: 1.1, marginBottom: 32 }}>
          {article.title}
        </h1>

        {/* CONTENU */}
        {renderContent(article.content)}

        {/* CTA INLINE */}
        <div style={{ margin: '40px 0', padding: '28px 28px', background: 'linear-gradient(135deg,#0c0c1c,rgba(160,120,32,.05))', border: '0.5px solid rgba(160,120,32,.15)', borderRadius: 14 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, color: '#f2efe9', marginBottom: 8 }}>Essayez PermitAI gratuitement</h3>
          <p style={{ fontSize: 13, color: '#3e3a34', marginBottom: 16, fontWeight: 300 }}>1 analyse PLU offerte · Résultat en 3 minutes · Sans carte bancaire</p>
          <Link href="/analyse">
            <button style={{ padding: '11px 22px', background: 'linear-gradient(90deg,#a07820,#c4960a)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              Analyser mon terrain gratuitement <ArrowRight size={13} />
            </button>
          </Link>
        </div>

        {/* ARTICLES LIÉS */}
        {relatedArticles.length > 0 && (
          <div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: '#f2efe9', marginBottom: 16 }}>Articles liés</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {relatedArticles.map((a, i) => (
                <Link key={i} href={`/blog/${Object.keys(ARTICLES).find(k => ARTICLES[k] === a)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#09090f', border: '0.5px solid #1c1c2a', borderRadius: 10, textDecoration: 'none', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#f2efe9', fontWeight: 400, marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: '#3e3a34' }}>{a.readTime} · {a.category}</div>
                  </div>
                  <ArrowRight size={13} color="#a07820" style={{ flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER MINI */}
      <div style={{ borderTop: '0.5px solid #111118', padding: '20px 52px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>© 2025 PermitAI</span>
        <span style={{ fontSize: 11, color: '#1e1e28' }}>contact@permitai.eu</span>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const article = ARTICLES[params.slug];
  if (!article) return {};
  return {
    title: `${article.title} | PermitAI`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://permitai.eu/blog/${params.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(ARTICLES).map(slug => ({ slug }));
}