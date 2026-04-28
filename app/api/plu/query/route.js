import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const addr = body.address || body.adresse;
    const { description, type, surface } = body;

    if (!addr) return NextResponse.json({ error: 'Adresse requise' }, { status: 400 });

    const surf = parseInt(surface) || 50;
    const cerfa_recommande = surf > 20 ? '13406' : '13703';
    const commune = addr.split(' ').slice(-2).join(' ') || addr;

    return NextResponse.json({
      success: true,
      address: addr,
      verdict: 'conforme',
      score_confiance: 87,
      resume: `Analyse PLU effectuée pour ${commune}. Votre projet est globalement conforme aux règles générales du Code de l'urbanisme. Vérifiez les règles spécifiques de votre PLU local.`,
      commune,
      zone: 'UB — Résidentiel pavillonnaire',
      regles_applicables: [
        {
          article: 'Art. R.111-16 — Hauteur maximale',
          contenu: 'Hauteur maximale autorisée : 9m en zone résidentielle. Votre projet respecte cette limite.',
          impact: 'favorable'
        },
        {
          article: 'Art. R.111-19 — Emprise au sol',
          contenu: 'Emprise au sol maximum : 40% de la superficie du terrain. Conforme pour une extension standard.',
          impact: 'neutre'
        },
      ],
      cerfa_recommande,
      regles_masquees: 10,
      is_demo: true,
      duration: '1.2',
      cerfa: {
        numero: surf > 20 ? '13406*04' : '13703*07',
        nom: surf > 20 ? 'Permis de construire — maison individuelle' : 'Déclaration préalable',
        delai: surf > 20 ? '2 mois' : '1 mois'
      },
      rules: [
        {
          id: 1,
          label: 'Hauteur maximale',
          article: 'Art. R.111-16',
          value: '9m maximum',
          status: 'ok',
          detail: 'Votre projet respecte la hauteur maximale autorisée de 9m.'
        },
        {
          id: 2,
          label: 'Emprise au sol',
          article: 'Art. R.111-19',
          value: '40% maximum',
          status: 'ok',
          detail: "L'emprise au sol est conforme au seuil de 40% autorisé."
        },
        {
          id: 3,
          label: 'Recul voie publique',
          article: 'Art. R.111-6',
          value: '5m minimum',
          status: 'ok',
          detail: 'Le recul de 5m minimum est respecté.'
        },
        {
          id: 4,
          label: 'Recul limites séparatives',
          article: 'Art. R.111-20',
          value: 'H/2 ≥ 3m',
          status: 'ok',
          detail: 'Le recul par rapport aux limites séparatives est conforme.'
        },
        {
          id: 5,
          label: 'Coefficient Biotope',
          article: 'Art. PLU local',
          value: '30% minimum',
          status: 'ok',
          detail: '30% minimum de la surface doit rester perméable.'
        },
      ],
      hiddenRulesCount: 10,
    });
  } catch (error) {
    console.error('PLU query error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
