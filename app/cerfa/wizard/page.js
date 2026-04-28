'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building2, ArrowLeft, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { CERFA_LIST, getCerfaByNumero } from '../../../lib/cerfaList';

function WizardContent() {
  const searchParams = useSearchParams();
  const preSelectedCerfa = searchParams.get('cerfa');
  
  const [selectedCerfa, setSelectedCerfa] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (preSelectedCerfa) {
      const cerfa = getCerfaByNumero(preSelectedCerfa);
      if (cerfa) {
        setSelectedCerfa(cerfa);
        setStep(2);
      }
    }
  }, [preSelectedCerfa]);

  const handleCerfaSelect = (cerfa) => {
    setSelectedCerfa(cerfa);
    setStep(2);
  };

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
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="badge-premium inline-block mb-6">
              <Sparkles className="w-4 h-4 inline-block mr-2" />
              Assistant CERFA IA
            </div>
            <h1 className="hero-title mb-6">
              Remplissez votre <span className="text-[#e8b420] italic">CERFA</span> en 5 minutes
            </h1>
            <p className="hero-subtitle max-w-2xl mx-auto">
              L'intelligence artificielle vous guide étape par étape pour remplir le bon formulaire
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium ${
                  step >= num ? 'bg-[#e8b420] text-[#06060e]' : 'bg-[#1c1c2a] text-[#8a857d]'
                }`}>
                  {num}
                </div>
                {num < 4 && <div className={`w-16 h-0.5 ${step > num ? 'bg-[#e8b420]' : 'bg-[#1c1c2a]'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Sélection CERFA */}
          {step === 1 && (
            <div>
              <h2 className="text-[24px] font-medium text-[#f0ede8] mb-6 text-center">
                Quel formulaire CERFA souhaitez-vous remplir ?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {CERFA_LIST.slice(0, 6).map(cerfa => (
                  <div
                    key={cerfa.numero}
                    onClick={() => handleCerfaSelect(cerfa)}
                    className="card-premium cursor-pointer hover:border-[#a07820] group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="badge-premium">CERFA {cerfa.numero}</div>
                      <ChevronRight className="w-5 h-5 text-[#8a857d] group-hover:text-[#e8b420] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-[15px] font-medium text-[#f0ede8] mb-2">{cerfa.nom}</h3>
                    <p className="text-[12px] text-[#8a857d] line-clamp-2">{cerfa.description}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link href="/cerfa">
                  <button className="btn-secondary text-[13px]">Voir tous les formulaires</button>
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Guide complet */}
          {step === 2 && selectedCerfa && (
            <div className="card-premium max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#4ade80]" />
                <div>
                  <div className="text-[13px] text-[#8a857d]">Formulaire sélectionné</div>
                  <h2 className="text-[20px] font-medium text-[#f0ede8]">CERFA {selectedCerfa.numero}</h2>
                </div>
              </div>

              <div className="bg-[#0e0e1a] rounded-lg p-6 mb-6">
                <h3 className="text-[16px] font-medium text-[#f0ede8] mb-3">{selectedCerfa.nom}</h3>
                <p className="text-[14px] text-[#8a857d] mb-4">{selectedCerfa.description}</p>
                
                <div className="grid grid-cols-3 gap-3 text-center text-[12px]">
                  <div>
                    <div className="text-[#8a857d] mb-1">Catégorie</div>
                    <div className="text-[#f0ede8]">{selectedCerfa.categorie}</div>
                  </div>
                  <div>
                    <div className="text-[#8a857d] mb-1">Délai</div>
                    <div className="text-[#f0ede8]">{selectedCerfa.delaiInstruction}</div>
                  </div>
                  <div>
                    <div className="text-[#8a857d] mb-1">Pièces</div>
                    <div className="text-[#f0ede8]">{selectedCerfa.piecesJointes.length}</div>
                  </div>
                </div>
              </div>

              {selectedCerfa.guide && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[18px] font-medium text-[#f0ede8] mb-3">Introduction</h3>
                    <p className="text-[14px] text-[#8a857d] leading-relaxed">{selectedCerfa.guide.introduction}</p>
                  </div>

                  {selectedCerfa.guide.sections && selectedCerfa.guide.sections.map((section, idx) => (
                    <div key={idx} className="border-l-2 border-[#a07820] pl-4">
                      <h4 className="text-[16px] font-medium text-[#f0ede8] mb-2">{section.titre}</h4>
                      <p className="text-[13px] text-[#8a857d] mb-3">{section.description}</p>
                      <div className="space-y-2">
                        {section.champs.map((champ, cidx) => (
                          <div key={cidx} className="bg-[#0e0e1a] rounded-lg p-3 text-[13px]">
                            <div className="font-medium text-[#f0ede8] mb-1">
                              {champ.nom}
                              {champ.requis && <span className="text-[#e8b420] ml-1">*</span>}
                            </div>
                            <div className="text-[#8a857d] text-[12px]">{champ.aide}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-8 pt-6 border-t border-[#1c1c2a]">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  ← Changer de formulaire
                </button>
                <Link href={`/cerfa/${selectedCerfa.slug}`} className="flex-1">
                  <button className="btn-primary w-full">Voir le guide complet</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function CerfaWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#06060e] flex items-center justify-center">
        <div className="text-[13px] text-[#8a857d]">Chargement...</div>
      </div>
    }>
      <WizardContent />
    </Suspense>
  );
}
