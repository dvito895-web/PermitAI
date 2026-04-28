'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Loader2, CheckCircle2, Lock } from 'lucide-react';
import AddressAutocomplete from '../../components/AddressAutocomplete';

export default function DemoPage() {
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Simulate 3 seconds loading
    await new Promise(resolve => setTimeout(resolve, 3000));

    setResult({
      success: true,
      zone: 'UB — Résidentiel pavillonnaire',
      score: 87,
      verdict: 'Conforme',
      regles_visibles: [
        { article: 'Art. R.111-16', label: 'Hauteur maximale', value: '9m maximum', status: 'ok' },
        { article: 'Art. R.111-19', label: 'Emprise au sol', value: '40% maximum', status: 'ok' },
      ],
      regles_cachees: 3,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/">
            <button className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-[#a0782022] text-[#a07820] rounded-lg text-[11px] font-semibold uppercase tracking-wide mb-6">
              Démo Live
            </div>
            <h1 className="text-[42px] font-medium text-[#f2efe9] mb-6">
              Testez l'analyse PLU <span className="text-[#e8b420] italic">gratuitement</span>
            </h1>
            <p className="text-[16px] text-[#5a5650] max-w-2xl mx-auto">
              Découvrez comment PermitAI analyse votre PLU en 3 minutes. Résultat partiel pour la démo.
            </p>
          </div>

          <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-8 max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[13px] text-[#5a5650] mb-2 font-medium">
                  Adresse du projet
                </label>
                <AddressAutocomplete
                  value={adresse}
                  onChange={setAdresse}
                  placeholder="12 rue des Lilas, Lyon 69006..."
                />
              </div>

              <button
                type="submit"
                disabled={!adresse || loading}
                className="w-full py-3 bg-[#a07820] hover:bg-[#c4960a] text-white rounded-lg text-[14px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  'Lancer l\'analyse gratuite'
                )}
              </button>
            </form>

            {result && (
              <div className="mt-8 pt-8 border-t border-[#1c1c2a]">
                {/* Header résultat */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[11px] text-[#5a5650] uppercase tracking-wide mb-1">Résultat partiel</div>
                    <h3 className="text-[20px] font-medium text-[#f2efe9]">{result.zone}</h3>
                  </div>
                  <div className="px-4 py-2 bg-[#4ade8022] text-[#4ade80] rounded-lg text-[13px] font-semibold">
                    {result.verdict}
                  </div>
                </div>

                {/* Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-[13px] mb-2">
                    <span className="text-[#5a5650]">Score de conformité</span>
                    <span className="text-[#e8b420] font-semibold">{result.score}%</span>
                  </div>
                  <div className="h-2 bg-[#14141f] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e8b420]"
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Règles visibles */}
                <div className="space-y-3 mb-4">
                  {result.regles_visibles.map((regle, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-[#14141f] rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-[#4ade80] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-[#f2efe9] mb-1">{regle.label}</div>
                        <div className="text-[11px] text-[#5a5650]">{regle.article}</div>
                        <div className="text-[12px] text-[#4ade80] mt-1">{regle.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Règles cachées avec overlay */}
                <div className="relative">
                  <div className="space-y-3 mb-4 filter blur-sm opacity-50">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-[#14141f] rounded-lg">
                        <div className="w-5 h-5 bg-[#5a5650] rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-[#5a5650] rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-[#5a5650] rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-[#06060e] bg-opacity-80 rounded-lg">
                    <div className="text-center px-6">
                      <Lock className="w-8 h-8 text-[#e8b420] mx-auto mb-3" />
                      <h4 className="text-[16px] font-medium text-[#f2efe9] mb-2">
                        {result.regles_cachees} règles supplémentaires
                      </h4>
                      <p className="text-[13px] text-[#5a5650] mb-4">
                        Créez un compte gratuit pour voir l'analyse complète
                      </p>
                      <Link href="/sign-up">
                        <button className="px-6 py-3 bg-[#a07820] hover:bg-[#c4960a] text-white rounded-lg text-[14px] font-medium transition-colors">
                          Créer un compte gratuit
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
