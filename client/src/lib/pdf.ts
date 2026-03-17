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

      // Two-column layout - equal width, aligned left and right
      const colWidth = 252;
      const leftColumnX = 50;
      const rightColumnX = 50 + colWidth + 16;
      const infoStartY = 155;

      const lineH = 10; // compact line height so TIN/VAT stay visible
      // Company Info (Left) - all lines use colWidth for aligned right edge
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, infoStartY, { width: colWidth, ...NO_BREAK });
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), leftColumnX, infoStartY + lineH, { width: colWidth, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
        .text(truncateText(COMPANY.address, 45), leftColumnX, infoStartY + lineH * 2, { width: colWidth, ...NO_BREAK });
      doc.text(`TIN: ${COMPANY.tin}`, leftColumnX, infoStartY + lineH * 3, { width: colWidth, ...NO_BREAK });
      doc.text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX, infoStartY + lineH * 4, { width: colWidth, ...NO_BREAK });
      doc.text(COMPANY.email, leftColumnX, infoStartY + lineH * 5, { width: colWidth, ...NO_BREAK });
      doc.text(COMPANY.website, leftColumnX, infoStartY + lineH * 6, { width: colWidth, ...NO_BREAK });

      // Customer Info (Right) - always show all fields
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('TO:', rightColumnX, infoStartY, { width: colWidth, ...NO_BREAK });
      const cust = quotation.customer ?? {};
      const c = (v: any) => (v != null && String(v).trim()) ? String(v).trim() : '';
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(c(cust.name) || '—', 60), rightColumnX, infoStartY + lineH, { width: colWidth, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica');
      doc.text(truncateText(c(cust.company) || '—', 60), rightColumnX, infoStartY + lineH * 2, { width: colWidth, ...NO_BREAK });
      doc.text(truncateText(c(cust.address) || '—', 45), rightColumnX, infoStartY + lineH * 3, { width: colWidth, ...NO_BREAK });
      doc.text(truncateText(c(cust.email) || '—', 60), rightColumnX, infoStartY + lineH * 4, { width: colWidth, ...NO_BREAK });
      doc.text(truncateText(c(cust.phone) || '—', 40), rightColumnX, infoStartY + lineH * 5, { width: colWidth, ...NO_BREAK });
      doc.text(`TIN: ${c(cust.tin) || '—'}`, rightColumnX, infoStartY + lineH * 6, { width: colWidth, ...NO_BREAK });
      doc.text(`VAT: ${c(cust.vat) || '—'}`, rightColumnX, infoStartY + lineH * 7, { width: colWidth, ...NO_BREAK });

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

      // Items: fill page 1, then page 2, etc. Totals at end of items. Bank fixed at bottom.
      const items = Array.isArray(quotation.items) ? quotation.items : [];
      const rowHeight = 20;
      const pageHeight = 842;
      const footerHeight = 40;
      const banksToShow = COMPANY.banks;
      const bankBoxHeightCalc = banksToShow.length * 50 + 20;
      const bankYStart = pageHeight - footerHeight - bankBoxHeightCalc - 15;
      const itemsBottomLimit = 700;

      const drawTableHeader = (y: number) => {
        doc.rect(50, y, doc.page.width - 100, 20).fillColor(RED_COLOR).fill();
        doc.fillColor('#FFFFFF').fontSize(F.body).font('Helvetica-Bold');
        doc.text('Description', 60, y + 6, NO_BREAK);
        doc.text('Qty', 350, y + 8, NO_BREAK);
        doc.text('Unit Price', 400, y + 8, NO_BREAK);
        doc.text('Total', 480, y + 8, NO_BREAK);
      };

      let itemY = 324;
      let isFirstItemsPage = true;
      let rowIndex = 0;

      drawTableHeader(300);
      itemY += 24;

      items.forEach((item: any) => {
        if (itemY + rowHeight > itemsBottomLimit) {
          doc.addPage({ size: 'A4', margin: 50 });
          isFirstItemsPage = false;
          doc.fillColor(LIGHT_GRAY).fontSize(F.small).font('Helvetica').text('Items (continued)', 50, 55, NO_BREAK);
          itemY = 74;
          drawTableHeader(65);
          itemY += 24;
        }
        if (rowIndex % 2 === 0) {
          doc.rect(50, itemY - 4, doc.page.width - 100, 20).fillColor('#F9FAFB').fill();
        }
        doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica');
        doc.text(truncateText(String(item.description || ''), 60), 60, itemY, { width: 280, ...NO_BREAK });
        doc.text(String(item.quantity || 0), 350, itemY, NO_BREAK);
        doc.text(formatAmount(Number(item.unitPrice || 0), quotation.currency || 'USD'), 400, itemY, NO_BREAK);
        doc.text(formatAmount(Number(item.quantity * item.unitPrice || 0), quotation.currency || 'USD'), 480, itemY, NO_BREAK);
        itemY += rowHeight;
        rowIndex++;
      });

      // Totals at end of items; bank fixed at bottom
      const totalsX = 380;
      const totalsTopY = itemY + 30;
      const contentY = totalsTopY + 95 + (quotation.notes ? 45 : 0) + (quotation.terms ? 45 : 0);

      const drawSummary = (startY: number) => {
        doc.rect(totalsX - 10, startY - 5, 180, 80).fillColor('#FEF2F2').fill();
        doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica').text('Subtotal:', totalsX, startY, NO_BREAK);
        doc.fillColor(DARK_GRAY).text(formatAmount(Number(quotation.subtotal), quotation.currency || 'USD'), 480, startY, NO_BREAK);
        let ly = startY + 14;
        if (Number(quotation.tax) > 0) {
          doc.fillColor(LIGHT_GRAY).text('VAT (15.5%):', totalsX, ly, NO_BREAK);
          doc.fillColor(DARK_GRAY).text(formatAmount(Number(quotation.tax), quotation.currency || 'USD'), 480, ly, NO_BREAK);
          ly += 14;
        }
        if (Number(quotation.discount) > 0) {
          doc.fillColor(LIGHT_GRAY).text('Discount:', totalsX, ly, NO_BREAK);
          doc.fillColor('#16A34A').text(`-${formatAmount(Number(quotation.discount), quotation.currency || 'USD')}`, 480, ly, NO_BREAK);
        }
        doc.moveTo(totalsX, startY + 50).lineTo(550, startY + 50).strokeColor(RED_COLOR).lineWidth(1).stroke();
        doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold').text('TOTAL:', totalsX, startY + 60, NO_BREAK);
        doc.fillColor(RED_COLOR).text(formatAmount(Number(quotation.total), quotation.currency || 'USD'), 470, startY + 60, NO_BREAK);
        let cY = startY + 95;
        if (quotation.notes) {
          doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold').text('Notes:', 50, cY, NO_BREAK);
          doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica').text(truncateText(quotation.notes, 100), 50, cY + 12, { width: 500, ...NO_BREAK });
          cY += 45;
        }
        if (quotation.terms) {
          doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold').text('Terms:', 50, cY, NO_BREAK);
          doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica').text(truncateText(quotation.terms, 100), 50, cY + 12, { width: 500, ...NO_BREAK });
        }
      };

      // Add summary page only if totals+notes+terms don't fit above bank
      if (contentY > bankYStart - 20) {
        doc.addPage({ size: 'A4', margin: 50 });
        drawSummary(55);
      } else {
        drawSummary(totalsTopY);
      }

      // Bank details fixed at bottom
      doc.rect(50, bankYStart, doc.page.width - 100, bankBoxHeightCalc).strokeColor('#E5E7EB').lineWidth(1).stroke();
      let bankY = bankYStart + 12;
      banksToShow.forEach((bank: any) => {
        doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
          .text(`Bank Details (${bank.title})`, 60, bankY, NO_BREAK);
        doc.fillColor(DARK_GRAY).fontSize(F.small).font('Helvetica')
          .text(`Bank: ${bank.name}`, 60, bankY + 12, { width: 400, ...NO_BREAK })
          .text(`Acc: ${bank.accountNumber}`, 60, bankY + 24, { width: 400, ...NO_BREAK });
        bankY += 50;
      });

      // Footer - fixed at very bottom of page
      doc.rect(0, pageHeight - footerHeight, doc.page.width, footerHeight).fill(RED_COLOR);
      doc.fillColor('#FFFFFF').fontSize(F.body).font('Helvetica')
        .text('Thank you for your business!', 50, pageHeight - footerHeight + 12, { width: doc.page.width - 100, align: 'center', ...NO_BREAK });

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

      // Two-column layout - equal width, aligned left and right
      const invColWidth = 252;
      const invLeftX = 50;
      const rightColumnX = 50 + invColWidth + 16;
      const invInfoY = 165;

      const invLineH = 10; // compact line height so TIN/VAT stay visible
      // Company Info (Left) - all lines use invColWidth for aligned right edge
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('FROM:', invLeftX, invInfoY, { width: invColWidth, ...NO_BREAK });
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), invLeftX, invInfoY + invLineH, { width: invColWidth, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
        .text(truncateText(COMPANY.address, 45), invLeftX, invInfoY + invLineH * 2, { width: invColWidth, ...NO_BREAK });
      doc.text(`TIN: ${COMPANY.tin}`, invLeftX, invInfoY + invLineH * 3, { width: invColWidth, ...NO_BREAK });
      doc.text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, invLeftX, invInfoY + invLineH * 4, { width: invColWidth, ...NO_BREAK });
      doc.text(COMPANY.email, invLeftX, invInfoY + invLineH * 5, { width: invColWidth, ...NO_BREAK });
      doc.text(COMPANY.website, invLeftX, invInfoY + invLineH * 6, { width: invColWidth, ...NO_BREAK });

      // Customer Info (Right) - compact spacing so TIN/VAT visible
      const invCust = invoice.customer || {};
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('TO:', rightColumnX, invInfoY, { width: invColWidth, ...NO_BREAK });
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(invCust.name || '', 60), rightColumnX, invInfoY + invLineH, { width: invColWidth, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica');
      doc.text(truncateText(invCust.company || '', 60), rightColumnX, invInfoY + invLineH * 2, { width: invColWidth, ...NO_BREAK });
      doc.text(truncateText(invCust.address || '', 45), rightColumnX, invInfoY + invLineH * 3, { width: invColWidth, ...NO_BREAK });
      doc.text(truncateText(invCust.email || '', 60), rightColumnX, invInfoY + invLineH * 4, { width: invColWidth, ...NO_BREAK });
      doc.text(truncateText(invCust.phone || '', 40), rightColumnX, invInfoY + invLineH * 5, { width: invColWidth, ...NO_BREAK });
      if (invCust.tin) doc.text(`TIN: ${invCust.tin}`, rightColumnX, invInfoY + invLineH * 6, { width: invColWidth, ...NO_BREAK });
      if (invCust.vat) doc.text(`VAT: ${invCust.vat}`, rightColumnX, invInfoY + invLineH * 7, { width: invColWidth, ...NO_BREAK });

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

      const itemPurpose = (() => {
        const items = Array.isArray(invoice?.items) ? invoice.items : [];
        const descs = items
          .map((it: any) => (it?.description != null ? String(it.description).trim() : ''))
          .filter(Boolean);
        if (descs.length === 0) return '';
        // Keep it short and readable on one line
        const unique = Array.from(new Set(descs));
        return unique.slice(0, 2).join(' / ');
      })();

      // Prefer the actual invoice item description(s) over job title for receipts.
      const purpose =
        (payment.notes && String(payment.notes).trim()) ||
        itemPurpose ||
        (invoice?.job?.title && String(invoice.job.title).trim()) ||
        (invoice?.notes && String(invoice.notes).trim()) ||
        (invoice?.invoiceNumber ? `Payment for Invoice #${invoice.invoiceNumber}` : 'Payment');

      const recColWidth = 252;
      const leftColumnX = 50;
      const rightColumnX = 50 + recColWidth + 16;
      const recInfoY = 165;

      const recLineH = 10; // compact line height so TIN/VAT stay visible
      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('FROM:', leftColumnX, recInfoY, { width: recColWidth, ...NO_BREAK });
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(COMPANY.name, 60), leftColumnX, recInfoY + recLineH, { width: recColWidth, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica')
        .text(truncateText(COMPANY.address, 45), leftColumnX, recInfoY + recLineH * 2, { width: recColWidth, ...NO_BREAK })
        .text(`TIN: ${COMPANY.tin}`, leftColumnX, recInfoY + recLineH * 3, { width: recColWidth, ...NO_BREAK })
        .text(`${COMPANY.phone} | ${COMPANY.phoneAlt}`, leftColumnX, recInfoY + recLineH * 4, { width: recColWidth, ...NO_BREAK })
        .text(COMPANY.email, leftColumnX, recInfoY + recLineH * 5, { width: recColWidth, ...NO_BREAK })
        .text(COMPANY.website, leftColumnX, recInfoY + recLineH * 6, { width: recColWidth, ...NO_BREAK });

      doc.fillColor(RED_COLOR).fontSize(F.body).font('Helvetica-Bold')
        .text('RECEIVED FROM:', rightColumnX, recInfoY, { width: recColWidth, ...NO_BREAK });
      doc.fillColor(DARK_GRAY).fontSize(F.body).font('Helvetica-Bold')
        .text(truncateText(customer.name, 60), rightColumnX, recInfoY + recLineH, { width: recColWidth, ...NO_BREAK });
      doc.fillColor(LIGHT_GRAY).fontSize(F.body).font('Helvetica');
      doc.text(truncateText(customer.company || '', 60), rightColumnX, recInfoY + recLineH * 2, { width: recColWidth, ...NO_BREAK });
      doc.text(truncateText(customer.address || '', 45), rightColumnX, recInfoY + recLineH * 3, { width: recColWidth, ...NO_BREAK });
      doc.text(truncateText(customer.email || '', 60), rightColumnX, recInfoY + recLineH * 4, { width: recColWidth, ...NO_BREAK });
      doc.text(truncateText(customer.phone || '', 40), rightColumnX, recInfoY + recLineH * 5, { width: recColWidth, ...NO_BREAK });
      if (customer.tin) doc.text(`TIN: ${customer.tin}`, rightColumnX, recInfoY + recLineH * 6, { width: recColWidth, ...NO_BREAK });
      if (customer.vat) doc.text(`VAT: ${customer.vat}`, rightColumnX, recInfoY + recLineH * 7, { width: recColWidth, ...NO_BREAK });

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
      doc.text(`For: ${truncateText(purpose, 90)}`, 50, recDetailY + 88, NO_BREAK);

      doc.fillColor(RED_COLOR).fontSize(11).font('Helvetica-Bold')
        .text(`Amount Received: ${formatAmount(Number(payment.amount), currency)}`, 50, recDetailY + 118, NO_BREAK);

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
