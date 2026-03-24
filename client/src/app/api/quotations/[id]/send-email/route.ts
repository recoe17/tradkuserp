import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { generateQuotationPDF } from '@/lib/pdf';
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

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        job: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ message: 'Quotation not found' }, { status: 404 });
    }

    if (!quotation.customer.email) {
      return NextResponse.json({ message: 'Customer email not found' }, { status: 400 });
    }

    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ 
        message: 'Email service not configured. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS environment variables.' 
      }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const pdfBuffer = await generateQuotationPDF(quotation);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: quotation.customer.email,
      subject: `Quotation ${quotation.quotationNumber} - Tradkuserp`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #DC2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Tradkuserp</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Dear ${quotation.customer.name},</h2>
            <p>Thank you for your interest in our services. Please find attached quotation <strong>${quotation.quotationNumber}</strong>.</p>
            <p><strong>Total Amount:</strong> ${formatAmount(Number(quotation.total), quotation.currency || 'USD')}</p>
            ${quotation.validUntil ? `<p><strong>Valid Until:</strong> ${new Date(quotation.validUntil).toLocaleDateString()}</p>` : ''}
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br><strong>Tradkuserp</strong><br>Bulawayo, Zimbabwe</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            Solar Power Systems | Solar Pumps | Solar Geysers | House Wiring | Security Systems
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `quotation-${quotation.quotationNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Update quotation status to sent
    await prisma.quotation.update({
      where: { id },
      data: { status: 'sent' },
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
