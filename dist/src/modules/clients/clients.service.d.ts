import { PrismaService } from '../../prisma';
import { CreateClientDto, UpdateClientDto } from './dto';
export declare class ClientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getProfileId;
    create(userId: string, createClientDto: CreateClientDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyAddress: string | null;
        taxId: string | null;
        profileId: string;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyAddress: string | null;
        taxId: string | null;
        profileId: string;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        contracts: {
            id: string;
            createdAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.ContractStatus;
        }[];
        invoices: {
            id: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            dueDate: Date;
            total: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyAddress: string | null;
        taxId: string | null;
        profileId: string;
    }>;
    update(userId: string, id: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyAddress: string | null;
        taxId: string | null;
        profileId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
