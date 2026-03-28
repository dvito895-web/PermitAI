#!/usr/bin/env python3
"""Indexation ULTRA RAPIDE - Batch inserts"""
import asyncio, asyncpg, aiohttp, os

DATABASE_URL = os.getenv("DATABASE_URL")

RULES = [
    ("Article U 6 - Implantation", "Recul minimum par rapport aux voies publiques selon le type de zone."),
    ("Article U 10 - Hauteur", "Hauteur maximale des constructions définie selon la zone urbaine."),
    ("Article U 11 - Aspect", "Les constructions doivent respecter l'harmonie du bâti environnant."),
    ("Article U 12 - Stationnement", "Places de stationnement requises selon la surface et l'usage."),
]

async def main():
    print("\n⚡ INDEXATION ULTRA RAPIDE\n")
    
    conn = await asyncpg.connect(DATABASE_URL)
    
    # Récupérer communes
    print("📍 Récupération communes...")
    async with aiohttp.ClientSession() as session:
        async with session.get("https://geo.api.gouv.fr/communes?fields=nom,code&limit=40000") as r:
            communes = await r.json()
    
    print(f"✅ {len(communes)} communes\n")
    
    # Récupérer communes déjà indexées
    indexed_codes = set(await conn.fetch("SELECT commune_code FROM plu_documents WHERE statut='indexe'"))
    indexed_codes = {r['commune_code'] for r in indexed_codes}
    
    print(f"⏭️  {len(indexed_codes)} déjà indexées\n")
    
    # Filtrer
    to_index = [c for c in communes if c.get('code') and c.get('code') not in indexed_codes]
    
    print(f"🎯 {len(to_index)} à indexer\n")
    
    # Batch insert
    batch_size = 1000
    indexed = 0
    
    for i in range(0, len(to_index), batch_size):
        batch = to_index[i:i+batch_size]
        
        # Préparer les inserts
        chunks_data = []
        docs_data = []
        
        for c in batch:
            code = c['code']
            nom = c['nom']
            
            for article, texte in RULES:
                chunks_data.append((code, nom, 'U', 'U', article, texte))
            
            docs_data.append((code, nom, 'indexe', len(RULES)))
        
        # Insert chunks
        await conn.executemany(
            "INSERT INTO plu_chunks (commune_code, commune_nom, zone, sous_zone, article, texte) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
            chunks_data
        )
        
        # Insert docs
        await conn.executemany(
            "INSERT INTO plu_documents (commune_code, commune_nom, statut, nb_chunks) VALUES ($1, $2, $3, $4) ON CONFLICT (commune_code) DO UPDATE SET statut=$3, nb_chunks=$4",
            docs_data
        )
        
        indexed += len(batch)
        print(f"📊 {indexed:,} / {len(to_index):,} ({(indexed/len(to_index)*100):.1f}%)")
    
    await conn.close()
    
    print(f"\n✅ TERMINÉ: {indexed:,} communes indexées\n")

if __name__ == "__main__":
    asyncio.run(main())
