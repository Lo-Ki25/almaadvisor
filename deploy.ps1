# 🚀 Script de Déploiement Automatique ALMA-ADVISOR pour PowerShell
# Usage: .\deploy.ps1

Write-Host "🚀 Déploiement Automatique ALMA-ADVISOR" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Vérifier si .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Fichier .env.local manquant!" -ForegroundColor Red
    Write-Host "📝 Créez le fichier .env.local avec vos variables d'environnement" -ForegroundColor Yellow
    Write-Host "📖 Consultez setup-guide.md pour les instructions" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host "✅ Fichier .env.local trouvé" -ForegroundColor Green

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Blue
npm install

# Générer le client Prisma
Write-Host "🔧 Génération du client Prisma..." -ForegroundColor Blue
npx prisma generate

# Initialiser la base de données locale
Write-Host "🗄️ Initialisation de la base de données locale..." -ForegroundColor Blue
npx prisma db push

# Tester l'application localement
Write-Host "🧪 Test de l'application locale..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de build local" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host "✅ Build local réussi" -ForegroundColor Green

# Se connecter à Vercel
Write-Host "🔐 Connexion à Vercel..." -ForegroundColor Blue
npx vercel login

# Déployer sur Vercel
Write-Host "🚀 Déploiement sur Vercel..." -ForegroundColor Blue
npx vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de déploiement" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
Write-Host "🌐 Votre application est maintenant en ligne" -ForegroundColor Green
Write-Host "📊 Consultez le dashboard Vercel pour les logs et métriques" -ForegroundColor Yellow
Write-Host "🎉 Déploiement terminé avec succès!" -ForegroundColor Green
Read-Host "Appuyez sur Entrée pour continuer"
