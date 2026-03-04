import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        job: true,
        quotation: true,
        payments: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const { dueDate, items, notes, terms, tax, discount } = await request.json();

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    const currentInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true }
    });

    const paidAmount = currentInvoice?.payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const balance = total - paidAmount;

    const invoice = await prisma.invoice.update({
      where: { id },
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

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    await prisma.invoice.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const { action } = await request.json();

    if (action === 'recalculate') {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { payments: true }
      });

      if (!invoice) {
        return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
      }

      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance = Number(invoice.total) - totalPaid;
      const status = balance <= 0 ? 'paid' : (totalPaid > 0 ? 'partial' : invoice.status);

      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          paidAmount: totalPaid,
          balance,
          status
        },
        include: {
          customer: true,
          job: true,
          quotation: true,
          payments: true
        }
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
