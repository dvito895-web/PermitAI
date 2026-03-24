#!/usr/bin/env python3
"""Script d'insertion de données PLU de test"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

# Données PLU de test pour 10 communes
test_data = [
    # Paris
    ("75101", "Paris 1er", "UA", None, "hauteur", "Article UA 10", "La hauteur maximale des constructions ne peut excéder 12m à l'égout du toit."),
    ("75101", "Paris 1er", "UA", None, "implantation", "Article UA 6", "Les constructions doivent être édifiées à l'alignement de la voie ou avec un retrait minimum de 3m."),
    ("75101", "Paris 1er", "UA", None, "implantation", "Article UA 7", "Les constructions peuvent être édifiées soit sur les limites séparatives soit en retrait de 3m minimum."),
    ("75101", "Paris 1er", "UA", None, "aspect_exterieur", "Article UA 11", "Les toitures doivent avoir une pente comprise entre 30° et 45°. Les couvertures en tuiles sont obligatoires."),
    ("75101", "Paris 1er", "UA", None, "occupation_sol", "Article UA 2", "Les extensions des constructions existantes sont admises dans la limite de 20% de la surface existante. Les annexes sont limitées à 30m2."),
    
    # Lyon
    ("69123", "Lyon", "UB", None, "hauteur", "Article UB 10", "La hauteur maximale est fixée à 9m au faîtage. Pour les annexes: hauteur maximale de 3,50m."),
    ("69123", "Lyon", "UB", None, "occupation_sol", "Article UB 2", "Les extensions sont autorisées dans la limite de 30m2."),
    ("69123", "Lyon", "UA", None, "hauteur", "Article UA 10", "La hauteur maximale des constructions est de 15m en zone UA."),
    ("69123", "Lyon", "UA", None, "implantation", "Article UA 6", "Retrait minimum de 4m par rapport à la voie publique."),
    
    # Marseille
    ("13055", "Marseille", "UA", None, "hauteur", "Article UA 10", "La hauteur ne peut excéder 12m sauf pour les immeubles en bande où elle peut atteindre 15m."),
    ("13055", "Marseille", "UA", None, "occupation_sol", "Article UA 2", "Extensions limitées à 25% de la surface existante."),
    ("13055", "Marseille", "UB", None, "hauteur", "Article UB 10", "Hauteur maximale de 10m au faîtage."),
    
    # Bordeaux
    ("33063", "Bordeaux", "UA", None, "hauteur", "Article UA 10", "Hauteur maximale: 13m à l'égout du toit dans le centre historique."),
    ("33063", "Bordeaux", "UA", None, "implantation", "Article UA 7", "Sur limites séparatives ou retrait de 3m minimum."),
    ("33063", "Bordeaux", "UB", None, "hauteur", "Article UB 10", "Hauteur limitée à 9m."),
    
    # Toulouse
    ("31555", "Toulouse", "UA", None, "hauteur", "Article UA 10", "Hauteur maximale de 14m autorisée en zone centrale."),
    ("31555", "Toulouse", "UA", None, "aspect_exterieur", "Article UA 11", "Toitures en tuiles canal obligatoires. Pente entre 25° et 35°."),
    ("31555", "Toulouse", "UB", None, "occupation_sol", "Article UB 2", "Extensions autorisées jusqu'à 35m2."),
    
    # Nantes
    ("44109", "Nantes", "UA", None, "hauteur", "Article UA 10", "Hauteur limitée à 11m en centre-ville."),
    ("44109", "Nantes", "UB", None, "hauteur", "Article UB 10", "Hauteur maximale de 9m pour les constructions principales."),
    ("44109", "Nantes", "N", None, "occupation_sol", "Article N 2", "Extensions limitées à 20% de la surface existante en zone naturelle."),
    
    # Strasbourg
    ("67482", "Strasbourg", "UA", None, "hauteur", "Article UA 10", "Hauteur maximale de 12m. Exceptions possibles pour les équipements publics."),
    ("67482", "Strasbourg", "UA", None, "implantation", "Article UA 6", "Alignement obligatoire sur rue principale."),
    ("67482", "Strasbourg", "UB", None, "occupation_sol", "Article UB 2", "Extensions limitées à 30m2."),
    
    # Lille
    ("59350", "Lille", "UA", None, "hauteur", "Article UA 10", "Hauteur maximale de 13m dans l'hypercentre."),
    ("59350", "Lille", "UA", None, "aspect_exterieur", "Article UA 11", "Matériaux traditionnels de la région: briques rouges privilégiées."),
    ("59350", "Lille", "UB", None, "hauteur", "Article UB 10", "9m maximum."),
    
    # Rennes
    ("35238", "Rennes", "UA", None, "hauteur", "Article UA 10", "Hauteur limitée à 12m en zone UA."),
    ("35238", "Rennes", "UA", None, "occupation_sol", "Article UA 2", "Extensions autorisées jusqu'à 20% de la surface."),
    ("35238", "Rennes", "UB", None, "hauteur", "Article UB 10", "Hauteur maximale de 8,50m."),
    
    # Nice
    ("06088", "Nice", "UA", None, "hauteur", "Article UA 10", "Hauteur maximale de 15m sur le front de mer, 12m ailleurs."),
    ("06088", "Nice", "UA", None, "implantation", "Article UA 7", "Retrait de 3m minimum des limites séparatives."),
    ("06088", "Nice", "UB", None, "occupation_sol", "Article UB 2", "Extensions limitées à 25m2."),
]

def insert_test_data():
    print("🔧 Insertion des données PLU de test...")
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Compter les communes uniques
        communes = {}
        for row in test_data:
            code, nom = row[0], row[1]
            if code not in communes:
                communes[code] = nom
        
        print(f"   {len(communes)} communes")
        print(f"   {len(test_data)} règles PLU")
        
        # Insérer les documents PLU
        for code, nom in communes.items():
            nb_rules = sum(1 for row in test_data if row[0] == code)
            cursor.execute("""
                INSERT INTO plu_documents (commune_code, commune_nom, statut, nb_chunks)
                VALUES (%s, %s, 'indexed', %s)
                ON CONFLICT (commune_code) DO UPDATE
                SET statut = 'indexed', nb_chunks = %s
            """, (code, nom, nb_rules, nb_rules))
        
        # Supprimer les anciennes données de test
        cursor.execute("DELETE FROM plu_chunks WHERE commune_code IN (" + 
                      ",".join(["%s"] * len(communes)) + ")", list(communes.keys()))
        
        # Insérer les règles
        for row in test_data:
            cursor.execute("""
                INSERT INTO plu_chunks (commune_code, commune_nom, zone, sous_zone, theme, article, texte)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, row)
        
        conn.commit()
        print(f"✅ Données insérées avec succès!")
        print(f"   Vous pouvez maintenant tester l'analyse PLU sur ces communes:")
        for code, nom in sorted(communes.items(), key=lambda x: x[1]):
            print(f"   - {nom} ({code})")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    insert_test_data()
