import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            jobs: true,
            quotations: true,
            invoices: true
          }
        }
      }
    });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single customer
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: true,
        quotations: true,
        invoices: true
      }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create customer
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, address, company, notes } = req.body;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        company,
        notes
      }
    });

    res.status(201).json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update customer
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, address, company, notes } = req.body;

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        phone,
        address,
        company,
        notes
      }
    });

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete customer
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
