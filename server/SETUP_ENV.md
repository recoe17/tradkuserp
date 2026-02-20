# Setting Up Your .env File

Your `.env` file needs to have the correct Neon database connection string.

## Quick Fix

Open `server/.env` and make sure the first line is:

```env
DATABASE_URL="postgresql://neondb_owner:npg_H91ZDGEgRTjI@ep-late-bonus-aiqgb2nt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## Complete .env Template

Here's a complete `.env` file you can use:

```env
DATABASE_URL="postgresql://neondb_owner:npg_H91ZDGEgRTjI@ep-late-bonus-aiqgb2nt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

JWT_SECRET="change-this-to-a-random-secret-key-in-production"
JWT_EXPIRES_IN="7d"

PORT=5000
NODE_ENV="development"

COMPANY_NAME="MaxVolt Electrical"
COMPANY_ADDRESS="123 Main Street, City, Country"
COMPANY_PHONE="+1234567890"
COMPANY_EMAIL="info@maxvolt.com"
```

## After Updating .env

Run the migration again:

```bash
cd server
npm run prisma:migrate -- --name init
```

This should now connect to your Neon database and create all the tables.
