import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendQuotationEmail } from '../services/email';
import { sendQuotationWhatsApp } from '../services/whatsapp';
import { generateQuotationPDF } from '../services/pdf';

const router = express.Router();
const prisma = new PrismaClient();

// Generate quotation number
async function generateQuotationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.quotation.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  return `QUO-${year}-${String(count + 1).padStart(4, '0')}`;
}

// Get all quotations
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;
    const where: any = {};
    
    if (status) where.status = status;

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        customer: true,
        job: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single quotation
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        job: true
      }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get quotation PDF
router.get('/:id/pdf', authenticate, async (req: AuthRequest, res) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        job: true
      }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const pdfBuffer = await generateQuotationPDF(quotation);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quotation-${quotation.quotationNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create quotation
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { customerId, jobId, validUntil, items, notes, terms, tax, discount } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    const quotationNumber = await generateQuotationNumber();

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId,
        jobId: jobId || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        items,
        notes,
        terms,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total
      },
      include: {
        customer: true,
        job: true
      }
    });

    res.status(201).json(quotation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update quotation
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { validUntil, items, notes, terms, tax, discount } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    const quotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: {
        validUntil: validUntil ? new Date(validUntil) : undefined,
        items,
        notes,
        terms,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total
      },
      include: {
        customer: true,
        job: true
      }
    });

    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send quotation via email
router.post('/:id/send-email', authenticate, async (req: AuthRequest, res) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        job: true
      }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    await sendQuotationEmail(quotation);
    
    await prisma.quotation.update({
      where: { id: req.params.id },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    res.json({ message: 'Quotation sent via email successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send quotation via WhatsApp
router.post('/:id/send-whatsapp', authenticate, async (req: AuthRequest, res) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        job: true
      }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (!quotation.customer.phone) {
      return res.status(400).json({ message: 'Customer phone number is required' });
    }

    await sendQuotationWhatsApp(quotation);
    
    await prisma.quotation.update({
      where: { id: req.params.id },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    res.json({ message: 'Quotation sent via WhatsApp successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update quotation status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    const quotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'accepted' && { acceptedAt: new Date() })
      }
    });

    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete quotation
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.quotation.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Quotation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
