import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const category = searchParams.get('category');
    
    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (category) where.category = category;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        job: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { jobId, category, description, amount, date, receipt, notes } = await request.json();

    const expense = await prisma.expense.create({
      data: {
        jobId: jobId || null,
        category,
        description,
        amount,
        date: date ? new Date(date) : new Date(),
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

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
