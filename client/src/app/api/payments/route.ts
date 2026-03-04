import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { invoiceId, amount, method, reference, notes, paidAt } = await request.json();

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        reference,
        notes,
        paidAt: paidAt ? new Date(paidAt) : new Date()
      }
    });

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true }
    });

    if (invoice) {
      // Payment is already included in invoice.payments after create, so don't add amount again
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance = Number(invoice.total) - totalPaid;
      const status = balance <= 0 ? 'paid' : invoice.status === 'draft' ? 'sent' : invoice.status;

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: totalPaid,
          balance,
          status,
          ...(balance <= 0 && { paidAt: new Date() })
        }
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
