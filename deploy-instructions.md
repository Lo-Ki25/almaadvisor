# 🚀 Déploiement Automatique ALMA-ADVISOR

## ✅ Étapes Automatisées Complétées

1. ✅ Repository GitHub connecté : https://github.com/Net-Nook2/alma-advisor
2. ✅ Code poussé vers GitHub
3. ✅ Configuration Vercel préparée

## 🎯 Prochaines Étapes sur Vercel

### 1. Aller sur Vercel Dashboard
- Ouvrez : https://vercel.com/netnooks-projects
- Cliquez sur **"New Project"**

### 2. Importer le Repository
- Sélectionnez : **Net-Nook2/alma-advisor**
- Cliquez sur **"Import"**

### 3. Configuration Automatique
Le projet est déjà configuré avec :
- ✅ Framework : Next.js
- ✅ Build Command : `npm run build`
- ✅ Output Directory : `.next`

### 4. Variables d'Environnement à Ajouter

Dans la section **"Environment Variables"**, ajoutez :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `DATABASE_URL` | `postgresql://...` | URL de votre base PostgreSQL |
| `OPENAI_API_KEY` | `sk-...` | Votre clé API OpenAI |
| `LLM_PROVIDER` | `openai` | Fournisseur LLM |
| `UPLOAD_DIR` | `./uploads` | Répertoire d'upload |
| `MAX_FILE_SIZE` | `50000000` | Taille max des fichiers |

### 5. Base de Données PostgreSQL

**Option Recommandée : Vercel Postgres**
1. Dans Vercel Dashboard → **Storage** → **Create Database** → **Postgres**
2. Nom : `alma-advisor-db`
3. Région : `Frankfurt` (plus proche du Maroc)
4. Copiez l'URL de connexion
5. Ajoutez-la comme `DATABASE_URL`

### 6. Clé API OpenAI

1. Allez sur : https://platform.openai.com/api-keys
2. Cliquez sur **"Create new secret key"**
3. Nom : `alma-advisor-production`
4. Copiez la clé (commence par `sk-`)
5. Ajoutez-la comme `OPENAI_API_KEY`

### 7. Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes
3. Votre app sera disponible sur : `https://alma-advisor.vercel.app`

## 🔧 Configuration Post-Déploiement

Une fois déployé, initialisez la base de données :

```bash
# En local, avec l'URL de production
npx prisma db push
```

## 🧪 Test de l'Application

1. **Accédez à votre URL Vercel**
2. **Créez un nouveau projet**
3. **Uploadez quelques documents** (PDF, DOCX, etc.)
4. **Lancez la génération du rapport**

## 📊 Monitoring

- **Logs** : Vercel Dashboard → Functions → View Logs
- **Analytics** : Déjà intégré via `@vercel/analytics`
- **Performance** : Vercel Speed Insights

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Vercel
2. Vérifiez les variables d'environnement
3. Testez votre clé OpenAI

## 🎉 Félicitations !

Votre plateforme ALMA-ADVISOR sera bientôt en ligne avec :
- ✅ Pipeline RAG complet
- ✅ Génération automatique de rapports
- ✅ Interface moderne et responsive
- ✅ Support de multiples méthodologies
- ✅ Export PDF professionnel
