import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { ActivityService } from '../activity/activity.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceItemDto } from './dto';
import { InvoiceStatus, EntityType } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  private async getProfileId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new NotFoundException('Profile not found');
    }

    return user.profile.id;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-`,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(
        lastInvoice.invoiceNumber.split('-')[2],
        10,
      );
      nextNumber = lastNumber + 1;
    }

    return `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
  }

  private calculateTotals(items: InvoiceItemDto[], taxRate: number = 0) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  async create(userId: string, createInvoiceDto: CreateInvoiceDto) {
    const profileId = await this.getProfileId(userId);
    const { items, ...invoiceData } = createInvoiceDto;

    // Verify client belongs to the profile
    const client = await this.prisma.client.findFirst({
      where: {
        id: invoiceData.clientId,
        profileId,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Verify contract if provided
    if (invoiceData.contractId) {
      const contract = await this.prisma.contract.findFirst({
        where: {
          id: invoiceData.contractId,
          clientId: invoiceData.clientId,
        },
      });

      if (!contract) {
        throw new NotFoundException('Contract not found');
      }
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const taxRate = invoiceData.taxRate || 0;
    const { subtotal, taxAmount, total } = this.calculateTotals(items, taxRate);

    // Create invoice with items
    const invoice = await this.prisma.invoice.create({
      data: {
        ...invoiceData,
        dueDate: new Date(invoiceData.dueDate),
        invoiceNumber,
        taxRate,
        subtotal,
        taxAmount,
        total,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
          })),
        },
      },
      include: {
        items: true,
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log creation
    await this.activityService.log({
      entityType: EntityType.INVOICE,
      entityId: invoice.id,
      event: 'CREATED',
      metadata: { invoiceNumber, total: total.toString() },
    });

    return invoice;
  }

  async findAll(userId: string) {
    const profileId = await this.getProfileId(userId);

    return this.prisma.invoice.findMany({
      where: {
        client: {
          profileId,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const profileId = await this.getProfileId(userId);

    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        contract: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    return invoice;
  }

  async update(
    userId: string,
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const profileId = await this.getProfileId(userId);

    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { client: true, items: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update a paid invoice');
    }

    const { items, ...updateData } = updateInvoiceDto;

    // Recalculate totals if items are updated
    let calculatedFields = {};
    if (items) {
      const taxRate = updateData.taxRate ?? Number(invoice.taxRate);
      const { subtotal, taxAmount, total } = this.calculateTotals(
        items,
        taxRate,
      );
      calculatedFields = { subtotal, taxAmount, total };
    } else if (updateData.taxRate !== undefined) {
      // Recalculate with existing items but new tax rate
      const existingItems = invoice.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }));
      const { subtotal, taxAmount, total } = this.calculateTotals(
        existingItems,
        updateData.taxRate,
      );
      calculatedFields = { subtotal, taxAmount, total };
    }

    // Update invoice
    const updated = await this.prisma.$transaction(async (tx) => {
      // Delete existing items if new items provided
      if (items) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });
      }

      return tx.invoice.update({
        where: { id },
        data: {
          ...updateData,
          dueDate: updateData.dueDate
            ? new Date(updateData.dueDate)
            : undefined,
          taxRate: updateData.taxRate ?? undefined,
          ...calculatedFields,
          ...(items && {
            items: {
              create: items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
              })),
            },
          }),
        },
        include: {
          items: true,
          client: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    });

    // Log status change if applicable
    if (updateData.status && updateData.status !== invoice.status) {
      await this.activityService.log({
        entityType: EntityType.INVOICE,
        entityId: id,
        event: updateData.status,
        metadata: { previousStatus: invoice.status },
      });
    }

    return updated;
  }

  async remove(userId: string, id: string) {
    const profileId = await this.getProfileId(userId);

    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid invoice');
    }

    await this.prisma.invoice.delete({ where: { id } });

    return { message: 'Invoice deleted successfully' };
  }

  async markAsPaid(id: string, stripePaymentIntentId: string) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        stripePaymentIntentId,
      },
    });

    await this.activityService.log({
      entityType: EntityType.INVOICE,
      entityId: id,
      event: 'PAID',
      metadata: { stripePaymentIntentId },
    });

    return invoice;
  }
}
