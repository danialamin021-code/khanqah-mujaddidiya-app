# Deploy Steps — Run These Manually

## 1. Commit and Push to GitHub

```bash
# Remove lock if it exists
rm -f .git/index.lock

# Stage all changes
git add -A

# Commit
git commit -m "Phase 2 & 3: Data, reliability, deployment"

# Push
git push origin main
```

On Windows PowerShell:
```powershell
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue
git add -A
git commit -m "Phase 2 & 3: Data, reliability, deployment"
git push origin main
```

## 2. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `danialamin021-code/khanqah-mujaddidiya-app`
3. Add environment variables (see docs/PHASE3_DEPLOYMENT.md)
4. Deploy

## 3. Supabase Auth Redirect URLs

After deployment, add to Supabase → Authentication → URL Configuration:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`
