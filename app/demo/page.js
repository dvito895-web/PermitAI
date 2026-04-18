'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';

export default function DemoPage() {
  const [adresse, setAdresse] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/plu/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adresse, description }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: true, message: 'Erreur lors de l\'analyse' });
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
          <h1 className="hero-title mb-6 text-center">
            Démonstration <span className="text-[#e8b420] italic">live</span>
          </h1>
          <p className="hero-subtitle text-center mb-12">
            Testez gratuitement l'analyse PLU en temps réel
          </p>

          <div className="card-premium max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[13px] text-[#8a857d] mb-2">Adresse du projet</label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="47 avenue Victor Hugo, 69003 Lyon"
                  className="input-premium w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] text-[#8a857d] mb-2">Description du projet</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Extension de 40m² en rez-de-chaussée"
                  className="input-premium w-full min-h-[100px]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  'Lancer l\'analyse gratuite'
                )}
              </button>
            </form>

            {result && (
              <div className="mt-8 pt-8 border-t border-[#1c1c2a]">
                {result.error ? (
                  <div className="text-center text-[#ef4444] text-[14px]">{result.message}</div>
                ) : (
                  <div>
                    <div className="badge-premium inline-block mb-4">Résultat</div>
                    <h3 className="text-[18px] font-medium text-[#f0ede8] mb-4">{result.verdict || 'Analyse terminée'}</h3>
                    <p className="text-[14px] text-[#8a857d]">{result.summary || 'Détails de l\'analyse disponibles dans votre dashboard.'}</p>
                    <Link href="/sign-up" className="inline-block mt-6">
                      <button className="btn-primary">Créer un compte gratuit</button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
