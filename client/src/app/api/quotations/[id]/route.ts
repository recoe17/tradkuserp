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
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        job: true
      }
    });

    if (!quotation) {
      return NextResponse.json({ message: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json(quotation);
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
    const body = await request.json();
    
    // If only updating status
    if (body.status && Object.keys(body).length === 1) {
      const quotation = await prisma.quotation.update({
        where: { id },
        data: { status: body.status },
        include: {
          customer: true,
          job: true
        }
      });
      return NextResponse.json(quotation);
    }

    // Full update
    const { validUntil, items, notes, terms, tax, discount, status } = body;

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    const quotation = await prisma.quotation.update({
      where: { id },
      data: {
        validUntil: validUntil ? new Date(validUntil) : undefined,
        items,
        notes,
        terms,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        status: status || undefined
      },
      include: {
        customer: true,
        job: true
      }
    });

    return NextResponse.json(quotation);
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
    await prisma.quotation.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Quotation deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
