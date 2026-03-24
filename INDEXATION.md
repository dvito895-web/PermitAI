# 📚 Documentation - Indexation PLU v3.0

## État Actuel

### ✅ Fonctionnel
- **51 communes indexées** avec données PLU dans la base
- Script d'indexation v3.0 créé et prêt à l'emploi
- Architecture sans IA pour réduire les coûts

### ⚠️ Limitation API Géoportail
L'API `https://www.geoportail-urbanisme.gouv.fr/api/document/search` retourne actuellement des erreurs 404.

**Solutions alternatives** :

1. **Utiliser l'API data.gouv.fr** :
   ```bash
   https://data.gouv.fr/fr/datasets/plan-local-durbanisme-plu/
   ```

2. **Scraping direct** :
   - Télécharger manuellement les PLU depuis geoportail-urbanisme.gouv.fr
   - Indexer les fichiers locaux avec le script

3. **Indexation progressive** :
   - Utiliser l'API communes (https://geo.api.gouv.fr/communes)
   - Rechercher les PLU un par un via d'autres sources

## Script d'Indexation

### Localisation
```
/app/scripts/index_plu_complet.py
```

### Fonctionnalités
- ✅ Extraction de texte brut avec PyMuPDF (pas d'IA)
- ✅ Découpage intelligent par articles et zones
- ✅ Gestion asynchrone pour performance
- ✅ Support modes test (10 PLU) et full (tous)
- ✅ Sauvegarde progression dans `indexation_progress.json`
- ✅ Limite de 50 chunks par commune pour optimiser

### Utilisation

**Mode test (10 PLU)** :
```bash
cd /app/scripts
export DATABASE_URL="$(grep DATABASE_URL /app/.env | cut -d'=' -f2-)"
python3 index_plu_complet.py --mode test
```

**Mode full (tous les PLU)** :
```bash
cd /app/scripts
export DATABASE_URL="$(grep DATABASE_URL /app/.env | cut -d'=' -f2-)"
nohup python3 index_plu_complet.py --mode full > indexation.log 2>&1 &
```

**Suivi de la progression** :
```bash
# Via fichier JSON
cat /app/scripts/indexation_progress.json

# Via API
curl https://permitai-demo.preview.emergentagent.com/api/indexation/progress
```

## Architecture Technique

### Traitement PDF
1. Téléchargement du PDF depuis l'URL du PLU
2. Extraction du texte brut (PyMuPDF)
3. Détection des articles et zones
4. Découpage en chunks de 800 caractères
5. Stockage dans PostgreSQL

### Base de Données

**Table `plu_chunks`** :
- `commune_code`: Code INSEE (ex: "75001")
- `commune_nom`: Nom de la commune
- `zone`: Zone principale (U, A, AU, N)
- `sous_zone`: Sous-zone détaillée
- `article`: Titre de l'article
- `texte`: Contenu du chunk (max 2000 char)

**Table `plu_documents`** :
- `commune_code`: Code INSEE (PK)
- `commune_nom`: Nom de la commune
- `statut`: "indexe" | "en_cours" | "erreur"
- `nb_chunks`: Nombre de chunks indexés

## Dépannage

### Erreur SSL Certificate
Le script désactive la vérification SSL automatiquement :
```python
connector = aiohttp.TCPConnector(ssl=False)
```

### API 404
Si l'API Géoportail retourne 404, utiliser les solutions alternatives ci-dessus.

### Connexion Database
Vérifier que `DATABASE_URL` est bien défini :
```bash
echo $DATABASE_URL
```

## Prochaines Étapes

1. **Résoudre l'accès API Géoportail** ou utiliser source alternative
2. **Lancer l'indexation complète** des 36 000 communes
3. **Monitorer la progression** via endpoint `/api/indexation/progress`
4. **Créer UI admin** pour visualiser l'avancement

## Coûts

### Actuel (avec IA Claude) ❌
- ~0,50 EUR par commune
- Total : 18 000 EUR pour 36 000 communes

### Nouveau (sans IA) ✅
- 0 EUR d'IA
- Coûts uniquement : bande passante + stockage
- Total estimé : < 100 EUR

## Contact Support

Pour toute question sur l'indexation :
- Vérifier les logs : `/app/scripts/indexation.log`
- Consulter l'endpoint : `/api/indexation/progress`
