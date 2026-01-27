import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePdf(htmlContent: string): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      // Set content with some basic styles injected to ensure it looks good
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Failed to generate PDF: ${error.message}`, error.stack);
      throw error;
    }
  }

  generateContractHtml(
    contractTitle: string,
    contractContentHtml: string,
    signatures: { client?: string; provider?: string }
  ): string {
    // Basic HTML template for the contract
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { margin-bottom: 50px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; page-break-inside: avoid; }
          .signature-block { border: 1px solid #ccc; padding: 15px; border-radius: 5px; }
          .signature-img { max-width: 100%; height: auto; max-height: 100px; display: block; margin-top: 10px; }
          .label { font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 10px; display: block; }
          .timestamp { font-size: 10px; color: #999; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">${contractTitle}</div>
          </div>
          
          <div class="content">
            ${contractContentHtml}
          </div>

          <div class="signatures">
            <div class="signature-block">
              <span class="label">Client Signature</span>
              ${signatures.client 
                ? `<img src="${signatures.client}" class="signature-img" />` 
                : '<div style="height: 50px; display: flex; align-items: center; color: #999; font-style: italic;">Pending...</div>'}
            </div>
            
            <div class="signature-block">
              <span class="label">Provider Signature</span>
               ${signatures.provider 
                ? `<img src="${signatures.provider}" class="signature-img" />` 
                : '<div style="height: 50px; display: flex; align-items: center; color: #999; font-style: italic;">Pending...</div>'}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
