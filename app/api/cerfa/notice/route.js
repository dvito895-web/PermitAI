// app/api/cerfa/notice/route.js
// Génère automatiquement la notice descriptive PC7/DP7 via Claude
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      type_cerfa, prenom, nom, adresse_terrain, commune, code_postal,
      nature_travaux, surface_creee, surface_terrain, hauteur_projet,
      materiaux_facade, materiaux_toiture, description_libre,
      zone_plu, zone_abf,
    } = data;

    const noticeContent = `NOTICE DESCRIPTIVE DU PROJET
================================

DEMANDEUR
---------
${prenom} ${nom}
Adresse du terrain : ${adresse_terrain}
Commune : ${commune} (${code_postal})

DESCRIPTION DU TERRAIN
-----------------------
Le terrain est situé à ${adresse_terrain}, commune de ${commune} (${code_postal}).
Surface du terrain : ${surface_terrain || 'à préciser'} m²
Zone PLU : ${zone_plu || 'À vérifier auprès du service urbanisme'}
${zone_abf ? '⚠️ Terrain en périmètre de protection d\'un monument historique — accord ABF requis' : ''}

DESCRIPTION DU PROJET
----------------------
Nature des travaux : ${nature_travaux}
Surface créée : ${surface_creee} m²
Hauteur du projet : ${hauteur_projet || 'à préciser'} m
${description_libre ? `\nDescription complémentaire :\n${description_libre}` : ''}

MATÉRIAUX ET ASPECTS EXTÉRIEURS
---------------------------------
Façades : ${materiaux_facade || 'À préciser'}
Toiture : ${materiaux_toiture || 'À préciser'}

Les matériaux et couleurs ont été choisis en cohérence avec les constructions voisines et les prescriptions du règlement local d'urbanisme applicable.

RACCORDEMENTS AUX RÉSEAUX
--------------------------
Le projet sera raccordé aux réseaux existants (eau potable, assainissement collectif, électricité) selon les conditions techniques imposées par les concessionnaires de réseaux.

CONFORMITÉ AUX RÈGLES D'URBANISME
------------------------------------
Le projet a été conçu dans le respect des dispositions du Plan Local d'Urbanisme (PLU) de la commune de ${commune} et du Code de l'urbanisme. La surface créée de ${surface_creee} m² est ${parseInt(surface_creee) <= 150 ? 'inférieure au seuil de 150m² ne nécessitant pas le recours à un architecte' : 'conforme aux dispositions applicables'}.

Date : ${new Date().toLocaleDateString('fr-FR')}
Signature du demandeur : _______________`;

    return Response.json({
      notice: noticeContent,
      cerfa_type: type_cerfa,
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({ error: 'Erreur génération notice' }, { status: 500 });
  }
}
