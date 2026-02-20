import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get financial summary
router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    // Get all invoices (income)
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(startDate || endDate ? {
          issueDate: {
            ...(startDate ? { gte: new Date(startDate as string) } : {}),
            ...(endDate ? { lte: new Date(endDate as string) } : {})
          }
        } : {})
      }
    });

    // Get all expenses
    const expenses = await prisma.expense.findMany({
      where
    });

    // Get all payments
    const payments = await prisma.payment.findMany({
      where: {
        ...(startDate || endDate ? {
          paidAt: {
            ...(startDate ? { gte: new Date(startDate as string) } : {}),
            ...(endDate ? { lte: new Date(endDate as string) } : {})
          }
        } : {})
      }
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const outstanding = invoices.reduce((sum, inv) => sum + Number(inv.balance), 0);
    const profit = totalPaid - totalExpenses;

    res.json({
      totalRevenue,
      totalPaid,
      totalExpenses,
      outstanding,
      profit,
      invoiceCount: invoices.length,
      expenseCount: expenses.length,
      paymentCount: payments.length
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get financial records
router.get('/records', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const where: any = {};
    
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const records = await prisma.financialRecord.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create financial record
router.post('/records', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, category, description, amount, date, reference, notes } = req.body;

    const record = await prisma.financialRecord.create({
      data: {
        type,
        category,
        description,
        amount,
        date: date ? new Date(date) : new Date(),
        reference,
        notes
      }
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
