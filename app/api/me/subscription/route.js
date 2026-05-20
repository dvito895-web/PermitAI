// app/api/me/subscription/route.js
// Retourne l'état de l'abonnement courant de l'utilisateur Clerk.
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '../../../../lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLAN_LIMITS = {
  free:    { credits: 1,   label: 'Découverte',  price: 0 },
  starter: { credits: 10,  label: 'Starter',     price: 29 },
  pro:     { credits: 50,  label: 'Pro',         price: 79 },
  cabinet: { credits: 200, label: 'Cabinet',     price: 249 },
};

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      // Mode démo non-authentifié : renvoie plan free fictif
      return NextResponse.json({
        authenticated: false,
        plan: 'free',
        status: 'inactive',
        credits: 1,
        credits_used: 0,
        limit: PLAN_LIMITS.free,
      });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    }).catch(() => null);

    // Crée un user "free" par défaut si premier accès
    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId, email: `${userId}@unknown`, plan: 'free', credits: 1 },
      }).catch(() => null);
    }

    const sub = user?.subscription;
    const plan = user?.plan || 'free';
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    return NextResponse.json({
      authenticated: true,
      user_id: user?.id,
      plan,
      status: sub?.status || (user?.stripeSubscriptionId ? 'active' : 'inactive'),
      credits: user?.credits ?? limit.credits,
      credits_used: Math.max(0, limit.credits - (user?.credits ?? limit.credits)),
      limit,
      stripe_customer_id: user?.stripeCustomerId || null,
      stripe_subscription_id: user?.stripeSubscriptionId || null,
      current_period_end: sub?.currentPeriodEnd || null,
      has_portal: !!user?.stripeCustomerId,
    });
  } catch (e) {
    console.error('[me/subscription] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
