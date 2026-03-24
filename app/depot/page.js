'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Building2, MapPin, Upload, CheckCircle, Mail, Clock, AlertTriangle, FileText, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DepotPage() {
  const { isSignedIn } = useUser();
  const [communeCode, setCommuneCode] = useState('');
  const [mairieInfo, setMairieInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [accuseReception, setAccuseReception] = useState(null);
  const [error, setError] = useState('');

  const checkMairie = async () => {
    if (!communeCode || communeCode.length !== 5) {
      setError('Veuillez saisir un code INSEE valide (5 chiffres)');
      return;
    }

    setLoading(true);
    setError('');
    setMairieInfo(null);

    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes/${communeCode}`);
      
      if (!response.ok) {
        throw new Error('Commune non trouvée');
      }

      const communeData = await response.json();

      // Simuler la vérification PLAT'AU (pour le MVP)
      // En production, cela appellerait l'API PLAT'AU réelle
      const isPlatauConnected = Math.random() > 0.5; // 50% des mairies sont raccordées (simulation)

      setMairieInfo({
        nom: communeData.nom,
        code: communeData.code,
        codeDepartement: communeData.codeDepartement,
        codeRegion: communeData.codeRegion,
        population: communeData.population,
        platauConnected: isPlatauConnected,
        adresseServiceUrbanisme: `Service Urbanisme\nMairie de ${communeData.nom}\n${communeData.nom}`,
        horaires: 'Lundi - Vendredi : 9h00 - 12h00 / 14h00 - 17h00',
        delaiLegalInstruction: '2 mois', // Par défaut pour PC MI
        dateLimiteReponse: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des informations de la mairie');
    } finally {
      setLoading(false);
    }
  };

  const deposerDossier = async (method) => {
    setDepositing(true);
    setError('');

    try {
      // Simuler le dépôt (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Générer un accusé de réception
      const accuse = {
        numeroDossier: `PC-${mairieInfo.code}-${Date.now().toString().slice(-6)}`,
        dateDepot: new Date().toLocaleDateString('fr-FR'),
        heureDepot: new Date().toLocaleTimeString('fr-FR'),
        commune: mairieInfo.nom,
        methode: method,
        delaiInstruction: mairieInfo.delaiLegalInstruction,
        dateLimite: mairieInfo.dateLimiteReponse,
        accordTaciteDate: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      };

      setAccuseReception(accuse);
      setDepositSuccess(true);
    } catch (err) {
      setError('Erreur lors du dépôt du dossier');
    } finally {
      setDepositing(false);
    }
  };

  const piecesObligatoires = [
    { code: 'PC1', nom: 'Plan de situation', description: 'Permet de localiser le terrain sur la commune' },
    { code: 'PC2', nom: 'Plan de masse coté', description: 'Représentation du terrain avec dimensions et constructions' },
    { code: 'PC3', nom: 'Plan de coupe', description: 'Coupe du terrain et de la construction' },
    { code: 'PC4', nom: 'Notice descriptive', description: 'Description du projet et matériaux' },
    { code: 'PC5', nom: 'Plan des façades et toitures', description: 'Représentation des façades extérieures' },
    { code: 'PC6', nom: 'Document graphique d\'insertion', description: 'Photo-montage du projet dans son environnement' },
    { code: 'PC7', nom: 'Photo environnement proche', description: 'Photographie du terrain et de ses abords immédiats' },
    { code: 'PC8', nom: 'Photo environnement lointain', description: 'Photographie depuis une voie publique' },
  ];

  if (depositSuccess && accuseReception) {
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

        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-8 text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-fraunces font-bold mb-2">Dépôt effectué avec succès !</h1>
            <p className="text-gray-300 mb-6">
              Votre dossier a été déposé auprès de la mairie de {accuseReception.commune}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Accusé de réception</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Numéro de dossier</p>
                <p className="text-lg font-semibold text-[#E8B420]">{accuseReception.numeroDossier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date de dépôt</p>
                <p className="text-lg font-semibold">{accuseReception.dateDepot} à {accuseReception.heureDepot}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Commune</p>
                <p className="text-lg font-semibold">{accuseReception.commune}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Méthode</p>
                <p className="text-lg font-semibold">{accuseReception.methode}</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E8B420]" />
                Délais d'instruction
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Délai légal</span>
                  <span className="font-semibold">{accuseReception.delaiInstruction}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date limite de réponse</span>
                  <span className="font-semibold text-[#E8B420]">{accuseReception.dateLimite}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Accord tacite possible à partir du</span>
                  <span className="font-semibold">{accuseReception.accordTaciteDate}</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mt-4">
                <p className="text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Si la mairie ne répond pas avant le {accuseReception.dateLimite}, votre demande est considérée comme <strong>accordée tacitement</strong>. 
                    Vous recevrez une alerte 7 jours avant cette date.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-[#A07820] hover:bg-[#E8B420] text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Télécharger l'accusé
              </button>
              <Link href="/suivi" className="flex-1">
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg transition-all">
                  Voir le suivi
                </button>
              </Link>
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

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-fraunces font-bold mb-6 text-center">
          Dépôt en <span className="text-[#E8B420] italic">mairie</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 text-center">
          Déposez votre dossier en ligne ou par courrier recommandé
        </p>

        <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Vérifier la mairie</h2>
          
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={communeCode}
              onChange={(e) => setCommuneCode(e.target.value)}
              placeholder="Code INSEE (ex: 75001)"
              maxLength={5}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E8B420]"
            />
            <button
              onClick={checkMairie}
              disabled={loading}
              className="bg-[#A07820] hover:bg-[#E8B420] text-white px-8 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500 text-sm mb-6">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-400">
            Le code INSEE correspond au code postal pour la plupart des communes. 
            Exemple : Paris 1er = 75101, Lyon = 69123
          </p>
        </div>

        {mairieInfo && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#E8B420]" />
                {mairieInfo.nom}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Code INSEE</p>
                  <p className="text-lg">{mairieInfo.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Population</p>
                  <p className="text-lg">{mairieInfo.population?.toLocaleString('fr-FR')} habitants</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${mairieInfo.platauConnected ? 'bg-green-500/10 border border-green-500' : 'bg-orange-500/10 border border-orange-500'}`}>
                <p className="font-semibold mb-1">
                  {mairieInfo.platauConnected ? '✓ Mairie raccordée à PLAT\'AU' : '⚠ Mairie non raccordée à PLAT\'AU'}
                </p>
                <p className="text-sm text-gray-300">
                  {mairieInfo.platauConnected 
                    ? 'Vous pouvez déposer votre dossier en ligne' 
                    : 'Dépôt physique ou par courrier recommandé nécessaire'}
                </p>
              </div>
            </div>

            {mairieInfo.platauConnected ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-6 h-6 text-[#E8B420]" />
                  Dépôt en ligne via PLAT'AU
                </h3>
                
                <p className="text-gray-300 mb-6">
                  La mairie de {mairieInfo.nom} est raccordée à la plateforme nationale PLAT'AU. 
                  Votre dossier sera transmis instantanément et vous recevrez un accusé de réception officiel.
                </p>

                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Délais d'instruction</p>
                      <p className="text-sm text-gray-300">
                        Délai légal : <strong>{mairieInfo.delaiLegalInstruction}</strong><br />
                        Date limite de réponse : <strong className="text-[#E8B420]">{mairieInfo.dateLimiteReponse}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deposerDossier('PLAT\'AU en ligne')}
                  disabled={depositing}
                  className="w-full bg-[#A07820] hover:bg-[#E8B420] text-white py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-5 h-5" />
                  {depositing ? 'Dépôt en cours...' : 'Déposer en ligne maintenant'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-6 h-6 text-[#E8B420]" />
                    Dépôt par LRAR électronique
                  </h3>
                  
                  <p className="text-gray-300 mb-6">
                    Envoyez votre dossier par Lettre Recommandée avec Accusé de Réception électronique via La Poste. 
                    Valeur juridique identique à un envoi postal classique.
                  </p>

                  <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <p className="font-semibold mb-2">Adresse de dépôt :</p>
                    <p className="text-sm text-gray-300 whitespace-pre-line">{mairieInfo.adresseServiceUrbanisme}</p>
                  </div>

                  <button
                    onClick={() => deposerDossier('LRAR électronique La Poste')}
                    disabled={depositing}
                    className="w-full bg-[#A07820] hover:bg-[#E8B420] text-white py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Mail className="w-5 h-5" />
                    {depositing ? 'Envoi en cours...' : 'Envoyer par LRAR électronique'}
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-[#E8B420]" />
                    Dépôt physique en mairie
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="font-semibold mb-2">Adresse du service urbanisme :</p>
                      <p className="text-sm text-gray-300 whitespace-pre-line">{mairieInfo.adresseServiceUrbanisme}</p>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Horaires d'ouverture :</p>
                      <p className="text-sm text-gray-300">{mairieInfo.horaires}</p>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
                    <p className="text-sm flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>
                        N'oubliez pas de demander un <strong>accusé de réception</strong> avec la date et le cachet de la mairie 
                        lors du dépôt physique de votre dossier.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#E8B420]" />
                Pièces obligatoires à joindre
              </h3>
              
              <div className="space-y-3">
                {piecesObligatoires.map((piece, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="bg-[#A07820] text-white text-xs font-bold px-2 py-1 rounded">
                      {piece.code}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{piece.nom}</p>
                      <p className="text-sm text-gray-400">{piece.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
