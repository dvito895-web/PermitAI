// app/api/stripe/portal/route.js
// Crée une session "Customer Portal" Stripe pour que l'utilisateur gère son abonnement.
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import prisma from '../../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { userId } = auth();
    const body = await req.json().catch(() => ({}));
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard`;

    // Récupère le customer Stripe lié à l'utilisateur Clerk
    let customerId = body.customerId;
    if (!customerId && userId) {
      const user = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
      customerId = user?.stripeCustomerId;
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Aucun abonnement actif. Souscrivez d\'abord à un plan.' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('[stripe/portal] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
