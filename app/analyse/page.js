'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Building2, MapPin, FileText, Loader2, AlertTriangle, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export default function AnalysePage() {
  const { isSignedIn } = useUser();
  const [adresse, setAdresse] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyse = async (e) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      setError('Veuillez vous connecter pour analyser votre terrain');
      return;
    }

    if (!adresse || !description) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/plu/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adresse,
          description,
          is_demo: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'L analyse a échoué');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Une erreur s est produite durant l analyse');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'conforme':
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case 'non_conforme':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'conforme_sous_conditions':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'non_indexee':
        return <HelpCircle className="w-8 h-8 text-gray-500" />;
      default:
        return <HelpCircle className="w-8 h-8 text-gray-500" />;
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'conforme':
        return 'text-green-500';
      case 'non_conforme':
        return 'text-red-500';
      case 'conforme_sous_conditions':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getVerdictLabel = (verdict) => {
    switch (verdict) {
      case 'conforme':
        return 'CONFORME';
      case 'non_conforme':
        return 'NON CONFORME';
      case 'conforme_sous_conditions':
        return 'CONFORME SOUS CONDITIONS';
      case 'non_indexee':
        return 'COMMUNE NON INDEXÉE';
      case 'incertain':
        return 'INCERTAIN';
      default:
        return verdict?.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-[#06060e] text-white">
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-[#E8B420]" />
              <span className="text-2xl font-fraunces font-bold">PermitAI</span>
            </Link>
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <button className="text-sm hover:text-[#E8B420] transition-colors">
                    Tableau de bord
                  </button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <button className="bg-[#A07820] hover:bg-[#E8B420] px-6 py-2 rounded-lg transition-all">
                    Connexion
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-fraunces font-bold mb-6 text-center">
          Analyse <span className="text-[#E8B420] italic">PLU</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 text-center">
          Vérifiez la conformité de votre projet en 3 minutes
        </p>

        <form onSubmit={handleAnalyse} className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E8B420]" />
              Adresse du terrain
            </label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Ex: 15 rue de la République, 75001 Paris"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E8B420]" />
              Description des travaux
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Je souhaite construire une extension de 20m2 à ma maison individuelle avec une hauteur de 3m. L extension sera en bois..."
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420] resize-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isSignedIn}
            className="w-full bg-[#A07820] hover:bg-[#E8B420] text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>Analyser la faisabilité</>
            )}
          </button>

          {!isSignedIn && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Vous devez être connecté pour analyser un terrain.{' '}
              <Link href="/sign-up" className="text-[#E8B420] hover:underline">
                Créer un compte gratuit
              </Link>
            </p>
          )}
        </form>

        {result && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getVerdictIcon(result.verdict)}
                <div>
                  <div className={`text-2xl font-bold ${getVerdictColor(result.verdict)}`}>
                    {getVerdictLabel(result.verdict)}
                  </div>
                  {result.score_confiance && (
                    <div className="text-sm text-gray-400">
                      Confiance: {result.score_confiance}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {result.resume && (
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-lg">{result.resume}</div>
              </div>
            )}

            {result.commune && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Commune</div>
                  <div className="font-semibold">{result.commune}</div>
                </div>
                {result.cerfa_recommande && (
                  <div>
                    <div className="text-gray-400">CERFA recommandé</div>
                    <div className="font-semibold">{result.cerfa_recommande}</div>
                  </div>
                )}
              </div>
            )}

            {result.regles_applicables && result.regles_applicables.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Règles PLU applicables</h3>
                <div className="space-y-4">
                  {result.regles_applicables.map((regle, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-4 border-l-4 border-[#E8B420]">
                      <div className="font-semibold mb-2">{regle.article}</div>
                      <div className="text-sm text-gray-400 mb-2">{regle.contenu}</div>
                      {regle.impact && (
                        <div className={`text-xs inline-block px-2 py-1 rounded ${
                          regle.impact === 'favorable' ? 'bg-green-500/20 text-green-500' :
                          regle.impact === 'defavorable' ? 'bg-red-500/20 text-red-500' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {regle.impact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {result.regles_masquees && result.regles_masquees > 0 && (
                  <div className="mt-4 bg-[#A07820]/20 border border-[#E8B420] rounded-lg p-6 text-center">
                    <div className="text-lg font-semibold mb-2">
                      {result.regles_masquees} règles masquées
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      Débloquez toutes les règles avec le plan Starter à 29 EUR/mois
                    </p>
                    <Link href="/tarifs">
                      <button className="bg-[#A07820] hover:bg-[#E8B420] text-white px-6 py-2 rounded-lg transition-all">
                        Voir les tarifs
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {result.geoportail_url && (
              <div>
                <a
                  href={result.geoportail_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E8B420] hover:underline text-sm"
                >
                  Voir le PLU sur Géoportail Urbanisme →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
