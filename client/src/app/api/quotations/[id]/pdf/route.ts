import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { generateQuotationPDF } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

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

    const pdfBuffer = await generateQuotationPDF(quotation);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation.quotationNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
