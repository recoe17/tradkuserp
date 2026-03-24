# Deploy for a Different User (New GitHub + New Clerk)

This guide walks you through deploying this clone for a new user with their own GitHub repo and Clerk application.

---

## 1. Point to Your GitHub Repository

### Create a new repo on GitHub
1. Go to https://github.com/new
2. Create a new repository (e.g. `tradkus` or your preferred name)
3. **Don't** initialize with README (you already have code)

### Update git remote

```powershell
cd c:\Users\Mufaro\Documents\tradkus

# Replace YOUR_USERNAME and YOUR_REPO with your GitHub username and repo name
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Verify
git remote -v
```

Example: `git remote set-url origin https://github.com/Mufaro/tradkus.git`

---

## 2. Set Up a New Clerk Application

The current project uses Clerk for auth. You need your own Clerk app.

### Create a Clerk app
1. Go to https://clerk.com and sign in (or create an account)
2. Click **Create application**
3. Choose your sign-in options (Email, Google, etc.)
4. After creation, go to **API Keys** in the sidebar
5. Copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### Configure Clerk allowed origins (after deployment)
- In Clerk dashboard → **Configure** → **Paths** / **Domains**
- Add your production URLs (e.g. `https://your-app.vercel.app`, `http://localhost:3000`)

---

## 3. Environment Variables

### Client (`client/.env.local`)

Create `client/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_FROM_CLERK
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_FROM_CLERK

NEXT_PUBLIC_API_URL=http://localhost:5000/api

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Replace the Clerk keys with your new app’s keys.

### Server (`server/.env`)

Copy from template and fill in:

```bash
cp server/env-template.txt server/.env
```

Edit `server/.env` and set:

- `DATABASE_URL` – new Neon DB for this user (see step 4)
- `JWT_SECRET` – new strong random string
- `CLERK_SECRET_KEY` – same secret from your new Clerk app
- `COMPANY_NAME`, `COMPANY_ADDRESS`, `COMPANY_EMAIL`, `COMPANY_PHONE` – new user’s company details

---

## 4. Update Company Branding

Edit **`client/src/lib/company.ts`** and replace:

- `name`, `address`, `tin`, `website`, `email`, `phone`, `phoneAlt`
- `banks` (account name, numbers, branch)
- `services`

---

## 5. Database (Neon)

If this is a separate deployment, use a new database:

1. Go to https://console.neon.tech
2. Create a new project
3. Copy the connection string
4. Put it in `server/.env` as `DATABASE_URL`
5. Run migrations:

```powershell
cd server
npx prisma migrate deploy
```

---

## 6. Deploy to Production

### Backend (e.g. Railway)
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Connect **your** GitHub repo
3. Select `server` as root directory
4. Add env vars: `DATABASE_URL`, `CLERK_SECRET_KEY`, `JWT_SECRET`, `PORT`, company variables
5. Deploy and copy the backend URL (e.g. `https://your-app.railway.app`)

### Frontend (Vercel)
1. Go to https://vercel.com → New Project → Import from GitHub
2. Select **your** repo
3. **Root Directory**: `client`
4. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` → `https://your-backend.railway.app/api`
5. Deploy

---

## 7. Push Your Code

```powershell
git add .
git commit -m "Configure for new deployment"
git push -u origin main
```

(Use `master` instead of `main` if that’s your default branch.)

---

## Quick Checklist

| Item | Action |
|------|--------|
| GitHub | Create repo, update `git remote set-url origin ...` |
| Clerk | Create app, copy publishable + secret keys |
| `client/.env.local` | New Clerk keys, correct API URL |
| `server/.env` | New `DATABASE_URL`, `CLERK_SECRET_KEY`, `JWT_SECRET`, company info |
| `client/src/lib/company.ts` | New company details |
| Neon | New DB or reuse existing (ensure isolated per user) |
| Railway | Deploy backend with env vars |
| Vercel | Deploy client with env vars |

---

## Important Notes

- **Never commit** `.env` or `.env.local` (they are in `.gitignore`)
- Use **production** Clerk keys (`pk_live_`, `sk_live_`) when deploying
- Add your production domains in the Clerk dashboard
- Each deployment should have its own database when data must be separate
