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

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
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
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { quotationId, customerId, jobId, dueDate, items, notes, terms, tax, discount, currency } = await request.json();

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
        balance: total,
        currency: ['USD', 'ZIG', 'ZAR'].includes(currency) ? currency : 'USD'
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
