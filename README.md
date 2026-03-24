# Tradkuserp - Electrical Company Management System

A comprehensive management system for electrical companies to manage jobs, quotations, invoices, customers, and finances.

## Features

- ✅ **Job Management** - Track jobs with status, priority, and service types (solar, electrical, plumbing)
- ✅ **Customer Management** - Manage customer information and contact details
- ✅ **Quotations** - Create, manage, and send quotations via email and WhatsApp
- ✅ **Invoices** - Generate invoices, track payments, and manage outstanding balances
- ✅ **Financial Overview** - Dashboard with revenue, expenses, profit, and outstanding amounts
- ✅ **PDF Generation** - Automatic PDF generation for quotations and invoices
- ✅ **Email Integration** - Send quotations and invoices via email
- ✅ **WhatsApp Integration** - Send quotations via WhatsApp
- ✅ **Auto-numbering** - Automatic quotation and invoice number generation

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication
- PDFKit for PDF generation
- Nodemailer for email
- Twilio for WhatsApp

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (we recommend [Neon](https://neon.tech) - free serverless PostgreSQL)
- npm or yarn

### Installation

1. **Clone and install dependencies:**

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

2. **Set up the database:**

**Option A: Using Neon (Recommended - Free Serverless PostgreSQL)**
- Sign up at https://neon.tech
- Create a new project
- Copy your connection string from the dashboard
- See `NEON_SETUP.md` for detailed instructions

**Option B: Local PostgreSQL**
- Install PostgreSQL locally
- Create database: `CREATE DATABASE maxvolt;`
- Use connection string: `postgresql://user:password@localhost:5432/maxvolt?schema=public`

**Then run migrations:**
```bash
cd server

# Create .env file with your DATABASE_URL
# DATABASE_URL="your-neon-connection-string-here"

# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

3. **Configure environment variables:**

Edit `server/.env` with your configuration:
- Database URL
- JWT secret
- Email settings (Gmail or other SMTP)
- Twilio credentials for WhatsApp
- Company information

4. **Set up client environment:**

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
App runs on http://localhost:3000

Or use the root script to run both:
```bash
npm run dev
```

## Usage

1. **Register/Login**: Create an account or login at http://localhost:3000/login
2. **Add Customers**: Navigate to Customers and add your customers
3. **Create Jobs**: Create jobs for different service types
4. **Generate Quotations**: Create quotations for jobs and send via email/WhatsApp
5. **Create Invoices**: Convert quotations to invoices or create new invoices
6. **Track Payments**: Record payments against invoices
7. **View Finances**: Check financial overview and reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Quotations
- `GET /api/quotations` - List all quotations
- `GET /api/quotations/:id` - Get quotation details
- `GET /api/quotations/:id/pdf` - Download quotation PDF
- `POST /api/quotations` - Create quotation
- `PUT /api/quotations/:id` - Update quotation
- `POST /api/quotations/:id/send-email` - Send quotation via email
- `POST /api/quotations/:id/send-whatsapp` - Send quotation via WhatsApp
- `DELETE /api/quotations/:id` - Delete quotation

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/from-quotation/:quotationId` - Create invoice from quotation
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Record payment
- `DELETE /api/payments/:id` - Delete payment

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Financials
- `GET /api/financials/summary` - Get financial summary
- `GET /api/financials/records` - Get financial records

## Database Schema

The system uses Prisma with the following main models:
- User (authentication)
- Customer
- Job
- Quotation
- Invoice
- Payment
- Expense
- FinancialRecord

## Development

### Database Migrations

```bash
cd server
npm run prisma:migrate
```

### Prisma Studio (Database GUI)

```bash
cd server
npm run prisma:studio
```

### Build for Production

```bash
# Build server
cd server
npm run build

# Build client
cd client
npm run build
```

## License

MIT
