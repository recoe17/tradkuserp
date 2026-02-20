# Database Setup Guide

> **Note:** We recommend using [Neon](https://neon.tech) for a free serverless PostgreSQL database. See `NEON_SETUP.md` for Neon setup instructions.

## Step 1: Install PostgreSQL (Local Setup)

If you don't have PostgreSQL installed:

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Or download from:** https://www.postgresql.org/download/

## Step 2: Create Database

Open PostgreSQL (using `psql` or any PostgreSQL client):

```bash
# Connect to PostgreSQL
psql postgres

# Or if you have a specific user:
psql -U your_username postgres
```

Then run:
```sql
CREATE DATABASE maxvolt;
\q
```

## Step 3: Configure Database Connection

Create `server/.env` file:

```bash
cd server
touch .env
```

Add your database connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/maxvolt?schema=public"
```

**Replace:**
- `username` - Your PostgreSQL username (usually your macOS username)
- `password` - Your PostgreSQL password (if you set one, or leave empty if no password)
- `localhost:5432` - Default PostgreSQL connection (change if different)

**Example (no password):**
```env
DATABASE_URL="postgresql://reconcilemakamure@localhost:5432/maxvolt?schema=public"
```

**Example (with password):**
```env
DATABASE_URL="postgresql://reconcilemakamure:mypassword@localhost:5432/maxvolt?schema=public"
```

## Step 4: Run Database Migrations

```bash
cd server

# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
```

When prompted, name your migration (e.g., "init").

## Step 5: Verify Setup

You can use Prisma Studio to view your database:

```bash
cd server
npm run prisma:studio
```

This opens a web interface at http://localhost:5555 where you can view and edit your database.

## Troubleshooting

### "Connection refused" error:
- Make sure PostgreSQL is running: `brew services list` (should show postgresql@15 as started)
- Check if PostgreSQL is on port 5432: `lsof -i :5432`

### "Database does not exist" error:
- Make sure you created the database: `CREATE DATABASE maxvolt;`

### "Password authentication failed":
- Check your username and password in the DATABASE_URL
- If you don't have a password, use: `postgresql://username@localhost:5432/maxvolt?schema=public`

### Find your PostgreSQL username:
```bash
whoami
# Use this as your username in DATABASE_URL
```
