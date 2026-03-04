import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            jobs: true,
            quotations: true,
            invoices: true
          }
        }
      }
    });
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { name, email, phone, address, company, notes } = await request.json();

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        company,
        notes
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
