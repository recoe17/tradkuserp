# Simple Vercel Deployment

## Quick Deploy Steps

### Step 1: Deploy via Vercel Dashboard

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Add New Project** → **Import** `recoe17/maxvolt`
4. **Settings**:
   - Framework: **Next.js**
   - Root Directory: `client`
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
5. **Environment Variables**:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   DATABASE_URL=your-neon-connection-string
   JWT_SECRET=your-secret-key
   NEXT_PUBLIC_API_URL=/api
   ```
6. **Deploy**!

### Step 2: Update Clerk

Add your Vercel domain to Clerk dashboard.

## For Backend API

Since you want everything on Vercel, you have two options:

### Option A: Use Vercel Serverless Functions (Current Setup)

The `api/index.ts` file I created will handle API routes.
All `/api/*` requests will go through serverless functions.

### Option B: Deploy Backend Separately (Easier)

1. Deploy frontend to Vercel (as above)
2. Deploy backend to Railway/Render separately
3. Set `NEXT_PUBLIC_API_URL` to your backend URL

## Recommended: Frontend Only on Vercel

For now, deploy just the frontend to Vercel:

1. **Root Directory**: `client`
2. **Environment Variables**: 
   - Clerk keys
   - `NEXT_PUBLIC_API_URL` = your backend URL (when you deploy it)

Then deploy backend separately to Railway/Render later.

## Quick Deploy Command

```bash
cd /Users/reconcilemakamure/maxvolt
vercel --cwd client
```

Or use the Vercel dashboard - it's easier!
