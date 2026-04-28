export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '../../../../lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'utilisateur depuis la DB
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Formater les analyses pour le frontend
    const analyses = user.analyses.map(a => ({
      id: a.id,
      adresse: a.adresse,
      communeCode: a.communeCode,
      description: a.description,
      verdict: a.verdict,
      createdAt: a.createdAt,
      isDemo: a.isDemo,
    }));

    return NextResponse.json(analyses);
  } catch (error) {
    console.error('❌ Erreur récupération historique:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
