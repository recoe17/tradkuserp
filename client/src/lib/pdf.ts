import PDFDocument from 'pdfkit';
import { COMPANY } from './company';
import { formatAmount } from './currency';

const RED_COLOR = '#DC2626';
const DARK_GRAY = '#374151';
const LIGHT_GRAY = '#6B7280';

async function fetchLogoBuffer(): Promise<Buffer | null> {
  try {
    const logoUrl = 'https://maxvolterp.vercel.app/logo.png';
    console.log('Fetching logo from:', logoUrl);
    const response = await fetch(logoUrl, {
      headers: { 'Accept': 'image/*' },
    });
    console.log('Logo fetch response:', response.status, response.statusText);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      console.log('Logo buffer size:', arrayBuffer.byteLength);
      return Buffer.from(arrayBuffer);
    }
  } catch (error) {
    console.error('Logo fetch error:', error);
  }
  return null;
}

export async function generateQuotationPDF(quotation: any): Promise<Buffer> {
  const logoBuffer = await fetchLogoBuffer();
  
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

      // Header with red accent bar
      doc.rect(0, 0, doc.page.width, 8).fill(RED_COLOR);
      
      // Logo and Company Header
      if (logoBuffer) {
        doc.image(logoBuffer, 50, 20, { width: 150 });
        doc.moveDown(4);
      } else {
        doc.moveDown();
        doc.fillColor(RED_COLOR).fontSize(24).font('Helvetica-Bold')
          .text('MAXVOLT', 50, 25, { continued: true })
          .fillColor(DARK_GRAY).text(' ELECTRICAL');
        doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
          .text('The best way to power up', 50, 52);
        doc.moveDown(2);
      }

      // Quotation Title
      doc.y = 90;
      doc.fillColor(RED_COLOR).fontSize(28).font('Helvetica-Bold')
        .text('QUOTATION', { align: 'right' });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(`#${quotation.quotationNumber}`, { align: 'right' });
      
      doc.moveDown(2);

      // Red divider line
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(RED_COLOR).lineWidth(2).stroke();
      doc.moveDown();

      // Two-column layout for company and customer info
      const leftColumnX = 50;
      const rightColumnX = 320;
      const infoStartY = doc.y;

      // Company Info (Left)
      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, infoStartY);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(COMPANY.name, leftColumnX, doc.y + 5);
      doc.fillColor(LIGHT_GRAY).font('Helvetica')
        .text(COMPANY.address, leftColumnX)
        .text(`TIN: ${COMPANY.tin}`, leftColumnX)
        .text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX)
        .text(COMPANY.email, leftColumnX)
        .text(COMPANY.website, leftColumnX);

      // Customer Info (Right)
      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('TO:', rightColumnX, infoStartY);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(quotation.customer.name, rightColumnX, doc.y + 5);
      doc.fillColor(LIGHT_GRAY).font('Helvetica');
      if (quotation.customer.company) {
        doc.text(quotation.customer.company, rightColumnX);
      }
      if (quotation.customer.address) {
        doc.text(quotation.customer.address, rightColumnX);
      }
      if (quotation.customer.email) {
        doc.text(quotation.customer.email, rightColumnX);
      }
      if (quotation.customer.phone) {
        doc.text(quotation.customer.phone, rightColumnX);
      }

      doc.y = Math.max(doc.y, infoStartY + 80);
      doc.moveDown();

      // Date info box
      const dateBoxY = doc.y;
      doc.rect(rightColumnX, dateBoxY, 180, 60).fillColor('#FEF2F2').fill();
      doc.fillColor(RED_COLOR).fontSize(9).font('Helvetica-Bold')
        .text('Date:', rightColumnX + 10, dateBoxY + 10);
      doc.fillColor(DARK_GRAY).font('Helvetica')
        .text(new Date(quotation.createdAt).toLocaleDateString(), rightColumnX + 60, dateBoxY + 10);
      
      if (quotation.validUntil) {
        doc.fillColor(RED_COLOR).font('Helvetica-Bold')
          .text('Valid Until:', rightColumnX + 10, dateBoxY + 25);
        doc.fillColor(DARK_GRAY).font('Helvetica')
          .text(new Date(quotation.validUntil).toLocaleDateString(), rightColumnX + 60, dateBoxY + 25);
      }

      doc.y = dateBoxY + 70;
      doc.moveDown();

      // Items Table Header
      const tableTop = doc.y;
      doc.rect(50, tableTop, doc.page.width - 100, 25).fillColor(RED_COLOR).fill();
      
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
      doc.text('Description', 60, tableTop + 8);
      doc.text('Qty', 350, tableTop + 8);
      doc.text('Unit Price', 400, tableTop + 8);
      doc.text('Total', 480, tableTop + 8);

      // Items
      let itemY = tableTop + 30;
      const items = Array.isArray(quotation.items) ? quotation.items : [];
      
      items.forEach((item: any, index: number) => {
        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(50, itemY - 5, doc.page.width - 100, 25).fillColor('#F9FAFB').fill();
        }
        
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica');
        doc.text(item.description || '', 60, itemY, { width: 280 });
        doc.text(String(item.quantity || 0), 350, itemY);
        doc.text(formatAmount(Number(item.unitPrice || 0), quotation.currency || 'USD'), 400, itemY);
        doc.text(formatAmount(Number(item.quantity * item.unitPrice || 0), quotation.currency || 'USD'), 480, itemY);
        itemY += 25;
      });

      // Totals section
      doc.y = itemY + 20;
      const totalsX = 380;
      
      // Totals box
      doc.rect(totalsX - 10, doc.y - 5, 180, 80).fillColor('#FEF2F2').fill();
      
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text('Subtotal:', totalsX, doc.y);
      doc.fillColor(DARK_GRAY)
        .text(formatAmount(Number(quotation.subtotal), quotation.currency || 'USD'), 480, doc.y);
      doc.moveDown(0.5);
      
      if (Number(quotation.tax) > 0) {
        doc.fillColor(LIGHT_GRAY).text('VAT (15.5%):', totalsX, doc.y);
        doc.fillColor(DARK_GRAY).text(formatAmount(Number(quotation.tax), quotation.currency || 'USD'), 480, doc.y);
        doc.moveDown(0.5);
      }
      
      if (Number(quotation.discount) > 0) {
        doc.fillColor(LIGHT_GRAY).text('Discount:', totalsX, doc.y);
        doc.fillColor('#16A34A').text(`-${formatAmount(Number(quotation.discount), quotation.currency || 'USD')}`, 480, doc.y);
        doc.moveDown(0.5);
      }
      
      doc.moveTo(totalsX, doc.y + 5).lineTo(550, doc.y + 5).strokeColor(RED_COLOR).lineWidth(1).stroke();
      doc.moveDown();
      
      doc.fillColor(RED_COLOR).fontSize(14).font('Helvetica-Bold')
        .text('TOTAL:', totalsX, doc.y);
      doc.fillColor(RED_COLOR)
        .text(formatAmount(Number(quotation.total), quotation.currency || 'USD'), 470, doc.y);

      // Notes and Terms
      if (quotation.notes) {
        doc.moveDown(2);
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Notes:');
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica').text(quotation.notes);
      }

      if (quotation.terms) {
        doc.moveDown();
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Terms & Conditions:');
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica').text(quotation.terms);
      }

      // Bank Details
      doc.moveDown(2);
      const bankBoxHeight = COMPANY.banks.length * 55 + 15;
      doc.rect(50, doc.y, doc.page.width - 100, bankBoxHeight).strokeColor('#E5E7EB').lineWidth(1).stroke();
      let bankY = doc.y + 10;
      COMPANY.banks.forEach((bank) => {
        doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold').text(`Bank Details (${bank.title})`, 60, bankY);
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
          .text(`Bank: ${bank.name}`, 60, bankY + 14)
          .text(`Account Name: ${bank.accountName}`, 60, bankY + 26)
          .text(`Account Number: ${bank.accountNumber}`, 60, bankY + 38)
          .text(`Branch: ${bank.branch}`, 60, bankY + 50);
        bankY += 65;
      });

      // Footer
      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica')
        .text('Thank you for your business!', 50, doc.page.height - 28, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  const logoBuffer = await fetchLogoBuffer();
  
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

      // Header with red accent bar
      doc.rect(0, 0, doc.page.width, 8).fill(RED_COLOR);
      
      // Logo and Company Header
      if (logoBuffer) {
        doc.image(logoBuffer, 50, 20, { width: 150 });
        doc.moveDown(4);
      } else {
        doc.moveDown();
        doc.fillColor(RED_COLOR).fontSize(24).font('Helvetica-Bold')
          .text('MAXVOLT', 50, 25, { continued: true })
          .fillColor(DARK_GRAY).text(' ELECTRICAL');
        doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
          .text('The best way to power up', 50, 52);
        doc.moveDown(2);
      }

      // Invoice Title
      doc.y = 90;
      doc.fillColor(RED_COLOR).fontSize(28).font('Helvetica-Bold')
        .text('INVOICE', { align: 'right' });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(`#${invoice.invoiceNumber}`, { align: 'right' });
      
      // Status badge
      const statusColors: Record<string, string> = {
        draft: '#9CA3AF',
        sent: '#3B82F6',
        paid: '#16A34A',
        partial: '#F59E0B',
        overdue: '#DC2626',
        cancelled: '#6B7280',
      };
      const statusColor = statusColors[invoice.status] || '#9CA3AF';
      doc.fillColor(statusColor).fontSize(12).font('Helvetica-Bold')
        .text(invoice.status.toUpperCase(), { align: 'right' });
      
      doc.moveDown(2);

      // Red divider line
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(RED_COLOR).lineWidth(2).stroke();
      doc.moveDown();

      // Two-column layout
      const leftColumnX = 50;
      const rightColumnX = 320;
      const infoStartY = doc.y;

      // Company Info (Left)
      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, infoStartY);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(COMPANY.name, leftColumnX, doc.y + 5);
      doc.fillColor(LIGHT_GRAY).font('Helvetica')
        .text(COMPANY.address, leftColumnX)
        .text(`TIN: ${COMPANY.tin}`, leftColumnX)
        .text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX)
        .text(COMPANY.email, leftColumnX)
        .text(COMPANY.website, leftColumnX);

      // Customer Info (Right)
      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('TO:', rightColumnX, infoStartY);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(invoice.customer.name, rightColumnX, doc.y + 5);
      doc.fillColor(LIGHT_GRAY).font('Helvetica');
      if (invoice.customer.company) {
        doc.text(invoice.customer.company, rightColumnX);
      }
      if (invoice.customer.address) {
        doc.text(invoice.customer.address, rightColumnX);
      }
      if (invoice.customer.email) {
        doc.text(invoice.customer.email, rightColumnX);
      }
      if (invoice.customer.phone) {
        doc.text(invoice.customer.phone, rightColumnX);
      }

      doc.y = Math.max(doc.y, infoStartY + 80);
      doc.moveDown();

      // Date info box
      const dateBoxY = doc.y;
      doc.rect(rightColumnX, dateBoxY, 180, 60).fillColor('#FEF2F2').fill();
      doc.fillColor(RED_COLOR).fontSize(9).font('Helvetica-Bold')
        .text('Issue Date:', rightColumnX + 10, dateBoxY + 10);
      doc.fillColor(DARK_GRAY).font('Helvetica')
        .text(new Date(invoice.issueDate).toLocaleDateString(), rightColumnX + 70, dateBoxY + 10);
      
      doc.fillColor(RED_COLOR).font('Helvetica-Bold')
        .text('Due Date:', rightColumnX + 10, dateBoxY + 25);
      doc.fillColor(DARK_GRAY).font('Helvetica')
        .text(new Date(invoice.dueDate).toLocaleDateString(), rightColumnX + 70, dateBoxY + 25);

      doc.y = dateBoxY + 70;
      doc.moveDown();

      // Items Table Header
      const tableTop = doc.y;
      doc.rect(50, tableTop, doc.page.width - 100, 25).fillColor(RED_COLOR).fill();
      
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
      doc.text('Description', 60, tableTop + 8);
      doc.text('Qty', 350, tableTop + 8);
      doc.text('Unit Price', 400, tableTop + 8);
      doc.text('Total', 480, tableTop + 8);

      // Items
      let itemY = tableTop + 30;
      const items = Array.isArray(invoice.items) ? invoice.items : [];
      
      items.forEach((item: any, index: number) => {
        if (index % 2 === 0) {
          doc.rect(50, itemY - 5, doc.page.width - 100, 25).fillColor('#F9FAFB').fill();
        }
        
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica');
        doc.text(item.description || '', 60, itemY, { width: 280 });
        doc.text(String(item.quantity || 0), 350, itemY);
        doc.text(formatAmount(Number(item.unitPrice || 0), invoice.currency || 'USD'), 400, itemY);
        doc.text(formatAmount(Number(item.quantity * item.unitPrice || 0), invoice.currency || 'USD'), 480, itemY);
        itemY += 25;
      });

      // Totals section
      doc.y = itemY + 20;
      const totalsX = 380;
      
      doc.rect(totalsX - 10, doc.y - 5, 180, 110).fillColor('#FEF2F2').fill();
      
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text('Subtotal:', totalsX, doc.y);
      doc.fillColor(DARK_GRAY)
        .text(formatAmount(Number(invoice.subtotal), invoice.currency || 'USD'), 480, doc.y);
      doc.moveDown(0.5);
      
      if (Number(invoice.tax) > 0) {
        doc.fillColor(LIGHT_GRAY).text('VAT (15.5%):', totalsX, doc.y);
        doc.fillColor(DARK_GRAY).text(formatAmount(Number(invoice.tax), invoice.currency || 'USD'), 480, doc.y);
        doc.moveDown(0.5);
      }
      
      if (Number(invoice.discount) > 0) {
        doc.fillColor(LIGHT_GRAY).text('Discount:', totalsX, doc.y);
        doc.fillColor('#16A34A').text(`-${formatAmount(Number(invoice.discount), invoice.currency || 'USD')}`, 480, doc.y);
        doc.moveDown(0.5);
      }
      
      doc.moveTo(totalsX, doc.y + 5).lineTo(550, doc.y + 5).strokeColor(RED_COLOR).lineWidth(1).stroke();
      doc.moveDown();
      
      doc.fillColor(DARK_GRAY).fontSize(11).font('Helvetica-Bold')
        .text('Total:', totalsX, doc.y);
      doc.text(formatAmount(Number(invoice.total), invoice.currency || 'USD'), 480, doc.y);
      doc.moveDown(0.5);

      doc.fillColor('#16A34A').text('Paid:', totalsX, doc.y);
      doc.text(formatAmount(Number(invoice.paidAmount), invoice.currency || 'USD'), 480, doc.y);
      doc.moveDown(0.5);

      doc.fillColor(RED_COLOR).fontSize(12).font('Helvetica-Bold')
        .text('Balance Due:', totalsX, doc.y);
      doc.text(formatAmount(Number(invoice.balance), invoice.currency || 'USD'), 470, doc.y);

      // Payment History
      if (invoice.payments && invoice.payments.length > 0) {
        doc.moveDown(2);
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Payment History:');
        doc.moveDown(0.5);
        invoice.payments.forEach((payment: any) => {
          doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
            .text(`${new Date(payment.paidAt).toLocaleDateString()} - ${formatAmount(Number(payment.amount), invoice.currency || 'USD')} (${payment.method})`, 50);
          doc.moveDown(0.3);
        });
      }

      // Notes and Terms
      if (invoice.notes) {
        doc.moveDown();
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Notes:');
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica').text(invoice.notes);
      }

      if (invoice.terms) {
        doc.moveDown();
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Terms & Conditions:');
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica').text(invoice.terms);
      }

      // Footer
      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica')
        .text('Thank you for your business!', 50, doc.page.height - 28, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateReceiptPDF(payment: any): Promise<Buffer> {
  const logoBuffer = await fetchLogoBuffer();

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

      doc.rect(0, 0, doc.page.width, 8).fill(RED_COLOR);

      if (logoBuffer) {
        doc.image(logoBuffer, 50, 20, { width: 150 });
        doc.moveDown(4);
      } else {
        doc.moveDown();
        doc.fillColor(RED_COLOR).fontSize(24).font('Helvetica-Bold')
          .text('MAXVOLT', 50, 25, { continued: true })
          .fillColor(DARK_GRAY).text(' ELECTRICAL');
        doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
          .text('The best way to power up', 50, 52);
        doc.moveDown(2);
      }

      doc.y = 90;
      doc.fillColor(RED_COLOR).fontSize(28).font('Helvetica-Bold')
        .text('RECEIPT', { align: 'right' });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(`#${payment.id.slice(-8).toUpperCase()}`, { align: 'right' });
      doc.moveDown(2);

      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(RED_COLOR).lineWidth(2).stroke();
      doc.moveDown();

      const invoice = payment.invoice;
      const customer = invoice?.customer || { name: '', company: '', address: '', email: '', phone: '' };
      const currency = invoice?.currency || 'USD';

      const leftColumnX = 50;
      const rightColumnX = 320;
      const infoStartY = doc.y;

      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, infoStartY);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(COMPANY.name, leftColumnX, doc.y + 5);
      doc.fillColor(LIGHT_GRAY).font('Helvetica')
        .text(COMPANY.address, leftColumnX)
        .text(`TIN: ${COMPANY.tin}`, leftColumnX)
        .text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX)
        .text(COMPANY.email, leftColumnX)
        .text(COMPANY.website, leftColumnX);

      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('RECEIVED FROM:', rightColumnX, infoStartY);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(customer.name, rightColumnX, doc.y + 5);
      doc.fillColor(LIGHT_GRAY).font('Helvetica');
      if (customer.company) doc.text(customer.company, rightColumnX);
      if (customer.address) doc.text(customer.address, rightColumnX);
      if (customer.email) doc.text(customer.email, rightColumnX);
      if (customer.phone) doc.text(customer.phone, rightColumnX);

      doc.moveDown(3);

      doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Payment details');
      doc.moveDown(0.5);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
        .text(`Date: ${new Date(payment.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`)
        .text(`Invoice: #${invoice?.invoiceNumber || '-'}`)
        .text(`Amount: ${formatAmount(Number(payment.amount), currency)}`)
        .text(`Method: ${(payment.method || '').replace(/_/g, ' ')}`);
      if (payment.reference) {
        doc.text(`Reference: ${payment.reference}`);
      }

      doc.moveDown(2);
      doc.fillColor(RED_COLOR).fontSize(14).font('Helvetica-Bold')
        .text(`Amount Received: ${formatAmount(Number(payment.amount), currency)}`);

      doc.moveDown(3);
      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica')
        .text('Thank you for your payment!', 50, doc.page.height - 28, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
