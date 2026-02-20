# Neon Database Setup Guide

Neon is a serverless PostgreSQL database that's perfect for development and production. It's free to start and automatically scales.

## Step 1: Create Neon Account

1. Go to https://neon.tech
2. Sign up for a free account (GitHub/Google login available)
3. Create a new project
4. Choose a region close to you
5. Name your project (e.g., "maxvolt")

## Step 2: Get Your Connection String

1. In your Neon dashboard, click on your project
2. Go to the "Connection Details" section
3. You'll see a connection string that looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Copy this connection string

## Step 3: Configure Your Application

### Option A: Quick Setup (Recommended)

1. Create `server/.env` file:
```bash
cd server
touch .env
```

2. Add your Neon connection string:
```env
# Database (Neon)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Company Info
COMPANY_NAME="MaxVolt Electrical"
COMPANY_ADDRESS="123 Main Street, City, Country"
COMPANY_PHONE="+1234567890"
COMPANY_EMAIL="info@maxvolt.com"
```

**Important:** Replace the `DATABASE_URL` with your actual Neon connection string!

### Option B: Using Environment Variables

You can also set the DATABASE_URL as an environment variable:
```bash
export DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Step 4: Run Database Migrations

```bash
cd server

# Generate Prisma client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate
```

When prompted, name your migration (e.g., "init").

## Step 5: Verify Connection

You can verify your connection works by running:

```bash
cd server
npm run prisma:studio
```

This opens Prisma Studio at http://localhost:5555 where you can view your database tables.

## Step 6: Configure Frontend

Make sure `client/.env.local` exists:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Benefits of Neon

✅ **Free tier** - 0.5 GB storage, unlimited projects
✅ **Serverless** - No database server management
✅ **Auto-scaling** - Handles traffic spikes automatically
✅ **Branching** - Create database branches for testing
✅ **Backups** - Automatic point-in-time recovery
✅ **Global** - Choose regions worldwide

## Troubleshooting

### Connection Timeout
- Check your internet connection
- Verify the connection string is correct
- Make sure SSL mode is set: `?sslmode=require`

### Migration Errors
- Ensure your Neon project is active
- Check that the connection string has the correct database name
- Try regenerating Prisma client: `npm run prisma:generate`

### Can't Connect
- Verify your Neon project is not paused (free tier projects pause after inactivity)
- Check Neon dashboard for connection issues
- Ensure your IP is not blocked (Neon allows all IPs by default)

## Next Steps

1. ✅ Database configured on Neon
2. ✅ Migrations run
3. Start backend: `cd server && npm run dev`
4. Start frontend: `cd client && npm run dev`
5. Open http://localhost:3000

## Production Tips

For production:
- Use Neon's connection pooling for better performance
- Set up automatic backups
- Monitor your database usage in Neon dashboard
- Consider upgrading if you need more resources
