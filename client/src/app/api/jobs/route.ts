import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const serviceType = searchParams.get('serviceType');
    
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
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { customerId, title, description, serviceType, status, priority, startDate, endDate, location, assignedTo, notes } = await request.json();

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

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
