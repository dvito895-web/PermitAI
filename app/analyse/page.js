'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Building2, MapPin, Search, ArrowRight, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import texts from '@/lib/texts';

export default function AnalysePage() {
  const { isSignedIn } = useUser();
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      alert(texts.analyse.form.signInRequired);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/plu/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adresse: address, description, is_demo: false }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert('Erreur lors de l\'analyse');
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
            {texts.analyse.title} <span className="text-[#e8b420] italic">{texts.analyse.titleHighlight}</span>
          </h1>
          <p className="hero-subtitle text-center mb-12">{texts.analyse.subtitle}</p>

          <div className="card-premium">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block mb-2">{texts.analyse.form.addressLabel}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a857d]" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={texts.analyse.form.addressPlaceholder}
                    className="input-premium w-full pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">{texts.analyse.form.descLabel}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={texts.analyse.form.descPlaceholder}
                  className="input-premium w-full h-32 resize-none"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? texts.analyse.form.loading : texts.analyse.form.submit}
                {!loading && <Search className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {result && (
            <div className="card-premium mt-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {result.verdict === 'conforme' ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  )}
                  <div>
                    <div className="text-[18px] font-medium capitalize">{result.verdict}</div>
                    <div className="text-[13px] text-[#8a857d]">{result.commune}</div>
                  </div>
                </div>
                <div className="badge-premium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {texts.analyse.results.confidence} {result.score_confiance}%
                </div>
              </div>

              <p className="text-[15px] text-[#f0ede8] leading-relaxed">{result.resume}</p>

              {result.regles_applicables && result.regles_applicables.length > 0 && (
                <div>
                  <h3 className="text-[16px] font-medium mb-4">{texts.analyse.results.applicableRules}</h3>
                  <div className="space-y-3">
                    {result.regles_applicables.map((regle, i) => (
                      <div key={i} className="bg-[#14141f] border border-[#272736] rounded-[8px] p-4">
                        <div className="text-[14px] font-medium mb-2">{regle.article}</div>
                        <div className="text-[13px] text-[#8a857d]">{regle.contenu}</div>
                      </div>
                    ))}
                  </div>
                  {result.regles_masquees > 0 && (
                    <div className="text-center mt-4">
                      <div className="text-[13px] text-[#8a857d] mb-3">
                        +{result.regles_masquees} {texts.analyse.results.hiddenRules}
                      </div>
                      <Link href="/tarifs">
                        <button className="btn-primary inline-flex items-center gap-2">
                          {texts.analyse.results.viewPricing}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {result.geoportail_url && (
                <a href={result.geoportail_url} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full flex items-center justify-center gap-2">
                  {texts.analyse.results.viewOnGeoportail}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
