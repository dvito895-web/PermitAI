import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db.js';

export async function GET(request, { params }) {
  try {
    const { numero } = params;

    const cerfa = await prisma.cerfaFormulaire.findUnique({
      where: { numero }
    });

    if (!cerfa) {
      return NextResponse.json(
        { error: 'CERFA not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cerfa);
  } catch (error) {
    console.error('CERFA API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
