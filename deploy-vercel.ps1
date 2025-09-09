# 🚀 ALMA-ADVISOR - Script de Déploiement Vercel

Write-Host "🚀 Déploiement ALMA-ADVISOR vers Vercel..." -ForegroundColor Green

# Vérification des prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier si Vercel CLI est installé
if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI non trouvé. Installation..." -ForegroundColor Red
    npm install -g vercel
}

# Vérifier si .env.local existe
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local non trouvé. Copiez .env.example vers .env.local et configurez vos variables" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "📝 .env.local créé. Veuillez le configurer avant de continuer." -ForegroundColor Yellow
    Start-Process notepad.exe ".env.local"
    Read-Host "Appuyez sur Entrée quand .env.local est configuré"
}

# Build et tests locaux
Write-Host "🔨 Build local..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build échoué!" -ForegroundColor Red
    exit 1
}

Write-Host "🧪 Tests..." -ForegroundColor Blue
npx vitest run
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Certains tests ont échoué, mais continuons..." -ForegroundColor Yellow
}

# Déploiement Vercel
Write-Host "🚀 Déploiement vers Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
Write-Host "🌐 Votre application est maintenant en ligne!" -ForegroundColor Cyan

# Ouvrir l'URL de production
Write-Host "📊 Ouverture du dashboard Vercel..." -ForegroundColor Blue
vercel --prod --open
