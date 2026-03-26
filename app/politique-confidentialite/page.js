'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/">
            <button className="btn-secondary">Retour à l'accueil</button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="hero-title mb-6">Politique de <span className="text-[#e8b420] italic">confidentialité</span></h1>
          <p className="hero-subtitle mb-12">Protection des données personnelles conforme au RGPD</p>

          <div className="card-premium space-y-8">
            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">1. Responsable du traitement</h2>
              <div className="text-[14px] text-[#8a857d] space-y-2 leading-relaxed">
                <p><strong className="text-[#f0ede8]">Raison sociale :</strong> PermitAI SAS</p>
                <p><strong className="text-[#f0ede8]">Siège social :</strong> 123 Cours de l'Intendance, 33000 Bordeaux, France</p>
                <p><strong className="text-[#f0ede8]">Email :</strong> <a href="mailto:contact@permitai.eu" className="text-[#e8b420] hover:underline">contact@permitai.eu</a></p>
                <p><strong className="text-[#f0ede8]">DPO (Délégué à la Protection des Données) :</strong> <a href="mailto:dpo@permitai.eu" className="text-[#e8b420] hover:underline">dpo@permitai.eu</a></p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">2. Données collectées</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Nous collectons les données suivantes lors de votre utilisation de PermitAI :</p>
                <p><strong className="text-[#f0ede8]">2.1 Données d'identification</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone (optionnel)</li>
                </ul>
                <p><strong className="text-[#f0ede8]">2.2 Données de projet</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresses analysées</li>
                  <li>Descriptions de projets de construction</li>
                  <li>Documents et pièces jointes uploadés</li>
                  <li>Formulaires CERFA générés</li>
                </ul>
                <p><strong className="text-[#f0ede8]">2.3 Données de paiement</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Informations de facturation (via Stripe, nous ne stockons pas les numéros de carte)</li>
                  <li>Historique de paiements et abonnements</li>
                </ul>
                <p><strong className="text-[#f0ede8]">2.4 Données de navigation</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Pages visitées et actions effectuées</li>
                  <li>Appareil et navigateur utilisés</li>
                  <li>Cookies (voir section dédiée)</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">3. Finalités du traitement</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Vos données sont collectées et traitées pour les finalités suivantes :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-[#f0ede8]">Fourniture du service :</strong> Analyses PLU, génération CERFA, dépôt en mairie</li>
                  <li><strong className="text-[#f0ede8]">Gestion de compte :</strong> Création, authentification, gestion des abonnements</li>
                  <li><strong className="text-[#f0ede8]">Facturation :</strong> Traitement des paiements, émission de factures</li>
                  <li><strong className="text-[#f0ede8]">Amélioration du service :</strong> Entraînement de nos modèles IA, optimisation de l'expérience utilisateur</li>
                  <li><strong className="text-[#f0ede8]">Communication :</strong> Envoi d'emails de service (alertes, notifications, confirmations)</li>
                  <li><strong className="text-[#f0ede8]">Support client :</strong> Assistance technique et réponse aux demandes</li>
                  <li><strong className="text-[#f0ede8]">Conformité légale :</strong> Respect des obligations légales (facturation, conservation)</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">4. Base légale des traitements</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Conformément au RGPD, nos traitements reposent sur les bases légales suivantes :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-[#f0ede8]">Exécution du contrat :</strong> Fourniture du service souscrit</li>
                  <li><strong className="text-[#f0ede8]">Consentement :</strong> Newsletter, cookies analytics (optionnels)</li>
                  <li><strong className="text-[#f0ede8]">Intérêt légitime :</strong> Amélioration du service, prévention de la fraude</li>
                  <li><strong className="text-[#f0ede8]">Obligation légale :</strong> Conservation des données de facturation</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">5. Durée de conservation</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Nous conservons vos données pour les durées suivantes :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-[#f0ede8]">Données de compte :</strong> Durée de l'abonnement + 3 ans après résiliation</li>
                  <li><strong className="text-[#f0ede8]">Analyses PLU :</strong> Durée de l'abonnement + 1 an</li>
                  <li><strong className="text-[#f0ede8]">Données de facturation :</strong> 10 ans (obligation légale comptable)</li>
                  <li><strong className="text-[#f0ede8]">Cookies analytics :</strong> 13 mois maximum</li>
                  <li><strong className="text-[#f0ede8]">Logs techniques :</strong> 12 mois</li>
                </ul>
                <p>Au-delà de ces durées, vos données sont supprimées ou anonymisées.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">6. Destinataires des données</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Vos données peuvent être transmises aux destinataires suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-[#f0ede8]">Personnel autorisé :</strong> Équipe PermitAI (accès limité au strict nécessaire)</li>
                  <li><strong className="text-[#f0ede8]">Sous-traitants :</strong>
                    <ul className="list-circle list-inside ml-6 mt-1">
                      <li>Clerk.dev (authentification)</li>
                      <li>Stripe (paiements)</li>
                      <li>Anthropic & Google (IA pour analyses PLU)</li>
                      <li>Vercel (hébergement)</li>
                      <li>Resend (envoi d'emails)</li>
                      <li>Plausible Analytics (statistiques anonymes)</li>
                    </ul>
                  </li>
                  <li><strong className="text-[#f0ede8]">Autorités :</strong> Sur réquisition légale uniquement</li>
                </ul>
                <p className="mt-3">Tous nos sous-traitants sont soumis à des obligations de confidentialité et de sécurité strictes.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">7. Transferts hors UE</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Certains de nos sous-traitants sont situés hors de l'Union Européenne (États-Unis notamment : Stripe, Anthropic, Vercel).</p>
                <p>Ces transferts sont sécurisés par :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Clauses contractuelles types de la Commission Européenne</li>
                  <li>Certifications EU-US Data Privacy Framework</li>
                  <li>Mesures de sécurité renforcées</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">8. Vos droits</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-[#f0ede8]">Droit d'accès :</strong> Obtenir une copie de vos données</li>
                  <li><strong className="text-[#f0ede8]">Droit de rectification :</strong> Corriger vos données inexactes</li>
                  <li><strong className="text-[#f0ede8]">Droit à l'effacement :</strong> Supprimer vos données (« droit à l'oubli »)</li>
                  <li><strong className="text-[#f0ede8]">Droit à la limitation :</strong> Restreindre le traitement de vos données</li>
                  <li><strong className="text-[#f0ede8]">Droit d'opposition :</strong> S'opposer au traitement pour motif légitime</li>
                  <li><strong className="text-[#f0ede8]">Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
                  <li><strong className="text-[#f0ede8]">Droit de retirer votre consentement :</strong> Pour les traitements basés sur le consentement</li>
                </ul>
                <p className="mt-4">Pour exercer ces droits, contactez-nous à : <a href="mailto:dpo@permitai.eu" className="text-[#e8b420] hover:underline">dpo@permitai.eu</a></p>
                <p>Nous répondrons dans un délai d'1 mois maximum. Vous pouvez également déposer une réclamation auprès de la CNIL (www.cnil.fr).</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">9. Sécurité des données</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Nous mettons en œuvre les mesures de sécurité suivantes pour protéger vos données :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Chiffrement SSL/TLS de toutes les communications</li>
                  <li>Chiffrement des données sensibles en base de données</li>
                  <li>Authentification sécurisée via Clerk (2FA disponible)</li>
                  <li>Sauvegardes quotidiennes automatiques</li>
                  <li>Contrôle d'accès strict au personnel autorisé</li>
                  <li>Surveillance et détection des intrusions</li>
                  <li>Audits de sécurité réguliers</li>
                </ul>
                <p className="mt-3">En cas de violation de données, nous vous informerons dans les 72h conformément au RGPD.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">10. Cookies et traceurs</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Nous utilisons les cookies suivants :</p>
                <p><strong className="text-[#f0ede8]">Cookies strictement nécessaires (pas de consentement requis) :</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cookies de session Clerk (authentification)</li>
                  <li>Cookies de préférences (langue, thème)</li>
                </ul>
                <p><strong className="text-[#f0ede8]">Cookies analytics (consentement requis) :</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Plausible Analytics (anonyme, sans tracking individuel, conforme RGPD)</li>
                </ul>
                <p className="mt-3">Vous pouvez paramétrer vos préférences de cookies via votre navigateur. Le refus des cookies analytics n'impacte pas les fonctionnalités du site.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">11. Modification de la politique</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Nous pouvons modifier cette politique de confidentialité à tout moment. Vous serez informé par email des modifications substantielles.</p>
                <p>La version en vigueur est toujours accessible sur cette page avec sa date de dernière mise à jour.</p>
              </div>
            </div>

            <div className="border-t border-[#1c1c2a] pt-6">
              <p className="text-[12px] text-[#3c3830]">Dernière mise à jour : Mars 2025</p>
              <p className="text-[12px] text-[#3c3830] mt-2">Questions ? Contactez notre DPO : <a href="mailto:dpo@permitai.eu" className="text-[#e8b420] hover:underline">dpo@permitai.eu</a></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
