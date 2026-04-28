import Link from 'next/link';
import { Building2, Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog Urbanisme & Permis de Construire | PermitAI',
  description: 'Guides, conseils et actualités sur les permis de construire, PLU, CERFA et réglementations d\'urbanisme en France.',
};

const ARTICLES = [
  {
    slug: 'permis-construire-extension-maison',
    title: 'Permis de construire extension maison : guide complet 2025',
    excerpt: 'Tout savoir sur l\'extension de maison : seuils CERFA, surface plancher, recours à un architecte, délais d\'instruction.',
    date: '2025-06-12',
    readTime: '10 min',
    category: 'Guide',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
  },
  {
    slug: 'plu-par-commune-france',
    title: 'Comprendre les PLU par commune en France : 36 000 documents',
    excerpt: 'Comment les PLU varient d\'une commune à l\'autre, où les consulter, comment lire un règlement de zone.',
    date: '2025-06-08',
    readTime: '9 min',
    category: 'Guide PLU',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  },
  {
    slug: 'agent-immobilier-plu-compromis',
    title: 'Agent immobilier : vérifier le PLU avant chaque compromis',
    excerpt: 'Pourquoi tout agent immo doit vérifier le PLU avant signature : sécurisation des transactions et préservation des commissions.',
    date: '2025-06-05',
    readTime: '7 min',
    category: 'Pro',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  },
  {
    slug: 'comment-lire-un-plu',
    title: 'Comment lire et comprendre un Plan Local d\'Urbanisme (PLU)',
    excerpt: 'Décryptage complet des zones, articles et règles d\'un PLU. Guide pratique pour les particuliers et professionnels.',
    date: '2025-01-15',
    readTime: '8 min',
    category: 'Guide PLU',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  },
  {
    slug: 'cerfa-13406-guide-complet',
    title: 'CERFA 13406 : le guide complet du permis de construire maison individuelle',
    excerpt: 'Tous les champs à remplir, pièces à joindre et erreurs à éviter pour votre CERFA 13406. Procédure 2025 mise à jour.',
    date: '2025-01-10',
    readTime: '12 min',
    category: 'CERFA',
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80',
  },
  {
    slug: 'delais-instruction-permis-construire',
    title: 'Délais d\'instruction du permis de construire : tout savoir en 2025',
    excerpt: 'Combien de temps pour obtenir un permis de construire ? Délais légaux, accord tacite, et recours en cas de dépassement.',
    date: '2025-01-05',
    readTime: '6 min',
    category: 'Réglementation',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
  },
  {
    slug: 'depot-numerique-plateau',
    title: 'PLAT\'AU : comment déposer son permis de construire en ligne',
    excerpt: 'La plateforme nationale PLAT\'AU permet le dépôt numérique de votre dossier d\'urbanisme. Mode d\'emploi et avantages.',
    date: '2024-12-20',
    readTime: '7 min',
    category: 'Démarches',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    slug: 'refus-permis-construire-recours',
    title: 'Refus de permis de construire : recours et solutions 2025',
    excerpt: 'Recours gracieux, recours contentieux, délais légaux. Que faire après un refus de permis pour maximiser vos chances.',
    date: '2024-12-15',
    readTime: '8 min',
    category: 'Recours',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
  },
  {
    slug: 'refus-permis-construire-que-faire',
    title: 'Refus de permis de construire : que faire ? Recours et solutions',
    excerpt: 'Votre permis a été refusé ? Découvrez les recours possibles, les délais et comment maximiser vos chances d\'obtenir une décision favorable.',
    date: '2024-12-15',
    readTime: '10 min',
    category: 'Contentieux',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/">
            <button className="btn-secondary">Accueil</button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="hero-title mb-6 text-center">
            Blog <span className="text-[#e8b420] italic">Urbanisme</span>
          </h1>
          <p className="hero-subtitle text-center mb-16 max-w-2xl mx-auto">
            Guides pratiques, actualités PLU et conseils pour réussir vos projets de construction
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICLES.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`}>
                <div className="card-premium cursor-pointer hover:border-[#a07820] group h-full flex flex-col">
                  <div className="aspect-video bg-[#14141f] rounded-lg mb-4 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="badge-premium inline-block mb-3">{article.category}</div>
                  
                  <h3 className="text-[16px] font-medium mb-3 text-[#f0ede8] line-clamp-2">{article.title}</h3>
                  
                  <p className="text-[13px] text-[#8a857d] mb-4 line-clamp-2 flex-grow">{article.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-[12px] text-[#8a857d] pt-4 border-t border-[#1c1c2a]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {article.readTime}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[#e8b420] text-[13px] font-medium">
                    Lire l'article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
