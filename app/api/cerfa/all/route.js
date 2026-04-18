import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db.js';

export async function GET() {
  try {
    const cerfas = await prisma.cerfaFormulaire.findMany({
      orderBy: { numero: 'asc' }
    });

    return NextResponse.json(cerfas);
  } catch (error) {
    console.error('CERFA list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
