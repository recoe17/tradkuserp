import PDFDocument from 'pdfkit';

export async function generateQuotationPDF(quotation: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text(process.env.COMPANY_NAME || 'MaxVolt Electrical', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('QUOTATION', { align: 'center', underline: true });
      doc.moveDown(2);

      // Company Info
      doc.fontSize(10);
      doc.text(process.env.COMPANY_ADDRESS || '');
      doc.text(`Phone: ${process.env.COMPANY_PHONE || ''}`);
      doc.text(`Email: ${process.env.COMPANY_EMAIL || ''}`);
      doc.moveDown();

      // Quotation Details
      doc.fontSize(12);
      doc.text(`Quotation Number: ${quotation.quotationNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, { align: 'right' });
      if (quotation.validUntil) {
        doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, { align: 'right' });
      }
      doc.moveDown(2);

      // Customer Info
      doc.fontSize(12).text('Bill To:', { underline: true });
      doc.fontSize(10);
      doc.text(quotation.customer.name);
      if (quotation.customer.company) {
        doc.text(quotation.customer.company);
      }
      if (quotation.customer.address) {
        doc.text(quotation.customer.address);
      }
      if (quotation.customer.email) {
        doc.text(`Email: ${quotation.customer.email}`);
      }
      if (quotation.customer.phone) {
        doc.text(`Phone: ${quotation.customer.phone}`);
      }
      doc.moveDown(2);

      // Items Table
      doc.fontSize(12).text('Items:', { underline: true });
      doc.moveDown(0.5);

      // Table Header
      doc.fontSize(10);
      doc.text('Description', 50, doc.y);
      doc.text('Qty', 350, doc.y);
      doc.text('Unit Price', 400, doc.y);
      doc.text('Total', 480, doc.y);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Items
      const items = Array.isArray(quotation.items) ? quotation.items : [];
      items.forEach((item: any) => {
        const startY = doc.y;
        doc.text(item.description || '', 50, startY, { width: 280 });
        doc.text(String(item.quantity || 0), 350, startY);
        doc.text(`$${Number(item.unitPrice || 0).toFixed(2)}`, 400, startY);
        doc.text(`$${Number(item.quantity * item.unitPrice || 0).toFixed(2)}`, 480, startY);
        doc.moveDown(1);
      });

      doc.moveDown(2);

      // Totals
      const totalsY = doc.y;
      doc.text('Subtotal:', 400, totalsY);
      doc.text(`$${Number(quotation.subtotal).toFixed(2)}`, 480, totalsY);
      
      if (Number(quotation.tax) > 0) {
        doc.text('Tax:', 400, doc.y + 15);
        doc.text(`$${Number(quotation.tax).toFixed(2)}`, 480, doc.y);
      }
      
      if (Number(quotation.discount) > 0) {
        doc.text('Discount:', 400, doc.y + 15);
        doc.text(`-$${Number(quotation.discount).toFixed(2)}`, 480, doc.y);
      }
      
      doc.moveDown(0.5);
      doc.moveTo(400, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total:', 400, doc.y);
      doc.text(`$${Number(quotation.total).toFixed(2)}`, 480, doc.y);
      doc.font('Helvetica').fontSize(10);

      // Notes and Terms
      if (quotation.notes) {
        doc.moveDown(2);
        doc.fontSize(12).text('Notes:', { underline: true });
        doc.fontSize(10).text(quotation.notes);
      }

      if (quotation.terms) {
        doc.moveDown(2);
        doc.fontSize(12).text('Terms & Conditions:', { underline: true });
        doc.fontSize(10).text(quotation.terms);
      }

      // Footer
      doc.fontSize(8)
        .text('Thank you for your business!', 50, doc.page.height - 50, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text(process.env.COMPANY_NAME || 'MaxVolt Electrical', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('INVOICE', { align: 'center', underline: true });
      doc.moveDown(2);

      // Company Info
      doc.fontSize(10);
      doc.text(process.env.COMPANY_ADDRESS || '');
      doc.text(`Phone: ${process.env.COMPANY_PHONE || ''}`);
      doc.text(`Email: ${process.env.COMPANY_EMAIL || ''}`);
      doc.moveDown();

      // Invoice Details
      doc.fontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
      doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, { align: 'right' });
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'right' });
      doc.text(`Status: ${invoice.status.toUpperCase()}`, { align: 'right' });
      doc.moveDown(2);

      // Customer Info
      doc.fontSize(12).text('Bill To:', { underline: true });
      doc.fontSize(10);
      doc.text(invoice.customer.name);
      if (invoice.customer.company) {
        doc.text(invoice.customer.company);
      }
      if (invoice.customer.address) {
        doc.text(invoice.customer.address);
      }
      if (invoice.customer.email) {
        doc.text(`Email: ${invoice.customer.email}`);
      }
      if (invoice.customer.phone) {
        doc.text(`Phone: ${invoice.customer.phone}`);
      }
      doc.moveDown(2);

      // Items Table
      doc.fontSize(12).text('Items:', { underline: true });
      doc.moveDown(0.5);

      // Table Header
      doc.fontSize(10);
      doc.text('Description', 50, doc.y);
      doc.text('Qty', 350, doc.y);
      doc.text('Unit Price', 400, doc.y);
      doc.text('Total', 480, doc.y);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Items
      const items = Array.isArray(invoice.items) ? invoice.items : [];
      items.forEach((item: any) => {
        const startY = doc.y;
        doc.text(item.description || '', 50, startY, { width: 280 });
        doc.text(String(item.quantity || 0), 350, startY);
        doc.text(`$${Number(item.unitPrice || 0).toFixed(2)}`, 400, startY);
        doc.text(`$${Number(item.quantity * item.unitPrice || 0).toFixed(2)}`, 480, startY);
        doc.moveDown(1);
      });

      doc.moveDown(2);

      // Totals
      const totalsY = doc.y;
      doc.text('Subtotal:', 400, totalsY);
      doc.text(`$${Number(invoice.subtotal).toFixed(2)}`, 480, totalsY);
      
      if (Number(invoice.tax) > 0) {
        doc.text('Tax:', 400, doc.y + 15);
        doc.text(`$${Number(invoice.tax).toFixed(2)}`, 480, doc.y);
      }
      
      if (Number(invoice.discount) > 0) {
        doc.text('Discount:', 400, doc.y + 15);
        doc.text(`-$${Number(invoice.discount).toFixed(2)}`, 480, doc.y);
      }
      
      doc.moveDown(0.5);
      doc.moveTo(400, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total:', 400, doc.y);
      doc.text(`$${Number(invoice.total).toFixed(2)}`, 480, doc.y);
      doc.font('Helvetica').fontSize(10);

      // Payment Info
      if (Number(invoice.paidAmount) > 0) {
        doc.moveDown(1);
        doc.text('Paid Amount:', 400, doc.y);
        doc.text(`$${Number(invoice.paidAmount).toFixed(2)}`, 480, doc.y);
      }

      if (Number(invoice.balance) > 0) {
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Balance Due:', 400, doc.y + 15);
        doc.text(`$${Number(invoice.balance).toFixed(2)}`, 480, doc.y);
        doc.font('Helvetica').fontSize(10);
      }

      // Payments History
      if (invoice.payments && invoice.payments.length > 0) {
        doc.moveDown(2);
        doc.fontSize(12).text('Payment History:', { underline: true });
        doc.moveDown(0.5);
        invoice.payments.forEach((payment: any) => {
          doc.text(
            `${new Date(payment.paidAt).toLocaleDateString()} - $${Number(payment.amount).toFixed(2)} (${payment.method})`,
            50
          );
          doc.moveDown(0.5);
        });
      }

      // Notes and Terms
      if (invoice.notes) {
        doc.moveDown(2);
        doc.fontSize(12).text('Notes:', { underline: true });
        doc.fontSize(10).text(invoice.notes);
      }

      if (invoice.terms) {
        doc.moveDown(2);
        doc.fontSize(12).text('Terms & Conditions:', { underline: true });
        doc.fontSize(10).text(invoice.terms);
      }

      // Footer
      doc.fontSize(8)
        .text('Thank you for your business!', 50, doc.page.height - 50, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
