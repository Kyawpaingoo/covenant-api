import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma';
import { PdfService } from './pdf.service';
import { ActivityService } from '../activity/activity.service';
import { SendEmailDto } from './dto';
import { ContractStatus, InvoiceStatus, EntityType } from '@prisma/client';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly activityService: ActivityService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      console.warn('RESEND_API_KEY not configured - email service will not work');
    }
    this.resend = new Resend(apiKey);
  }

  async sendContractEmail(userId: string, contractId: string, dto?: SendEmailDto) {
    // Get contract with client and profile info
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        client: {
          include: {
            profile: {
              include: {
                user: {
                  select: { email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Verify ownership
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile || contract.client.profileId !== user.profile.id) {
      throw new BadRequestException('Access denied');
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateContractPdf({
      title: contract.title,
      content: contract.content,
      clientName: contract.client.name,
      clientEmail: contract.client.email,
      businessName: contract.client.profile?.businessName || undefined,
      createdAt: contract.createdAt,
      version: contract.version,
    });

    // Build email
    const portalUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const contractLink = `${portalUrl}/portal/contract/${contract.shortLink}`;
    const businessName = contract.client.profile?.businessName || 'Your Service Provider';
    
    const subject = dto?.subject || `Contract: ${contract.title}`;
    const htmlContent = dto?.message || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You have a new contract to review</h2>
        <p>Hello ${contract.client.name},</p>
        <p><strong>${businessName}</strong> has sent you a contract titled "<strong>${contract.title}</strong>" for your review and signature.</p>
        <p style="margin: 30px 0;">
          <a href="${contractLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review & Sign Contract
          </a>
        </p>
        <p>Or copy this link: <a href="${contractLink}">${contractLink}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          This contract is attached as a PDF for your records.
        </p>
      </div>
    `;

    // Send email via Resend
    const { data, error } = await this.resend.emails.send({
      from: `${businessName} <onboarding@resend.dev>`,
      to: [contract.client.email],
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    });

    if (error) {
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }

    // Update contract status to SENT
    await this.prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.SENT },
    });

    // Log activity
    await this.activityService.log({
      entityType: EntityType.CONTRACT,
      entityId: contractId,
      event: 'EMAIL_SENT',
      metadata: {
        recipientEmail: contract.client.email,
        emailId: data?.id,
      },
    });

    return {
      success: true,
      message: `Contract sent to ${contract.client.email}`,
      emailId: data?.id,
    };
  }

  async sendInvoiceEmail(userId: string, invoiceId: string, dto?: SendEmailDto) {
    // Get invoice with all related data
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          include: {
            profile: {
              include: {
                user: {
                  select: { email: true },
                },
              },
            },
          },
        },
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Verify ownership
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile || invoice.client.profileId !== user.profile.id) {
      throw new BadRequestException('Access denied');
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      clientAddress: invoice.client.companyAddress || undefined,
      businessName: invoice.client.profile?.businessName || undefined,
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      subtotal: Number(invoice.subtotal),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
    });

    // Build email
    const businessName = invoice.client.profile?.businessName || 'Your Service Provider';
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(Number(invoice.total));
    const formattedDueDate = invoice.dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subject = dto?.subject || `Invoice ${invoice.invoiceNumber} from ${businessName}`;
    const htmlContent = dto?.message || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Invoice ${invoice.invoiceNumber}</h2>
        <p>Hello ${invoice.client.name},</p>
        <p>Please find attached your invoice from <strong>${businessName}</strong>.</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">Amount Due</p>
          <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #333;">${formattedTotal}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Due by ${formattedDueDate}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          This invoice is attached as a PDF for your records.
        </p>
      </div>
    `;

    // Send email via Resend
    const { data, error } = await this.resend.emails.send({
      from: `${businessName} <onboarding@resend.dev>`,
      to: [invoice.client.email],
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    });

    if (error) {
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }

    // Update invoice status to OPEN if it was DRAFT
    if (invoice.status === InvoiceStatus.DRAFT) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.OPEN },
      });
    }

    // Log activity
    await this.activityService.log({
      entityType: EntityType.INVOICE,
      entityId: invoiceId,
      event: 'EMAIL_SENT',
      metadata: {
        recipientEmail: invoice.client.email,
        emailId: data?.id,
      },
    });

    return {
      success: true,
      message: `Invoice sent to ${invoice.client.email}`,
      emailId: data?.id,
    };
  }
}
