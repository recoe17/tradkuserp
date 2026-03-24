import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { formatAmount } from '@/lib/currency';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    if (!invoice.customer.phone) {
      return NextResponse.json({ message: 'Customer phone not found' }, { status: 400 });
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
      const phone = invoice.customer.phone.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        `Hello ${invoice.customer.name},\n\n` +
        `This is a reminder for Invoice ${invoice.invoiceNumber} from Tradkuserp.\n\n` +
        `Total Amount: ${formatAmount(Number(invoice.total), invoice.currency || 'USD')}\n` +
        `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n` +
        `Balance Due: ${formatAmount(Number(invoice.balance), invoice.currency || 'USD')}\n` +
        `\nPlease make payment at your earliest convenience.\n\n` +
        `Best regards,\nTradkuserp`
      );
      
      return NextResponse.json({ 
        success: true, 
        whatsappUrl: `https://wa.me/${phone}?text=${message}`,
        message: 'WhatsApp link generated'
      });
    }

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const message = 
      `Hello ${invoice.customer.name},\n\n` +
      `Invoice: ${invoice.invoiceNumber}\n` +
      `Total: ${formatAmount(Number(invoice.total), invoice.currency || 'USD')}\n` +
      `Due: ${new Date(invoice.dueDate).toLocaleDateString()}\n` +
      `Balance: ${formatAmount(Number(invoice.balance), invoice.currency || 'USD')}\n\n` +
      `Tradkuserp`;

    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${invoice.customer.phone}`,
    });

    await prisma.invoice.update({
      where: { id },
      data: { status: 'sent' },
    });

    return NextResponse.json({ success: true, message: 'WhatsApp message sent successfully' });
  } catch (error: any) {
    console.error('Error sending WhatsApp:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}
