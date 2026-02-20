# Deploy to Vercel - Simple Guide

## Step 1: Deploy Frontend to Vercel

### Via Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Add New Project**
4. **Import Git Repository**: Select `recoe17/maxvolt`
5. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `client` ⚠️ Important!
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
   - **Install Command**: `npm install` (auto)
6. **Environment Variables** (Click "Environment Variables" and add):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (from Clerk dashboard)
   CLERK_SECRET_KEY=sk_live_... (from Clerk dashboard)
   NEXT_PUBLIC_API_URL=http://localhost:5000/api (for now, update later)
   ```
7. **Deploy**!

### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from project root
cd /Users/reconcilemakamure/maxvolt
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing? No
# - Project name: maxvolt
# - Directory: ./client ⚠️ Important!
# - Override settings? No

# Add environment variables in Vercel dashboard, then:
vercel --prod
```

## Step 2: Update Clerk Settings

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to **Settings** → **Domains**
4. Add your Vercel domain (e.g., `maxvolt.vercel.app` or your custom domain)
5. Update **Redirect URLs**:
   - `https://your-app.vercel.app/dashboard`
   - `https://your-app.vercel.app/sign-in`
   - `https://your-app.vercel.app/sign-up`

## Step 3: Backend Options

Since you didn't use Railway, you have options:

### Option A: Deploy Backend Later (Recommended)

For now, deploy just the frontend. The frontend will work, but API calls will fail until you deploy the backend.

**Later, deploy backend to:**
- Railway (https://railway.app) - Easy, free tier
- Render (https://render.com) - Easy, free tier
- Or any Node.js hosting

Then update `NEXT_PUBLIC_API_URL` in Vercel to your backend URL.

### Option B: Run Backend Locally (For Testing)

Keep backend running locally for testing:
```bash
cd server
npm run dev
```

Update Vercel env var:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

(Note: This only works if you're testing locally)

## Environment Variables Checklist

### Required for Vercel:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `NEXT_PUBLIC_API_URL` (your backend URL when deployed)

## After Deployment

1. Visit your Vercel URL (e.g., `https://maxvolt.vercel.app`)
2. Test sign-in/sign-up
3. Frontend should work!

## Next: Deploy Backend

When ready to deploy backend:
1. Use Railway or Render (both free)
2. Get backend URL
3. Update `NEXT_PUBLIC_API_URL` in Vercel
4. Redeploy frontend

## Quick Deploy

```bash
cd /Users/reconcilemakamure/maxvolt
vercel --cwd client
```

Your frontend will be live! 🚀
