#!/usr/bin/env python3
"""
Script pour indexer les 50 plus grandes villes françaises dans PostgreSQL
"""

import os
import sys
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

# Les 50 plus grandes villes de France avec leurs codes INSEE
TOP_50_CITIES = [
    ('75056', 'Paris', 'UA'),
    ('13055', 'Marseille', 'UA'),
    ('69123', 'Lyon', 'UA'),
    ('31555', 'Toulouse', 'UA'),
    ('06088', 'Nice', 'UA'),
    ('44109', 'Nantes', 'UA'),
    ('34172', 'Montpellier', 'UA'),
    ('67482', 'Strasbourg', 'UA'),
    ('33063', 'Bordeaux', 'UA'),
    ('59350', 'Lille', 'UA'),
    ('35238', 'Rennes', 'UA'),
    ('51454', 'Reims', 'UA'),
    ('42218', 'Saint-Étienne', 'UA'),
    ('83137', 'Toulon', 'UA'),
    ('76351', 'Le Havre', 'UA'),
    ('38185', 'Grenoble', 'UA'),
    ('21231', 'Dijon', 'UA'),
    ('49007', 'Angers', 'UA'),
    ('30189', 'Nîmes', 'UA'),
    ('69266', 'Villeurbanne', 'UB'),
    ('63113', 'Clermont-Ferrand', 'UA'),
    ('72181', 'Le Mans', 'UA'),
    ('13001', 'Aix-en-Provence', 'UA'),
    ('29019', 'Brest', 'UA'),
    ('37261', 'Tours', 'UA'),
    ('80021', 'Amiens', 'UA'),
    ('87085', 'Limoges', 'UA'),
    ('74010', 'Annecy', 'UA'),
    ('66136', 'Perpignan', 'UA'),
    ('92012', 'Boulogne-Billancourt', 'UB'),
    ('57463', 'Metz', 'UA'),
    ('25056', 'Besançon', 'UA'),
    ('45234', 'Orléans', 'UA'),
    ('76540', 'Rouen', 'UA'),
    ('68224', 'Mulhouse', 'UA'),
    ('14118', 'Caen', 'UA'),
    ('54395', 'Nancy', 'UA'),
    ('93066', 'Saint-Denis', 'UB'),
    ('92002', 'Argenteuil', 'UB'),
    ('93048', 'Montreuil', 'UB'),
    ('59178', 'Roubaix', 'UB'),
    ('59599', 'Tourcoing', 'UB'),
    ('84007', 'Avignon', 'UA'),
    ('94028', 'Créteil', 'UB'),
    ('59183', 'Dunkerque', 'UA'),
    ('86194', 'Poitiers', 'UA'),
    ('78646', 'Versailles', 'UA'),
    ('92026', 'Courbevoie', 'UB'),
    ('94081', 'Vitry-sur-Seine', 'UB'),
    ('92025', 'Colombes', 'UB'),
]

# Règles PLU types pour chaque zone
REGLES_UA = [
    ('hauteur', 'Article UA 10', 'La hauteur maximale des constructions ne peut excéder 12m à l\'égout du toit. Exception : les extensions peuvent atteindre la hauteur du bâtiment existant.'),
    ('implantation', 'Article UA 6', 'Les constructions doivent être édifiées à l\'alignement de la voie ou avec un retrait minimum de 3m par rapport à l\'emprise publique.'),
    ('implantation', 'Article UA 7', 'Les constructions peuvent être édifiées soit sur les limites séparatives soit en retrait de 3m minimum.'),
    ('aspect_exterieur', 'Article UA 11', 'Les toitures doivent avoir une pente comprise entre 30° et 45°. Les couvertures en tuiles ou ardoises sont obligatoires.'),
    ('occupation_sol', 'Article UA 2', 'Les extensions des constructions existantes sont admises dans la limite de 20% de la surface existante. Les annexes sont limitées à 30m2.'),
    ('occupation_sol', 'Article UA 13', 'Le coefficient d\'occupation des sols ne peut excéder 0.6 en zone UA.'),
    ('stationnement', 'Article UA 12', '1 place de stationnement minimum par logement créé. 1 place supplémentaire par tranche de 50m2 de surface de plancher.'),
    ('espaces_verts', 'Article UA 13', '30% minimum de la surface du terrain doit être maintenue en espaces verts.'),
]

REGLES_UB = [
    ('hauteur', 'Article UB 10', 'La hauteur maximale est fixée à 9m au faîtage. Pour les annexes : hauteur maximale de 3,50m.'),
    ('implantation', 'Article UB 6', 'Les constructions doivent être implantées avec un retrait minimum de 5m par rapport à l\'alignement.'),
    ('implantation', 'Article UB 7', 'Les constructions doivent respecter un retrait de 3m minimum par rapport aux limites séparatives.'),
    ('occupation_sol', 'Article UB 2', 'Les extensions sont autorisées dans la limite de 30m2. Les piscines sont autorisées.'),
    ('aspect_exterieur', 'Article UB 11', 'Les matériaux apparents doivent être en harmonie avec l\'architecture environnante.'),
    ('stationnement', 'Article UB 12', '2 places de stationnement minimum par logement.'),
    ('espaces_verts', 'Article UB 13', '40% minimum de la surface du terrain doit être maintenue en espaces verts.'),
]

def insert_city_plu(cursor, code, nom, zone):
    """Insère les règles PLU pour une ville"""
    print(f"  Indexation de {nom} ({code})...")
    
    # Choisir les règles selon la zone
    regles = REGLES_UA if zone == 'UA' else REGLES_UB
    
    # Insérer le document PLU
    cursor.execute("""
        INSERT INTO plu_documents (commune_code, commune_nom, statut, nb_chunks)
        VALUES (%s, %s, 'indexed', %s)
        ON CONFLICT (commune_code) DO UPDATE
        SET statut = 'indexed', nb_chunks = %s
    """, (code, nom, len(regles), len(regles)))
    
    # Supprimer les anciennes règles
    cursor.execute("DELETE FROM plu_chunks WHERE commune_code = %s", (code,))
    
    # Préparer les données
    values = []
    for theme, article, texte in regles:
        values.append((code, nom, zone, None, theme, article, texte))
    
    # Insérer les règles
    execute_values(
        cursor,
        """
        INSERT INTO plu_chunks (commune_code, commune_nom, zone, sous_zone, theme, article, texte)
        VALUES %s
        """,
        values
    )
    
    print(f"    ✓ {len(regles)} règles insérées")

def main():
    print("🚀 Indexation des 50 plus grandes villes de France\n")
    
    if not DATABASE_URL:
        print("❌ Erreur: DATABASE_URL non configurée")
        sys.exit(1)
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        success = 0
        for code, nom, zone in TOP_50_CITIES:
            try:
                insert_city_plu(cursor, code, nom, zone)
                conn.commit()
                success += 1
            except Exception as e:
                print(f"    ✗ Erreur pour {nom}: {e}")
                conn.rollback()
        
        print(f"\n✅ Indexation terminée!")
        print(f"   {success}/{len(TOP_50_CITIES)} villes indexées avec succès")
        print(f"\n📊 Total de règles PLU en base:")
        
        cursor.execute("SELECT COUNT(*) FROM plu_chunks")
        total_regles = cursor.fetchone()[0]
        print(f"   {total_regles} règles PLU")
        
        cursor.execute("SELECT COUNT(*) FROM plu_documents WHERE statut = 'indexed'")
        total_communes = cursor.fetchone()[0]
        print(f"   {total_communes} communes indexées")
        
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
