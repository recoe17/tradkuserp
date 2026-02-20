import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all payments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get payments for an invoice
router.get('/invoice/:invoiceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { invoiceId: req.params.invoiceId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { invoiceId, amount, method, reference, notes, paidAt } = req.body;

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        reference,
        notes,
        paidAt: paidAt ? new Date(paidAt) : new Date()
      }
    });

    // Update invoice balance and status
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true }
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(amount);
      const balance = Number(invoice.total) - totalPaid;
      const status = balance <= 0 ? 'paid' : invoice.status === 'draft' ? 'sent' : invoice.status;

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: totalPaid,
          balance,
          status,
          ...(balance <= 0 && { paidAt: new Date() })
        }
      });
    }

    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await prisma.payment.delete({
      where: { id: req.params.id }
    });

    // Recalculate invoice balance
    const invoice = await prisma.invoice.findUnique({
      where: { id: payment.invoiceId },
      include: { payments: true }
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) - Number(payment.amount);
      const balance = Number(invoice.total) - totalPaid;
      const status = balance <= 0 ? 'paid' : balance > 0 && invoice.dueDate < new Date() ? 'overdue' : 'sent';

      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: totalPaid,
          balance,
          status
        }
      });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
