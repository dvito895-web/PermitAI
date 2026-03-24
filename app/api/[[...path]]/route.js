import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '@/lib/db';
import Stripe from 'stripe';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  const method = request.method;

  try {
    // Health check endpoint - GET /api/health
    if (route === '/health' && method === 'GET') {
      return handleCORS(NextResponse.json({
        status: 'ok',
        service: 'PermitAI',
        version: '2.0.0',
      }));
    }

    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'PermitAI API v2.0' }));
    }

    // PLU Query endpoint - POST /api/plu/query
    if (route === '/plu/query' && method === 'POST') {
      const authObj = auth();
      if (!authObj.userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const body = await request.json();
      const { adresse, description, is_demo = false } = body;

      if (!adresse || !description) {
        return handleCORS(NextResponse.json(
          { error: 'adresse and description are required' },
          { status: 400 }
        ));
      }

      // Geocode address using French Government API
      const geocodeUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.features || geocodeData.features.length === 0) {
        return handleCORS(NextResponse.json({
          error: 'Address not found',
          message: 'Unable to geocode the provided address'
        }, { status: 404 }));
      }

      const feature = geocodeData.features[0];
      const communeCode = feature.properties.citycode;
      const communeNom = feature.properties.city;
      const coordinates = feature.geometry.coordinates;

      // Search for PLU rules in database
      const pluRules = await prisma.pluChunk.findMany({
        where: { communeCode },
        take: is_demo ? 2 : 20,
      });

      if (pluRules.length === 0) {
        return handleCORS(NextResponse.json({
          verdict: 'non_indexee',
          commune: communeNom,
          commune_code: communeCode,
          message: 'Cette commune n est pas encore indexee dans notre base',
          geoportail_url: `https://www.geoportail-urbanisme.gouv.fr/map/#tile=1&lon=${coordinates[0]}&lat=${coordinates[1]}&zoom=16`,
          coordinates: { lon: coordinates[0], lat: coordinates[1] }
        }));
      }

      // Build context for Claude
      const contextRules = pluRules.map((rule, i) => 
        `Regle ${i + 1} - ${rule.article || 'N/A'}: ${rule.texte}`
      ).join('\\n\\n');

      const prompt = `Tu es un expert en droit de l'urbanisme francais avec 20 ans d'experience. Tu connais parfaitement tous les PLU de France.

Voici les regles PLU applicables pour ${communeNom} (code ${communeCode}):
${contextRules}

Le projet est : ${description}

Analyse la conformite du projet avec ces regles. Reponds UNIQUEMENT en JSON valide sans aucun texte autour, avec cette structure exacte:
{
  "verdict": "conforme" | "non_conforme" | "conforme_sous_conditions" | "incertain",
  "score_confiance": 0-100,
  "resume": "Resume en 2 phrases claires",
  "commune": "${communeNom}",
  "regles_applicables": [
    {
      "article": "Article exact",
      "contenu": "Extrait de la regle",
      "impact": "favorable" | "defavorable" | "neutre"
    }
  ],
  "conditions": ["Condition 1", "Condition 2"],
  "points_vigilance": ["Point 1", "Point 2"],
  "cerfa_recommande": "PC_MI" | "DP_MI" | "CU" | etc,
  "architecte_obligatoire": true | false,
  "delai_instruction": "2 mois" | "3 mois",
  "prochaine_etape": "Description de l'etape suivante",
  "geoportail_url": "https://www.geoportail-urbanisme.gouv.fr/map/#tile=1&lon=${coordinates[0]}&lat=${coordinates[1]}&zoom=16"
}`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      });

      let resultJson;
      try {
        const responseText = message.content[0].text;
        resultJson = JSON.parse(responseText);
      } catch (e) {
        resultJson = {
          verdict: 'incertain',
          score_confiance: 50,
          resume: 'Analyse en cours. Veuillez reessayer.',
          commune: communeNom,
          regles_applicables: pluRules.slice(0, 2).map(r => ({
            article: r.article,
            contenu: r.texte.substring(0, 200),
            impact: 'neutre'
          })),
          cerfa_recommande: 'DP_MI',
          architecte_obligatoire: false,
          delai_instruction: '1 mois'
        };
      }

      if (is_demo) {
        resultJson.regles_masquees = Math.max(0, pluRules.length - 2);
        resultJson.regles_applicables = resultJson.regles_applicables?.slice(0, 2);
        delete resultJson.conditions;
        delete resultJson.points_vigilance;
      }

      // Save analysis
      const user = await prisma.user.findUnique({
        where: { clerkId: authObj.userId }
      });

      if (user) {
        await prisma.analyse.create({
          data: {
            userId: user.id,
            adresse,
            communeCode,
            description,
            verdict: resultJson.verdict,
            resultJson,
            isDemo: is_demo,
          }
        });
      }

      return handleCORS(NextResponse.json(resultJson));
    }

    // Mairie info endpoint - GET /api/mairie/info?code=XXXXX
    if (route === '/mairie/info' && method === 'GET') {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');

      if (!code) {
        return handleCORS(NextResponse.json({ error: 'code parameter required' }, { status: 400 }));
      }

      // Fetch commune info from French Government API
      const communeUrl = `https://geo.api.gouv.fr/communes/${code}`;
      const communeResponse = await fetch(communeUrl);
      
      if (!communeResponse.ok) {
        return handleCORS(NextResponse.json({ error: 'Commune not found' }, { status: 404 }));
      }

      const communeData = await communeResponse.json();

      return handleCORS(NextResponse.json({
        commune_code: code,
        commune_nom: communeData.nom,
        platau_raccordee: false, // Mock for MVP
        adresse_service_urbanisme: 'Service Urbanisme, Mairie de ' + communeData.nom,
        horaires: 'Lundi-Vendredi 9h-12h, 14h-17h',
        delai_legal_instruction: '2 mois',
      }));
    }

    // Stripe checkout endpoint - POST /api/checkout
    if (route === '/checkout' && method === 'POST') {
      const authObj = auth();
      if (!authObj.userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const body = await request.json();
      const { price_id, plan_name } = body;

      if (!price_id || !plan_name) {
        return handleCORS(NextResponse.json(
          { error: 'price_id and plan_name are required' },
          { status: 400 }
        ));
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: authObj.userId }
      });

      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }));
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tarifs`,
        client_reference_id: user.id,
        metadata: {
          userId: user.id,
          plan: plan_name,
        },
      });

      return handleCORS(NextResponse.json({ url: session.url, session_id: session.id }));
    }

    // Stripe webhook endpoint - POST /api/webhook/stripe
    if (route === '/webhook/stripe' && method === 'POST') {
      const sig = request.headers.get('stripe-signature');
      const body = await request.text();

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return handleCORS(NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 }));
      }

      if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: subscription.metadata.plan || 'starter',
              credits: subscription.metadata.plan === 'starter' ? 8 : 999,
            }
          });

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubId: subscription.id,
              stripeCustomerId: subscription.customer,
              plan: subscription.metadata.plan || 'starter',
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
          });
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'free',
              credits: 1,
            }
          });
        }
      }

      return handleCORS(NextResponse.json({ received: true }));
    }

    // Webhook for Clerk user events - POST /api/webhooks/clerk
    if (route === '/webhooks/clerk' && method === 'POST') {
      const body = await request.json();
      const { type, data } = body;

      if (type === 'user.created') {
        const primaryEmail = data.email_addresses.find(
          (email) => email.id === data.primary_email_address_id
        );

        await prisma.user.upsert({
          where: { clerkId: data.id },
          create: {
            clerkId: data.id,
            email: primaryEmail?.email_address || '',
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            imageUrl: data.image_url || '',
            plan: 'free',
            credits: 1,
          },
          update: {
            email: primaryEmail?.email_address || '',
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            imageUrl: data.image_url || '',
          }
        });
      }

      if (type === 'user.updated') {
        const primaryEmail = data.email_addresses.find(
          (email) => email.id === data.primary_email_address_id
        );

        await prisma.user.update({
          where: { clerkId: data.id },
          data: {
            email: primaryEmail?.email_address || '',
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            imageUrl: data.image_url || '',
          }
        });
      }

      if (type === 'user.deleted') {
        await prisma.user.delete({
          where: { clerkId: data.id }
        }).catch(() => {});
      }

      return handleCORS(NextResponse.json({ message: 'Webhook processed successfully' }));
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ));

  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    ));
  }
}

// Export all HTTP methods
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
