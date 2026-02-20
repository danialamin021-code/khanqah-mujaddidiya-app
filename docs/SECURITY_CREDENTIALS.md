# Credential Security

## If credentials were exposed

If Supabase credentials, test user passwords, or other secrets were ever committed to git or shared:

1. **Supabase (mobile/.env or root .env)**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
   - Regenerate the **anon** key
   - Update your local `.env` / `mobile/.env` with the new key

2. **Test user (.env.test)**
   - Change the test account password in Supabase Auth (Dashboard → Authentication → Users)
   - Update `TEST_USER_PASSWORD` in your local `.env.test`

## Files that must never be committed

- `.env`, `.env.*` (root)
- `mobile/.env` (mobile app)

These are in `.gitignore`. If you accidentally commit them, run:

```bash
git rm --cached mobile/.env
git rm --cached .env.test
# ... then commit the removal
```

Then rotate the exposed credentials immediately.
