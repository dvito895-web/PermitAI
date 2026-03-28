import { NextResponse } from 'next/server';
import { sendWelcomeEmail, sendAnalyseConfirmationEmail, sendDepotConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { type, ...data } = await request.json();

    let result;
    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(data.email, data.name);
        break;
      case 'analyse':
        result = await sendAnalyseConfirmationEmail(data.email, data.name, data.analysisData);
        break;
      case 'depot':
        result = await sendDepotConfirmationEmail(data.email, data.name, data.depotData);
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
