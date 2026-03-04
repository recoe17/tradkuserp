import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendQuotationWhatsApp(quotation: any) {
  if (!client) {
    throw new Error('WhatsApp service not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
  }
  
  try {
    const message = `
*Quotation ${quotation.quotationNumber}*

Dear ${quotation.customer.name},

Thank you for your interest in our services.

*Total Amount:* $${quotation.total.toFixed(2)}
${quotation.validUntil ? `*Valid Until:* ${new Date(quotation.validUntil).toLocaleDateString()}` : ''}

Please review the quotation and let us know if you have any questions.

Best regards,
${process.env.COMPANY_NAME}
${process.env.COMPANY_PHONE}
    `.trim();

    // Note: For production, you'll need to upload the PDF to a public URL
    // and include it in the message, or use Twilio's Media API
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${quotation.customer.phone}`,
      body: message
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}

export async function sendInvoiceWhatsApp(invoice: any) {
  if (!client) {
    throw new Error('WhatsApp service not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
  }
  
  try {
    const message = `
*Invoice ${invoice.invoiceNumber}*

Dear ${invoice.customer.name},

Please find invoice ${invoice.invoiceNumber}.

*Total Amount:* $${invoice.total.toFixed(2)}
*Due Date:* ${new Date(invoice.dueDate).toLocaleDateString()}
${invoice.balance > 0 ? `*Balance Due:* $${invoice.balance.toFixed(2)}` : ''}

Please make payment by the due date.

Best regards,
${process.env.COMPANY_NAME}
${process.env.COMPANY_PHONE}
    `.trim();

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${invoice.customer.phone}`,
      body: message
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}
