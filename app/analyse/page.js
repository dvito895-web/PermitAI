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
      setError('Please sign in to analyze your land');
      return;
    }

    if (!adresse || !description) {
      setError('Please fill in all fields');
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
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
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
        return 'COMMUNE NON INDEXEE';
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
                    Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <button className="bg-[#A07820] hover:bg-[#E8B420] px-6 py-2 rounded-lg transition-all">
                    Sign In
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
          Verify your project compliance in 3 minutes
        </p>

        <form onSubmit={handleAnalyse} className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E8B420]" />
              Land Address
            </label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Ex: 15 rue de la Republique, 75001 Paris"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E8B420]" />
              Project Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: I want to build a 20m2 extension to my house with a height of 3m. The extension will be in wood..."
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
                Analysis in progress...
              </>
            ) : (
              <>Analyze compliance</>
            )}
          </button>

          {!isSignedIn && (
            <p className="text-center text-sm text-gray-400 mt-4">
              You must be signed in to analyze a land.{' '}
              <Link href="/sign-up" className="text-[#E8B420] hover:underline">
                Create free account
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
                      Confidence: {result.score_confiance}%
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
                  <div className="text-gray-400">Town</div>
                  <div className="font-semibold">{result.commune}</div>
                </div>
                {result.cerfa_recommande && (
                  <div>
                    <div className="text-gray-400">Recommended CERFA</div>
                    <div className="font-semibold">{result.cerfa_recommande}</div>
                  </div>
                )}
              </div>
            )}

            {result.regles_applicables && result.regles_applicables.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Applicable PLU Rules</h3>
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
                      {result.regles_masquees} hidden rules
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      Unlock all rules with Starter plan at 29 EUR/month
                    </p>
                    <Link href="/tarifs">
                      <button className="bg-[#A07820] hover:bg-[#E8B420] text-white px-6 py-2 rounded-lg transition-all">
                        View pricing
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
                  View PLU on Geoportail Urbanisme →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
