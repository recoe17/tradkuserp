# Fix Railway Build Error

## Problem
`tsc: command not found` - TypeScript compiler not available during build.

## Solutions

### Solution 1: Use npx (Recommended - Already Applied)

✅ Updated build script to use `npx tsc` instead of `tsc`

This uses npx to find and run TypeScript from node_modules.

### Solution 2: Railway Build Command

In Railway, use this build command:

```bash
npm ci && npm run prisma:generate && npx tsc
```

Or simply:
```bash
npm install && npm run build
```

### Solution 3: Use Dockerfile

I've created a `Dockerfile` in the server folder. Railway can use this:

1. In Railway project settings
2. Go to "Settings" → "Deploy"
3. Enable "Use Dockerfile"
4. It will automatically use `server/Dockerfile`

### Solution 4: Install All Dependencies

Make sure Railway installs devDependencies. In Railway settings:

**Build Command:**
```bash
npm ci --include=dev && npm run build
```

## Railway Settings Summary

**Root Directory:** `server`

**Build Command (Option 1):**
```bash
npm install && npm run build
```

**Build Command (Option 2):**
```bash
npm ci --include=dev && npx prisma generate && npx tsc
```

**Start Command:**
```bash
npm start
```

## Verify Locally First

Test the build locally:
```bash
cd server
npm install
npm run build
```

If this works, Railway should work too.

## Environment Variables

Don't forget these in Railway:
- `DATABASE_URL` (Neon connection string)
- `CLERK_SECRET_KEY`
- `JWT_SECRET`
- `PORT=5000`
- `NODE_ENV=production`

## Alternative: Run Without Build

If building keeps failing, we can modify to run TypeScript directly with `tsx`. Let me know if you want this option.
