# Deploy Full Stack to Vercel

## Overview

Deploy both frontend and backend to Vercel using serverless functions.

## Step 1: Update Client API URL

Since everything is on Vercel, update `client/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_URL=/api
```

The API will be at the same domain, so use `/api` as the base URL.

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Add New Project**
4. **Import Git Repository**: Select `recoe17/maxvolt`
5. **Configure Project**:
   - Framework Preset: **Other** (or **Next.js**)
   - Root Directory: Leave empty (root)
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/.next`
   - Install Command: `cd client && npm install`
6. **Environment Variables** (Add these):
   ```
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   
   # Database
   DATABASE_URL=your-neon-connection-string
   
   # JWT
   JWT_SECRET=your-random-secret-key
   
   # Server
   PORT=3000
   NODE_ENV=production
   
   # Company Info
   COMPANY_NAME=MaxVolt Electrical
   COMPANY_ADDRESS=123 Main Street, City, Country
   COMPANY_PHONE=+1234567890
   COMPANY_EMAIL=info@maxvolt.com
   ```
7. **Deploy**!

### Option B: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/reconcilemakamure/maxvolt
vercel

# Follow prompts, add env vars in dashboard, then:
vercel --prod
```

## Step 3: Update Client API Configuration

Update `client/src/lib/api.ts` to use relative URLs:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

## Step 4: Update Clerk Settings

1. Go to Clerk Dashboard
2. Add your Vercel domain
3. Update redirect URLs

## File Structure for Vercel

```
maxvolt/
├── api/
│   └── index.ts          # Express API (serverless function)
├── client/               # Next.js frontend
│   └── ...
├── server/               # (not used in Vercel deployment)
└── vercel.json          # Vercel configuration
```

## Important Notes

⚠️ **Prisma**: Make sure Prisma client is generated. Add to build:
```bash
cd server && npx prisma generate && cd ../client && npm run build
```

⚠️ **API Routes**: All `/api/*` requests go to `api/index.ts`

⚠️ **Environment Variables**: Set all in Vercel dashboard

## Troubleshooting

- **API not found**: Check `vercel.json` routes configuration
- **Prisma errors**: Make sure `DATABASE_URL` is set
- **Clerk errors**: Verify Clerk keys are correct

## Alternative: Separate API Deployment

If serverless functions don't work well, you can:
1. Deploy frontend to Vercel
2. Deploy backend to Railway/Render (separate)
3. Update `NEXT_PUBLIC_API_URL` to backend URL

Let me know which approach you prefer!
