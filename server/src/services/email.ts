import nodemailer from 'nodemailer';
import { generateQuotationPDF } from './pdf';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendQuotationEmail(quotation: any) {
  try {
    const pdfBuffer = await generateQuotationPDF(quotation);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: quotation.customer.email,
      subject: `Quotation ${quotation.quotationNumber} - ${process.env.COMPANY_NAME}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Dear ${quotation.customer.name},</h2>
          <p>Thank you for your interest in our services. Please find attached the quotation ${quotation.quotationNumber}.</p>
          <p><strong>Total Amount:</strong> $${quotation.total.toFixed(2)}</p>
          ${quotation.validUntil ? `<p><strong>Valid Until:</strong> ${new Date(quotation.validUntil).toLocaleDateString()}</p>` : ''}
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>${process.env.COMPANY_NAME}</p>
        </div>
      `,
      attachments: [
        {
          filename: `quotation-${quotation.quotationNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendInvoiceEmail(invoice: any) {
  try {
    const pdfBuffer = await generateInvoicePDF(invoice);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: invoice.customer.email,
      subject: `Invoice ${invoice.invoiceNumber} - ${process.env.COMPANY_NAME}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Dear ${invoice.customer.name},</h2>
          <p>Please find attached invoice ${invoice.invoiceNumber}.</p>
          <p><strong>Total Amount:</strong> $${invoice.total.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          ${invoice.balance > 0 ? `<p><strong>Balance Due:</strong> $${invoice.balance.toFixed(2)}</p>` : ''}
          <p>Please make payment by the due date.</p>
          <p>Best regards,<br>${process.env.COMPANY_NAME}</p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
