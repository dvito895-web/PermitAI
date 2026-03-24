#!/usr/bin/env python3
"""
PermitAI PLU Indexer v3.0 - Indexation complète sans IA
Récupère et indexe tous les PLU de France depuis le Géoportail
"""

import asyncio
import aiohttp
import asyncpg
import re
import os
import argparse
import sys
from datetime import datetime

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERREUR: PyMuPDF n'est pas installé. Installez-le avec: pip install PyMuPDF")
    sys.exit(1)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
CHUNK_SIZE = 800
GEOPORTAIL_API = "https://www.geoportail-urbanisme.gouv.fr/api/document/search"
PROGRESS_FILE = "indexation_progress.json"

if not DATABASE_URL:
    print("ERREUR: Variable DATABASE_URL non définie")
    sys.exit(1)


async def get_all_plu():
    """Récupère tous les documents PLU depuis le Géoportail"""
    print("\n🔍 Récupération de la liste des PLU depuis le Géoportail...")
    docs = []
    
    # Désactiver la vérification SSL pour éviter les erreurs de certificat
    connector = aiohttp.TCPConnector(ssl=False)
    
    async with aiohttp.ClientSession(
        connector=connector,
        headers={"User-Agent": "PermitAI-Indexer/3.0 contact@permitai.fr"}
    ) as session:
        for doc_type in ["PLU", "PLUi", "POS", "CC"]:
            page = 1
            print(f"\n  Type: {doc_type}")
            
            while True:
                try:
                    async with session.get(
                        GEOPORTAIL_API,
                        params={
                            "documentType": doc_type,
                            "status": "approuve",
                            "limit": 100,
                            "page": page
                        },
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status != 200:
                            print(f"    ⚠️  Status {response.status}, arrêt pagination")
                            break
                        
                        data = await response.json()
                        results = data.get("results", [])
                        
                        if not results:
                            break
                        
                        docs.extend(results)
                        print(f"    Page {page}: {len(results)} PLU récupérés (total: {len(docs)})")
                        page += 1
                        await asyncio.sleep(0.2)
                        
                except Exception as e:
                    print(f"    ❌ Erreur page {page}: {e}")
                    break
    
    print(f"\n✅ Total récupéré: {len(docs)} documents PLU")
    return docs


async def extract_and_chunk(url, session):
    """Extrait le texte d'un PDF et le découpe en chunks intelligents"""
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=120)) as response:
            pdf_bytes = await response.read()
        
        # Ouvrir le PDF avec PyMuPDF
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
            full_text = ""
            for page in pdf:
                full_text += page.get_text("text") + "\n"
                # Limiter à ~200k caractères pour éviter les PDFs trop lourds
                if len(full_text) > 200000:
                    break
        
        # Vérifier que le PDF contient du texte
        if len(full_text.strip()) < 200:
            return []
        
        # Pattern pour détecter les articles
        article_pattern = re.compile(
            r'(Article\s+[A-Z]{0,3}[\s\-]?\d+[\.\-]?\d*'
            r'|Art\.\s*\d+[\.\-]?\d*'
            r'|ARTICLE\s+\d+)',
            re.IGNORECASE
        )
        
        # Pattern pour détecter les zones (U, A, AU, N, etc.)
        zone_pattern = re.compile(
            r'ZONE\s+([A-Z]{1,3}[a-z]?)\b|Zone\s+([A-Z]{1,3}[a-z]?)\b',
            re.IGNORECASE
        )
        
        chunks = []
        current_zone = "U"
        current_sous_zone = ""
        
        # Découper par articles
        splits = article_pattern.split(full_text)
        
        for i, part in enumerate(splits):
            if not part or len(part.strip()) < 50:
                continue
            
            # Détecter si c'est un titre d'article
            if article_pattern.match(part.strip()):
                article_title = part.strip()
                # Le contenu est la partie suivante
                if i + 1 < len(splits):
                    content = splits[i + 1]
                else:
                    content = ""
            else:
                article_title = ""
                content = part
            
            # Détecter la zone dans le contenu
            zone_match = zone_pattern.search(content)
            if zone_match:
                detected = zone_match.group(1) or zone_match.group(2)
                if detected:
                    current_zone = detected[0].upper()
                    current_sous_zone = detected.upper()
            
            # Découper en chunks de CHUNK_SIZE
            words = content.split()
            current_chunk = ""
            
            for word in words:
                current_chunk += word + " "
                if len(current_chunk) >= CHUNK_SIZE:
                    if len(current_chunk.strip()) > 100:
                        chunks.append({
                            "zone": current_zone,
                            "sous_zone": current_sous_zone,
                            "article": article_title,
                            "texte": current_chunk.strip()
                        })
                    current_chunk = ""
            
            # Ajouter le dernier chunk
            if current_chunk.strip() and len(current_chunk.strip()) > 100:
                chunks.append({
                    "zone": current_zone,
                    "sous_zone": current_sous_zone,
                    "article": article_title,
                    "texte": current_chunk.strip()
                })
        
        return chunks
    
    except Exception as e:
        return []


async def store_chunks(chunks, code, nom, conn):
    """Stocke les chunks dans la base de données"""
    stored = 0
    
    # Limiter à 50 chunks par commune pour optimiser
    for chunk in chunks[:50]:
        try:
            await conn.execute(
                """
                INSERT INTO plu_chunks 
                (commune_code, commune_nom, zone, sous_zone, article, texte) 
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                code,
                nom,
                chunk.get("zone", "U"),
                chunk.get("sous_zone", ""),
                chunk.get("article", ""),
                chunk.get("texte", "")[:2000]  # Limiter à 2000 caractères
            )
            stored += 1
        except Exception:
            continue
    
    # Mettre à jour le document
    await conn.execute(
        """
        INSERT INTO plu_documents (commune_code, commune_nom, statut, nb_chunks) 
        VALUES ($1, $2, 'indexe', $3) 
        ON CONFLICT (commune_code) 
        DO UPDATE SET statut='indexe', nb_chunks=$3
        """,
        code,
        nom,
        stored
    )
    
    return stored


async def save_progress(success, errors, skipped, total):
    """Sauvegarde la progression dans un fichier JSON"""
    progress = {
        "status": "running",
        "communes_indexed": success,
        "communes_errors": errors,
        "communes_skipped": skipped,
        "total_communes_estimated": total,
        "last_update": datetime.now().isoformat()
    }
    
    try:
        import json
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(progress, f)
    except Exception:
        pass


async def main(mode):
    """Fonction principale d'indexation"""
    print(f"""
╔════════════════════════════════════════════════════════════╗
║           PermitAI PLU Indexer v3.0                       ║
║           Mode: {mode.upper():45} ║
║           Aucune IA utilisée - Texte brut uniquement       ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    # Connexion à la base de données
    print("🔌 Connexion à la base de données...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connecté à PostgreSQL\n")
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return
    
    # Récupérer la liste des PLU
    plu_list = await get_all_plu()
    
    if mode == "test":
        print(f"\n🧪 Mode TEST: Limitation à 10 PLU")
        plu_list = plu_list[:10]
    
    print(f"\n🚀 Début de l'indexation de {len(plu_list)} PLU\n")
    print("=" * 70)
    
    success = 0
    errors = 0
    skipped = 0
    
    # Désactiver la vérification SSL
    connector = aiohttp.TCPConnector(ssl=False)
    
    async with aiohttp.ClientSession(
        connector=connector,
        headers={"User-Agent": "PermitAI-Indexer/3.0"}
    ) as session:
        for i, doc in enumerate(plu_list):
            code = doc.get("codeInsee", "").strip()
            nom = doc.get("nomCommune", code)
            url = doc.get("urlDocument", "")
            
            if not code or not url:
                continue
            
            # Vérifier si déjà indexé
            existing = await conn.fetchval(
                "SELECT nb_chunks FROM plu_documents WHERE commune_code=$1",
                code
            )
            
            if existing and existing > 0:
                skipped += 1
                continue
            
            print(f"  [{i+1}/{len(plu_list)}] {nom} ({code})...", end=" ", flush=True)
            
            # Extraire et découper le PDF
            chunks = await extract_and_chunk(url, session)
            
            if chunks:
                n = await store_chunks(chunks, code, nom, conn)
                print(f"✅ {n} chunks")
                success += 1
            else:
                print("❌ PDF inaccessible ou vide")
                errors += 1
            
            # Pause pour ne pas surcharger l'API
            await asyncio.sleep(0.3)
            
            # Rapport de progression tous les 100
            if i > 0 and i % 100 == 0:
                print(f"\n{'='*70}")
                print(f"📊 PROGRESSION : {i}/{len(plu_list)} communes traitées")
                print(f"   ✅ Succès: {success} | ❌ Erreurs: {errors} | ⏭️  Déjà indexés: {skipped}")
                print(f"{'='*70}\n")
                await save_progress(success, errors, skipped, len(plu_list))
    
    await conn.close()
    
    print(f"""
{'='*70}
✅ INDEXATION TERMINÉE
{'='*70}
  Succès:        {success}
  Erreurs:       {errors}
  Déjà indexés:  {skipped}
  Total traité:  {success + errors + skipped}
{'='*70}
    """)
    
    # Sauvegarder l'état final
    await save_progress(success, errors, skipped, len(plu_list))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Indexation des PLU de France")
    parser.add_argument(
        "--mode",
        choices=["test", "full"],
        default="test",
        help="Mode d'indexation: test (10 PLU) ou full (tous)"
    )
    
    args = parser.parse_args()
    
    try:
        asyncio.run(main(args.mode))
    except KeyboardInterrupt:
        print("\n\n⚠️  Indexation interrompue par l'utilisateur")
        sys.exit(0)
