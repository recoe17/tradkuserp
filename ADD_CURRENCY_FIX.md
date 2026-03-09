# Fix: Quotation.currency column does not exist

Your production database is missing the `currency` column. You have two options:

## Option 1: Run migration on deploy (automatic)

The build now runs `prisma migrate deploy` which will apply the migration. **Make sure `DATABASE_URL` is set in your Vercel environment variables**, then redeploy.

## Option 2: Run SQL manually (immediate fix)

If you have access to your production database (Neon, Supabase, etc.), run this SQL directly:

```sql
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
```

Then redeploy (or the next deploy will work).
