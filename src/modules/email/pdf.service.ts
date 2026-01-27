import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface ContractPdfData {
  title: string;
  content: string;
  clientName: string;
  clientEmail: string;
  businessName?: string;
  createdAt: Date;
  version: number;
}

interface ContentBlock {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'divider';
  content: string;
}

interface ContractContentJSON {
  version: number;
  blocks: ContentBlock[];
}

interface InvoicePdfData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  businessName?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  dueDate: Date;
  createdAt: Date;
}

@Injectable()
export class PdfService {
  async generateContractPdf(data: ContractPdfData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([612, 792]); // Letter size
    const { height } = page.getSize();
    let yPosition = height - 50;

    // Header
    page.drawText(data.title, {
      x: 50,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Business name
    if (data.businessName) {
      page.drawText(`From: ${data.businessName}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 20;
    }

    // Client info
    page.drawText(`To: ${data.clientName}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 20;

    page.drawText(`Email: ${data.clientEmail}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 15;

    page.drawText(`Version: ${data.version} | Date: ${data.createdAt.toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 40;

    // Divider line
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 562, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yPosition -= 30;

    // Content - parse content (handle JSON or Markdown)
    const normalizedContent = this.parseContent(data.content);
    const lines = this.wrapText(normalizedContent, 80);
    
    for (const line of lines) {
      if (yPosition < 50) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }

      const isHeading = line.startsWith('#');
      const cleanLine = line.replace(/^#+\s*/, '');
      
      page.drawText(cleanLine, {
        x: 50,
        y: yPosition,
        size: isHeading ? 14 : 11,
        font: isHeading ? boldFont : font,
        color: rgb(0, 0, 0),
      });
      yPosition -= isHeading ? 25 : 18;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private parseContent(content: string): string {
    if (!content || !content.trim().startsWith('{')) {
      return content;
    }

    try {
      const parsed = JSON.parse(content) as ContractContentJSON;
      if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
        return content;
      }

      return parsed.blocks
        .map((block) => {
          switch (block.type) {
            case 'h1':
              return `# ${block.content}`;
            case 'h2':
              return `## ${block.content}`;
            case 'h3':
              return `### ${block.content}`;
            case 'paragraph':
              return block.content;
            case 'bullet-list':
              return block.content
                .split('\n')
                .map((item) => `- ${item}`)
                .join('\n');
            case 'numbered-list':
              return block.content
                .split('\n')
                .map((item, i) => `${i + 1}. ${item}`)
                .join('\n');
            case 'divider':
              return '---';
            default:
              return block.content;
          }
        })
        .join('\n\n');
    } catch {
      return content;
    }
  }

  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([612, 792]);
    const { height } = page.getSize();
    let yPosition = height - 50;

    // Title
    page.drawText('INVOICE', {
      x: 50,
      y: yPosition,
      size: 28,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 30;

    // Invoice number
    page.drawText(data.invoiceNumber, {
      x: 50,
      y: yPosition,
      size: 14,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 40;

    // From section
    if (data.businessName) {
      page.drawText('From:', {
        x: 50,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 15;
      page.drawText(data.businessName, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;
    }

    // To section
    page.drawText('Bill To:', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 15;
    page.drawText(data.clientName, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
    page.drawText(data.clientEmail, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
    if (data.clientAddress) {
      yPosition -= 15;
      page.drawText(data.clientAddress, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
    yPosition -= 40;

    // Dates
    page.drawText(`Issue Date: ${data.createdAt.toLocaleDateString()}`, {
      x: 400,
      y: height - 80,
      size: 10,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText(`Due Date: ${data.dueDate.toLocaleDateString()}`, {
      x: 400,
      y: height - 95,
      size: 10,
      font: boldFont,
      color: rgb(0.8, 0.2, 0.2),
    });

    // Table header
    page.drawRectangle({
      x: 50,
      y: yPosition - 5,
      width: 512,
      height: 25,
      color: rgb(0.95, 0.95, 0.95),
    });

    page.drawText('Description', { x: 55, y: yPosition, size: 10, font: boldFont });
    page.drawText('Qty', { x: 350, y: yPosition, size: 10, font: boldFont });
    page.drawText('Price', { x: 400, y: yPosition, size: 10, font: boldFont });
    page.drawText('Total', { x: 500, y: yPosition, size: 10, font: boldFont });
    yPosition -= 30;

    // Items
    for (const item of data.items) {
      page.drawText(item.description.substring(0, 50), { x: 55, y: yPosition, size: 10, font: font });
      page.drawText(item.quantity.toString(), { x: 350, y: yPosition, size: 10, font: font });
      page.drawText(this.formatCurrency(item.unitPrice, data.currency), { x: 400, y: yPosition, size: 10, font: font });
      page.drawText(this.formatCurrency(item.total, data.currency), { x: 500, y: yPosition, size: 10, font: font });
      yPosition -= 20;
    }

    yPosition -= 20;

    // Divider
    page.drawLine({
      start: { x: 350, y: yPosition },
      end: { x: 562, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yPosition -= 20;

    // Totals
    page.drawText('Subtotal:', { x: 400, y: yPosition, size: 10, font: font });
    page.drawText(this.formatCurrency(data.subtotal, data.currency), { x: 500, y: yPosition, size: 10, font: font });
    yPosition -= 18;

    if (data.taxRate > 0) {
      page.drawText(`Tax (${data.taxRate}%):`, { x: 400, y: yPosition, size: 10, font: font });
      page.drawText(this.formatCurrency(data.taxAmount, data.currency), { x: 500, y: yPosition, size: 10, font: font });
      yPosition -= 18;
    }

    yPosition -= 5;
    page.drawLine({
      start: { x: 400, y: yPosition },
      end: { x: 562, y: yPosition },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 20;

    page.drawText('Total:', { x: 400, y: yPosition, size: 14, font: boldFont });
    page.drawText(this.formatCurrency(data.total, data.currency), { x: 500, y: yPosition, size: 14, font: boldFont });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private wrapText(text: string, maxCharsPerLine: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
          currentLine = (currentLine + ' ' + word).trim();
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
    }

    return lines;
  }

  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}
