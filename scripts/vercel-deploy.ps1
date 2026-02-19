# Vercel Deployment Script
# Run: .\scripts\vercel-deploy.ps1
# Prerequisites: Node.js, npm

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== Vercel Deployment ===" -ForegroundColor Cyan

# 1. Check login
Write-Host "`n1. Checking Vercel login..." -ForegroundColor Yellow
$whoami = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Run: npx vercel login" -ForegroundColor Red
    Write-Host "This will open a browser to authenticate." -ForegroundColor Yellow
    npx vercel login
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

# 2. Link project (first time)
if (-not (Test-Path ".vercel\project.json")) {
    Write-Host "`n2. Linking to Vercel project (first time)..." -ForegroundColor Yellow
    npx vercel link --yes
}

# 3. Deploy
Write-Host "`n3. Deploying to production..." -ForegroundColor Yellow
npx vercel deploy --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== Deployment complete! ===" -ForegroundColor Green
    Write-Host "Add your production URL to Supabase Auth redirect URLs:" -ForegroundColor Yellow
    Write-Host "  Supabase -> Authentication -> URL Configuration" -ForegroundColor Gray
    Write-Host "  Site URL: https://your-app.vercel.app" -ForegroundColor Gray
    Write-Host "  Redirect URLs: https://your-app.vercel.app/**" -ForegroundColor Gray
} else {
    exit 1
}
