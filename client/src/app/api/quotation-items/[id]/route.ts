import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const { description, unitPrice, category } = await request.json();

    const item = await prisma.quotationItem.update({
      where: { id },
      data: {
        description: description || undefined,
        unitPrice: unitPrice !== undefined ? unitPrice : undefined,
        category: category !== undefined ? category : undefined
      }
    });

    return NextResponse.json(item);
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
    await prisma.quotationItem.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
