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
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            customer: true
          }
        }
      }
    });

    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
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
    const { jobId, category, description, amount, date, receipt, notes } = await request.json();

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        jobId: jobId || undefined,
        category,
        description,
        amount,
        date: date ? new Date(date) : undefined,
        receipt,
        notes
      },
      include: {
        job: {
          include: {
            customer: true
          }
        }
      }
    });

    return NextResponse.json(expense);
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
    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
