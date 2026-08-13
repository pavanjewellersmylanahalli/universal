# Setup Production Database

## Problem
Your Neon database is connected but has no tables. Error:
```
relation "public.User" does not exist
```

## Solution: Push Schema to Production Database

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link your project**
   ```bash
   vercel link
   ```

4. **Pull environment variables**
   ```bash
   vercel env pull .env.production
   ```

5. **Push database schema**
   ```bash
   npx prisma db push --skip-generate
   ```

### Option 2: Update Local .env and Push (Easier)

1. **Edit your `.env` file** and replace with your actual Neon connection string:
   
   ```env
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-empty-union-axo1j52n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
   DIRECT_DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-empty-union-axo1j52n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

2. **Push schema to database**
   ```bash
   npx prisma db push
   ```

3. **Seed initial data** (optional, for demo users)
   ```bash
   npm run db:seed
   ```

### Option 3: Using Neon's Query Editor (Manual)

This is not recommended as it's very manual, but if the above don't work:

1. Go to https://console.neon.tech
2. Select your project
3. Go to **SQL Editor**
4. Run the schema SQL (you'd need to export it first)

## After Schema is Created

Test your app:
1. Go to https://girvimanage.vercel.app/register
2. Try creating a business
3. Should work now! ✅

## Verify Tables Exist

After pushing, verify in Neon:
1. Go to https://console.neon.tech
2. Click on your project
3. Go to **Tables** or **SQL Editor**
4. Run: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
5. You should see tables like: User, Business, Role, Permission, etc.

## Expected Tables

After successful push, you should have these tables:
- User
- Business
- Role
- Permission
- RolePermission
- UserRole
- Customer
- Girvi
- GirviItem
- Payment
- BankPledge
- VaultItem
- AuditLog
- Notification

## Troubleshooting

### Error: "P2021: Table does not exist"
- Schema not pushed yet - follow Option 2 above

### Error: "Can't reach database server"
- Check DATABASE_URL is correct
- Ensure Neon database is active (not paused)

### Error: "SSL connection required"
- Ensure `?sslmode=require` is at the end of DATABASE_URL
