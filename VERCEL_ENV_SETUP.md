# Vercel Environment Variables Setup

## 📍 Where to Add These

1. Go to: **https://vercel.com/dashboard**
2. Click on your project: **girvimanage**
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add each variable below

## 🔐 Environment Variables to Add

### 1. NODE_ENV
```
Key: NODE_ENV
Value: production
```
**For:** All environments (Production, Preview, Development)

---

### 2. DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-empty-union-axo1j52n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
```
**⚠️ IMPORTANT:** Replace `YOUR_NEW_PASSWORD` with your NEW Neon password (after resetting)

**For:** All environments

---

### 3. DIRECT_DATABASE_URL
```
Key: DIRECT_DATABASE_URL
Value: postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-empty-union-axo1j52n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
```
**⚠️ IMPORTANT:** Same as DATABASE_URL (use the same NEW password)

**For:** All environments

---

### 4. AUTH_SECRET
```
Key: AUTH_SECRET
Value: 0thKokR/gGIzBPhUm1/890fiouGc2Q0X9v2MscW6ENM=
```
**Note:** This is the secret generated for you. Keep it safe!

**For:** All environments

---

### 5. AUTH_URL (Update after first deploy)
```
Key: AUTH_URL
Value: https://your-vercel-url.vercel.app
```
**First deploy:** Leave blank or use placeholder, then update after you get your Vercel URL

**For:** Production only (you can add different URLs for Preview/Development later)

---

### 6. NEXTAUTH_URL (Update after first deploy)
```
Key: NEXTAUTH_URL
Value: https://your-vercel-url.vercel.app
```
**First deploy:** Leave blank or use placeholder, then update after you get your Vercel URL

**For:** Production only

---

### 7. NEXT_PUBLIC_APP_URL (Update after first deploy)
```
Key: NEXT_PUBLIC_APP_URL
Value: https://your-vercel-url.vercel.app
```
**First deploy:** Leave blank or use placeholder, then update after you get your Vercel URL

**For:** All environments

---

### 8. STORAGE_PROVIDER
```
Key: STORAGE_PROVIDER
Value: local
```
**For:** All environments

---

### 9. NEXT_PUBLIC_APP_NAME
```
Key: NEXT_PUBLIC_APP_NAME
Value: GirviPro
```
**For:** All environments

---

## 🔄 Two-Step Process

### Step 1: Add Initial Variables (Do Now)

Add these **immediately**:
1. ✅ `NODE_ENV` = `production`
2. ✅ `DATABASE_URL` = (with NEW Neon password)
3. ✅ `DIRECT_DATABASE_URL` = (with NEW Neon password)
4. ✅ `AUTH_SECRET` = `0thKokR/gGIzBPhUm1/890fiouGc2Q0X9v2MscW6ENM=`
5. ✅ `STORAGE_PROVIDER` = `local`
6. ✅ `NEXT_PUBLIC_APP_NAME` = `GirviPro`

### Step 2: Update URLs After First Deploy

After Vercel gives you a URL (e.g., `https://girvimanage-abc123.vercel.app`):

1. Go back to **Settings** → **Environment Variables**
2. Add/Update these three:
   - `AUTH_URL` = `https://girvimanage-abc123.vercel.app`
   - `NEXTAUTH_URL` = `https://girvimanage-abc123.vercel.app`
   - `NEXT_PUBLIC_APP_URL` = `https://girvimanage-abc123.vercel.app`
3. Vercel will automatically redeploy

---

## 🗄️ Get Your NEW Neon Password

**⚠️ CRITICAL:** You must reset your Neon password first!

### How to Reset Neon Password:

1. Go to: **https://console.neon.tech**
2. Select your project
3. Go to **Settings** → **Reset Password** (or create new role)
4. Copy the new connection string
5. Use it in `DATABASE_URL` and `DIRECT_DATABASE_URL`

**Your new connection string will look like:**
```
postgresql://neondb_owner:npg_NEW_PASSWORD_HERE@ep-empty-union-axo1j52n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 📋 Quick Copy-Paste Template

Here's a template ready for Vercel. Just replace the placeholders:

```
NODE_ENV=production

DATABASE_URL=postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-empty-union-axo1j52n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require

DIRECT_DATABASE_URL=postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-empty-union-axo1j52n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require

AUTH_SECRET=0thKokR/gGIzBPhUm1/890fiouGc2Q0X9v2MscW6ENM=

AUTH_URL=https://your-vercel-url.vercel.app

NEXTAUTH_URL=https://your-vercel-url.vercel.app

NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app

STORAGE_PROVIDER=local

NEXT_PUBLIC_APP_NAME=GirviPro
```

---

## ✅ After Adding Variables

1. **Save** each variable
2. Vercel will automatically **redeploy**
3. Wait 2-3 minutes for build
4. Check **Deployments** tab for status
5. Once "Ready", click on the URL to test

---

## 🧪 Testing Your Deployment

Once deployed, test these:

1. **Homepage loads**: Visit your Vercel URL
2. **Login page works**: Go to `/login`
3. **Registration works**: Create a test account
4. **Database connection**: If registration succeeds, database is connected!
5. **Dashboard loads**: Login and access dashboard

---

## 🚨 Troubleshooting

### Build Fails
- Check **Deployments** → **Build Logs**
- Ensure all environment variables are added
- Verify no typos in variable names

### Auth Errors
- Ensure `AUTH_SECRET` is set correctly
- Verify `AUTH_URL` matches your actual Vercel domain
- Check `DATABASE_URL` is correct

### Database Connection Errors
- Verify Neon password is correct
- Ensure connection string includes `?sslmode=require`
- Check Neon database is active (not suspended)

### 500 Errors
- Check **Function Logs** in Vercel dashboard
- Verify all required environment variables are set
- Ensure database schema is up to date (Prisma migrations)

---

## 📊 Environment Scopes

When adding variables in Vercel, you'll see three checkboxes:

- **Production**: Your main public site
- **Preview**: Deployed from pull requests
- **Development**: Local development (not needed)

**Recommendation:** Check **all three** for now to keep it simple.

---

## 🎯 Next Steps

1. ✅ Reset Neon password
2. ✅ Add environment variables to Vercel
3. ✅ Wait for automatic redeploy
4. ✅ Get your Vercel URL
5. ✅ Update the three AUTH URLs
6. ✅ Test your app!

Your app should be live within 5 minutes! 🚀
