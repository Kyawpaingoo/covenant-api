import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
interface UserPayload {
    id: string;
    email: string;
}
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(user: UserPayload, createInvoiceDto: CreateInvoiceDto): Promise<{
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
    findAll(user: UserPayload): Promise<({
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
    findOne(user: UserPayload, id: string): Promise<{
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
    update(user: UserPayload, id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<{
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
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
export {};
