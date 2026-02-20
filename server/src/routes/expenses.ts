import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all expenses
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { jobId, category } = req.query;
    const where: any = {};
    
    if (jobId) where.jobId = jobId;
    if (category) where.category = category;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        job: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single expense
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          include: {
            customer: true
          }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create expense
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { jobId, category, description, amount, date, receipt, notes } = req.body;

    const expense = await prisma.expense.create({
      data: {
        jobId: jobId || null,
        category,
        description,
        amount,
        date: date ? new Date(date) : new Date(),
        receipt,
        notes
      },
      include: {
        job: {
          include: {
            customer: true
          }
        }
      }
    });

    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { jobId, category, description, amount, date, receipt, notes } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        jobId: jobId || undefined,
        category,
        description,
        amount,
        date: date ? new Date(date) : undefined,
        receipt,
        notes
      },
      include: {
        job: {
          include: {
            customer: true
          }
        }
      }
    });

    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
