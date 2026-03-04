import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

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

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ message: 'Quotation not found' }, { status: 404 });
    }

    if (!quotation.customer.phone) {
      return NextResponse.json({ message: 'Customer phone not found' }, { status: 400 });
    }

    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
      // If Twilio is not configured, open WhatsApp Web with pre-filled message
      const phone = quotation.customer.phone.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        `Hello ${quotation.customer.name},\n\n` +
        `Thank you for your interest in MaxVolt Electrical.\n\n` +
        `Here are the details for Quotation ${quotation.quotationNumber}:\n` +
        `Total Amount: $${Number(quotation.total).toFixed(2)}\n` +
        `${quotation.validUntil ? `Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}\n` : ''}` +
        `\nPlease let us know if you have any questions.\n\n` +
        `Best regards,\nMaxVolt Electrical (Pvt) Ltd`
      );
      
      return NextResponse.json({ 
        success: true, 
        whatsappUrl: `https://wa.me/${phone}?text=${message}`,
        message: 'WhatsApp link generated. Twilio not configured for automated sending.'
      });
    }

    // Use Twilio to send WhatsApp message
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const message = 
      `Hello ${quotation.customer.name},\n\n` +
      `Thank you for your interest in MaxVolt Electrical.\n\n` +
      `Quotation: ${quotation.quotationNumber}\n` +
      `Total: $${Number(quotation.total).toFixed(2)}\n` +
      `${quotation.validUntil ? `Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}\n` : ''}` +
      `\nPlease contact us for more details.\n\n` +
      `MaxVolt Electrical (Pvt) Ltd`;

    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${quotation.customer.phone}`,
    });

    // Update quotation status to sent
    await prisma.quotation.update({
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
