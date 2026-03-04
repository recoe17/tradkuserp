import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { quotationId } = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        job: true
      }
    });

    if (!quotation) {
      return NextResponse.json({ message: 'Quotation not found' }, { status: 404 });
    }

    const { dueDate } = await request.json();
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        quotationId: quotation.id,
        customerId: quotation.customerId,
        jobId: quotation.jobId,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: quotation.items as any,
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
