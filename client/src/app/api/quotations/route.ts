import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
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
    return NextResponse.json(quotations);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { customerId, jobId, validUntil, items, notes, terms, tax, discount } = await request.json();

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

    return NextResponse.json(quotation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
