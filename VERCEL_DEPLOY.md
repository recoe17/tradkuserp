# Deploy MaxVolt to Vercel

## Overview

Your MaxVolt app has:
- **Frontend**: Next.js (deploys to Vercel)
- **Backend**: Express API (needs separate hosting or Vercel serverless functions)

## Option 1: Deploy Frontend to Vercel + Backend to Railway/Render (Recommended)

### Step 1: Deploy Backend First

**Option A: Railway (Recommended)**
1. Go to https://railway.app
2. Sign up/login
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `maxvolt` repository
5. Select the `server` folder
6. Add environment variables:
   - `DATABASE_URL` (your Neon connection string)
   - `CLERK_SECRET_KEY`
   - `JWT_SECRET`
   - `PORT=5000`
   - Company info variables
7. Deploy!

**Option B: Render**
1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Root directory: `server`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add environment variables (same as above)

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI** (if not installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy from project root**:
```bash
cd /Users/reconcilemakamure/maxvolt
vercel
```

4. **Follow prompts**:
   - Set up and deploy? **Yes**
   - Which scope? (your account)
   - Link to existing project? **No**
   - Project name: `maxvolt` (or your choice)
   - Directory: `./client`
   - Override settings? **No**

5. **Add Environment Variables in Vercel Dashboard**:
   - Go to your project settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from your Clerk dashboard)
     - `CLERK_SECRET_KEY` (from your Clerk dashboard)
     - `NEXT_PUBLIC_API_URL` (your backend URL, e.g., `https://your-backend.railway.app/api`)

6. **Redeploy** after adding env vars:
```bash
vercel --prod
```

## Option 2: Full Stack on Vercel (Serverless Functions)

This requires converting your Express backend to Vercel serverless functions. More complex but everything in one place.

## Environment Variables Checklist

### Frontend (Vercel)
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `NEXT_PUBLIC_API_URL` (your backend URL)

### Backend (Railway/Render)
- ✅ `DATABASE_URL` (Neon connection string)
- ✅ `CLERK_SECRET_KEY`
- ✅ `JWT_SECRET`
- ✅ `PORT=5000`
- ✅ `NODE_ENV=production`
- ✅ Company info variables

## After Deployment

1. Update your Clerk app settings:
   - Add production URLs to allowed origins
   - Update redirect URLs

2. Test your live app!

## Quick Deploy Commands

```bash
# Deploy to Vercel
cd /Users/reconcilemakamure/maxvolt
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

- **API calls failing**: Check `NEXT_PUBLIC_API_URL` is correct
- **Clerk errors**: Verify Clerk keys are set correctly
- **Database errors**: Check Neon connection string
- **Build errors**: Check Node.js version (Vercel uses 18.x by default)
