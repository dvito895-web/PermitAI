export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const PRODUCTS = {
  analyse: { amount: 4900, name: 'Analyse PLU complète + rapport PDF' },
  cerfa:   { amount: 9900, name: 'CERFA pré-rempli + pièces vérifiées' },
  depot:   { amount: 19900, name: 'Dépôt mairie complet + suivi 60 jours' },
  pack:    { amount: 29900, name: 'Pack Tout-en-un (Analyse + CERFA + Dépôt)' },
  recours: { amount: 39900, name: 'Recours après refus — lettre + dossier IA' },
  audit:   { amount: 14900, name: 'Audit terrain avant achat' },
};

export async function POST(request) {
  try {
    const { product } = await request.json();
    const p = PRODUCTS[product];
    if (!p) return NextResponse.json({ error: 'Produit invalide' }, { status: 400 });

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.includes('placeholder') || key.includes('test_placeholder')) {
      const subject = encodeURIComponent(`Achat - ${p.name}`);
      const body = encodeURIComponent(`Je souhaite acheter : ${p.name} (${p.amount/100}€)`);
      return NextResponse.json({ url: `mailto:contact@permitai.eu?subject=${subject}&body=${body}` });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      line_items: [{ price_data: { currency: 'eur', product_data: { name: p.name }, unit_amount: p.amount }, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://permitai.eu'}/dashboard?success=true&product=${product}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://permitai.eu'}/tarifs`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ url: 'mailto:contact@permitai.eu' });
  }
}
