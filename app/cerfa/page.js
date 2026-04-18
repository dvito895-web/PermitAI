'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, FileText, Download, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import texts from '@/lib/texts.ts';

export default function CerfaPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const cerfaForms = [
    { code: 'PC_MI', name: 'Permis de construire maison individuelle', delay: texts.cerfa.forms.delay + ' : 2 mois', surface: texts.cerfa.forms.maxSurface + ' : Aucune' },
    { code: 'DP_MI', name: 'Déclaration préalable travaux', delay: texts.cerfa.forms.delay + ' : 1 mois', surface: texts.cerfa.forms.maxSurface + ' : 40m2' },
    { code: 'CU', name: 'Certificat d\'urbanisme', delay: texts.cerfa.forms.delay + ' : 1 mois', surface: texts.cerfa.forms.maxSurface + ' : N/A' },
  ];

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">{texts.nav.logo}</span>
          </Link>
          <Link href="/dashboard">
            <button className="btn-secondary">{texts.nav.dashboard}</button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <h1 className="hero-title mb-6 text-center">
            {texts.cerfa.title} <span className="text-[#e8b420] italic">{texts.cerfa.titleHighlight}</span>
          </h1>
          <p className="hero-subtitle text-center mb-12">{texts.cerfa.subtitle}</p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {cerfaForms.map((form, i) => (
              <div key={i} className="card-premium cursor-pointer hover:border-[#a07820] group">
                <div className="text-[#e8b420] mb-4 transition-transform group-hover:scale-110">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-[16px] font-medium mb-3 text-[#f0ede8]">{form.name}</h3>
                <div className="space-y-2 text-[13px] text-[#8a857d]">
                  <div>{form.delay}</div>
                  <div>{form.surface}</div>
                </div>
                <button className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                  Remplir ce CERFA
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="card-premium">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className={`flex items-center gap-2`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      s === step ? 'bg-[#a07820] text-white' :
                      s < step ? 'bg-[#14141f] text-[#e8b420]' :
                      'bg-[#14141f] text-[#3c3830]'
                    }`}>
                      {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                    </div>
                    {s < 4 && <div className="w-12 h-px bg-[#272736]"></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-[#e8b420] mx-auto mb-4" />
              <h3 className="text-[20px] font-medium mb-3">Wizard CERFA - Étape {step}/4</h3>
              <p className="text-[14px] text-[#8a857d] mb-8">Interface de saisie interactive en cours de développement</p>
              
              <div className="flex items-center justify-center gap-4">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {texts.cerfa.wizard.previous}
                  </button>
                )}
                {step < 4 ? (
                  <button onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2">
                    {texts.cerfa.wizard.next}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="btn-primary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {texts.cerfa.wizard.download}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
