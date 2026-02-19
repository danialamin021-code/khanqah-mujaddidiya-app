#!/bin/bash
# Vercel Deployment Script
# Run: ./scripts/vercel-deploy.sh
# Prerequisites: Node.js, npm

set -e
cd "$(dirname "$0")/.."

echo "=== Vercel Deployment ==="

# 1. Check login
echo ""
echo "1. Checking Vercel login..."
if ! npx vercel whoami >/dev/null 2>&1; then
    echo "Not logged in. Run: npx vercel login"
    npx vercel login
fi

# 2. Link project (first time)
if [ ! -f .vercel/project.json ]; then
    echo ""
    echo "2. Linking to Vercel project (first time)..."
    npx vercel link --yes
fi

# 3. Deploy
echo ""
echo "3. Deploying to production..."
npx vercel deploy --prod --yes

echo ""
echo "=== Deployment complete! ==="
echo "Add your production URL to Supabase Auth redirect URLs:"
echo "  Supabase -> Authentication -> URL Configuration"
echo "  Site URL: https://your-app.vercel.app"
echo "  Redirect URLs: https://your-app.vercel.app/**"
