# PRODUCTION DEPLOYMENT GUIDE
## Universal Jewellery & Girvi Management System

This guide walks you through publishing the platform to production using:
- **Supabase**: PostgreSQL Database
- **Render**: FastAPI Python Backend API
- **Vercel**: Next.js 16 Frontend Web Application

---

## Phase 1: Database Setup on Supabase

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project** and enter:
   - **Name**: `universal-jewellery-db`
   - **Database Password**: Set a secure password (save this password!).
   - **Region**: Choose the region closest to your customers (e.g. *Singapore* or *Mumbai*).
3. Once the database is created, go to **Project Settings** -> **Database**.
4. Scroll down to **Connection String** and copy the **URI** connection string:
   ```text
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
   *(Replace `[YOUR-PASSWORD]` with your database password).*

---

## Phase 2: Deploy Backend on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) and sign in.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository:
   `https://github.com/pavanjewellersmylanahalli/universal.git`
4. Configure the Web Service settings:
   - **Name**: `universal-jewellery-api`
   - **Language**: `Python 3`
   - **Branch**: `main`
   - **Root Directory**: `(Leave empty)`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Scroll down to **Environment Variables** and add:
   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | Your Supabase connection string from Phase 1 |
   | `SECRET_KEY` | `SUPER_SECRET_PRODUCTION_KEY_12345` (or click Generate) |
6. Click **Create Web Service**.
7. Once deployed, Render will provide your Backend URL (e.g. `https://universal-jewellery-api.onrender.com`).
8. **Seed Initial Data**: Go to your Render service **Shell** tab and run:
   ```bash
   cd backend && python scripts/seed.py
   ```

---

## Phase 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository:
   `https://github.com/pavanjewellersmylanahalli/universal.git`
4. Configure Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
5. Expand **Environment Variables** and add:
   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_BACKEND_URL` | Your Render Backend URL (e.g., `https://universal-jewellery-api.onrender.com`) |
6. Click **Deploy**.

---

## Verification & Final Check

- **Backend Health Check**: Visit `https://universal-jewellery-api.onrender.com/health` (should return `{"status":"ok","version":"1.0.0"}`).
- **Frontend App**: Visit your Vercel URL (e.g. `https://universal-jewellery.vercel.app/login`).
- Login with pre-seeded demo accounts or register a new business organization!
