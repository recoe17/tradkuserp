import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const items = await prisma.quotationItem.findMany({
      orderBy: { description: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { description, unitPrice, category } = await request.json();

    const item = await prisma.quotationItem.create({
      data: {
        description,
        unitPrice,
        category: category || null
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
