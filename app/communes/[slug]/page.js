import Link from 'next/link';
import { Building2, MapPin, FileText, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import prisma from '../../../lib/db';

export async function generateMetadata({ params }) {
  const commune = await prisma.pluDocument.findFirst({
    where: {
      communeNom: {
        contains: params.slug,
        mode: 'insensitive',
      },
    },
  });

  if (!commune) {
    return {
      title: 'Commune non trouvée | PermitAI',
    };
  }

  return {
    title: `PLU ${commune.communeNom} — Analyse permis de construire | PermitAI`,
    description: `Analysez le Plan Local d'Urbanisme de ${commune.communeNom} en 3 minutes. ${commune.nbChunks || 0} règles indexées. Conformité, hauteur, emprise au sol vérifiées par IA.`,
    keywords: [`PLU ${commune.communeNom}`, `permis de construire ${commune.communeNom}`, `urbanisme ${commune.communeNom}`, 'analyse PLU', 'CERFA'],
    openGraph: {
      title: `PLU ${commune.communeNom} — PermitAI`,
      description: `Analyse PLU instantanée pour ${commune.communeNom}. ${commune.nbChunks || 0} règles indexées.`,
      type: 'article',
    },
  };
}

export default async function CommunePage({ params }) {
  const commune = await prisma.pluDocument.findFirst({
    where: {
      communeNom: {
        contains: params.slug,
        mode: 'insensitive',
      },
    },
  });

  if (!commune) {
    notFound();
  }

  const chunksCount = await prisma.pluChunk.count({
    where: { communeCode: commune.communeCode },
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Service urbanisme ${commune.communeNom}`,
    description: `Analyse du PLU de ${commune.communeNom} et accompagnement permis de construire`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: commune.communeNom,
      addressCountry: 'FR',
    },
    areaServed: commune.communeNom,
    url: `https://permitai.eu/communes/${params.slug}`,
  };

  return (
    <div className="min-h-screen bg-[#06060e]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/communes">
            <button className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Toutes les communes
            </button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="badge-premium inline-block mb-6">
            <MapPin className="w-4 h-4 inline-block mr-2" />
            Code INSEE : {commune.communeCode}
          </div>
          
          <h1 className="hero-title mb-6">
            PLU de <span className="text-[#e8b420] italic">{commune.communeNom}</span>
          </h1>
          
          <p className="hero-subtitle mb-12">
            Plan Local d'Urbanisme indexé et analysable en 3 minutes par intelligence artificielle
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-premium text-center">
              <FileText className="w-8 h-8 text-[#e8b420] mx-auto mb-3" />
              <div className="text-[24px] font-medium text-[#e8b420] mb-2">{chunksCount}</div>
              <div className="text-[13px] text-[#8a857d]">Règles PLU indexées</div>
            </div>
            <div className="card-premium text-center">
              <div className="text-[32px] mb-3">✓</div>
              <div className="text-[24px] font-medium text-[#4ade80] mb-2">{commune.statut === 'indexed' ? 'Indexé' : 'En cours'}</div>
              <div className="text-[13px] text-[#8a857d]">Statut PLU</div>
            </div>
            <div className="card-premium text-center">
              <div className="text-[32px] mb-3">⚡</div>
              <div className="text-[24px] font-medium text-[#e8b420] mb-2">3 min</div>
              <div className="text-[13px] text-[#8a857d]">Temps d'analyse</div>
            </div>
          </div>

          <div className="card-premium mb-8">
            <h2 className="text-[20px] font-medium text-[#f0ede8] mb-4">Que contient le PLU de {commune.communeNom} ?</h2>
            <div className="space-y-3 text-[14px] text-[#8a857d]">
              <p>Le Plan Local d'Urbanisme de {commune.communeNom} définit les règles de construction applicables sur l'ensemble du territoire communal.</p>
              <p>PermitAI a indexé {chunksCount} règles issues du PLU officiel, couvrant :</p>
              <ul className="ml-6 space-y-2">
                <li>• Zonage du territoire (zones U, AU, A, N)</li>
                <li>• Règles d'implantation des constructions</li>
                <li>• Hauteurs maximales autorisées</li>
                <li>• Emprise au sol et coefficient d'occupation</li>
                <li>• Aspect extérieur des bâtiments</li>
                <li>• Stationnement et espaces verts</li>
              </ul>
            </div>
          </div>

          <div className="card-premium mb-8">
            <h2 className="text-[20px] font-medium text-[#f0ede8] mb-4">Comment déposer un permis à {commune.communeNom} ?</h2>
            <ol className="ml-6 space-y-3 text-[14px] text-[#8a857d] list-decimal">
              <li><strong className="text-[#f0ede8]">Analysez votre PLU</strong> avec PermitAI : vérification automatique de la conformité.</li>
              <li><strong className="text-[#f0ede8]">Remplissez le CERFA approprié</strong> (13406 pour permis de construire, 13703 pour DP).</li>
              <li><strong className="text-[#f0ede8]">Joignez les pièces obligatoires</strong> : plans, photos, notice descriptive.</li>
              <li><strong className="text-[#f0ede8]">Déposez en mairie</strong> : PLAT'AU si {commune.communeNom} est raccordée, sinon LRAR La Poste.</li>
              <li><strong className="text-[#f0ede8]">Suivez l'instruction</strong> : 1 mois (DP) ou 2-3 mois (PC) selon la zone.</li>
            </ol>
          </div>

          <div className="card-premium bg-gradient-to-br from-[#14141f] to-[#0a0a14]">
            <h3 className="text-[20px] font-medium mb-4 text-[#f0ede8]">Analysez votre projet à {commune.communeNom}</h3>
            <p className="text-[14px] text-[#8a857d] mb-6">
              Entrez l'adresse exacte de votre terrain pour obtenir une analyse complète du PLU applicable, avec citations des articles officiels.
            </p>
            <Link href={`/analyse?adresse=${encodeURIComponent(commune.communeNom)}`}>
              <button className="btn-primary">Analyser mon terrain à {commune.communeNom}</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
