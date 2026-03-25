'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Send, Mail, MapPin, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import texts from '@/lib/texts';

export default function DepotPage() {
  const [codeInsee, setCodeInsee] = useState('');
  const [mairieInfo, setMairieInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkMairie = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/mairie/info?code=${codeInsee}`);
      const data = await response.json();
      setMairieInfo(data);
    } catch (error) {
      alert('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="container mx-auto max-w-4xl">
          <h1 className="hero-title mb-6 text-center">
            {texts.depot.title} <span className="text-[#e8b420] italic">{texts.depot.titleHighlight}</span>
          </h1>
          <p className="hero-subtitle text-center mb-12">{texts.depot.subtitle}</p>

          <div className="card-premium mb-8">
            <label className="block mb-2">{texts.depot.codeInsee}</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={codeInsee}
                onChange={(e) => setCodeInsee(e.target.value)}
                placeholder="75001"
                className="input-premium flex-1"
              />
              <button onClick={checkMairie} disabled={loading} className="btn-primary">
                {loading ? texts.depot.verifying : texts.depot.verify}
              </button>
            </div>
          </div>

          {mairieInfo && (
            <div className="space-y-6">
              <div className="card-premium">
                <div className="flex items-center gap-3 mb-6">
                  {mairieInfo.platau_raccordee ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  )}
                  <div>
                    <h3 className="text-[18px] font-medium">{mairieInfo.commune_nom}</h3>
                    <p className="text-[13px] text-[#8a857d]">
                      {mairieInfo.platau_raccordee ? texts.depot.platauConnected : texts.depot.platauNotConnected}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#14141f] border border-[#272736] rounded-[8px] p-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#3c3830] mb-2">Adresse Service</div>
                    <div className="text-[14px] text-[#f0ede8]">{mairieInfo.adresse_service_urbanisme}</div>
                  </div>
                  <div className="bg-[#14141f] border border-[#272736] rounded-[8px] p-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#3c3830] mb-2">{texts.depot.legalDelay}</div>
                    <div className="text-[14px] text-[#f0ede8]">{mairieInfo.delai_legal_instruction}</div>
                  </div>
                </div>

                {mairieInfo.platau_raccordee ? (
                  <button className="btn-primary w-full flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    {texts.depot.depositOnline}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button className="btn-primary w-full flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      {texts.depot.depositByLRAR}
                    </button>
                    <button className="btn-secondary w-full flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {texts.depot.depositInPerson}
                    </button>
                  </div>
                )}
              </div>

              <div className="card-premium">
                <h3 className="text-[16px] font-medium mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#e8b420]" />
                  {texts.depot.requiredDocuments}
                </h3>
                <ul className="space-y-2 text-[14px] text-[#8a857d]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#e8b420] flex-shrink-0 mt-0.5" />
                    Formulaire CERFA complété et signé
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#e8b420] flex-shrink-0 mt-0.5" />
                    Plan de situation du terrain
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#e8b420] flex-shrink-0 mt-0.5" />
                    Plan de masse des constructions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#e8b420] flex-shrink-0 mt-0.5" />
                    Plan des façades et toitures
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
