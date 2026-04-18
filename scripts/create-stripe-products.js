const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Script pour créer les produits et prix Stripe en production
 * Exécuter avec: node scripts/create-stripe-products.js
 */

async function createStripeProducts() {
  console.log('🔄 Création des produits Stripe...\n');

  try {
    // Plan Starter
    const starterProduct = await stripe.products.create({
      name: 'PermitAI Starter',
      description: 'Pour les particuliers — 8 analyses PLU/mois, 3 CERFA, 2 dépôts mairie',
      metadata: {
        plan: 'starter',
        features: '8_analyses,3_cerfa,2_depots,ia_premium',
      },
    });

    const starterMonthly = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 2900, // 29€
      currency: 'eur',
      recurring: { interval: 'month' },
      metadata: { billing: 'monthly' },
    });

    const starterAnnual = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 22800, // 228€/an (19€/mois)
      currency: 'eur',
      recurring: { interval: 'year' },
      metadata: { billing: 'annual' },
    });

    console.log('✅ Starter créé');
    console.log(`   Product ID: ${starterProduct.id}`);
    console.log(`   Price Monthly ID: ${starterMonthly.id}`);
    console.log(`   Price Annual ID: ${starterAnnual.id}\n`);

    // Plan Pro
    const proProduct = await stripe.products.create({
      name: 'PermitAI Pro Immobilier',
      description: 'Pour agents et constructeurs — Analyses illimitées, 13 CERFA, dépôts illimités',
      metadata: {
        plan: 'pro',
        features: 'unlimited_analyses,unlimited_cerfa,unlimited_depots,5_users,chrome_extension',
      },
    });

    const proMonthly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 8900, // 89€
      currency: 'eur',
      recurring: { interval: 'month' },
      metadata: { billing: 'monthly' },
    });

    const proAnnual = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 58800, // 588€/an (49€/mois)
      currency: 'eur',
      recurring: { interval: 'year' },
      metadata: { billing: 'annual' },
    });

    console.log('✅ Pro créé');
    console.log(`   Product ID: ${proProduct.id}`);
    console.log(`   Price Monthly ID: ${proMonthly.id}`);
    console.log(`   Price Annual ID: ${proAnnual.id}\n`);

    // Plan Cabinet
    const cabinetProduct = await stripe.products.create({
      name: 'PermitAI Cabinet',
      description: 'Pour cabinets et promoteurs — Tout Pro + utilisateurs illimités + API 2000 req/mois',
      metadata: {
        plan: 'cabinet',
        features: 'everything_pro,unlimited_users,api_access,account_manager',
      },
    });

    const cabinetMonthly = await stripe.prices.create({
      product: cabinetProduct.id,
      unit_amount: 19900, // 199€
      currency: 'eur',
      recurring: { interval: 'month' },
      metadata: { billing: 'monthly' },
    });

    const cabinetAnnual = await stripe.prices.create({
      product: cabinetProduct.id,
      unit_amount: 118800, // 1188€/an (99€/mois)
      currency: 'eur',
      recurring: { interval: 'year' },
      metadata: { billing: 'annual' },
    });

    console.log('✅ Cabinet créé');
    console.log(`   Product ID: ${cabinetProduct.id}`);
    console.log(`   Price Monthly ID: ${cabinetMonthly.id}`);
    console.log(`   Price Annual ID: ${cabinetAnnual.id}\n`);

    console.log('🎉 Tous les produits Stripe ont été créés avec succès !');
    console.log('\n📋 Ajoutez ces Price IDs dans votre .env :');
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY=${starterMonthly.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL=${starterAnnual.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=${proMonthly.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=${proAnnual.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_CABINET_MONTHLY=${cabinetMonthly.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_CABINET_ANNUAL=${cabinetAnnual.id}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des produits Stripe:', error.message);
    process.exit(1);
  }
}

createStripeProducts();
