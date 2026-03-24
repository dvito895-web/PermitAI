'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Building2, FileText, Clock, AlertTriangle, CheckCircle, XCircle, Edit, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

// Données de démonstration
const DEMO_DOSSIERS = [
  {
    id: '1',
    numeroDossier: 'PC-75001-123456',
    typeCerfa: 'PC_MI',
    commune: 'Paris 1er',
    statut: 'en_instruction',
    dateDepot: '2025-01-15',
    dateLimite: '2025-03-15',
    dateAccordTacite: '2025-03-16',
    prochaineAction: 'Attendre la décision de la mairie',
  },
  {
    id: '2',
    numeroDossier: 'DP-69123-789012',
    typeCerfa: 'DP_MI',
    commune: 'Lyon',
    statut: 'depose',
    dateDepot: '2025-02-01',
    dateLimite: '2025-03-01',
    dateAccordTacite: '2025-03-02',
    prochaineAction: 'Le dossier est en cours d\'enregistrement',
  },
  {
    id: '3',
    numeroDossier: 'PC-13055-345678',
    typeCerfa: 'PC',
    commune: 'Marseille',
    statut: 'accorde',
    dateDepot: '2024-11-10',
    dateLimite: '2025-02-10',
    dateAccordTacite: null,
    prochaineAction: 'Envoyer la DOC avant le début des travaux',
  },
  {
    id: '4',
    numeroDossier: 'BR-75001-999999',
    typeCerfa: 'CU',
    commune: 'Paris 1er',
    statut: 'brouillon',
    dateDepot: null,
    dateLimite: null,
    dateAccordTacite: null,
    prochaineAction: 'Compléter et déposer le dossier',
  },
];

const DEMO_ALERTES = [
  {
    id: '1',
    dossierId: '1',
    type: 'delai_proche',
    titre: 'Date limite dans 7 jours',
    message: 'La mairie doit répondre avant le 15 mars 2025 pour votre dossier PC-75001-123456',
    dateEcheance: '2025-03-15',
    urgence: 'haute',
    estLue: false,
  },
  {
    id: '2',
    dossierId: '3',
    type: 'doc_required',
    titre: 'DOC à envoyer',
    message: 'N\'oubliez pas d\'envoyer la Déclaration d\'Ouverture de Chantier avant le début des travaux',
    dateEcheance: null,
    urgence: 'moyenne',
    estLue: false,
  },
  {
    id: '3',
    dossierId: '2',
    type: 'accord_tacite',
    titre: 'Accord tacite possible',
    message: 'La mairie n\'a pas répondu dans les délais légaux. Votre demande est accordée tacitement.',
    dateEcheance: '2025-03-02',
    urgence: 'info',
    estLue: true,
  },
];

export default function SuiviPage() {
  const { isSignedIn } = useUser();
  const [dossiers, setDossiers] = useState(DEMO_DOSSIERS);
  const [alertes, setAlertes] = useState(DEMO_ALERTES);
  const [selectedFilter, setSelectedFilter] = useState('tous');

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'brouillon':
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
      case 'depose':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'en_instruction':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'pieces_complementaires':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'accorde':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'refuse':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'accorde_tacite':
        return 'bg-purple-500/20 text-purple-400 border-purple-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'brouillon':
        return 'Brouillon';
      case 'depose':
        return 'Déposé';
      case 'en_instruction':
        return 'En instruction';
      case 'pieces_complementaires':
        return 'Pièces complémentaires';
      case 'accorde':
        return 'Accordé';
      case 'refuse':
        return 'Refusé';
      case 'accorde_tacite':
        return 'Accordé tacitement';
      default:
        return statut;
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'accorde':
      case 'accorde_tacite':
        return <CheckCircle className="w-5 h-5" />;
      case 'refuse':
        return <XCircle className="w-5 h-5" />;
      case 'en_instruction':
      case 'depose':
        return <Clock className="w-5 h-5" />;
      case 'pieces_complementaires':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Edit className="w-5 h-5" />;
    }
  };

  const calculateJoursRestants = (dateLimite) => {
    if (!dateLimite) return null;
    const today = new Date();
    const limite = new Date(dateLimite);
    const diff = Math.ceil((limite - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getUrgenceColor = (urgence) => {
    switch (urgence) {
      case 'haute':
        return 'bg-red-500/20 border-red-500 text-red-400';
      case 'moyenne':
        return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'info':
        return 'bg-blue-500/20 border-blue-500 text-blue-400';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const filteredDossiers = selectedFilter === 'tous' 
    ? dossiers 
    : dossiers.filter(d => d.statut === selectedFilter);

  const alertesNonLues = alertes.filter(a => !a.estLue);

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
        <h1 className="text-4xl md:text-5xl font-fraunces font-bold mb-6">
          Suivi des <span className="text-[#E8B420] italic">dossiers</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Suivez l'avancement de vos demandes d'urbanisme
        </p>

        {/* Alertes urgentes */}
        {alertesNonLues.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#E8B420]" />
              Alertes ({alertesNonLues.length})
            </h2>
            
            {alertesNonLues.map((alerte) => (
              <div key={alerte.id} className={`border rounded-lg p-4 ${getUrgenceColor(alerte.urgence)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{alerte.titre}</p>
                    <p className="text-sm mb-2">{alerte.message}</p>
                    {alerte.dateEcheance && (
                      <p className="text-xs opacity-75">
                        Échéance : {new Date(alerte.dateEcheance).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <button className="text-xs hover:underline">
                    Marquer comme lue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['tous', 'brouillon', 'depose', 'en_instruction', 'accorde', 'refuse'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedFilter === filter
                  ? 'bg-[#A07820] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}
            >
              {filter === 'tous' ? 'Tous' : getStatutLabel(filter)}
            </button>
          ))}
        </div>

        {/* Tableau des dossiers */}
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 font-semibold">Numéro de dossier</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Commune</th>
                  <th className="text-left p-4 font-semibold">Statut</th>
                  <th className="text-left p-4 font-semibold">Date dépôt</th>
                  <th className="text-left p-4 font-semibold">Jours restants</th>
                  <th className="text-left p-4 font-semibold">Prochaine action</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDossiers.map((dossier) => {
                  const joursRestants = calculateJoursRestants(dossier.dateLimite);
                  
                  return (
                    <tr key={dossier.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold">{dossier.numeroDossier}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm bg-white/5 px-2 py-1 rounded">{dossier.typeCerfa}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{dossier.commune}</p>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getStatutColor(dossier.statut)}`}>
                          {getStatutIcon(dossier.statut)}
                          <span className="text-sm font-semibold">{getStatutLabel(dossier.statut)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {dossier.dateDepot ? new Date(dossier.dateDepot).toLocaleDateString('fr-FR') : '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        {joursRestants !== null ? (
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${joursRestants <= 7 ? 'text-red-500' : 'text-[#E8B420]'}`} />
                            <span className={`text-sm font-semibold ${joursRestants <= 7 ? 'text-red-500' : ''}`}>
                              {joursRestants > 0 ? `${joursRestants} jours` : 'Dépassé'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-400">{dossier.prochaineAction}</p>
                      </td>
                      <td className="p-4">
                        <button className="text-[#E8B420] hover:text-[#E8B420]/80 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDossiers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucun dossier trouvé avec ce filtre</p>
          </div>
        )}

        {/* Légende des délais */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">À propos des délais</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              <strong>Délai légal :</strong> La mairie dispose d'un délai légal pour instruire votre dossier 
              (1 mois pour DP, 2 mois pour PC MI, 3 mois pour PC).
            </p>
            <p>
              <strong>Accord tacite :</strong> Si la mairie ne répond pas dans les délais légaux, 
              votre demande est considérée comme <strong className="text-green-500">accordée tacitement</strong>.
            </p>
            <p>
              <strong>DOC :</strong> Déclaration d'Ouverture de Chantier à envoyer le premier jour des travaux.
            </p>
            <p>
              <strong>DAACT :</strong> Déclaration d'Achèvement et de Conformité des Travaux à envoyer 
              dans les 90 jours suivant la fin des travaux.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
