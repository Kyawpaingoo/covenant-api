import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
interface UserPayload {
    id: string;
    email: string;
}
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(user: UserPayload, createClientDto: CreateClientDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyAddress: string | null;
        taxId: string | null;
        profileId: string;
    }>;
    findAll(user: UserPayload): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyAddress: string | null;
        taxId: string | null;
        profileId: string;
    }[]>;
    findOne(user: UserPayload, id: string): Promise<{
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
    update(user: UserPayload, id: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyAddress: string | null;
        taxId: string | null;
        profileId: string;
    }>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
export {};
