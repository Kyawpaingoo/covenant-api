import { PrismaService } from '../../prisma';
import { ActivityService } from '../activity/activity.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
export declare class InvoicesService {
    private readonly prisma;
    private readonly activityService;
    constructor(prisma: PrismaService, activityService: ActivityService);
    private getProfileId;
    private generateInvoiceNumber;
    private calculateTotals;
    create(userId: string, createInvoiceDto: CreateInvoiceDto): Promise<{
        client: {
            email: string;
            name: string;
        };
        items: {
            id: string;
            total: import("@prisma/client-runtime-utils").Decimal;
            description: string;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            invoiceId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        clientId: string;
        contractId: string | null;
        invoiceNumber: string;
        dueDate: Date;
        currency: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        stripePaymentIntentId: string | null;
    }>;
    findAll(userId: string): Promise<({
        client: {
            id: string;
            email: string;
            name: string;
        };
        _count: {
            items: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        clientId: string;
        contractId: string | null;
        invoiceNumber: string;
        dueDate: Date;
        currency: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        stripePaymentIntentId: string | null;
    })[]>;
    findOne(userId: string, id: string): Promise<{
        client: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyAddress: string | null;
            taxId: string | null;
            profileId: string;
        };
        contract: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.ContractStatus;
        } | null;
        items: {
            id: string;
            total: import("@prisma/client-runtime-utils").Decimal;
            description: string;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            invoiceId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        clientId: string;
        contractId: string | null;
        invoiceNumber: string;
        dueDate: Date;
        currency: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        stripePaymentIntentId: string | null;
    }>;
    update(userId: string, id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<{
        client: {
            email: string;
            name: string;
        };
        items: {
            id: string;
            total: import("@prisma/client-runtime-utils").Decimal;
            description: string;
            quantity: import("@prisma/client-runtime-utils").Decimal;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            invoiceId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        clientId: string;
        contractId: string | null;
        invoiceNumber: string;
        dueDate: Date;
        currency: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        stripePaymentIntentId: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    markAsPaid(id: string, stripePaymentIntentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        clientId: string;
        contractId: string | null;
        invoiceNumber: string;
        dueDate: Date;
        currency: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        stripePaymentIntentId: string | null;
    }>;
}
