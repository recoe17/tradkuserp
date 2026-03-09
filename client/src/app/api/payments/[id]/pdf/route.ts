import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { generateReceiptPDF } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    const pdfBuffer = await generateReceiptPDF(payment);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${payment.id.slice(-8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Receipt PDF generation error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to generate receipt PDF' },
      { status: 500 }
    );
  }
}
