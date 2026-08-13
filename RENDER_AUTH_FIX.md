# Fix NextAuth "UntrustedHost" Error on Render

## Problem
Your app is live at `https://girvimanage.onrender.com` but showing authentication errors:
```
[auth][error] UntrustedHost: Host must be trusted. URL was: https://girvimanage.onrender.com/api/auth/session
```

## Solution

### Step 1: Add Missing Environment Variables

Go to **Render Dashboard** → Your Service → **Environment**

Add these three new variables:

1. **`AUTH_URL`**
   ```
   https://girvimanage.onrender.com
   ```

2. **`NEXTAUTH_URL`**
   ```
   https://girvimanage.onrender.com
   ```

3. **`NEXT_PUBLIC_APP_URL`**
   ```
   https://girvimanage.onrender.com
   ```

### Step 2: Commit and Push Code Changes

The code has been updated with `trustHost: true` in the auth configuration.

```bash
git add .
git commit -m "fix: add trustHost to NextAuth config for production deployment"
git push origin main
```

### Step 3: Render Will Auto-Deploy

- Render detects the new commit
- Automatically rebuilds and redeploys
- Auth errors should be resolved

### Step 4: Verify

Once redeployed:
1. Visit `https://girvimanage.onrender.com`
2. Try to access the login page
3. No more auth errors should appear

## Why This Happened

NextAuth v5 requires explicit trust of deployment hosts for security. By default, it only trusts `localhost`. For production, you need to either:

1. Set `trustHost: true` (what we did) - trusts all hosts
2. Or set `AUTH_URL` environment variable with your exact domain

## Complete Environment Variables Checklist

Make sure you have ALL of these in Render:

- ✅ `NODE_ENV` = `production`
- ✅ `DATABASE_URL` = Your Neon connection string
- ✅ `DIRECT_DATABASE_URL` = Your Neon connection string
- ✅ `AUTH_SECRET` = Your generated secret (32+ characters)
- ✅ `AUTH_URL` = `https://girvimanage.onrender.com`
- ✅ `NEXTAUTH_URL` = `https://girvimanage.onrender.com`
- ✅ `NEXT_PUBLIC_APP_URL` = `https://girvimanage.onrender.com`
- ✅ `STORAGE_PROVIDER` = `local`
- ✅ `NEXT_PUBLIC_APP_NAME` = `GirviPro`

## After Fix

Your app should be fully functional:
- ✅ Authentication working
- ✅ Login/Register pages accessible
- ✅ Dashboard accessible after login
- ✅ All API routes working

## Troubleshooting

If errors persist after redeployment:

1. **Check logs**: Render Dashboard → Logs tab
2. **Verify env vars**: Ensure all variables are set (no typos)
3. **Hard refresh**: Clear browser cache or use incognito mode
4. **Check AUTH_SECRET**: Must be set and at least 32 characters long

## Generate AUTH_SECRET (if missing)

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as the `AUTH_SECRET` value in Render.
