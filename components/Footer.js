import Link from 'next/link';
import { Building2, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#06060e] border-t border-[#1c1c2a] py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Building2 className="w-6 h-6 text-[#e8b420]" />
              <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
            </Link>
            <p className="text-[13px] text-[#8a857d] leading-relaxed">
              Simplifiez vos démarches d'urbanisme avec l'intelligence artificielle.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h3 className="text-[14px] font-medium text-[#f0ede8] mb-4">Produit</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/analyse" className="text-[13px] text-[#8a857d] hover:text-[#e8b420] transition-colors">
                  Analyser mon terrain
                </Link>
              </li>
              <li>
                <Link href="/cerfa" className="text-[13px] text-[#8a857d] hover:text-[#e8b420] transition-colors">
                  Formulaires CERFA
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="text-[13px] text-[#8a857d] hover:text-[#e8b420] transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[13px] text-[#8a857d] hover:text-[#e8b420] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-[14px] font-medium text-[#f0ede8] mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-[13px] text-[#8a857d] hover:text-[#e8b420] transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-[13px] text-[#8a857d] hover:text-[#e8b420] transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-[13px] text-[#8a857d] hover:text-[#e8b420] transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[14px] font-medium text-[#f0ede8] mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#e8b420] mt-0.5 flex-shrink-0" />
                <a href="mailto:contact@permitai.eu" className="text-[13px] text-[#8a857d] hover:text-[#e8b420] transition-colors">
                  contact@permitai.eu
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#e8b420] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#8a857d]">
                  France
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#1c1c2a] text-center">
          <p className="text-[13px] text-[#8a857d]">
            © {currentYear} PermitAI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
