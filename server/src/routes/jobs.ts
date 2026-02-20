import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Generate job number
async function generateJobNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.job.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  return `JOB-${year}-${String(count + 1).padStart(4, '0')}`;
}

// Get all jobs
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, serviceType } = req.query;
    const where: any = {};
    
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        customer: true,
        _count: {
          select: {
            quotations: true,
            invoices: true,
            expenses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single job
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        quotations: true,
        invoices: true,
        expenses: true
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create job
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { customerId, title, description, serviceType, status, priority, startDate, endDate, location, assignedTo, notes } = req.body;

    const jobNumber = await generateJobNumber();

    const job = await prisma.job.create({
      data: {
        jobNumber,
        customerId,
        title,
        description,
        serviceType,
        status: status || 'pending',
        priority: priority || 'medium',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location,
        assignedTo,
        notes
      },
      include: {
        customer: true
      }
    });

    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update job
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, description, serviceType, status, priority, startDate, endDate, location, assignedTo, notes } = req.body;

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        serviceType,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        assignedTo,
        notes
      },
      include: {
        customer: true
      }
    });

    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete job
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.job.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
