import Link from 'next/link';
import { Building2, FileText, Clock, CheckCircle2, Download, ArrowLeft } from 'lucide-react';
import prisma from '../../../lib/db.js';

export async function generateMetadata({ params }) {
  const cerfa = await prisma.cerfaFormulaire.findUnique({
    where: { slug: params.slug }
  });

  if (!cerfa) {
    return {
      title: 'CERFA non trouvé',
    };
  }

  return {
    title: `CERFA ${cerfa.numero} - ${cerfa.nom} | PermitAI`,
    description: cerfa.description,
  };
}

export default async function CerfaDetailPage({ params }) {
  const cerfa = await prisma.cerfaFormulaire.findUnique({
    where: { slug: params.slug }
  });

  if (!cerfa) {
    return (
      <div className="min-h-screen bg-[#06060e] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[32px] font-medium text-[#f0ede8] mb-4">CERFA non trouvé</h1>
          <Link href="/cerfa">
            <button className="btn-primary">Voir tous les CERFA</button>
          </Link>
        </div>
      </div>
    );
  }

  const champsRequis = typeof cerfa.champsRequis === 'string' 
    ? JSON.parse(cerfa.champsRequis) 
    : cerfa.champsRequis || [];
  
  const piecesJointes = typeof cerfa.piecesJointes === 'string'
    ? JSON.parse(cerfa.piecesJointes)
    : cerfa.piecesJointes || [];

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/cerfa">
            <button className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Tous les CERFA
            </button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="badge-premium inline-block mb-6">CERFA {cerfa.numero}</div>
          <h1 className="hero-title mb-6">
            {cerfa.nom}
          </h1>
          <p className="hero-subtitle mb-12">{cerfa.description}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card-premium">
              <div className="text-[11px] uppercase tracking-wider text-[#3c3830] mb-2">Catégorie</div>
              <div className="text-[16px] text-[#f0ede8]">{cerfa.categorie}</div>
            </div>
            <div className="card-premium">
              <div className="text-[11px] uppercase tracking-wider text-[#3c3830] mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Délai d'instruction
              </div>
              <div className="text-[16px] text-[#f0ede8]">{cerfa.delaiInstruction}</div>
            </div>
          </div>

          {champsRequis && champsRequis.length > 0 && (
            <div className="card-premium mb-8">
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">Informations requises</h2>
              <div className="space-y-3">
                {champsRequis.map((champ, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#e8b420] flex-shrink-0 mt-0.5" />
                    <span className="text-[14px] text-[#8a857d] capitalize">
                      {champ.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {piecesJointes && piecesJointes.length > 0 && (
            <div className="card-premium mb-8">
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">Pièces à joindre</h2>
              <div className="space-y-3">
                {piecesJointes.map((piece, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#e8b420] flex-shrink-0 mt-0.5" />
                    <span className="text-[14px] text-[#8a857d] capitalize">
                      {piece.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card-premium bg-gradient-to-br from-[#14141f] to-[#0a0a14]">
            <h3 className="text-[18px] font-medium mb-4 text-[#f0ede8]">Générer ce CERFA automatiquement</h3>
            <p className="text-[14px] text-[#8a857d] mb-6">
              Créez un compte gratuit pour générer ce formulaire automatiquement avec l'aide de notre IA.
            </p>
            <Link href="/sign-up">
              <button className="btn-primary inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                Commencer gratuitement
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
