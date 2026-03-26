'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function CGUPage() {
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
          <h1 className="hero-title mb-6">Conditions Générales <span className="text-[#e8b420] italic">d'Utilisation</span></h1>
          <p className="hero-subtitle mb-12">Conditions régissant l'utilisation du service PermitAI</p>

          <div className="card-premium space-y-8">
            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">1. Objet</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions dans lesquelles PermitAI SAS met à disposition des utilisateurs son service d'analyse de Plans Locaux d'Urbanisme (PLU), de génération de formulaires CERFA et d'assistance au dépôt de dossiers de permis de construire.</p>
                <p>L'accès et l'utilisation du service PermitAI impliquent l'acceptation pleine et entière des présentes CGU par l'utilisateur.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">2. Définitions</h2>
              <div className="text-[14px] text-[#8a857d] space-y-2 leading-relaxed">
                <p><strong className="text-[#f0ede8]">Service :</strong> Désigne l'ensemble des fonctionnalités proposées par PermitAI accessible via le site web permitai.eu</p>
                <p><strong className="text-[#f0ede8]">Utilisateur :</strong> Toute personne physique ou morale accédant et utilisant le Service</p>
                <p><strong className="text-[#f0ede8]">Compte :</strong> Espace personnel créé par l'utilisateur pour accéder au Service</p>
                <p><strong className="text-[#f0ede8]">Abonnement :</strong> Souscription à l'un des plans tarifaires (Gratuit, Starter, Pro, Cabinet)</p>
                <p><strong className="text-[#f0ede8]">Analyse PLU :</strong> Service d'analyse automatisée des règles d'urbanisme applicables à une adresse donnée</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">3. Inscription et compte utilisateur</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p><strong className="text-[#f0ede8]">3.1 Création de compte</strong><br/>Pour accéder aux fonctionnalités du Service, l'utilisateur doit créer un compte en fournissant des informations exactes et à jour (adresse email, nom, prénom).</p>
                <p><strong className="text-[#f0ede8]">3.2 Sécurité du compte</strong><br/>L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation du compte est réputée émaner de l'utilisateur.</p>
                <p><strong className="text-[#f0ede8]">3.3 Suspension du compte</strong><br/>PermitAI se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU ou d'utilisation frauduleuse du Service.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">4. Description du service</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>PermitAI propose les services suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-[#f0ede8]">Analyse PLU :</strong> Analyse automatisée des règles d'urbanisme applicables à une adresse via intelligence artificielle</li>
                  <li><strong className="text-[#f0ede8]">Génération CERFA :</strong> Pré-remplissage automatique des formulaires administratifs officiels (PC MI, DP MI, CU, etc.)</li>
                  <li><strong className="text-[#f0ede8]">Dépôt en mairie :</strong> Assistance au dépôt de dossiers via PLAT'AU ou LRAR selon la commune</li>
                  <li><strong className="text-[#f0ede8]">Suivi de dossier :</strong> Tableau de bord de suivi de l'avancement des dossiers déposés</li>
                  <li><strong className="text-[#f0ede8]">Alertes :</strong> Notifications automatiques sur les délais légaux et révisions PLU</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">5. Plans tarifaires et paiement</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p><strong className="text-[#f0ede8]">5.1 Plans disponibles</strong><br/>Le Service propose quatre plans : Gratuit (1 analyse limitée), Starter (29€/mois), Pro (89€/mois), et Cabinet (199€/mois). Les fonctionnalités et limites de chaque plan sont détaillées sur la page Tarifs.</p>
                <p><strong className="text-[#f0ede8]">5.2 Modalités de paiement</strong><br/>Les paiements sont effectués par carte bancaire via Stripe. Les abonnements sont renouvelés automatiquement chaque mois sauf résiliation.</p>
                <p><strong className="text-[#f0ede8]">5.3 Résiliation</strong><br/>L'utilisateur peut résilier son abonnement à tout moment depuis son espace personnel. La résiliation prend effet à la fin de la période en cours, sans remboursement au prorata.</p>
                <p><strong className="text-[#f0ede8]">5.4 Modification des tarifs</strong><br/>PermitAI se réserve le droit de modifier ses tarifs à tout moment. Les nouveaux tarifs s'appliquent aux nouvelles souscriptions. Les abonnements en cours conservent leurs tarifs jusqu'au renouvellement.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">6. Utilisation du service</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p><strong className="text-[#f0ede8]">6.1 Usage autorisé</strong><br/>Le Service est destiné à un usage professionnel et personnel dans le cadre de projets de construction légaux. Toute utilisation à des fins illégales est strictement interdite.</p>
                <p><strong className="text-[#f0ede8]">6.2 Usages interdits</strong><br/>Il est notamment interdit de :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Revendre ou redistribuer les analyses PLU sans autorisation</li>
                  <li>Utiliser des scripts automatisés pour extraire massivement des données</li>
                  <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
                  <li>Surcharger volontairement les serveurs</li>
                  <li>Utiliser le Service pour diffuser du contenu illégal ou nuisible</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">7. Responsabilités et garanties</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p><strong className="text-[#f0ede8]">7.1 Nature du service</strong><br/>Les analyses PLU fournies par PermitAI sont générées automatiquement par intelligence artificielle à partir de données officielles. Elles sont fournies à titre indicatif et ne constituent pas un conseil juridique.</p>
                <p><strong className="text-[#f0ede8]">7.2 Limitation de responsabilité</strong><br/>PermitAI ne saurait être tenu responsable :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>En cas de refus de permis de construire par une mairie</li>
                  <li>Des erreurs ou inexactitudes dans les données PLU sources</li>
                  <li>Des décisions prises par l'utilisateur sur la base des analyses fournies</li>
                  <li>Des interruptions temporaires du Service pour maintenance</li>
                </ul>
                <p><strong className="text-[#f0ede8]">7.3 Recommandations</strong><br/>Il est fortement recommandé à l'utilisateur de consulter un professionnel qualifié (architecte, avocat spécialisé) avant tout dépôt officiel de dossier.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">8. Données personnelles</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Le traitement des données personnelles est régi par notre <Link href="/politique-confidentialite" className="text-[#e8b420] hover:underline">Politique de confidentialité</Link>, conforme au RGPD.</p>
                <p>Les données collectées incluent : email, nom, prénom, adresses analysées, projets décrits, historique d'utilisation.</p>
                <p>Ces données sont utilisées pour fournir le Service, améliorer nos algorithmes, et communiquer avec l'utilisateur.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">9. Propriété intellectuelle</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Tous les éléments du Service (logiciel, base de données, interface, logos, etc.) sont la propriété exclusive de PermitAI SAS et sont protégés par le droit d'auteur et le droit des bases de données.</p>
                <p>L'utilisateur dispose d'un droit d'utilisation personnel et non exclusif du Service dans le cadre de son abonnement.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">10. Modification des CGU</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>PermitAI se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email des modifications substantielles.</p>
                <p>L'utilisation continue du Service après modification vaut acceptation des nouvelles CGU.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">11. Droit applicable et litiges</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Les présentes CGU sont régies par le droit français.</p>
                <p>En cas de litige, l'utilisateur peut recourir à une médiation de la consommation avant toute action judiciaire.</p>
                <p>À défaut d'accord amiable, tout litige relèvera de la compétence exclusive des tribunaux français.</p>
              </div>
            </div>

            <div className="border-t border-[#1c1c2a] pt-6">
              <p className="text-[12px] text-[#3c3830]">Dernière mise à jour : Mars 2025</p>
              <p className="text-[12px] text-[#3c3830] mt-2">Pour toute question : <a href="mailto:contact@permitai.eu" className="text-[#e8b420] hover:underline">contact@permitai.eu</a></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
