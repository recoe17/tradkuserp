import PDFDocument from 'pdfkit';
import { COMPANY } from './company';
import { formatAmount } from './currency';

const RED_COLOR = '#DC2626';
const DARK_GRAY = '#374151';
const LIGHT_GRAY = '#6B7280';
const NO_BREAK = { lineBreak: false } as const;

function truncateText(text: string, maxLen: number): string {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text.replace(/\r\n/g, '\n').trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + '...' : cleaned;
}

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
      const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });
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

      // Quotation Title - fixed positions only
      const titleY = 90;
      doc.fillColor(RED_COLOR).fontSize(28).font('Helvetica-Bold')
        .text('QUOTATION', 300, titleY, { width: 250, align: 'right', ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(`#${quotation.quotationNumber}`, 300, titleY + 32, { width: 250, align: 'right', ...NO_BREAK });

      // Red divider line
      const dividerY = 140;
      doc.moveTo(50, dividerY).lineTo(doc.page.width - 50, dividerY).strokeColor(RED_COLOR).lineWidth(2).stroke();

      // Two-column layout - fixed Y positions
      const leftColumnX = 50;
      const rightColumnX = 320;
      const infoStartY = 155;

      // Company Info (Left) - fixed Y, no flow
      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, infoStartY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), leftColumnX, infoStartY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(truncateText(COMPANY.address, 80), leftColumnX, infoStartY + 28, { width: 250, height: 28, ellipsis: true });
      doc.text(`TIN: ${COMPANY.tin}`, leftColumnX, infoStartY + 48, NO_BREAK);
      doc.text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX, infoStartY + 60, NO_BREAK);
      doc.text(COMPANY.email, leftColumnX, infoStartY + 72, { width: 250, ...NO_BREAK });
      doc.text(COMPANY.website, leftColumnX, infoStartY + 84, { width: 250, ...NO_BREAK });

      // Customer Info (Right)
      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('TO:', rightColumnX, infoStartY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(truncateText(quotation.customer?.name || '', 60), rightColumnX, infoStartY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica');
      const cust = quotation.customer || {};
      doc.text(truncateText(cust.company || '', 60), rightColumnX, infoStartY + 28, { width: 250, ...NO_BREAK });
      doc.text(truncateText(cust.address || '', 80), rightColumnX, infoStartY + 42, { width: 250, height: 28, ellipsis: true });
      doc.text(truncateText(cust.email || '', 60), rightColumnX, infoStartY + 62, { width: 250, ...NO_BREAK });
      doc.text(truncateText(cust.phone || '', 40), rightColumnX, infoStartY + 74, { width: 250, ...NO_BREAK });

      // Date info box
      const dateBoxY = 265;
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

      // Items Table Header
      const tableTop = 340;
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
        doc.text(truncateText(String(item.description || ''), 120), 60, itemY, { width: 280, height: 20, ellipsis: true });
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

      // Notes and Terms - fixed Y to avoid flow
      const notesStartY = itemY + 110;
      if (quotation.notes) {
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Notes:', 50, notesStartY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
          .text(truncateText(quotation.notes, 800), 50, notesStartY + 14, { width: 500, height: 70 });
      }
      const termsY = quotation.notes ? notesStartY + 90 : notesStartY;
      if (quotation.terms) {
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Terms & Conditions:', 50, termsY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
          .text(truncateText(quotation.terms, 1000), 50, termsY + 14, { width: 500, height: 80 });
      }

      // Bank Details - fixed Y
      const bankYStart = quotation.terms ? termsY + 100 : termsY + 10;
      const bankBoxHeight = COMPANY.banks.length * 55 + 15;
      doc.rect(50, bankYStart, doc.page.width - 100, bankBoxHeight).strokeColor('#E5E7EB').lineWidth(1).stroke();
      let bankY = bankYStart + 10;
      COMPANY.banks.forEach((bank) => {
        doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold').text(`Bank Details (${bank.title})`, 60, bankY);
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
          .text(`Bank: ${bank.name}`, 60, bankY + 14)
          .text(`Account Name: ${bank.accountName}`, 60, bankY + 26)
          .text(`Account Number: ${bank.accountNumber}`, 60, bankY + 38)
          .text(`Branch: ${bank.branch}`, 60, bankY + 50);
        bankY += 65;
      });

      // Footer - fixed position, no flow
      const pageHeight = 842;
      doc.rect(0, pageHeight - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica')
        .text('Thank you for your business!', 50, pageHeight - 28, { width: doc.page.width - 100, align: 'center', ...NO_BREAK });

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
      const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });
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

      // Invoice Title - fixed positions
      const invTitleY = 90;
      doc.fillColor(RED_COLOR).fontSize(28).font('Helvetica-Bold')
        .text('INVOICE', 300, invTitleY, { width: 250, align: 'right', ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(`#${invoice.invoiceNumber}`, 300, invTitleY + 32, { width: 250, align: 'right', ...NO_BREAK });
      
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
        .text(invoice.status.toUpperCase(), 300, invTitleY + 48, { width: 250, align: 'right', ...NO_BREAK });

      // Red divider line
      doc.moveTo(50, 155).lineTo(doc.page.width - 50, 155).strokeColor(RED_COLOR).lineWidth(2).stroke();

      // Two-column layout - fixed Y
      const leftColumnX = 50;
      const rightColumnX = 320;
      const invInfoY = 165;

      // Company Info (Left)
      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, invInfoY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), leftColumnX, invInfoY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(truncateText(COMPANY.address, 80), leftColumnX, invInfoY + 28, { width: 250, height: 28, ellipsis: true });
      doc.text(`TIN: ${COMPANY.tin}`, leftColumnX, invInfoY + 48, NO_BREAK);
      doc.text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX, invInfoY + 60, NO_BREAK);
      doc.text(COMPANY.email, leftColumnX, invInfoY + 72, { width: 250, ...NO_BREAK });
      doc.text(COMPANY.website, leftColumnX, invInfoY + 84, { width: 250, ...NO_BREAK });

      // Customer Info (Right)
      const invCust = invoice.customer || {};
      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('TO:', rightColumnX, invInfoY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(truncateText(invCust.name || '', 60), rightColumnX, invInfoY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica');
      doc.text(truncateText(invCust.company || '', 60), rightColumnX, invInfoY + 28, { width: 250, ...NO_BREAK });
      doc.text(truncateText(invCust.address || '', 80), rightColumnX, invInfoY + 42, { width: 250, height: 28, ellipsis: true });
      doc.text(truncateText(invCust.email || '', 60), rightColumnX, invInfoY + 62, { width: 250, ...NO_BREAK });
      doc.text(truncateText(invCust.phone || '', 40), rightColumnX, invInfoY + 74, { width: 250, ...NO_BREAK });

      // Date info box
      const dateBoxY = 265;
      doc.rect(rightColumnX, dateBoxY, 180, 60).fillColor('#FEF2F2').fill();
      doc.fillColor(RED_COLOR).fontSize(9).font('Helvetica-Bold')
        .text('Issue Date:', rightColumnX + 10, dateBoxY + 10);
      doc.fillColor(DARK_GRAY).font('Helvetica')
        .text(new Date(invoice.issueDate).toLocaleDateString(), rightColumnX + 70, dateBoxY + 10);
      
      doc.fillColor(RED_COLOR).font('Helvetica-Bold')
        .text('Due Date:', rightColumnX + 10, dateBoxY + 25);
      doc.fillColor(DARK_GRAY).font('Helvetica')
        .text(new Date(invoice.dueDate).toLocaleDateString(), rightColumnX + 70, dateBoxY + 25);

      // Items Table Header
      const invTableTop = 340;
      doc.rect(50, invTableTop, doc.page.width - 100, 25).fillColor(RED_COLOR).fill();
      
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
      doc.text('Description', 60, invTableTop + 8);
      doc.text('Qty', 350, invTableTop + 8);
      doc.text('Unit Price', 400, invTableTop + 8);
      doc.text('Total', 480, invTableTop + 8);

      // Items
      let invItemY = invTableTop + 30;
      const items = Array.isArray(invoice.items) ? invoice.items : [];
      
      items.forEach((item: any, index: number) => {
        if (index % 2 === 0) {
          doc.rect(50, invItemY - 5, doc.page.width - 100, 25).fillColor('#F9FAFB').fill();
        }
        
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica');
        doc.text(truncateText(String(item.description || ''), 120), 60, invItemY, { width: 280, height: 20, ellipsis: true });
        doc.text(String(item.quantity || 0), 350, invItemY);
        doc.text(formatAmount(Number(item.unitPrice || 0), invoice.currency || 'USD'), 400, invItemY);
        doc.text(formatAmount(Number(item.quantity * item.unitPrice || 0), invoice.currency || 'USD'), 480, invItemY);
        invItemY += 25;
      });

      // Totals section
      doc.y = invItemY + 20;
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

      // Payment History - fixed Y, no flow (max 5 payments shown)
      const payHistY = invItemY + 145;
      if (invoice.payments && invoice.payments.length > 0) {
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Payment History:', 50, payHistY, NO_BREAK);
        invoice.payments.slice(0, 5).forEach((payment: any, i: number) => {
          doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
            .text(`${new Date(payment.paidAt).toLocaleDateString()} - ${formatAmount(Number(payment.amount), invoice.currency || 'USD')} (${payment.method})`, 50, payHistY + 16 + i * 14, { width: 500, ...NO_BREAK });
        });
      }

      // Notes and Terms - fixed Y
      const invNotesY = payHistY + (invoice.payments?.length ? Math.min(invoice.payments.length, 5) * 18 + 25 : 10);
      if (invoice.notes) {
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Notes:', 50, invNotesY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
          .text(truncateText(invoice.notes, 800), 50, invNotesY + 14, { width: 500, height: 60 });
      }
      const invTermsY = invoice.notes ? invNotesY + 80 : invNotesY;
      if (invoice.terms) {
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Terms & Conditions:', 50, invTermsY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
          .text(truncateText(invoice.terms, 1000), 50, invTermsY + 14, { width: 500, height: 70 });
      }

      // Footer
      const invPageH = 842;
      doc.rect(0, invPageH - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica')
        .text('Thank you for your business!', 50, invPageH - 28, { width: doc.page.width - 100, align: 'center', ...NO_BREAK });

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
      const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });
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

      doc.fillColor(RED_COLOR).fontSize(28).font('Helvetica-Bold')
        .text('RECEIPT', 300, 90, { width: 250, align: 'right', ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(`#${payment.id.slice(-8).toUpperCase()}`, 300, 122, { width: 250, align: 'right', ...NO_BREAK });

      doc.moveTo(50, 155).lineTo(doc.page.width - 50, 155).strokeColor(RED_COLOR).lineWidth(2).stroke();

      const invoice = payment.invoice;
      const customer = invoice?.customer || { name: '', company: '', address: '', email: '', phone: '' };
      const currency = invoice?.currency || 'USD';

      const leftColumnX = 50;
      const rightColumnX = 320;
      const recInfoY = 165;

      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, recInfoY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), leftColumnX, recInfoY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica')
        .text(truncateText(COMPANY.address, 80), leftColumnX, recInfoY + 28, { width: 250, ...NO_BREAK })
        .text(`TIN: ${COMPANY.tin}`, leftColumnX, recInfoY + 42, NO_BREAK)
        .text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX, recInfoY + 54, NO_BREAK)
        .text(COMPANY.email, leftColumnX, recInfoY + 66, { width: 250, ...NO_BREAK })
        .text(COMPANY.website, leftColumnX, recInfoY + 78, { width: 250, ...NO_BREAK });

      doc.fillColor(RED_COLOR).fontSize(10).font('Helvetica-Bold')
        .text('RECEIVED FROM:', rightColumnX, recInfoY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica-Bold')
        .text(truncateText(customer.name, 60), rightColumnX, recInfoY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica');
      doc.text(truncateText(customer.company || '', 60), rightColumnX, recInfoY + 28, { width: 250, ...NO_BREAK });
      doc.text(truncateText(customer.address || '', 80), rightColumnX, recInfoY + 42, { width: 250, ...NO_BREAK });
      doc.text(truncateText(customer.email || '', 60), rightColumnX, recInfoY + 56, { width: 250, ...NO_BREAK });
      doc.text(truncateText(customer.phone || '', 40), rightColumnX, recInfoY + 70, { width: 250, ...NO_BREAK });

      const recDetailY = 275;
      doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('Payment details', 50, recDetailY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(10).font('Helvetica')
        .text(`Date: ${new Date(payment.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 50, recDetailY + 18, NO_BREAK)
        .text(`Invoice: #${invoice?.invoiceNumber || '-'}`, 50, recDetailY + 32, NO_BREAK)
        .text(`Amount: ${formatAmount(Number(payment.amount), currency)}`, 50, recDetailY + 46, NO_BREAK)
        .text(`Method: ${(payment.method || '').replace(/_/g, ' ')}`, 50, recDetailY + 60, NO_BREAK);
      if (payment.reference) {
        doc.text(`Reference: ${payment.reference}`, 50, recDetailY + 74, NO_BREAK);
      }

      doc.fillColor(RED_COLOR).fontSize(14).font('Helvetica-Bold')
        .text(`Amount Received: ${formatAmount(Number(payment.amount), currency)}`, 50, recDetailY + 110, NO_BREAK);

      const recPageH = 842;
      doc.rect(0, recPageH - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica')
        .text('Thank you for your payment!', 50, recPageH - 28, { width: doc.page.width - 100, align: 'center', ...NO_BREAK });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
