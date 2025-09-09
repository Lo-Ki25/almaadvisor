# Guide de Déploiement sur Vercel

Ce guide vous explique comment déployer ALMA-ADVISOR sur Vercel.

## Prérequis

1. Compte GitHub
2. Compte Vercel (connecté à GitHub)
3. Base de données PostgreSQL (Vercel Postgres, Supabase, PlanetScale, etc.)
4. Clé API OpenAI

## Étapes de Déploiement

### 1. Préparer le Repository GitHub

```bash
# Si ce n'est pas déjà fait
git init
git add .
git commit -m "Initial commit - ALMA-ADVISOR RAG platform"

# Créer un repository sur GitHub et le connecter
git remote add origin https://github.com/VOTRE_USERNAME/alma-advisor.git
git branch -M main
git push -u origin main
```

### 2. Configurer la Base de Données

#### Option A: Vercel Postgres
1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Créer un nouveau projet Storage > Postgres
3. Noter l'URL de connexion

#### Option B: Supabase
1. Aller sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans Settings > Database
4. Copier l'URL de connexion PostgreSQL

#### Option C: PlanetScale (MySQL alternative)
1. Aller sur [PlanetScale](https://planetscale.com)
2. Créer une base de données
3. Obtenir l'URL de connexion

### 3. Déployer sur Vercel

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquer sur "New Project"
3. Importer votre repository GitHub
4. Configurer les variables d'environnement :

```env
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50000000
```

5. Cliquer sur "Deploy"

### 4. Configuration Post-Déploiement

Une fois le déploiement terminé :

1. **Initialiser la base de données** :
   ```bash
   # En local, avec l'URL de production
   npx prisma db push --schema=./prisma/schema.prisma
   ```

2. **Vérifier le déploiement** :
   - Aller sur l'URL fournie par Vercel
   - Tester la création d'un nouveau projet
   - Vérifier l'upload de documents

### 5. Variables d'Environnement Détaillées

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `OPENAI_API_KEY` | Clé API OpenAI pour embeddings et LLM | `sk-...` |
| `LLM_PROVIDER` | Fournisseur LLM (openai, anthropic, groq) | `openai` |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (optionnel) | `sk-ant-...` |
| `GROQ_API_KEY` | Clé API Groq (optionnel) | `gsk_...` |
| `UPLOAD_DIR` | Répertoire d'upload (pour Vercel: ./uploads) | `./uploads` |
| `MAX_FILE_SIZE` | Taille max des fichiers en bytes | `50000000` |

### 6. Domaine Personnalisé (Optionnel)

1. Dans Vercel Dashboard > Project Settings > Domains
2. Ajouter votre domaine personnalisé
3. Configurer les DNS selon les instructions

### 7. Monitoring et Logs

- **Logs** : Vercel Dashboard > Functions > View Logs
- **Analytics** : Déjà intégré via `@vercel/analytics`
- **Monitoring** : Utiliser Vercel Speed Insights

## Dépannage

### Erreurs Communes

1. **Build Error: Prisma Client**
   ```bash
   # Solution : Ajouter dans package.json
   "scripts": {
     "build": "prisma generate && next build"
   }
   ```

2. **Database Connection Error**
   - Vérifier l'URL de connexion
   - S'assurer que la DB accepte les connexions externes

3. **OpenAI API Error**
   - Vérifier la clé API
   - S'assurer que le compte a des crédits

4. **File Upload Error**
   - Vercel a une limite de 50MB pour les uploads
   - Considérer l'utilisation d'un service externe (AWS S3, Cloudinary)

### Optimisations pour Production

1. **Performance** :
   - Activer Edge Functions si possible
   - Utiliser les ISR (Incremental Static Regeneration)

2. **Sécurité** :
   - Configurer CORS appropriés
   - Ajouter rate limiting
   - Utiliser HTTPS uniquement

3. **Monitoring** :
   - Configurer des alertes Vercel
   - Monitorer les coûts OpenAI

## Support

Pour toute question :
1. Vérifier les logs Vercel
2. Consulter la documentation Prisma
3. Vérifier les limites de l'API OpenAI

## Architecture de Production

```
Internet → Vercel Edge Network → Next.js App → PostgreSQL Database
                                           ↓
                                    OpenAI API (Embeddings + LLM)
```

Le déploiement utilise :
- **Frontend** : Next.js 14 sur Vercel Edge
- **Backend** : API Routes serverless
- **Database** : PostgreSQL avec Prisma ORM
- **AI** : OpenAI API pour embeddings et génération
- **Storage** : Système de fichiers temporaire Vercel (/tmp)

## Mise à Jour

Pour mettre à jour l'application :

```bash
git add .
git commit -m "Update: description des changements"
git push origin main
```

Vercel redéploiera automatiquement à chaque push sur la branche main.
