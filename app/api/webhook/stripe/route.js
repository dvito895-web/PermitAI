import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '../../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Mapping price → plan (priorise les vars d'env, fallback inclusion dans le nom)
function priceToPlan(priceId) {
  if (!priceId) return 'free';
  if (priceId === process.env.STRIPE_PRICE_STARTER) return 'starter';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_CABINET) return 'cabinet';
  if (priceId.toLowerCase().includes('starter')) return 'starter';
  if (priceId.toLowerCase().includes('pro')) return 'pro';
  if (priceId.toLowerCase().includes('cabinet')) return 'cabinet';
  return 'free';
}

// Mapping plan → crédits/mois (analyses)
function planCredits(plan) {
  return ({ free: 1, starter: 10, pro: 50, cabinet: 200 })[plan] || 1;
}

// Upsert User + Subscription (table dédiée pour historique)
async function syncUserAndSubscription({ clerkUserId, email, customerId, subscription }) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id;
  const plan = priceToPlan(priceId);
  const status = subscription.status || 'active'; // active, canceled, past_due, trialing, unpaid…
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // 1) Upsert User
  const where = clerkUserId ? { clerkId: clerkUserId } : { email: email || '' };
  let user = clerkUserId
    ? await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
    : await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });

  if (!user && email) {
    user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
  }

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        plan: status === 'active' || status === 'trialing' ? plan : 'free',
        credits: status === 'active' || status === 'trialing' ? planCredits(plan) : user.credits,
      },
    });
  } else if (clerkUserId) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email: email || `${clerkUserId}@stripe.unknown`,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        plan: status === 'active' || status === 'trialing' ? plan : 'free',
        credits: planCredits(plan),
      },
    });
  } else {
    console.warn('[stripe-webhook] No user identifiable for subscription', subscription.id);
    return null;
  }

  // 2) Upsert Subscription (1:1 avec User)
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      stripeSubId: subscription.id,
      stripeCustomerId: customerId,
      plan,
      status,
      currentPeriodEnd,
    },
    create: {
      userId: user.id,
      stripeSubId: subscription.id,
      stripeCustomerId: customerId,
      plan,
      status,
      currentPeriodEnd,
    },
  });

  return user;
}

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 });
  if (!webhookSecret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Création initiale via Stripe Checkout ──
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription' || !session.subscription) {
          console.log('[stripe-webhook] checkout.session.completed (non-sub)', session.id);
          break;
        }
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncUserAndSubscription({
          clerkUserId: session.client_reference_id,
          email: session.customer_email || session.customer_details?.email,
          customerId: session.customer,
          subscription,
        });
        console.log('✅ checkout.session.completed → subscription synced:', session.subscription);
        break;
      }

      // ── Création / mise à jour / suppression d'abonnement ──
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await syncUserAndSubscription({
          clerkUserId: subscription.metadata?.clerk_user_id || null,
          email: null,
          customerId: subscription.customer,
          subscription,
        });
        console.log(`✅ ${event.type}: ${subscription.id} → status=${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: subscription.customer } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: 'free', stripeSubscriptionId: null, credits: planCredits('free') },
          });
          await prisma.subscription.updateMany({
            where: { stripeSubId: subscription.id },
            data: { status: 'canceled' },
          });
        }
        console.log(`✅ Subscription canceled: ${subscription.id}`);
        break;
      }

      // ── Renouvellement automatique mensuel ──
      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const user = await syncUserAndSubscription({
            clerkUserId: subscription.metadata?.clerk_user_id || null,
            email: invoice.customer_email,
            customerId: invoice.customer,
            subscription,
          });
          if (user) {
            // Reset crédits mensuels au renouvellement
            await prisma.user.update({
              where: { id: user.id },
              data: { credits: planCredits(priceToPlan(subscription.items.data[0]?.price?.id)) },
            });
          }
        }
        console.log(`✅ Invoice paid: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: invoice.customer } });
        if (user) {
          await prisma.subscription.updateMany({
            where: { userId: user.id },
            data: { status: 'past_due' },
          });
          // Optionnel : créer une alerte interne (model Alerte)
          await prisma.alerte.create({
            data: {
              userId: user.id,
              typeAlerte: 'payment_failed',
              message: `Paiement échoué pour facture ${invoice.number || invoice.id}. Mettez à jour votre moyen de paiement.`,
            },
          }).catch(() => {/* ignore si modèle indispo */});
        }
        console.warn(`⚠️ Invoice payment_failed: ${invoice.id} customer=${invoice.customer}`);
        break;
      }

      default:
        console.log(`ℹ️ Event non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true, event: event.type });
  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET pour debug : confirme que la route est joignable
export async function GET() {
  return NextResponse.json({
    status: 'webhook stripe ready',
    configured: !!webhookSecret && !!process.env.STRIPE_SECRET_KEY,
    events: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ],
  });
}
