# Universal Girvi Management System (GirviPro) — Phase 1

GirviPro is a multi-tenant, commercial-grade Girvi / Pawn / Gold Loan Management System built as a modern, responsive web application. It supports tenant isolation, granular RBAC (role-based access control), secure session authentication, and physical asset vault tracking.

---

## Technical Stack

* **Frontend/Backend APIs**: Next.js 16 (App Router, Turbopack, TypeScript, Tailwind CSS v4)
* **Authentication**: NextAuth.js v5 (Auth.js) credentials flow with Argon2id password hashing
* **Database**: PostgreSQL on Neon with Prisma 7 ORM and Neon serverless driver adapter
* **State Management**: Zustand (client state) & TanStack Query (server state cache)
* **Testing**: Vitest & React Testing Library (unit/integration)

---

## Project Structure

* `/app`: Pages and API route handlers.
  * `/app/api/v1/onboarding`: Atomic wizard endpoint to onboard new businesses and create owners.
  * `/app/api/v1/business`: Fetch/update tenant business profile settings.
  * `/app/api/v1/users`: List users in the tenant business.
  * `/app/api/v1/me`: Retrieve currently logged-in user profile.
* `/components/layout`: Dashboard shell, sidebar, and headers.
* `/lib/api/tenant.ts`: Tenant isolation check (`assertTenantAccess()`) that validates user sessions against requested resources.
* `/lib/api/middleware.ts`: Composable authentication (`withAuth`) and authorization (`withPermission`) route wrappers.
* `/types/next-auth.d.ts`: Global next-auth and JWT type declarations.

---

## Local Setup

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the connection strings in `.env`:
* **DATABASE_URL**: Neon connection string (pooled link).
* **DIRECT_DATABASE_URL**: Neon direct connection string (unpooled link for migrations).
* **AUTH_SECRET**: Secret used to encrypt JWT session cookies (`openssl rand -base64 32`).

### 3. Run Database Migrations
Create and run the database tables:
```bash
npx prisma db push
```
Or apply migrations:
```bash
npx prisma migrate dev
```

### 4. Seed Development Data
Prepopulate the database with a test business, users, roles, and permissions:
```bash
npm run db:seed
```
* **Demo Owner Login**: `owner@demo.com` / `DemoOwner@123`
* **Demo Viewer Login**: `viewer@demo.com` / `DemoViewer@123`

---

## Executing Commands

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the onboarding wizard and login page.

### Running Lint Checks
```bash
npm run lint
```

### Running TypeScript Compilations
```bash
npm run type-check
```

### Running Unit & Integration Tests
```bash
npm run test
```

### Build for Production
```bash
npm run build
```
Creates an optimized output bundle ready to deploy on Vercel or Render.
