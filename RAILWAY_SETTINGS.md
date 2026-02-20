# Railway Deployment Settings

## ✅ Build Fix Applied

I've fixed the build error and pushed to GitHub. Railway should now build successfully.

## Railway Configuration

### Settings:

**Root Directory:** `server`

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### Alternative Build Commands (if needed):

**Option 1: Include dev dependencies**
```bash
npm ci --include=dev && npm run build
```

**Option 2: Explicit TypeScript**
```bash
npm install && npx prisma generate && npx tsc
```

## Environment Variables

Add these in Railway → Variables:

```
DATABASE_URL=postgresql://... (your Neon connection string)
CLERK_SECRET_KEY=sk_live_... (from Clerk dashboard)
JWT_SECRET=your-random-secret-key
PORT=5000
NODE_ENV=production
COMPANY_NAME=MaxVolt Electrical
COMPANY_ADDRESS=123 Main Street, City, Country
COMPANY_PHONE=+1234567890
COMPANY_EMAIL=info@maxvolt.com
```

## After Deployment

Railway will give you a URL like: `https://your-app.railway.app`

Use this URL in your Vercel frontend environment variable:
```
NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
```

## Using Dockerfile (Optional)

If you want to use the Dockerfile I created:
1. Railway → Settings → Deploy
2. Enable "Use Dockerfile"
3. It will automatically detect `server/Dockerfile`

## Redeploy

After updating settings, Railway should automatically redeploy. Or manually trigger:
- Railway Dashboard → Deployments → Redeploy

The build should now work! 🚀
