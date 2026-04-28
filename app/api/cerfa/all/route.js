export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { CERFA_LIST } from '../../../../lib/cerfaList';

export async function GET() {
  try {
    return NextResponse.json({ cerfa: CERFA_LIST });
  } catch (error) {
    return NextResponse.json({ cerfa: [] });
  }
}
