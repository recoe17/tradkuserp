import PDFDocument from 'pdfkit';
import { COMPANY } from './company';
import { formatAmount } from './currency';

const RED_COLOR = '#DC2626';
const DARK_GRAY = '#374151';
const LIGHT_GRAY = '#6B7280';
const NO_BREAK = { lineBreak: false } as const;
// Smaller font sizes to fit on one page
const F = { title: 20, sub: 8, body: 8, small: 7 } as const;

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
      
      // Logo and Company Header - no moveDown to avoid cursor/flow
      if (logoBuffer) {
        doc.image(logoBuffer, 50, 20, { width: 120, height: 40 });
      } else {
        doc.fillColor(RED_COLOR).fontSize(18).font('Helvetica-Bold')
          .text('MAXVOLT', 50, 25, { continued: true })
          .fillColor(DARK_GRAY).text(' ELECTRICAL');
        doc.fillColor(LIGHT_GRAY).fontSize(F.small).font('Helvetica')
          .text('The best way to power up', 50, 48, NO_BREAK);
      }

      // Quotation Title - fixed positions only
      const titleY = 90;
      doc.fillColor(RED_COLOR).fontSize(F.title).font('Helvetica-Bold')
        .text('QUOTATION', 50, titleY, { width: 500, align: 'right', ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.sub).font('Helvetica')
        .text(`#${quotation.quotationNumber}`, 50, titleY + 24, { width: 500, align: 'right', ...NO_BREAK });

      // Red divider line
      const dividerY = 140;
      doc.moveTo(50, dividerY).lineTo(doc.page.width - 50, dividerY).strokeColor(RED_COLOR).lineWidth(2).stroke();

      // Two-column layout - fixed Y positions
      const leftColumnX = 50;
      const rightColumnX = 320;
      const infoStartY = 155;

      // Company Info (Left) - fixed Y, no flow
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, infoStartY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), leftColumnX, infoStartY + 12, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
        .text(truncateText(COMPANY.address, 45), leftColumnX, infoStartY + 24, { width: 250, ...NO_BREAK });
      doc.text(`TIN: ${COMPANY.tin}`, leftColumnX, infoStartY + 38, NO_BREAK);
      doc.text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX, infoStartY + 48, NO_BREAK);
      doc.text(COMPANY.email, leftColumnX, infoStartY + 58, { width: 250, ...NO_BREAK });
      doc.text(COMPANY.website, leftColumnX, infoStartY + 68, { width: 250, ...NO_BREAK });

      // Customer Info (Right)
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('TO:', rightColumnX, infoStartY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(quotation.customer?.name || '', 60), rightColumnX, infoStartY + 12, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica');
      const cust = quotation.customer || {};
      doc.text(truncateText(cust.company || '', 60), rightColumnX, infoStartY + 24, { width: 250, ...NO_BREAK });
      doc.text(truncateText(cust.address || '', 45), rightColumnX, infoStartY + 36, { width: 250, ...NO_BREAK });
      doc.text(truncateText(cust.email || '', 60), rightColumnX, infoStartY + 48, { width: 250, ...NO_BREAK });
      doc.text(truncateText(cust.phone || '', 40), rightColumnX, infoStartY + 58, { width: 250, ...NO_BREAK });
      if (cust.tin) doc.text(`TIN: ${cust.tin}`, rightColumnX, infoStartY + 70, { width: 250, ...NO_BREAK });
      if (cust.vat) doc.text(`VAT: ${cust.vat}`, rightColumnX, infoStartY + 82, { width: 250, ...NO_BREAK });

      // Date info box
      const dateBoxY = 265;
      doc.rect(rightColumnX, dateBoxY, 180, 60).fillColor('#FEF2F2').fill();
      doc.fillColor(RED_COLOR).fontSize(F.small).font('Helvetica-Bold')
        .text('Date:', rightColumnX + 10, dateBoxY + 10, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
        .text(new Date(quotation.createdAt).toLocaleDateString(), rightColumnX + 60, dateBoxY + 10, NO_BREAK);
      
      if (quotation.validUntil) {
        doc.fillColor(RED_COLOR).fontSize(F.small).font('Helvetica-Bold')
          .text('Valid Until:', rightColumnX + 10, dateBoxY + 25, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
          .text(new Date(quotation.validUntil).toLocaleDateString(), rightColumnX + 60, dateBoxY + 25, NO_BREAK);
      }

      // Items Table Header
      const tableTop = 300;
      doc.rect(50, tableTop, doc.page.width - 100, 20).fillColor(RED_COLOR).fill();
      
      doc.fillColor('#FFFFFF').fontSize(F.body).font('Helvetica-Bold');
      doc.text('Description', 60, tableTop + 6, NO_BREAK);
      doc.text('Qty', 350, tableTop + 8, NO_BREAK);
      doc.text('Unit Price', 400, tableTop + 8, NO_BREAK);
      doc.text('Total', 480, tableTop + 8, NO_BREAK);

      // Items (cap count so everything fits on one page)
      let itemY = tableTop + 24;
      const items = Array.isArray(quotation.items) ? quotation.items : [];
      const maxItemsToShow = 6;
      const itemsToShow = items.slice(0, maxItemsToShow);
      const remainingItems = items.length - itemsToShow.length;
      
      itemsToShow.forEach((item: any, index: number) => {
        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(50, itemY - 4, doc.page.width - 100, 20).fillColor('#F9FAFB').fill();
        }
        
        doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica');
        doc.text(truncateText(String(item.description || ''), 60), 60, itemY, { width: 280, ...NO_BREAK });
        doc.text(String(item.quantity || 0), 350, itemY, NO_BREAK);
        doc.text(formatAmount(Number(item.unitPrice || 0), quotation.currency || 'USD'), 400, itemY, NO_BREAK);
        doc.text(formatAmount(Number(item.quantity * item.unitPrice || 0), quotation.currency || 'USD'), 480, itemY, NO_BREAK);
        itemY += 20;
      });

      if (remainingItems > 0) {
        // Summary row for extra items
        doc.rect(50, itemY - 4, doc.page.width - 100, 20).fillColor('#F3F4F6').fill();
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica-Oblique');
        doc.text(`+ ${remainingItems} more item(s)`, 60, itemY, { width: 380, ...NO_BREAK });
        itemY += 20;
      }

      // Totals section - fixed top
      const totalsTopY = 500;
      const totalsX = 380;
      
      // Totals box
      doc.rect(totalsX - 10, totalsTopY - 5, 180, 80).fillColor('#FEF2F2').fill();
      
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
        .text('Subtotal:', totalsX, totalsTopY, NO_BREAK);
      doc.fillColor(DARK_GRAY)
        .text(formatAmount(Number(quotation.subtotal), quotation.currency || 'USD'), 480, totalsTopY, NO_BREAK);
      
      let totalsLineY = totalsTopY + 14;
      if (Number(quotation.tax) > 0) {
        doc.fillColor(LIGHT_GRAY).text('VAT (15.5%):', totalsX, totalsLineY, NO_BREAK);
        doc.fillColor(DARK_GRAY).text(formatAmount(Number(quotation.tax), quotation.currency || 'USD'), 480, totalsLineY, NO_BREAK);
        totalsLineY += 14;
      }
      
      if (Number(quotation.discount) > 0) {
        doc.fillColor(LIGHT_GRAY).text('Discount:', totalsX, totalsLineY, NO_BREAK);
        doc.fillColor('#16A34A').text(`-${formatAmount(Number(quotation.discount), quotation.currency || 'USD')}`, 480, totalsLineY, NO_BREAK);
        totalsLineY += 14;
      }
      
      doc.moveTo(totalsX, totalsTopY + 50).lineTo(550, totalsTopY + 50).strokeColor(RED_COLOR).lineWidth(1).stroke();
      
      doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold')
        .text('TOTAL:', totalsX, totalsTopY + 60, NO_BREAK);
      doc.fillColor(RED_COLOR)
        .text(formatAmount(Number(quotation.total), quotation.currency || 'USD'), 470, totalsTopY + 60, NO_BREAK);

      // Notes and Terms - NO wrapping: lineBreak false + truncate so no overflow
      const notesStartY = 580;
      if (quotation.notes) {
        doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold').text('Notes:', 50, notesStartY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
          .text(truncateText(quotation.notes, 100), 50, notesStartY + 12, { width: 500, ...NO_BREAK });
      }
      const termsY = quotation.notes ? notesStartY + 28 : notesStartY;
      if (quotation.terms) {
        doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold').text('Terms:', 50, termsY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
          .text(truncateText(quotation.terms, 100), 50, termsY + 12, { width: 500, ...NO_BREAK });
      }

      // Bank Details - fixed Y and limited height
      const bankYStart = 720;
      const banksToShow = COMPANY.banks.slice(0, 1);
      const bankBoxHeight = banksToShow.length * 40 + 15;
      doc.rect(50, bankYStart, doc.page.width - 100, bankBoxHeight).strokeColor('#E5E7EB').lineWidth(1).stroke();
      let bankY = bankYStart + 10;
      banksToShow.forEach((bank) => {
        doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
          .text(`Bank Details (${bank.title})`, 60, bankY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
          .text(`Bank: ${bank.name}`, 60, bankY + 12, { width: 250, ...NO_BREAK })
          .text(`Acc: ${bank.accountNumber}`, 60, bankY + 24, { width: 250, ...NO_BREAK });
        bankY += 40;
      });

      // Footer - fixed position, no flow
      const pageHeight = 842;
      doc.rect(0, pageHeight - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(F.body).font('Helvetica')
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
        doc.fillColor(RED_COLOR).fontSize(18).font('Helvetica-Bold')
          .text('MAXVOLT', 50, 25, { continued: true })
          .fillColor(DARK_GRAY).text(' ELECTRICAL');
        doc.fillColor(LIGHT_GRAY).fontSize(F.small).font('Helvetica')
          .text('The best way to power up', 50, 48);
        doc.moveDown(2);
      }

      // Invoice Title - fixed positions
      const invTitleY = 90;
      doc.fillColor(RED_COLOR).fontSize(F.title).font('Helvetica-Bold')
        .text('INVOICE', 300, invTitleY, { width: 250, align: 'right', ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.sub).font('Helvetica')
        .text(`#${invoice.invoiceNumber}`, 300, invTitleY + 28, { width: 250, align: 'right', ...NO_BREAK });
      
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
      doc.fillColor(statusColor).fontSize(F.body).font('Helvetica-Bold')
        .text(invoice.status.toUpperCase(), 300, invTitleY + 44, { width: 250, align: 'right', ...NO_BREAK });

      // Red divider line
      doc.moveTo(50, 155).lineTo(doc.page.width - 50, 155).strokeColor(RED_COLOR).lineWidth(2).stroke();

      // Two-column layout - fixed Y
      const leftColumnX = 50;
      const rightColumnX = 320;
      const invInfoY = 165;

      // Company Info (Left)
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, invInfoY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), leftColumnX, invInfoY + 12, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
        .text(truncateText(COMPANY.address, 45), leftColumnX, invInfoY + 28, { width: 250, ...NO_BREAK });
      doc.text(`TIN: ${COMPANY.tin}`, leftColumnX, invInfoY + 48, NO_BREAK);
      doc.text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX, invInfoY + 60, NO_BREAK);
      doc.text(COMPANY.email, leftColumnX, invInfoY + 72, { width: 250, ...NO_BREAK });
      doc.text(COMPANY.website, leftColumnX, invInfoY + 84, { width: 250, ...NO_BREAK });

      // Customer Info (Right)
      const invCust = invoice.customer || {};
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('TO:', rightColumnX, invInfoY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(invCust.name || '', 60), rightColumnX, invInfoY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica');
      doc.text(truncateText(invCust.company || '', 60), rightColumnX, invInfoY + 24, { width: 250, ...NO_BREAK });
      doc.text(truncateText(invCust.address || '', 45), rightColumnX, invInfoY + 42, { width: 250, ...NO_BREAK });
      doc.text(truncateText(invCust.email || '', 60), rightColumnX, invInfoY + 62, { width: 250, ...NO_BREAK });
      doc.text(truncateText(invCust.phone || '', 40), rightColumnX, invInfoY + 74, { width: 250, ...NO_BREAK });
      if (invCust.tin) doc.text(`TIN: ${invCust.tin}`, rightColumnX, invInfoY + 86, { width: 250, ...NO_BREAK });
      if (invCust.vat) doc.text(`VAT: ${invCust.vat}`, rightColumnX, invInfoY + 98, { width: 250, ...NO_BREAK });

      // Date info box
      const dateBoxY = 265;
      doc.rect(rightColumnX, dateBoxY, 180, 60).fillColor('#FEF2F2').fill();
      doc.fillColor(RED_COLOR).fontSize(F.small).font('Helvetica-Bold')
        .text('Issue Date:', rightColumnX + 10, dateBoxY + 10);
      doc.fillColor(DARK_GRAY).font('Helvetica')
        .text(new Date(invoice.issueDate).toLocaleDateString(), rightColumnX + 70, dateBoxY + 10);
      
      doc.fillColor(RED_COLOR).fontSize(F.small).font('Helvetica-Bold')
        .text('Due Date:', rightColumnX + 10, dateBoxY + 25);
      doc.fillColor(DARK_GRAY).font('Helvetica')
        .text(new Date(invoice.dueDate).toLocaleDateString(), rightColumnX + 70, dateBoxY + 25);

      // Items Table Header
      const invTableTop = 300;
      doc.rect(50, invTableTop, doc.page.width - 100, 20).fillColor(RED_COLOR).fill();
      
      doc.fillColor('#FFFFFF').fontSize(F.body).font('Helvetica-Bold');
      doc.text('Description', 60, invTableTop + 6);
      doc.text('Qty', 350, invTableTop + 8);
      doc.text('Unit Price', 400, invTableTop + 8);
      doc.text('Total', 480, invTableTop + 8);
      
      // Items (cap count so everything fits on one page)
      let invItemY = invTableTop + 24;
      const items = Array.isArray(invoice.items) ? invoice.items : [];
      const invMaxItemsToShow = 6;
      const invItemsToShow = items.slice(0, invMaxItemsToShow);
      const invRemainingItems = items.length - invItemsToShow.length;
      
      invItemsToShow.forEach((item: any, index: number) => {
        if (index % 2 === 0) {
          doc.rect(50, invItemY - 4, doc.page.width - 100, 20).fillColor('#F9FAFB').fill();
        }
        
        doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica');
        doc.text(truncateText(String(item.description || ''), 120), 60, invItemY, { width: 280, height: 18, ellipsis: true });
        doc.text(String(item.quantity || 0), 350, invItemY);
        doc.text(formatAmount(Number(item.unitPrice || 0), invoice.currency || 'USD'), 400, invItemY);
        doc.text(formatAmount(Number(item.quantity * item.unitPrice || 0), invoice.currency || 'USD'), 480, invItemY);
        invItemY += 20;
      });

      if (invRemainingItems > 0) {
        doc.rect(50, invItemY - 4, doc.page.width - 100, 20).fillColor('#F3F4F6').fill();
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica-Oblique');
        doc.text(`+ ${invRemainingItems} more item(s)`, 60, invItemY, { width: 380, ...NO_BREAK });
        invItemY += 20;
      }

      // Totals section - fixed top
      const invTotalsTopY = 500;
      const totalsX = 380;
      
      doc.rect(totalsX - 10, invTotalsTopY - 5, 180, 110).fillColor('#FEF2F2').fill();
      
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
        .text('Subtotal:', totalsX, invTotalsTopY);
      doc.fillColor(DARK_GRAY)
        .text(formatAmount(Number(invoice.subtotal), invoice.currency || 'USD'), 480, invTotalsTopY);
      
      let invTotalsLineY = invTotalsTopY + 14;
      if (Number(invoice.tax) > 0) {
        doc.fillColor(LIGHT_GRAY).text('VAT (15.5%):', totalsX, invTotalsLineY);
        doc.fillColor(DARK_GRAY).text(formatAmount(Number(invoice.tax), invoice.currency || 'USD'), 480, invTotalsLineY);
        invTotalsLineY += 14;
      }
      
      if (Number(invoice.discount) > 0) {
        doc.fillColor(LIGHT_GRAY).text('Discount:', totalsX, invTotalsLineY);
        doc.fillColor('#16A34A').text(`-${formatAmount(Number(invoice.discount), invoice.currency || 'USD')}`, 480, invTotalsLineY);
        invTotalsLineY += 14;
      }
      
      doc.moveTo(totalsX, invTotalsTopY + 60).lineTo(550, invTotalsTopY + 60).strokeColor(RED_COLOR).lineWidth(1).stroke();
      
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text('Total:', totalsX, invTotalsTopY + 70);
      doc.text(formatAmount(Number(invoice.total), invoice.currency || 'USD'), 480, invTotalsTopY + 70);

      doc.fillColor('#16A34A').text('Paid:', totalsX, invTotalsTopY + 84);
      doc.text(formatAmount(Number(invoice.paidAmount), invoice.currency || 'USD'), 480, invTotalsTopY + 84);

      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('Balance Due:', totalsX, invTotalsTopY + 98);
      doc.text(formatAmount(Number(invoice.balance), invoice.currency || 'USD'), 470, invTotalsTopY + 98);

      // Payment History - fixed Y, no flow (max 5 payments shown)
      const payHistY = 580;
      if (invoice.payments && invoice.payments.length > 0) {
        doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold').text('Payment History:', 50, payHistY, NO_BREAK);
        invoice.payments.slice(0, 5).forEach((payment: any, i: number) => {
          doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
            .text(`${new Date(payment.paidAt).toLocaleDateString()} - ${formatAmount(Number(payment.amount), invoice.currency || 'USD')} (${payment.method})`, 50, payHistY + 16 + i * 14, { width: 500, ...NO_BREAK });
        });
      }

      // Notes and Terms - fixed Y
      const invNotesY = 640;
      if (invoice.notes) {
        doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold').text('Notes:', 50, invNotesY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
          .text(truncateText(invoice.notes, 800), 50, invNotesY + 14, { width: 500, height: 60 });
      }
      const invTermsY = invoice.notes ? invNotesY + 80 : invNotesY;
      if (invoice.terms) {
        doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold').text('Terms:', 50, invTermsY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
          .text(truncateText(invoice.terms, 1000), 50, invTermsY + 14, { width: 500, height: 70 });
      }

      // Footer
      const invPageH = 842;
      doc.rect(0, invPageH - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(F.body).font('Helvetica')
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
        doc.fillColor(RED_COLOR).fontSize(18).font('Helvetica-Bold')
          .text('MAXVOLT', 50, 25, { continued: true })
          .fillColor(DARK_GRAY).text(' ELECTRICAL');
        doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
          .text('The best way to power up', 50, 52);
        doc.moveDown(2);
      }

      doc.fillColor(RED_COLOR).fontSize(F.title).font('Helvetica-Bold')
        .text('RECEIPT', 300, 90, { width: 250, align: 'right', ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.sub).font('Helvetica')
        .text(`#${payment.id.slice(-8).toUpperCase()}`, 300, 122, { width: 250, align: 'right', ...NO_BREAK });

      doc.moveTo(50, 155).lineTo(doc.page.width - 50, 155).strokeColor(RED_COLOR).lineWidth(2).stroke();

      const invoice = payment.invoice;
      const customer = invoice?.customer || { name: '', company: '', address: '', email: '', phone: '' };
      const currency = invoice?.currency || 'USD';

      const leftColumnX = 50;
      const rightColumnX = 320;
      const recInfoY = 165;

      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, recInfoY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), leftColumnX, recInfoY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
        .text(truncateText(COMPANY.address, 45), leftColumnX, recInfoY + 28, { width: 250, ...NO_BREAK })
        .text(`TIN: ${COMPANY.tin}`, leftColumnX, recInfoY + 42, NO_BREAK)
        .text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX, recInfoY + 54, NO_BREAK)
        .text(COMPANY.email, leftColumnX, recInfoY + 66, { width: 250, ...NO_BREAK })
        .text(COMPANY.website, leftColumnX, recInfoY + 78, { width: 250, ...NO_BREAK });

      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('RECEIVED FROM:', rightColumnX, recInfoY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(customer.name, 60), rightColumnX, recInfoY + 14, { width: 250, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica');
      doc.text(truncateText(customer.company || '', 60), rightColumnX, recInfoY + 28, { width: 250, ...NO_BREAK });
      doc.text(truncateText(customer.address || '', 45), rightColumnX, recInfoY + 42, { width: 250, ...NO_BREAK });
      doc.text(truncateText(customer.email || '', 60), rightColumnX, recInfoY + 56, { width: 250, ...NO_BREAK });
      doc.text(truncateText(customer.phone || '', 40), rightColumnX, recInfoY + 70, { width: 250, ...NO_BREAK });
      if (customer.tin) doc.text(`TIN: ${customer.tin}`, rightColumnX, recInfoY + 84, { width: 250, ...NO_BREAK });
      if (customer.vat) doc.text(`VAT: ${customer.vat}`, rightColumnX, recInfoY + 96, { width: 250, ...NO_BREAK });

      const recDetailY = 290;
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold').text('Payment details', 50, recDetailY, NO_BREAK);
      doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
        .text(`Date: ${new Date(payment.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 50, recDetailY + 18, NO_BREAK)
        .text(`Invoice: #${invoice?.invoiceNumber || '-'}`, 50, recDetailY + 32, NO_BREAK)
        .text(`Amount: ${formatAmount(Number(payment.amount), currency)}`, 50, recDetailY + 46, NO_BREAK)
        .text(`Method: ${(payment.method || '').replace(/_/g, ' ')}`, 50, recDetailY + 60, NO_BREAK);
      if (payment.reference) {
        doc.text(`Reference: ${payment.reference}`, 50, recDetailY + 74, NO_BREAK);
      }

      doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold')
        .text(`Amount Received: ${formatAmount(Number(payment.amount), currency)}`, 50, recDetailY + 110, NO_BREAK);

      const recPageH = 842;
      doc.rect(0, recPageH - 40, doc.page.width, 40).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(F.body).font('Helvetica')
        .text('Thank you for your payment!', 50, recPageH - 28, { width: doc.page.width - 100, align: 'center', ...NO_BREAK });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
