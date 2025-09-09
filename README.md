# ALMA-ADVISOR

Plateforme de conseil en transformation digitale avec ingestion documentaire et génération automatique de rapports RAG.

## Fonctionnalités

- 📊 **Tableau de bord** - Vue d'ensemble des projets
- 📝 **Création de projets** - Assistant en 4 étapes
- 📄 **Upload de documents** - Support PDF, DOCX, XLSX, CSV, TXT, MD
- 🧠 **Pipeline RAG** - Ingestion → Analyse → Génération
- 📈 **Génération automatique** - Rapports, diagrammes, tableaux
- 🎨 **Diagrammes** - C4, BPMN, Gantt, STRIDE
- 📋 **Tableaux** - RICE, Budget, RACI, BSC
- 📤 **Export** - PDF + annexes

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` avec :

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/alma_advisor"

# OpenAI API (for embeddings and LLM)
OPENAI_API_KEY="your_openai_api_key_here"

# Alternative LLM Providers (optional)
ANTHROPIC_API_KEY="your_anthropic_api_key_here"
GROQ_API_KEY="your_groq_api_key_here"

# LLM Provider (openai, anthropic, groq)
LLM_PROVIDER="openai"

# File Upload Settings
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="50000000"
```

### 2. Base de données

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la base de données
npm run db:push
```

### 3. Développement

```bash
# Démarrer le serveur de développement
npm run dev
```

## Déploiement sur Vercel

### 1. Préparation

1. Créez un compte Vercel
2. Connectez votre repository GitHub
3. Configurez une base de données PostgreSQL (Vercel Postgres, Supabase, ou PlanetScale)

### 2. Variables d'environnement sur Vercel

Dans les paramètres du projet Vercel, ajoutez :

- `DATABASE_URL` - URL de votre base de données PostgreSQL
- `OPENAI_API_KEY` - Clé API OpenAI
- `LLM_PROVIDER` - "openai" (ou autre fournisseur)
- `UPLOAD_DIR` - "./uploads"
- `MAX_FILE_SIZE` - "50000000"

### 3. Déploiement

```bash
# Le déploiement se fait automatiquement via Git
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

## Architecture

### Backend API Routes

- `POST /api/projects` - Créer un projet
- `GET /api/projects` - Lister les projets
- `GET /api/projects/[id]` - Détails d'un projet
- `POST /api/projects/[id]/upload` - Upload de documents
- `POST /api/projects/[id]/ingest` - Ingestion des documents
- `POST /api/projects/[id]/embed` - Génération des embeddings
- `POST /api/projects/[id]/generate` - Génération du rapport

### Pipeline RAG

1. **Upload** - Documents stockés et métadonnées enregistrées
2. **Ingestion** - Parsing et chunking des documents
3. **Embeddings** - Génération des vecteurs sémantiques
4. **Génération** - Création du rapport avec RAG

### Technologies

- **Frontend** - Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** - Next.js API Routes, Prisma ORM
- **Base de données** - PostgreSQL
- **IA** - OpenAI API (embeddings + LLM)
- **UI** - Radix UI, Lucide Icons
- **Déploiement** - Vercel

## Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.
