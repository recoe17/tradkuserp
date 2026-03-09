import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { generateInvoicePDF } from '@/lib/pdf';
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
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    if (!invoice.customer.email) {
      return NextResponse.json({ message: 'Customer email not found' }, { status: 400 });
    }

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

    const pdfBuffer = await generateInvoicePDF(invoice);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: invoice.customer.email,
      subject: `Invoice ${invoice.invoiceNumber} - MaxVolt Electrical`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #DC2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">MaxVolt Electrical</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Dear ${invoice.customer.name},</h2>
            <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong>.</p>
            <p><strong>Total Amount:</strong> ${formatAmount(Number(invoice.total), invoice.currency || 'USD')}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            ${Number(invoice.balance) > 0 ? `<p><strong>Balance Due:</strong> ${formatAmount(Number(invoice.balance), invoice.currency || 'USD')}</p>` : ''}
            <p>Please make payment by the due date.</p>
            <p>Best regards,<br><strong>MaxVolt Electrical (Pvt) Ltd</strong><br>Bulawayo, Zimbabwe</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            Solar Power Systems | Solar Pumps | Solar Geysers | House Wiring | Security Systems
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    await prisma.invoice.update({
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
