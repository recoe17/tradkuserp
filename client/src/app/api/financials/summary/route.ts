import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(startDate || endDate ? {
          issueDate: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {})
          }
        } : {})
      }
    });

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({ where });

    const payments = await prisma.payment.findMany({
      where: {
        ...(startDate || endDate ? {
          paidAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {})
          }
        } : {})
      }
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const outstanding = invoices.reduce((sum, inv) => sum + Number(inv.balance), 0);
    const profit = totalPaid - totalExpenses;

    return NextResponse.json({
      totalRevenue,
      totalPaid,
      totalExpenses,
      outstanding,
      profit,
      invoiceCount: invoices.length,
      expenseCount: expenses.length,
      paymentCount: payments.length
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
