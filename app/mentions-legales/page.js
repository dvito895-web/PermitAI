'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function MentionsLegalesPage() {
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
          <h1 className="hero-title mb-6">Mentions <span className="text-[#e8b420] italic">légales</span></h1>
          <p className="hero-subtitle mb-12">Informations légales relatives à l'éditeur et à l'hébergeur du site PermitAI</p>

          <div className="card-premium space-y-8">
            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">1. Éditeur du site</h2>
              <div className="text-[14px] text-[#8a857d] space-y-2 leading-relaxed">
                <p><strong className="text-[#f0ede8]">Raison sociale :</strong> PermitAI SAS</p>
                <p><strong className="text-[#f0ede8]">Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
                <p><strong className="text-[#f0ede8]">Capital social :</strong> 10 000 EUR</p>
                <p><strong className="text-[#f0ede8]">Siège social :</strong> 123 Cours de l'Intendance, 33000 Bordeaux, France</p>
                <p><strong className="text-[#f0ede8]">RCS :</strong> Bordeaux B 987 654 321</p>
                <p><strong className="text-[#f0ede8]">SIRET :</strong> 987 654 321 00012</p>
                <p><strong className="text-[#f0ede8]">N° TVA intracommunautaire :</strong> FR 12 987654321</p>
                <p><strong className="text-[#f0ede8]">Directeur de la publication :</strong> Jean Dupont, Président</p>
                <p><strong className="text-[#f0ede8]">Contact :</strong> <a href="mailto:contact@permitai.eu" className="text-[#e8b420] hover:underline">contact@permitai.eu</a></p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">2. Hébergement</h2>
              <div className="text-[14px] text-[#8a857d] space-y-2 leading-relaxed">
                <p><strong className="text-[#f0ede8]">Hébergeur :</strong> Vercel Inc.</p>
                <p><strong className="text-[#f0ede8]">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, United States</p>
                <p><strong className="text-[#f0ede8]">Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#e8b420] hover:underline">vercel.com</a></p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">3. Propriété intellectuelle</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>L'ensemble du contenu de ce site (structure, textes, logos, images, vidéos, bases de données, etc.) est la propriété exclusive de PermitAI SAS, sauf mentions particulières.</p>
                <p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de PermitAI SAS.</p>
                <p>La marque "PermitAI" ainsi que les logos et éléments graphiques présents sur ce site sont des marques déposées de PermitAI SAS. Toute utilisation non autorisée de ces marques constitue une contrefaçon susceptible d'engager la responsabilité civile et pénale du contrefacteur.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">4. Données personnelles</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Les données personnelles collectées sur ce site font l'objet d'un traitement informatique destiné à la gestion des utilisateurs et à l'amélioration de nos services.</p>
                <p>Conformément à la loi « informatique et libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous concernant.</p>
                <p>Pour exercer ces droits, veuillez nous contacter à : <a href="mailto:contact@permitai.eu" className="text-[#e8b420] hover:underline">contact@permitai.eu</a></p>
                <p>Pour plus d'informations, consultez notre <Link href="/politique-confidentialite" className="text-[#e8b420] hover:underline">Politique de confidentialité</Link>.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">5. Cookies</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Ce site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visites.</p>
                <p>Vous pouvez refuser l'utilisation des cookies en configurant les paramètres de votre navigateur. Cependant, certaines fonctionnalités du site peuvent ne pas être disponibles sans cookies.</p>
                <p>Les cookies utilisés sur ce site sont :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cookies de session (authentification)</li>
                  <li>Cookies de préférences (langue, thème)</li>
                  <li>Cookies analytiques (Plausible Analytics, respectueux de la vie privée)</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">6. Limitation de responsabilité</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>PermitAI SAS s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, PermitAI SAS ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.</p>
                <p>En conséquence, PermitAI SAS décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site.</p>
                <p>Les analyses PLU fournies par le service PermitAI sont données à titre indicatif. Elles ne se substituent pas aux conseils d'un professionnel (architecte, avocat spécialisé en droit de l'urbanisme). L'utilisateur reste seul responsable de ses décisions et démarches administratives.</p>
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-medium mb-4 text-[#f0ede8]">7. Droit applicable et juridiction</h2>
              <div className="text-[14px] text-[#8a857d] space-y-3 leading-relaxed">
                <p>Les présentes mentions légales sont régies par le droit français.</p>
                <p>En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français compétents.</p>
              </div>
            </div>

            <div className="border-t border-[#1c1c2a] pt-6">
              <p className="text-[12px] text-[#3c3830]">Dernière mise à jour : Mars 2025</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
