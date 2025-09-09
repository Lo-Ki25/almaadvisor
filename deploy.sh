#!/bin/bash

# 🚀 Script de Déploiement Automatique ALMA-ADVISOR
# Usage: ./deploy.sh

echo "🚀 Déploiement Automatique ALMA-ADVISOR"
echo "========================================"

# Vérifier si .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Fichier .env.local manquant!"
    echo "📝 Créez le fichier .env.local avec vos variables d'environnement"
    echo "📖 Consultez setup-guide.md pour les instructions"
    exit 1
fi

echo "✅ Fichier .env.local trouvé"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Initialiser la base de données locale
echo "🗄️ Initialisation de la base de données locale..."
npx prisma db push

# Tester l'application localement
echo "🧪 Test de l'application locale..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build local réussi"
else
    echo "❌ Erreur de build local"
    exit 1
fi

# Se connecter à Vercel
echo "🔐 Connexion à Vercel..."
npx vercel login

# Déployer sur Vercel
echo "🚀 Déploiement sur Vercel..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi!"
    echo "🌐 Votre application est maintenant en ligne"
    echo "📊 Consultez le dashboard Vercel pour les logs et métriques"
else
    echo "❌ Erreur de déploiement"
    exit 1
fi

echo "🎉 Déploiement terminé avec succès!"
