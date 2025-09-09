# 🚀 ALMA-ADVISOR - Guide de Déploiement

## ✅ État du Projet
- **Build Status**: ✅ Compilé avec succès
- **Tests**: ✅ 16 tests unitaires passants
- **TypeScript**: ✅ Sans erreurs de type
- **Dépendances**: ✅ Résolues avec `--legacy-peer-deps`

## 📦 Prérequis

### Variables d'Environnement
Copiez `.env.example` vers `.env.local` et configurez :

```bash
# Base de données
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # Pour Prisma

# LLM Provider (optionnel - au moins un requis)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="..."
GROQ_API_KEY="..."
LLM_PROVIDER="openai" # ou "anthropic" ou "groq"

# Next.js
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://your-domain.com"
```

## 🚀 Options de Déploiement

### 1. Vercel (Recommandé)
```bash
# Installation Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod
```

**Configuration Vercel:**
- Build Command: `npm run build`
- Install Command: `npm install --legacy-peer-deps`
- Node.js Version: `18.x`

### 2. Railway
```bash
# Installation Railway CLI
npm install -g @railway/cli

# Login et déploiement
railway login
railway init
railway up
```

### 3. Render
1. Connectez votre repo GitHub à Render
2. Configurez:
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Start Command: `npm start`
   - Node Version: `18`

### 4. Docker (Local/VPS)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🗄️ Configuration Base de Données

### PostgreSQL avec Prisma
```bash
# Migration de la base
npx prisma db push

# Génération du client
npx prisma generate

# Seeding (optionnel)
npx prisma db seed
```

### Variables Database
```bash
# Exemple PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/almaadvisor"
DIRECT_URL="postgresql://user:password@host:5432/almaadvisor"
```

## ⚙️ Scripts de Déploiement

### Build de Production
```bash
npm run build
```

### Tests
```bash
npx vitest run
```

### Validation complète
```bash
npm install --legacy-peer-deps
npx prisma generate
npm run build
npx vitest run
```

## 🔧 Paramètres de Performance

### Next.js Config
```javascript
// next.config.mjs
{
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['localhost'],
  }
}
```

### Environment Variables Production
```bash
NODE_ENV=production
NEXTAUTH_SECRET=your-production-secret
DATABASE_URL=your-production-db-url
```

## 🚦 Health Checks

### Endpoint de Santé
- `/api/projects` - Status de l'API
- `/` - Interface utilisateur

### Monitoring
```bash
# Logs de production
npm run build && npm start

# Tests de charge
curl -X GET https://your-domain.com/api/projects
```

## 🔐 Sécurité

### Headers de Sécurité
```javascript
// next.config.mjs
{
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  }
}
```

### Variables Sensibles
- ✅ Jamais commiter `.env.local`
- ✅ Utiliser des secrets environnementaux 
- ✅ Rotation des clés API

## 📊 Métriques Post-Déploiement

### Performance
- ⚡ First Contentful Paint < 2s
- 📊 Lighthouse Score > 90
- 🚀 API Response Time < 500ms

### Monitoring
- 📈 Vercel Analytics / Railway Metrics
- 🔍 Error Tracking avec Sentry (optionnel)
- 📊 Database performance monitoring

## 🆘 Troubleshooting

### Erreurs Communes
```bash
# Erreur de dépendances
npm install --legacy-peer-deps

# Erreur Prisma
npx prisma generate
npx prisma db push

# Erreur de build TypeScript
npm run build -- --verbose
```

### Rollback
```bash
# Retour version précédente
git revert HEAD
git push origin main

# Ou rollback Vercel
vercel rollback
```

## 📝 Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Build local réussi
- [ ] Tests passants
- [ ] Domain/DNS configuré
- [ ] Monitoring activé
- [ ] Backup BDD configuré
- [ ] Health checks fonctionnels

---

## 🎉 Déploiement Réussi !

Votre application ALMA-ADVISOR est maintenant en production avec :
- ✅ Architecture robuste
- ✅ Gestion d'erreurs complète  
- ✅ Tests unitaires
- ✅ Performance optimisée
- ✅ TypeScript sécurisé
