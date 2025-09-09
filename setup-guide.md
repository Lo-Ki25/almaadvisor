# 🚀 Guide Complet de Configuration et Déploiement ALMA-ADVISOR

## 📋 Prérequis

1. ✅ Node.js installé
2. ✅ Compte GitHub
3. ✅ Compte Vercel
4. ✅ Compte OpenAI

## 🔧 Étape 1: Configuration des Variables d'Environnement

### 1.1 Créer le fichier .env.local

Créez un fichier `.env.local` dans le dossier `almaadvisor` avec ce contenu :

```env
# Database URL - Remplacez par votre URL PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database"

# OpenAI API Key - Remplacez par votre clé API
OPENAI_API_KEY="sk-your_openai_api_key_here"

# LLM Provider
LLM_PROVIDER="openai"

# File Upload Settings
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="50000000"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

### 1.2 Obtenir la Clé API OpenAI

1. Allez sur : https://platform.openai.com/api-keys
2. Cliquez sur "Create new secret key"
3. Nom : `alma-advisor-production`
4. Copiez la clé (commence par `sk-`)
5. Remplacez `sk-your_openai_api_key_here` dans .env.local

### 1.3 Configurer la Base de Données

**Option A: Supabase (Gratuit et Recommandé)**

1. Allez sur : https://supabase.com
2. Créez un nouveau projet
3. Settings → Database → Copiez l'URL PostgreSQL
4. Remplacez `postgresql://username:password@host:port/database` dans .env.local

**Option B: Vercel Postgres**

1. Allez sur : https://vercel.com/bentabetchouaib25-4583s-projects
2. Storage → Create Database → Postgres
3. Nom : `alma-advisor-db`
4. Région : `Frankfurt`
5. Copiez l'URL et remplacez dans .env.local

## 🔧 Étape 2: Installation et Configuration Locale

### 2.1 Installer les Dépendances

```bash
npm install
```

### 2.2 Initialiser la Base de Données

```bash
npx prisma db push
```

### 2.3 Tester l'Application Locale

```bash
npm run dev
```

Ouvrez http://localhost:3000 pour tester.

## 🚀 Étape 3: Déploiement Automatique sur Vercel

### 3.1 Se Connecter à Vercel

```bash
npx vercel login
```

### 3.2 Configurer les Variables d'Environnement sur Vercel

```bash
# Ajouter DATABASE_URL
npx vercel env add DATABASE_URL

# Ajouter OPENAI_API_KEY
npx vercel env add OPENAI_API_KEY

# Ajouter LLM_PROVIDER
npx vercel env add LLM_PROVIDER

# Ajouter UPLOAD_DIR
npx vercel env add UPLOAD_DIR

# Ajouter MAX_FILE_SIZE
npx vercel env add MAX_FILE_SIZE
```

### 3.3 Déployer en Production

```bash
npx vercel --prod
```

## 🔧 Étape 4: Configuration Post-Déploiement

### 4.1 Initialiser la Base de Données de Production

```bash
npx prisma db push --schema=./prisma/schema.prisma
```

### 4.2 Vérifier le Déploiement

```bash
npx vercel ls
```

## 🧪 Étape 5: Test de l'Application

1. Accédez à votre URL Vercel
2. Créez un nouveau projet
3. Uploadez des documents (PDF, DOCX, etc.)
4. Lancez la génération du rapport

## 📊 Étape 6: Monitoring et Maintenance

### 6.1 Vérifier les Logs

```bash
npx vercel logs
```

### 6.2 Redéployer après Modifications

```bash
git add .
git commit -m "Update: description des changements"
git push origin main
npx vercel --prod
```

## 🆘 Dépannage

### Problème: Erreur de Base de Données

```bash
# Vérifier la connexion
npx prisma db push

# Regénérer le client Prisma
npx prisma generate
```

### Problème: Erreur de Build

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npx vercel --prod
```

### Problème: Variables d'Environnement

```bash
# Vérifier les variables
npx vercel env ls

# Ajouter une variable manquante
npx vercel env add VARIABLE_NAME
```

## 🎯 Commandes de Déploiement Rapide

```bash
# Déploiement complet en une commande
npm install && npx prisma db push && npx vercel --prod
```

## 📱 URLs Importantes

- **Application Locale** : http://localhost:3000
- **Application Production** : https://almaadvisor-37fw4xsdh-bentabetchouaib25-4583s-projects.vercel.app
- **Dashboard Vercel** : https://vercel.com/bentabetchouaib25-4583s-projects/almaadvisor
- **GitHub Repository** : https://github.com/Net-Nook2/alma-advisor

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données créée et accessible
- [ ] Clé API OpenAI valide
- [ ] Application testée localement
- [ ] Déploiement Vercel réussi
- [ ] Base de données de production initialisée
- [ ] Application testée en production

## 🎉 Félicitations !

Votre plateforme ALMA-ADVISOR est maintenant déployée avec :
- ✅ Pipeline RAG complet
- ✅ Génération automatique de rapports
- ✅ Interface moderne et responsive
- ✅ Support de multiples méthodologies
- ✅ Export PDF professionnel
