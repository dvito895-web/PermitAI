'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Building2, FileText, User, MapPin, ArrowRight, ArrowLeft, Lock, Download, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const CERFA_FORMS = [
  { id: 'PC_MI', num: '13406*04', name: 'Permis de construire - Maison individuelle', delai: '2 mois', surface_max: '150m2', description: 'Pour construction ou extension de maison individuelle' },
  { id: 'DP_MI', num: '13703*08', name: 'Déclaration préalable - Maison individuelle', delai: '1 mois', surface_max: '20m2', description: 'Pour travaux entre 5 et 20m2' },
  { id: 'PC', num: '13409*06', name: 'Permis de construire - Autres constructions', delai: '3 mois', surface_max: 'Illimité', description: 'Pour tous les autres projets de construction' },
  { id: 'DP', num: '13404*03', name: 'Déclaration préalable - Autres constructions', delai: '1 mois', surface_max: '20m2', description: 'Pour travaux autres que maison individuelle' },
  { id: 'CU', num: '13410*05', name: 'Certificat d\'urbanisme', delai: '1 à 2 mois', surface_max: 'N/A', description: 'Pour connaître les règles applicables à un terrain' },
  { id: 'DOC', num: '13407*05', name: 'Déclaration d\'ouverture de chantier', delai: '0 jour', surface_max: 'N/A', description: 'À déposer le premier jour des travaux' },
  { id: 'DAACT', num: '13408*05', name: 'Déclaration d\'achèvement des travaux', delai: '0 jour', surface_max: 'N/A', description: 'À déposer dans les 90 jours après fin travaux' },
];

export default function CerfaPage() {
  const { isSignedIn, user } = useUser();
  const [selectedForm, setSelectedForm] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1 - Informations demandeur
    nom: '',
    prenom: '',
    adresse_demandeur: '',
    email: '',
    telephone: '',
    
    // Étape 2 - Informations terrain
    adresse_terrain: '',
    reference_cadastrale: '',
    surface_terrain: '',
    
    // Étape 3 - Description travaux
    nature_travaux: '',
    surface_creee: '',
    hauteur: '',
    materiaux: '',
    couleurs: '',
  });
  const [loading, setLoading] = useState(false);
  const [cadastreLoading, setCadastreLoading] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [error, setError] = useState('');

  const userPlan = 'free'; // TODO: récupérer depuis la base de données

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchCadastreRef = async () => {
    if (!formData.adresse_terrain) {
      setError('Veuillez saisir l\'adresse du terrain');
      return;
    }

    setCadastreLoading(true);
    setError('');

    try {
      // Géocoder l'adresse
      const geocodeUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(formData.adresse_terrain)}`;
      const geocodeRes = await fetch(geocodeUrl);
      const geocodeData = await geocodeRes.json();

      if (!geocodeData.features || geocodeData.features.length === 0) {
        throw new Error('Adresse non trouvée');
      }

      const [lon, lat] = geocodeData.features[0].geometry.coordinates;

      // Récupérer la référence cadastrale via l'API IGN
      const cadastreUrl = `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}`;
      const cadastreRes = await fetch(cadastreUrl);
      const cadastreData = await cadastreRes.json();

      if (cadastreData.features && cadastreData.features.length > 0) {
        const parcelle = cadastreData.features[0].properties;
        const ref = `${parcelle.com}_${parcelle.section}_${parcelle.numero}`;
        handleInputChange('reference_cadastrale', ref);
      } else {
        throw new Error('Parcelle cadastrale non trouvée');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération de la référence cadastrale');
    } finally {
      setCadastreLoading(false);
    }
  };

  const generatePDF = async () => {
    if (userPlan === 'free') {
      setError('Cette fonctionnalité nécessite un plan payant. Passez au plan Starter pour 29€/mois.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simuler la génération de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPdfGenerated(true);
    } catch (err) {
      setError('Erreur lors de la génération du PDF');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isFieldLocked = (fieldIndex) => {
    return userPlan === 'free' && fieldIndex > 3;
  };

  const renderWizardStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Étape 1 - Informations du demandeur</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                  placeholder="Dupont"
                  disabled={isFieldLocked(1)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Prénom *</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                  placeholder="Jean"
                  disabled={isFieldLocked(2)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Adresse du domicile *</label>
                <input
                  type="text"
                  value={formData.adresse_demandeur}
                  onChange={(e) => handleInputChange('adresse_demandeur', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                  placeholder="15 rue de la République, 75001 Paris"
                  disabled={isFieldLocked(3)}
                />
              </div>

              {userPlan === 'free' && (
                <>
                  <div className="relative">
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-500 blur-sm"
                        placeholder="email@exemple.fr"
                      />
                      <Lock className="absolute right-3 top-3 w-5 h-5 text-[#E8B420]" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold mb-2">Téléphone *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-500 blur-sm"
                        placeholder="06 12 34 56 78"
                      />
                      <Lock className="absolute right-3 top-3 w-5 h-5 text-[#E8B420]" />
                    </div>
                  </div>
                </>
              )}

              {userPlan !== 'free' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                      placeholder="email@exemple.fr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </>
              )}
            </div>

            {userPlan === 'free' && (
              <div className="bg-[#A07820]/20 border border-[#E8B420] rounded-lg p-6 text-center">
                <Lock className="w-8 h-8 text-[#E8B420] mx-auto mb-3" />
                <p className="text-lg font-semibold mb-2">2 champs masqués</p>
                <p className="text-sm text-gray-300 mb-4">
                  Disponible avec le plan Starter à 29 EUR/mois
                </p>
                <Link href="/tarifs">
                  <button className="bg-[#A07820] hover:bg-[#E8B420] text-white px-6 py-2 rounded-lg transition-all">
                    Voir les tarifs
                  </button>
                </Link>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Étape 2 - Informations du terrain</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Adresse du terrain *</label>
                <input
                  type="text"
                  value={formData.adresse_terrain}
                  onChange={(e) => handleInputChange('adresse_terrain', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                  placeholder="20 avenue des Champs, 75008 Paris"
                  disabled={userPlan === 'free'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Référence cadastrale</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.reference_cadastrale}
                    readOnly
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                    placeholder="Sera rempli automatiquement"
                    disabled={userPlan === 'free'}
                  />
                  <button
                    onClick={fetchCadastreRef}
                    disabled={cadastreLoading || userPlan === 'free'}
                    className="bg-[#A07820] hover:bg-[#E8B420] text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cadastreLoading ? 'Chargement...' : 'Auto-remplir'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Référence automatique via API IGN Cadastre</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Surface du terrain (m²)</label>
                <input
                  type="number"
                  value={formData.surface_terrain}
                  onChange={(e) => handleInputChange('surface_terrain', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                  placeholder="500"
                  disabled={userPlan === 'free'}
                />
              </div>
            </div>

            {userPlan === 'free' && (
              <div className="bg-[#A07820]/20 border border-[#E8B420] rounded-lg p-6 text-center">
                <Lock className="w-8 h-8 text-[#E8B420] mx-auto mb-3" />
                <p className="text-lg font-semibold mb-2">Formulaire complet masqué</p>
                <p className="text-sm text-gray-300 mb-4">
                  Disponible avec le plan Starter à 29 EUR/mois
                </p>
                <Link href="/tarifs">
                  <button className="bg-[#A07820] hover:bg-[#E8B420] text-white px-6 py-2 rounded-lg transition-all">
                    Débloquer maintenant
                  </button>
                </Link>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Étape 3 - Description des travaux</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Nature des travaux *</label>
                <textarea
                  value={formData.nature_travaux}
                  onChange={(e) => handleInputChange('nature_travaux', e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420] resize-none"
                  placeholder="Ex: Construction d'une extension en ossature bois..."
                  disabled={userPlan === 'free'}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Surface créée (m²) *</label>
                  <input
                    type="number"
                    value={formData.surface_creee}
                    onChange={(e) => handleInputChange('surface_creee', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                    placeholder="20"
                    disabled={userPlan === 'free'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Hauteur (m) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hauteur}
                    onChange={(e) => handleInputChange('hauteur', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                    placeholder="3.5"
                    disabled={userPlan === 'free'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Matériaux *</label>
                  <input
                    type="text"
                    value={formData.materiaux}
                    onChange={(e) => handleInputChange('materiaux', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                    placeholder="Bois, tuiles..."
                    disabled={userPlan === 'free'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Couleurs</label>
                  <input
                    type="text"
                    value={formData.couleurs}
                    onChange={(e) => handleInputChange('couleurs', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
                    placeholder="Gris anthracite, blanc..."
                    disabled={userPlan === 'free'}
                  />
                </div>
              </div>
            </div>

            {userPlan === 'free' && (
              <div className="bg-[#A07820]/20 border border-[#E8B420] rounded-lg p-6 text-center">
                <Lock className="w-8 h-8 text-[#E8B420] mx-auto mb-3" />
                <p className="text-lg font-semibold mb-2">Description complète masquée</p>
                <p className="text-sm text-gray-300 mb-4">
                  Disponible avec le plan Starter à 29 EUR/mois
                </p>
                <Link href="/tarifs">
                  <button className="bg-[#A07820] hover:bg-[#E8B420] text-white px-6 py-2 rounded-lg transition-all">
                    Débloquer maintenant
                  </button>
                </Link>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Étape 4 - Récapitulatif</h3>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-[#E8B420] mb-2">Demandeur</h4>
                <p>{formData.prenom} {formData.nom}</p>
                <p className="text-sm text-gray-400">{formData.adresse_demandeur}</p>
                {userPlan !== 'free' && (
                  <>
                    <p className="text-sm text-gray-400">{formData.email}</p>
                    <p className="text-sm text-gray-400">{formData.telephone}</p>
                  </>
                )}
              </div>

              {userPlan !== 'free' && (
                <>
                  <div>
                    <h4 className="font-semibold text-[#E8B420] mb-2">Terrain</h4>
                    <p>{formData.adresse_terrain}</p>
                    {formData.reference_cadastrale && (
                      <p className="text-sm text-gray-400">Réf. cadastrale: {formData.reference_cadastrale}</p>
                    )}
                    {formData.surface_terrain && (
                      <p className="text-sm text-gray-400">Surface: {formData.surface_terrain}m²</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#E8B420] mb-2">Travaux</h4>
                    <p className="text-sm">{formData.nature_travaux}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      {formData.surface_creee && <span>Surface: {formData.surface_creee}m²</span>}
                      {formData.hauteur && <span>Hauteur: {formData.hauteur}m</span>}
                      {formData.materiaux && <span>Matériaux: {formData.materiaux}</span>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {!pdfGenerated ? (
              <button
                onClick={generatePDF}
                disabled={loading || userPlan === 'free'}
                className="w-full bg-[#A07820] hover:bg-[#E8B420] text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Génération en cours...' : (
                  <>
                    <Download className="w-5 h-5" />
                    Générer le PDF
                  </>
                )}
              </button>
            ) : (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold mb-2">PDF généré avec succès !</p>
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all inline-flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Télécharger le CERFA {selectedForm?.num}
                </button>
              </div>
            )}

            {userPlan === 'free' && (
              <div className="bg-[#A07820]/20 border border-[#E8B420] rounded-lg p-6 text-center">
                <Lock className="w-8 h-8 text-[#E8B420] mx-auto mb-3" />
                <p className="text-lg font-semibold mb-2">Génération PDF non disponible</p>
                <p className="text-sm text-gray-300 mb-4">
                  Passez au plan Starter à 29 EUR/mois pour générer vos CERFA
                </p>
                <Link href="/tarifs">
                  <button className="bg-[#A07820] hover:bg-[#E8B420] text-white px-6 py-2 rounded-lg transition-all">
                    Voir les tarifs
                  </button>
                </Link>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500 text-sm">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedForm) {
    return (
      <div className="min-h-screen bg-[#06060e] text-white">
        <nav className="border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Building2 className="w-8 h-8 text-[#E8B420]" />
                <span className="text-2xl font-fraunces font-bold">PermitAI</span>
              </Link>
              <Link href="/dashboard">
                <button className="text-sm hover:text-[#E8B420] transition-colors">
                  Tableau de bord
                </button>
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <button
            onClick={() => { setSelectedForm(null); setStep(1); setPdfGenerated(false); }}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste des formulaires
          </button>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-fraunces font-bold mb-2">
                CERFA {selectedForm.num}
              </h1>
              <p className="text-xl text-gray-300">{selectedForm.name}</p>
              <p className="text-sm text-gray-400 mt-2">Délai d'instruction: {selectedForm.delai}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`flex-1 h-2 rounded ${s <= step ? 'bg-[#E8B420]' : 'bg-white/10'} ${s !== 4 ? 'mr-2' : ''}`} />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Demandeur</span>
                <span>Terrain</span>
                <span>Travaux</span>
                <span>Récapitulatif</span>
              </div>
            </div>

            {renderWizardStep()}

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </button>
              
              {step < 4 && (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-[#A07820] hover:bg-[#E8B420] rounded-lg transition-all"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060e] text-white">
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-[#E8B420]" />
              <span className="text-2xl font-fraunces font-bold">PermitAI</span>
            </Link>
            <Link href="/dashboard">
              <button className="text-sm hover:text-[#E8B420] transition-colors">
                Tableau de bord
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-fraunces font-bold mb-6 text-center">
          Formulaires <span className="text-[#E8B420] italic">CERFA</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          Générez vos formulaires officiels pré-remplis automatiquement
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {CERFA_FORMS.map((form) => (
            <div
              key={form.id}
              className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg p-6 transition-all cursor-pointer"
              onClick={() => { setSelectedForm(form); setFormData({}); setStep(1); setPdfGenerated(false); }}
            >
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-[#E8B420]" />
                <span className="text-xs bg-[#A07820] px-2 py-1 rounded">{form.num}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{form.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{form.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Délai: {form.delai}</span>
                {form.surface_max !== 'N/A' && <span>Max: {form.surface_max}</span>}
              </div>
            </div>
          ))}
        </div>

        {!isSignedIn && (
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">
              Connectez-vous pour générer vos CERFA
            </p>
            <Link href="/sign-in">
              <button className="bg-[#A07820] hover:bg-[#E8B420] text-white px-8 py-3 rounded-lg transition-all">
                Se connecter
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
