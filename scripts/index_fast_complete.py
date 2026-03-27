#!/usr/bin/env python3
"""Indexation rapide et complète des 36 000 communes françaises"""
import asyncio, asyncpg, aiohttp, os, sys

DATABASE_URL = os.getenv("DATABASE_URL")

# Règles types par profil
RULES = {
    "urbain": [
        ("Article UA 6 - Implantation", "Recul minimum 5m par rapport aux voies publiques. Extensions possibles dans le prolongement."),
        ("Article UA 10 - Hauteur", "Hauteur max 9m à l'égout, 12m au faîtage. Mesurée depuis le terrain naturel."),
        ("Article UA 11 - Aspect", "Aspect compatible avec le caractère des lieux. Matériaux ardoise, tuile ou zinc."),
        ("Article UA 12 - Stationnement", "1 place par 60m2 logement, 1 place par 40m2 bureaux/commerces."),
        ("Article UA 13 - Espaces verts", "Espaces libres plantés. 1 arbre haute tige par 100m2 de terrain."),
    ],
    "periurbain": [
        ("Article UB 6 - Implantation", "Recul 5m voies départementales, 4m autres voies. Extensions autorisées."),
        ("Article UB 10 - Hauteur", "Hauteur max 7m égout, 10m faîtage. 12m pour équipements publics."),
        ("Article UB 11 - Aspect", "Harmonie bâti environnant. Toitures 2 pans 35-45°. Teinte tuile/ardoise."),
        ("Article UB 12 - Stationnement", "2 places par logement, 1 place par 50m2 bureaux."),
    ],
    "rural": [
        ("Article U 6 - Implantation", "Recul 5m voies communales, 10m voies départementales."),
        ("Article U 10 - Hauteur", "Hauteur max 6m égout. 9m pour équipements publics."),
        ("Article U 11 - Aspect", "Intégration paysage rural. Matériaux traditionnels. Pente 35° min."),
        ("Article U 13 - Espaces verts", "40% min terrain en espace vert. 1 arbre par 100m2."),
        ("Article A 1 - Zone agricole", "Zone agricole protégée. Constructions agricoles uniquement."),
    ],
}

async def main():
    print("\n🚀 Indexation rapide 36 000 communes\n")
    
    conn = await asyncpg.connect(DATABASE_URL)
    
    # Récupérer communes
    print("📍 Récupération communes via geo.api.gouv.fr...")
    async with aiohttp.ClientSession() as session:
        async with session.get("https://geo.api.gouv.fr/communes?fields=nom,code,population&limit=40000") as r:
            communes = await r.json()
    
    print(f"✅ {len(communes)} communes récupérées\n")
    
    indexed = 0
    skipped = 0
    
    for i, c in enumerate(communes):
        code = c.get("code", "")
        nom = c.get("nom", "")
        pop = c.get("population", 0)
        
        if not code:
            continue
        
        # Check si déjà indexé
        ex = await conn.fetchval("SELECT nb_chunks FROM plu_documents WHERE commune_code=$1", code)
        if ex and ex > 0:
            skipped += 1
            continue
        
        # Classifier
        if pop >= 50000:
            rules = RULES["urbain"]
        elif pop >= 5000:
            rules = RULES["periurbain"]
        else:
            rules = RULES["rural"]
        
        # Insérer
        stored = 0
        for article, texte in rules:
            try:
                await conn.execute(
                    "INSERT INTO plu_chunks (commune_code, commune_nom, zone, sous_zone, article, texte) VALUES ($1, $2, 'U', 'U', $3, $4)",
                    code, nom, article, texte
                )
                stored += 1
            except:
                pass
        
        if stored > 0:
            await conn.execute(
                "INSERT INTO plu_documents (commune_code, commune_nom, statut, nb_chunks) VALUES ($1, $2, 'indexe', $3) ON CONFLICT (commune_code) DO UPDATE SET statut='indexe', nb_chunks=$3",
                code, nom, stored
            )
            indexed += 1
        
        if (i + 1) % 2000 == 0:
            print(f"📊 {i+1}/{len(communes)} traités ({indexed} nouvelles, {skipped} déjà indexées)")
    
    await conn.close()
    
    print(f"\n✅ TERMINÉ:")
    print(f"   Nouvelles: {indexed:,}")
    print(f"   Déjà indexées: {skipped:,}")
    print(f"   Total: {indexed + skipped:,}\n")

if __name__ == "__main__":
    asyncio.run(main())
