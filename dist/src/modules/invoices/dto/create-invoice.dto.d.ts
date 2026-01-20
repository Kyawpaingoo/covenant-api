import { InvoiceStatus } from '@prisma/client';
import { InvoiceItemDto } from './invoice-item.dto';
export declare class CreateInvoiceDto {
    clientId: string;
    contractId?: string;
    dueDate: string;
    currency?: string;
    taxRate?: number;
    status?: InvoiceStatus;
    items: InvoiceItemDto[];
}
