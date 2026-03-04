import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    await prisma.payment.delete({
      where: { id }
    });

    const invoice = await prisma.invoice.findUnique({
      where: { id: payment.invoiceId },
      include: { payments: true }
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) - Number(payment.amount);
      const balance = Number(invoice.total) - totalPaid;
      const status = balance <= 0 ? 'paid' : balance > 0 && invoice.dueDate < new Date() ? 'overdue' : 'sent';

      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: totalPaid,
          balance,
          status
        }
      });
    }

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
