import Link from 'next/link';
import { Building2 } from 'lucide-react';
import prisma from '../../lib/db.js';
import CerfaListClient from './CerfaListClient';

export const metadata = {
  title: 'Formulaires CERFA — 13 types de permis et déclarations',
  description: 'Tous les formulaires CERFA pour permis de construire, déclaration préalable, certificat d\'urbanisme. Guides complets et génération automatique.',
};

export default async function CerfaListPage() {
  const cerfas = await prisma.cerfaFormulaire.findMany({
    orderBy: { numero: 'asc' }
  });

  const cerfasData = cerfas.map(c => ({
    numero: c.numero,
    nom: c.nom,
    description: c.description,
    categorie: c.categorie,
    delaiInstruction: c.delaiInstruction,
    slug: c.slug
  }));

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/dashboard">
            <button className="btn-secondary">Dashboard</button>
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="hero-title mb-6 text-center">
            Formulaires <span className="text-[#e8b420] italic">CERFA</span>
          </h1>
          <p className="hero-subtitle text-center mb-12">
            13 formulaires officiels pour vos projets de construction
          </p>

          <CerfaListClient initialCerfas={cerfasData} />
        </div>
      </section>
    </div>
  );
}
