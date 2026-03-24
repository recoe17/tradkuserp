import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

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

    // If an invoice already exists for this quotation, return it instead of creating a duplicate
    const existingInvoice = await prisma.invoice.findFirst({
      where: { quotationId: quotation.id },
      include: {
        customer: true,
        job: true,
        quotation: true
      }
    });

    if (existingInvoice) {
      return NextResponse.json(existingInvoice, { status: 200 });
    }

    const invoiceNumber = await generateInvoiceNumber();

    try {
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          quotationId: quotation.id,
          customerId: quotation.customerId,
          jobId: quotation.jobId,
          dueDate: dueDate
            ? new Date(dueDate)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: quotation.items as any,
          notes: quotation.notes,
          terms: quotation.terms,
          subtotal: quotation.subtotal,
          tax: quotation.tax,
          discount: quotation.discount,
          total: quotation.total,
          balance: quotation.total,
          currency: ['BWP', 'USD', 'ZIG', 'ZAR'].includes(quotation.currency)
            ? quotation.currency
            : 'BWP'
        },
        include: {
          customer: true,
          job: true,
          quotation: true
        }
      });

      return NextResponse.json(invoice, { status: 201 });
    } catch (error: any) {
      // Handle unique constraint on invoiceNumber gracefully
      if (error.code === 'P2002' && error.meta?.target?.includes('invoiceNumber')) {
        return NextResponse.json(
          { message: 'An invoice was just created with this number. Please try again.' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
