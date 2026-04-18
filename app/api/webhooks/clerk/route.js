import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { sendWelcomeEmail } from '../../../../lib/email';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET manquant');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('❌ Clerk webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address || '';

        await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            clerkId: id,
            email,
            firstName: first_name || '',
            lastName: last_name || '',
            plan: 'free',
          },
        });

        console.log(`✅ Utilisateur créé: ${email} (Clerk ID: ${id})`);

        // Envoyer email de bienvenue
        try {
          await sendWelcomeEmail({
            to: email,
            firstName: first_name || 'Utilisateur',
          });
          console.log(`📧 Email de bienvenue envoyé à ${email}`);
        } catch (emailErr) {
          console.error('❌ Erreur envoi email bienvenue:', emailErr.message);
        }

        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address || '';

        await prisma.user.updateMany({
          where: { clerkId: id },
          data: {
            email,
            firstName: first_name || '',
            lastName: last_name || '',
          },
        });

        console.log(`✅ Utilisateur mis à jour: ${email}`);
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        await prisma.user.updateMany({
          where: { clerkId: id },
          data: { deletedAt: new Date() },
        });

        console.log(`✅ Utilisateur supprimé (soft delete): Clerk ID ${id}`);
        break;
      }

      default:
        console.log(`ℹ️ Event Clerk non géré: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook Clerk:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
