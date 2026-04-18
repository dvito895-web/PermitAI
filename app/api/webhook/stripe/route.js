import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '../../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { customer, client_reference_id, subscription } = session;
        const clerkUserId = client_reference_id;

        if (!clerkUserId) break;

        // Récupérer le subscription pour connaître le plan
        const sub = await stripe.subscriptions.retrieve(subscription);
        const priceId = sub.items.data[0].price.id;

        // Mapper priceId → plan
        let plan = 'free';
        if (priceId.includes('starter')) plan = 'starter';
        else if (priceId.includes('pro')) plan = 'pro';
        else if (priceId.includes('cabinet')) plan = 'cabinet';

        // Mettre à jour l'utilisateur
        await prisma.user.upsert({
          where: { clerkId: clerkUserId },
          update: {
            stripeCustomerId: customer,
            stripeSubscriptionId: subscription,
            plan,
          },
          create: {
            id: crypto.randomUUID(),
            clerkId: clerkUserId,
            email: session.customer_email || '',
            stripeCustomerId: customer,
            stripeSubscriptionId: subscription,
            plan,
          },
        });

        console.log(`✅ Subscription créé pour user ${clerkUserId} (plan: ${plan})`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) break;

        const priceId = subscription.items.data[0].price.id;
        let plan = 'free';
        if (priceId.includes('starter')) plan = 'starter';
        else if (priceId.includes('pro')) plan = 'pro';
        else if (priceId.includes('cabinet')) plan = 'cabinet';

        await prisma.user.update({
          where: { id: user.id },
          data: { plan },
        });

        console.log(`✅ Subscription mis à jour pour user ${user.clerkId} (plan: ${plan})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'free',
            stripeSubscriptionId: null,
          },
        });

        console.log(`✅ Subscription annulé pour user ${user.clerkId}, retour au plan gratuit`);
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('✅ Paiement réussi:', event.data.object.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('❌ Paiement échoué:', invoice.id);
        // TODO: Envoyer email d'alerte utilisateur via Resend
        break;
      }

      default:
        console.log(`ℹ️ Event non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
