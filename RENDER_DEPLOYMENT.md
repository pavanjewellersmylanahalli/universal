# Render Deployment Guide for GirviPro

## Quick Setup

### 1. Fill in Render Form

| Field | Value |
|-------|-------|
| **Source Code** | `poojawelleri1996ii-dev/girvimanage` |
| **Name** | `girvimanage` |
| **Project** | My project (optional) |
| **Language** | `Node` |
| **Branch** | `main` |
| **Region** | `Oregon (US West)` or closest to your users |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | **Free** (for testing) or **Starter** (for production) |

### 2. Environment Variables

After creating the service, add these in Render Dashboard → Environment:

#### Required Variables:

```bash
NODE_ENV=production

# Database (Get from Neon.tech or your PostgreSQL provider)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DIRECT_DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Auth Secret (Generate with: openssl rand -base64 32)
AUTH_SECRET=your-generated-secret-here

# Auth URL (IMPORTANT: Must match your actual Render URL)
AUTH_URL=https://girvimanage.onrender.com
NEXTAUTH_URL=https://girvimanage.onrender.com

# App URL (Update after Render gives you the URL)
NEXT_PUBLIC_APP_URL=https://girvimanage.onrender.com

# Storage
STORAGE_PROVIDER=local

# App Name
NEXT_PUBLIC_APP_NAME=GirviPro
```

### 3. Generate AUTH_SECRET

Run this command locally to generate a secure secret:

```bash
# On Windows with Git Bash
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as your `AUTH_SECRET` value.

### 4. Database Setup (Neon.tech Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. Use it for both `DATABASE_URL` and `DIRECT_DATABASE_URL`

The connection string looks like:
```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 5. Health Check

Render will automatically check `/api/health` to ensure your service is running.

### 6. Deploy

1. Click **Create Web Service**
2. Wait for the build to complete (5-10 minutes first time)
3. Once deployed, copy your app URL
4. Update `NEXT_PUBLIC_APP_URL` environment variable with your actual Render URL
5. Trigger a redeploy (Manual Deploy → Deploy latest commit)

## Post-Deployment

### Access Your App
Your app will be available at: `https://girvimanage.onrender.com`

### First Time Setup
1. Visit your app URL
2. Register the first admin user
3. Complete the business onboarding

### Database Migrations
Migrations run automatically during build via `npx prisma generate`.

If you need to run migrations manually:
1. Go to Render Dashboard → Shell
2. Run: `npx prisma migrate deploy`

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### App Won't Start
- Check `DATABASE_URL` is correct
- Verify `AUTH_SECRET` is set
- Check start command logs for errors

### Database Connection Issues
- Ensure connection string includes `?sslmode=require`
- Verify database is accessible from Render's IP
- Check Neon.tech hasn't suspended your database (free tier)

### 500 Errors
- Check application logs in Render dashboard
- Verify all required environment variables are set
- Ensure database schema is up to date

## Upgrading Instance Type

Free tier limitations:
- Spins down after 15 minutes of inactivity
- 512 MB RAM
- Shared CPU

For production use, upgrade to **Starter** ($7/month):
- Always-on
- 512 MB RAM
- 0.5 CPU
- No spin-down delays

## Alternative: Using render.yaml

You can also deploy using the `render.yaml` file in your repo:

1. In Render Dashboard, click **New** → **Blueprint**
2. Connect your GitHub repo
3. Render will automatically detect `render.yaml`
4. Add environment variables manually in the dashboard
5. Click **Apply**

## Monitoring

- **Logs**: Render Dashboard → Logs tab
- **Metrics**: Render Dashboard → Metrics tab
- **Health**: Automatically monitored via `/api/health`

## Custom Domain (Optional)

1. Go to Render Dashboard → Settings → Custom Domain
2. Add your domain (e.g., `app.girvipro.com`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Cost Estimate

| Tier | Cost | Best For |
|------|------|----------|
| Free | $0/month | Testing, demos |
| Starter | $7/month | Small businesses (recommended) |
| Standard | $25/month | Growing businesses |
| Pro | $85/month | High traffic |

## Security Notes

- Always use HTTPS (Render provides this automatically)
- Keep `AUTH_SECRET` secure and never commit it
- Use strong database passwords
- Enable Render's DDoS protection
- Regularly update dependencies

## Next Steps

After deployment:
1. Test user registration and login
2. Complete business onboarding
3. Test core features (customers, girvi, payments)
4. Set up automatic backups for your database
5. Configure monitoring and alerts
