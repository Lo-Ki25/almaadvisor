@echo off
REM 🚀 Script de Déploiement Automatique ALMA-ADVISOR pour Windows
REM Usage: deploy.bat

echo 🚀 Déploiement Automatique ALMA-ADVISOR
echo ========================================

REM Vérifier si .env.local existe
if not exist ".env.local" (
    echo ❌ Fichier .env.local manquant!
    echo 📝 Créez le fichier .env.local avec vos variables d'environnement
    echo 📖 Consultez setup-guide.md pour les instructions
    pause
    exit /b 1
)

echo ✅ Fichier .env.local trouvé

REM Installer les dépendances
echo 📦 Installation des dépendances...
npm install

REM Générer le client Prisma
echo 🔧 Génération du client Prisma...
npx prisma generate

REM Initialiser la base de données locale
echo 🗄️ Initialisation de la base de données locale...
npx prisma db push

REM Tester l'application localement
echo 🧪 Test de l'application locale...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Erreur de build local
    pause
    exit /b 1
)

echo ✅ Build local réussi

REM Se connecter à Vercel
echo 🔐 Connexion à Vercel...
npx vercel login

REM Déployer sur Vercel
echo 🚀 Déploiement sur Vercel...
npx vercel --prod

if %errorlevel% neq 0 (
    echo ❌ Erreur de déploiement
    pause
    exit /b 1
)

echo ✅ Déploiement réussi!
echo 🌐 Votre application est maintenant en ligne
echo 📊 Consultez le dashboard Vercel pour les logs et métriques
echo 🎉 Déploiement terminé avec succès!
pause
