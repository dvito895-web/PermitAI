#!/usr/bin/env python3
"""Indexation des 13 formulaires CERFA officiels"""
import asyncio, asyncpg, os, json

DATABASE_URL = os.getenv("DATABASE_URL")

CERFA_DATA = [
    {
        "numero": "13406",
        "nom": "Permis de construire - Maison individuelle et/ou ses annexes",
        "slug": "permis-construire-maison-individuelle",
        "description": "Demande de permis de construire pour une maison individuelle et/ou ses annexes comprenant ou non des démolitions.",
        "categorie": "Permis de construire",
        "champs_requis": json.dumps(["identite", "adresse_terrain", "surface_plancher", "hauteur", "implantation"]),
        "pieces_jointes": json.dumps(["plan_situation", "plan_masse", "plan_facades", "photo_proche", "photo_lointaine"]),
        "delai_instruction": "2 mois"
    },
    {
        "numero": "13409",
        "nom": "Permis de construire - Autre construction",
        "slug": "permis-construire-autre",
        "description": "Demande de permis de construire pour les autres constructions (logements collectifs, bâtiments commerciaux, agricoles, etc.).",
        "categorie": "Permis de construire",
        "champs_requis": json.dumps(["identite", "adresse_terrain", "surface_plancher", "destination", "nombre_logements"]),
        "pieces_jointes": json.dumps(["plan_situation", "plan_masse", "plan_facades", "plan_toitures", "notice_descriptive"]),
        "delai_instruction": "3 mois"
    },
    {
        "numero": "13410",
        "nom": "Permis d'aménager",
        "slug": "permis-amenager",
        "description": "Permis d'aménager un terrain (lotissement, camping, parc résidentiel de loisirs, etc.).",
        "categorie": "Permis d'aménager",
        "champs_requis": json.dumps(["identite", "adresse_terrain", "type_amenagement", "nombre_lots"]),
        "pieces_jointes": json.dumps(["plan_situation", "plan_amenagement", "notice_impact"]),
        "delai_instruction": "3 mois"
    },
    {
        "numero": "13411",
        "nom": "Permis de démolir",
        "slug": "permis-demolir",
        "description": "Demande de permis de démolir une construction existante.",
        "categorie": "Permis de démolir",
        "champs_requis": json.dumps(["identite", "adresse_terrain", "surface_demolie", "motif_demolition"]),
        "pieces_jointes": json.dumps(["plan_situation", "plan_masse", "photo_construction"]),
        "delai_instruction": "2 mois"
    },
    {
        "numero": "13703",
        "nom": "Déclaration préalable - Maison individuelle",
        "slug": "declaration-prealable-maison",
        "description": "Déclaration préalable pour les travaux sur maison individuelle (extension, modification de l'aspect extérieur, etc.).",
        "categorie": "Déclaration préalable",
        "champs_requis": json.dumps(["identite", "adresse_terrain", "nature_travaux", "surface_creee"]),
        "pieces_jointes": json.dumps(["plan_situation", "plan_masse", "plan_facades", "photo_avant"]),
        "delai_instruction": "1 mois"
    },
    {
        "numero": "13404",
        "nom": "Déclaration préalable - Autres travaux",
        "slug": "declaration-prealable-autre",
        "description": "Déclaration préalable pour les autres travaux et aménagements.",
        "categorie": "Déclaration préalable",
        "champs_requis": json.dumps(["identite", "adresse_terrain", "nature_travaux"]),
        "pieces_jointes": json.dumps(["plan_situation", "plan_masse", "description_travaux"]),
        "delai_instruction": "1 mois"
    },
    {
        "numero": "13702",
        "nom": "Certificat d'urbanisme",
        "slug": "certificat-urbanisme",
        "description": "Demande de certificat d'urbanisme (information ou opérationnel).",
        "categorie": "Certificat",
        "champs_requis": json.dumps(["identite", "adresse_terrain", "type_certificat"]),
        "pieces_jointes": json.dumps(["plan_situation", "plan_cadastral"]),
        "delai_instruction": "1 mois"
    },
    {
        "numero": "13408",
        "nom": "Transfert de permis",
        "slug": "transfert-permis",
        "description": "Demande de transfert d'un permis de construire ou d'aménager à une autre personne.",
        "categorie": "Modificatif",
        "champs_requis": json.dumps(["identite_nouveau_titulaire", "numero_permis", "date_permis"]),
        "pieces_jointes": json.dumps(["accord_ancien_titulaire", "attestation_mutation"]),
        "delai_instruction": "2 mois"
    },
    {
        "numero": "14023",
        "nom": "Permis modificatif",
        "slug": "permis-modificatif",
        "description": "Demande de permis modificatif (modification d'un permis de construire en cours de validité).",
        "categorie": "Modificatif",
        "champs_requis": json.dumps(["numero_permis_initial", "nature_modification"]),
        "pieces_jointes": json.dumps(["plans_modifies", "notice_explicative"]),
        "delai_instruction": "2 mois"
    },
    {
        "numero": "13412",
        "nom": "Autorisation de travaux - ERP",
        "slug": "autorisation-travaux-erp",
        "description": "Autorisation de travaux dans un établissement recevant du public (ERP).",
        "categorie": "ERP",
        "champs_requis": json.dumps(["identite", "adresse_erp", "categorie_erp", "nature_travaux"]),
        "pieces_jointes": json.dumps(["plan_situation", "notice_accessibilite", "attestation_conformite"]),
        "delai_instruction": "4 mois"
    },
    {
        "numero": "15483",
        "nom": "Déclaration d'ouverture de chantier",
        "slug": "declaration-ouverture-chantier",
        "description": "Déclaration d'ouverture de chantier (DOC) à déposer avant le commencement des travaux.",
        "categorie": "Suivi de chantier",
        "champs_requis": json.dumps(["numero_permis", "date_ouverture", "duree_prevue"]),
        "pieces_jointes": json.dumps([]),
        "delai_instruction": "Instantané"
    },
    {
        "numero": "13407",
        "nom": "Déclaration d'achèvement de travaux",
        "slug": "declaration-achevement-travaux",
        "description": "Déclaration attestant l'achèvement et la conformité des travaux (DAACT).",
        "categorie": "Suivi de chantier",
        "champs_requis": json.dumps(["numero_permis", "date_achevement", "conformite"]),
        "pieces_jointes": json.dumps(["attestation_rt2012", "attestation_accessibilite"]),
        "delai_instruction": "3 mois (visite possible)"
    },
    {
        "numero": "13736",
        "nom": "Prorogation de permis",
        "slug": "prorogation-permis",
        "description": "Demande de prorogation d'un permis de construire ou d'aménager.",
        "categorie": "Modificatif",
        "champs_requis": json.dumps(["numero_permis", "date_permis", "motif_prorogation"]),
        "pieces_jointes": json.dumps([]),
        "delai_instruction": "2 mois"
    }
]

async def index_cerfa():
    conn = await asyncpg.connect(DATABASE_URL)
    
    print("\n🚀 Indexation des 13 CERFA officiels\n")
    
    indexed = 0
    for cerfa in CERFA_DATA:
        try:
            await conn.execute('''
                INSERT INTO cerfa_formulaires 
                (numero, nom, slug, description, categorie, champs_requis, pieces_jointes, delai_instruction)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (numero) DO UPDATE SET
                nom = EXCLUDED.nom,
                description = EXCLUDED.description,
                categorie = EXCLUDED.categorie,
                champs_requis = EXCLUDED.champs_requis,
                pieces_jointes = EXCLUDED.pieces_jointes,
                delai_instruction = EXCLUDED.delai_instruction
            ''', cerfa["numero"], cerfa["nom"], cerfa["slug"], cerfa["description"],
            cerfa["categorie"], cerfa["champs_requis"], cerfa["pieces_jointes"], cerfa["delai_instruction"])
            
            print(f"✅ CERFA {cerfa['numero']} - {cerfa['nom'][:50]}...")
            indexed += 1
        except Exception as e:
            print(f"❌ Erreur CERFA {cerfa['numero']}: {e}")
    
    await conn.close()
    
    print(f"\n✅ {indexed}/13 CERFA indexés avec succès\n")

if __name__ == "__main__":
    asyncio.run(index_cerfa())
