# Quick Start Guide - MaxVolt

## Step 1: Install Dependencies

Open your terminal in the project root (`/Users/reconcilemakamure/maxvolt`) and run:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 2: Set Up Neon Database (Recommended)

1. **Sign up for Neon** (free): https://neon.tech
2. **Create a new project** in Neon dashboard
3. **Copy your connection string** from Neon dashboard
   - It looks like: `postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`

4. **Create `server/.env` file:**
```bash
cd server
touch .env
```

5. **Add your Neon connection string to `server/.env`:**
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"

COMPANY_NAME="MaxVolt Electrical"
COMPANY_ADDRESS="123 Main Street, City, Country"
COMPANY_PHONE="+1234567890"
COMPANY_EMAIL="info@maxvolt.com"
```

**Important:** Replace `DATABASE_URL` with your actual Neon connection string!

## Step 3: Run Database Migrations

```bash
cd server

# Generate Prisma client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate
```

When prompted, name your migration (e.g., "init").

## Step 4: Configure Frontend

Create `client/.env.local`:
```bash
cd ../client
touch .env.local
```

Add:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 5: Start the Application

You need **TWO terminal windows**:

### Terminal 1 - Backend Server:
```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
```

### Terminal 2 - Frontend Client:
```bash
cd client
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
```

## Step 6: Access the Application

1. **Open your browser** and go to: **http://localhost:3000**

2. **Register a new account:**
   - Click "Don't have an account? Register"
   - Fill in your name, email, and password
   - Click "Register"

3. **You'll be redirected to the Dashboard** where you can:
   - View financial overview
   - Navigate to Customers, Jobs, Quotations, Invoices, and Finances

## Step 7: Start Using the System

### Typical Workflow:

1. **Add Customers:**
   - Go to "Customers" → Click "Add Customer"
   - Fill in customer details and save

2. **Create a Job:**
   - Go to "Jobs" → Click "New Job"
   - Select customer, add job details, choose service type (solar, electrical, plumbing)
   - Save

3. **Create a Quotation:**
   - Go to "Quotations" → Click "New Quotation"
   - Select customer and job
   - Add items (description, quantity, unit price)
   - Set tax/discount if needed
   - Save
   - You can then send it via Email or WhatsApp, or download PDF

4. **Create an Invoice:**
   - Go to "Invoices" → Click "New Invoice"
   - Or convert a quotation to invoice
   - Add items and save
   - Track payments against invoices

5. **View Finances:**
   - Go to "Finances" to see revenue, expenses, profit, and outstanding amounts

## Troubleshooting

### Database Connection Error:
- Make sure your Neon project is active (not paused)
- Check your DATABASE_URL in `server/.env`
- Verify the connection string is correct (should include `?sslmode=require`)
- Try refreshing your connection string in Neon dashboard

### Port Already in Use:
- Backend: Change `PORT` in `server/.env`
- Frontend: Next.js will automatically use the next available port

### API Connection Error:
- Make sure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `client/.env.local`

### Email/WhatsApp Not Working:
- These are optional features
- Configure email/WhatsApp credentials in `server/.env` if you want to use them
- The system works fine without them - you can still download PDFs

## Need Help?

- See `NEON_SETUP.md` for detailed Neon database setup
- Check the main README.md for more details
- Database GUI: Run `cd server && npm run prisma:studio` to view/edit data in browser
