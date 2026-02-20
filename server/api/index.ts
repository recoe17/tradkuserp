// Vercel serverless function wrapper for Express API
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from '../src/routes/auth';
import customerRoutes from '../src/routes/customers';
import jobRoutes from '../src/routes/jobs';
import quotationRoutes from '../src/routes/quotations';
import invoiceRoutes from '../src/routes/invoices';
import paymentRoutes from '../src/routes/payments';
import expenseRoutes from '../src/routes/expenses';
import financialRoutes from '../src/routes/financials';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MaxVolt API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/financials', financialRoutes);

// Export for Vercel
export default app;
