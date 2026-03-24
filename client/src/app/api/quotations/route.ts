import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

async function generateQuotationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QUO-${year}-`;
  const existing = await prisma.quotation.findMany({
    where: { quotationNumber: { startsWith: prefix } },
    select: { quotationNumber: true }
  });
  let maxNum = 0;
  for (const q of existing) {
    const numPart = q.quotationNumber.replace(prefix, '');
    const n = parseInt(numPart, 10) || 0;
    if (n > maxNum) maxNum = n;
  }
  return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where: any = {};
    if (status) where.status = status;

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        customer: true,
        job: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(quotations);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { customerId, jobId, validUntil, items, notes, terms, tax, discount, currency, asDraft } = await request.json();

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    const createQuotation = async (quotationNumber: string) =>
      prisma.quotation.create({
        data: {
          quotationNumber,
          customerId,
          jobId: jobId || null,
          validUntil: validUntil ? new Date(validUntil) : null,
          items,
          notes,
          terms,
          subtotal,
          tax: taxAmount,
          discount: discountAmount,
          total,
          currency: ['BWP', 'USD', 'ZIG', 'ZAR'].includes(currency) ? currency : 'BWP',
          status: asDraft === false ? 'sent' : 'draft'
        },
        include: { customer: true, job: true }
      });

    let quotation;
    for (let attempt = 0; attempt < 3; attempt++) {
      const quotationNumber = await generateQuotationNumber();
      try {
        quotation = await createQuotation(quotationNumber);
        break;
      } catch (e: any) {
        if (e?.code === 'P2002' && e?.meta?.target?.includes?.('quotationNumber') && attempt < 2) {
          continue; // retry on unique constraint
        }
        throw e;
      }
    }
    if (!quotation) throw new Error('Failed to create quotation');

    return NextResponse.json(quotation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
