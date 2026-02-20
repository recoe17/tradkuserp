# Fix Build Error: tsc command not found

## Problem
TypeScript compiler (`tsc`) is not found during build. This happens because TypeScript might not be installed or not in the right place.

## Solution Applied

✅ Updated `server/package.json`:
- Added `postinstall` script to generate Prisma client
- Updated build script to ensure Prisma is generated first

## For Railway Deployment

### Option 1: Use the Updated package.json (Recommended)

The build command should now work:
```bash
npm install && npm run build
```

### Option 2: Manual Build Command

If still having issues, use this build command in Railway:
```bash
npm ci && npx prisma generate && npm run build
```

### Option 3: Use Dockerfile

I've created a `Dockerfile` in the server folder. Railway can use this:
1. In Railway settings, enable Docker
2. It will use the Dockerfile automatically

## Verify Build Locally

Test the build locally first:
```bash
cd server
npm install
npm run build
```

If this works locally, it should work on Railway.

## Railway Settings

Make sure Railway settings are:
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build` (or use Dockerfile)
- **Start Command**: `npm start`

## Environment Variables

Don't forget to add these in Railway:
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `JWT_SECRET`
- `PORT=5000`
- `NODE_ENV=production`

## Alternative: Use tsx Instead

If TypeScript keeps causing issues, we can modify to use `tsx` directly without building. Let me know if you want this option.
