import Link from 'next/link';
import { Building2, FileText, Clock, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getCerfaBySlug } from '../../../lib/cerfaList';

export async function generateMetadata({ params }) {
  const cerfa = getCerfaBySlug(params.slug);
  
  if (!cerfa) {
    return {
      title: 'CERFA non trouvé | PermitAI',
    };
  }

  return {
    title: `CERFA ${cerfa.numero} - ${cerfa.nom} | PermitAI`,
    description: cerfa.description,
  };
}

export default function CerfaDetailPage({ params }) {
  const cerfa = getCerfaBySlug(params.slug);

  if (!cerfa) {
    notFound();
  }

  const guide = cerfa.guide || {};

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
          {/* Header */}
          <div className="badge-premium inline-block mb-6">
            CERFA {cerfa.numero}
          </div>
          
          <h1 className="hero-title mb-6">{cerfa.nom}</h1>
          
          <p className="hero-subtitle mb-8">{cerfa.description}</p>

          {/* KPIs */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="card-premium text-center">
              <FileText className="w-6 h-6 text-[#e8b420] mx-auto mb-2" />
              <div className="text-[13px] text-[#8a857d] mb-1">Catégorie</div>
              <div className="text-[14px] font-medium text-[#f0ede8]">{cerfa.categorie}</div>
            </div>
            <div className="card-premium text-center">
              <Clock className="w-6 h-6 text-[#e8b420] mx-auto mb-2" />
              <div className="text-[13px] text-[#8a857d] mb-1">Délai d'instruction</div>
              <div className="text-[14px] font-medium text-[#f0ede8]">{cerfa.delaiInstruction}</div>
            </div>
            <div className="card-premium text-center">
              <CheckCircle2 className="w-6 h-6 text-[#4ade80] mx-auto mb-2" />
              <div className="text-[13px] text-[#8a857d] mb-1">Pièces requises</div>
              <div className="text-[14px] font-medium text-[#f0ede8]">{cerfa.piecesJointes.length}</div>
            </div>
          </div>

          {/* Introduction */}
          {guide.introduction && (
            <div className="card-premium mb-8">
              <h2 className="text-[20px] font-medium text-[#f0ede8] mb-4">Introduction</h2>
              <p className="text-[14px] text-[#8a857d] leading-relaxed">{guide.introduction}</p>
            </div>
          )}

          {/* Sections du formulaire */}
          {guide.sections && guide.sections.length > 0 && (
            <div className="card-premium mb-8">
              <h2 className="text-[20px] font-medium text-[#f0ede8] mb-6">Sections à remplir</h2>
              <div className="space-y-6">
                {guide.sections.map((section, idx) => (
                  <div key={idx} className="border-l-2 border-[#a07820] pl-4">
                    <h3 className="text-[16px] font-medium text-[#f0ede8] mb-2">{section.titre}</h3>
                    <p className="text-[13px] text-[#8a857d] mb-4">{section.description}</p>
                    <div className="space-y-2">
                      {section.champs.map((champ, cidx) => (
                        <div key={cidx} className="flex items-start gap-3 bg-[#0e0e1a] rounded-lg p-3">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${champ.requis ? 'text-[#e8b420]' : 'text-[#3e3a34]'}`} />
                          <div className="flex-1">
                            <div className="text-[13px] font-medium text-[#f0ede8] mb-1">
                              {champ.nom}
                              {champ.requis && <span className="text-[#e8b420] ml-1">*</span>}
                            </div>
                            <div className="text-[12px] text-[#8a857d]">{champ.aide}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pièces jointes */}
          {guide.piecesMajeures && guide.piecesMajeures.length > 0 && (
            <div className="card-premium mb-8">
              <h2 className="text-[20px] font-medium text-[#f0ede8] mb-6">Pièces jointes obligatoires</h2>
              <div className="space-y-3">
                {guide.piecesMajeures.map((piece, idx) => (
                  <div key={idx} className="bg-[#0e0e1a] border border-[#1c1c2a] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="badge-premium text-[11px]">{piece.code}</div>
                      <div className="text-[14px] font-medium text-[#f0ede8]">{piece.nom}</div>
                    </div>
                    <p className="text-[13px] text-[#8a857d]">{piece.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Erreurs fréquentes */}
          {guide.erreursFrequentes && guide.erreursFrequentes.length > 0 && (
            <div className="card-premium mb-8 bg-[#ef444422] border-[#ef4444]">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                <h2 className="text-[18px] font-medium text-[#f0ede8]">Erreurs fréquentes à éviter</h2>
              </div>
              <ul className="space-y-2">
                {guide.erreursFrequentes.map((erreur, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[13px] text-[#8a857d]">
                    <span className="text-[#ef4444] mt-1">•</span>
                    <span>{erreur}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Délais et recours */}
          {guide.delaisEtRecours && (
            <div className="card-premium mb-8">
              <h2 className="text-[20px] font-medium text-[#f0ede8] mb-4">Délais et procédures</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(guide.delaisEtRecours).map(([key, value]) => (
                  <div key={key} className="bg-[#0e0e1a] rounded-lg p-4">
                    <div className="text-[11px] text-[#8a857d] uppercase tracking-wide mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-[13px] text-[#f0ede8]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="card-premium bg-gradient-to-br from-[#14141f] to-[#0a0a14]">
            <h3 className="text-[20px] font-medium text-[#f0ede8] mb-4">Générez votre CERFA {cerfa.numero} avec PermitAI</h3>
            <p className="text-[14px] text-[#8a857d] mb-6">
              Pré-remplissage automatique, vérification PLU, génération PDF officiel
            </p>
            <div className="flex gap-3">
              <Link href={`/cerfa/wizard?cerfa=${cerfa.numero}`}>
                <button className="btn-primary">Remplir ce CERFA</button>
              </Link>
              <Link href="/analyse">
                <button className="btn-secondary">Analyser mon PLU d'abord</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
