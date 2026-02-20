# Quick Vercel Deployment Guide

## Prerequisites

1. ✅ Your code is on GitHub: https://github.com/recoe17/maxvolt
2. ✅ Vercel account (sign up at https://vercel.com)

## Step 1: Deploy Backend (Railway - Recommended)

### Why Railway?
- Easy PostgreSQL/Neon integration
- Automatic deployments from GitHub
- Free tier available

### Setup:

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `recoe17/maxvolt`
5. **Settings**:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. **Environment Variables** (Add these):
   ```
   DATABASE_URL=your-neon-connection-string
   CLERK_SECRET_KEY=your-clerk-secret-key
   JWT_SECRET=your-jwt-secret
   PORT=5000
   NODE_ENV=production
   COMPANY_NAME=MaxVolt Electrical
   COMPANY_ADDRESS=123 Main Street, City, Country
   COMPANY_PHONE=+1234567890
   COMPANY_EMAIL=info@maxvolt.com
   ```
7. **Deploy** - Railway will give you a URL like: `https://your-app.railway.app`

## Step 2: Deploy Frontend to Vercel

### Method A: Via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Add New Project**
4. **Import Git Repository**: Select `recoe17/maxvolt`
5. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `client`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
6. **Environment Variables** (Add these):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (from Clerk dashboard)
   CLERK_SECRET_KEY=sk_live_... (from Clerk dashboard)
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
7. **Deploy**!

### Method B: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/reconcilemakamure/maxvolt
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing? No
# - Project name: maxvolt
# - Directory: ./client
# - Override settings? No

# Add environment variables in Vercel dashboard, then:
vercel --prod
```

## Step 3: Update Clerk Settings

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to **Settings** → **Domains**
4. Add your Vercel domain (e.g., `maxvolt.vercel.app`)
5. Update **Redirect URLs**:
   - Add: `https://your-app.vercel.app/dashboard`
   - Add: `https://your-app.vercel.app/sign-in`
   - Add: `https://your-app.vercel.app/sign-up`

## Step 4: Test Your Live App

1. Visit your Vercel URL (e.g., `https://maxvolt.vercel.app`)
2. Test sign-in/sign-up
3. Test API calls
4. Verify everything works!

## Your URLs

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **Database**: Neon (already configured)

## Environment Variables Summary

### Vercel (Frontend)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### Railway (Backend)
```
DATABASE_URL=postgresql://... (Neon)
CLERK_SECRET_KEY=sk_live_...
JWT_SECRET=...
PORT=5000
NODE_ENV=production
```

## Troubleshooting

- **CORS errors**: Make sure backend CORS allows your Vercel domain
- **API not found**: Check `NEXT_PUBLIC_API_URL` is correct
- **Clerk errors**: Verify Clerk keys and domain settings
- **Database errors**: Check Neon connection string

## Next Steps After Deployment

1. ✅ Set up custom domain (optional)
2. ✅ Enable analytics
3. ✅ Set up monitoring
4. ✅ Configure backups

Your app will be live! 🚀
