"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../../prisma");
const activity_service_1 = require("../activity/activity.service");
const client_1 = require("@prisma/client");
let InvoicesService = class InvoicesService {
    constructor(prisma, activityService) {
        this.prisma = prisma;
        this.activityService = activityService;
    }
    async getProfileId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user?.profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return user.profile.id;
    }
    async generateInvoiceNumber() {
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
            const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
            nextNumber = lastNumber + 1;
        }
        return `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
    }
    calculateTotals(items, taxRate = 0) {
        const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;
        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        };
    }
    async create(userId, createInvoiceDto) {
        const profileId = await this.getProfileId(userId);
        const { items, ...invoiceData } = createInvoiceDto;
        const client = await this.prisma.client.findFirst({
            where: {
                id: invoiceData.clientId,
                profileId,
            },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        if (invoiceData.contractId) {
            const contract = await this.prisma.contract.findFirst({
                where: {
                    id: invoiceData.contractId,
                    clientId: invoiceData.clientId,
                },
            });
            if (!contract) {
                throw new common_1.NotFoundException('Contract not found');
            }
        }
        const invoiceNumber = await this.generateInvoiceNumber();
        const taxRate = invoiceData.taxRate || 0;
        const { subtotal, taxAmount, total } = this.calculateTotals(items, taxRate);
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
        await this.activityService.log({
            entityType: client_1.EntityType.INVOICE,
            entityId: invoice.id,
            event: 'CREATED',
            metadata: { invoiceNumber, total: total.toString() },
        });
        return invoice;
    }
    async findAll(userId) {
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
    async findOne(userId, id) {
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
            throw new common_1.NotFoundException('Invoice not found');
        }
        if (invoice.client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return invoice;
    }
    async update(userId, id, updateInvoiceDto) {
        const profileId = await this.getProfileId(userId);
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { client: true, items: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        if (invoice.client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (invoice.status === client_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('Cannot update a paid invoice');
        }
        const { items, ...updateData } = updateInvoiceDto;
        let calculatedFields = {};
        if (items) {
            const taxRate = updateData.taxRate ?? Number(invoice.taxRate);
            const { subtotal, taxAmount, total } = this.calculateTotals(items, taxRate);
            calculatedFields = { subtotal, taxAmount, total };
        }
        else if (updateData.taxRate !== undefined) {
            const existingItems = invoice.items.map((item) => ({
                description: item.description,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
            }));
            const { subtotal, taxAmount, total } = this.calculateTotals(existingItems, updateData.taxRate);
            calculatedFields = { subtotal, taxAmount, total };
        }
        const updated = await this.prisma.$transaction(async (tx) => {
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
        if (updateData.status && updateData.status !== invoice.status) {
            await this.activityService.log({
                entityType: client_1.EntityType.INVOICE,
                entityId: id,
                event: updateData.status,
                metadata: { previousStatus: invoice.status },
            });
        }
        return updated;
    }
    async remove(userId, id) {
        const profileId = await this.getProfileId(userId);
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        if (invoice.client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (invoice.status === client_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('Cannot delete a paid invoice');
        }
        await this.prisma.invoice.delete({ where: { id } });
        return { message: 'Invoice deleted successfully' };
    }
    async markAsPaid(id, stripePaymentIntentId) {
        const invoice = await this.prisma.invoice.update({
            where: { id },
            data: {
                status: client_1.InvoiceStatus.PAID,
                stripePaymentIntentId,
            },
        });
        await this.activityService.log({
            entityType: client_1.EntityType.INVOICE,
            entityId: id,
            event: 'PAID',
            metadata: { stripePaymentIntentId },
        });
        return invoice;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        activity_service_1.ActivityService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map