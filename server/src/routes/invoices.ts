import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateInvoicePDF } from '../services/pdf';

const router = express.Router();
const prisma = new PrismaClient();

// Generate invoice number using atomic yearly counter
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const counter = await prisma.$transaction(async (tx) => {
    return tx.invoiceCounter.upsert({
      where: { year },
      update: { value: { increment: 1 } },
      create: { year, value: 1 }
    });
  });

  return `INV-${year}-${String(counter.value).padStart(4, '0')}`;
}

// Get all invoices
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;
    const where: any = {};
    
    if (status) where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        job: true,
        quotation: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single invoice
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        job: true,
        quotation: true,
        payments: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get invoice PDF
router.get('/:id/pdf', authenticate, async (req: AuthRequest, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        job: true,
        quotation: true,
        payments: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const pdfBuffer = await generateInvoicePDF(invoice);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create invoice
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { quotationId, customerId, jobId, dueDate, items, notes, terms, tax, discount } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        quotationId: quotationId || null,
        customerId,
        jobId: jobId || null,
        dueDate: new Date(dueDate),
        items,
        notes,
        terms,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        balance: total
      },
      include: {
        customer: true,
        job: true,
        quotation: true
      }
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create invoice from quotation
router.post('/from-quotation/:quotationId', authenticate, async (req: AuthRequest, res) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.quotationId },
      include: {
        customer: true,
        job: true
      }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const { dueDate } = req.body;
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        quotationId: quotation.id,
        customerId: quotation.customerId,
        jobId: quotation.jobId,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        items: quotation.items,
        notes: quotation.notes,
        terms: quotation.terms,
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        discount: quotation.discount,
        total: quotation.total,
        balance: quotation.total
      },
      include: {
        customer: true,
        job: true,
        quotation: true
      }
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update invoice
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { dueDate, items, notes, terms, tax, discount } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    // Get current invoice to calculate balance
    const currentInvoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { payments: true }
    });

    const paidAmount = currentInvoice?.payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const balance = total - paidAmount;

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        dueDate: dueDate ? new Date(dueDate) : undefined,
        items,
        notes,
        terms,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        balance
      },
      include: {
        customer: true,
        job: true,
        quotation: true
      }
    });

    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update invoice status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'paid' && { paidAt: new Date() })
      }
    });

    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete invoice
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.invoice.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
