import Link from 'next/link';
import { Building2, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06060e] flex items-center justify-center px-6">
      <div className="text-center">
        <Building2 className="w-16 h-16 text-[#e8b420] mx-auto mb-6" />
        <h1 className="text-[48px] font-fraunces font-medium text-[#f0ede8] mb-4">
          Page non trouvée
        </h1>
        <p className="text-[16px] text-[#8a857d] mb-8 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <button className="btn-primary inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
