import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { priceId, planName } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID manquant' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tarifs`,
      client_reference_id: userId,
      metadata: {
        clerkUserId: userId,
        planName: planName || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Erreur création Stripe Checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
