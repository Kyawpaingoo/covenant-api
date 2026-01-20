import { Request } from 'express';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto, SignContractDto } from './dto';
interface UserPayload {
    id: string;
    email: string;
}
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    create(user: UserPayload, createContractDto: CreateContractDto): Promise<{
        client: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import(".prisma/client").$Enums.ContractStatus;
        version: number;
        shortLink: string;
        clientId: string;
    }>;
    findAll(user: UserPayload): Promise<({
        client: {
            id: string;
            email: string;
            name: string;
        };
        _count: {
            signatures: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import(".prisma/client").$Enums.ContractStatus;
        version: number;
        shortLink: string;
        clientId: string;
    })[]>;
    findOne(user: UserPayload, id: string): Promise<{
        invoices: {
            id: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            total: import("@prisma/client-runtime-utils").Decimal;
        }[];
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
        signatures: {
            id: string;
            signerName: string;
            signerEmail: string;
            ipAddress: string;
            userAgent: string | null;
            signedAt: Date;
            contractId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import(".prisma/client").$Enums.ContractStatus;
        version: number;
        shortLink: string;
        clientId: string;
    }>;
    update(user: UserPayload, id: string, updateContractDto: UpdateContractDto): Promise<{
        client: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import(".prisma/client").$Enums.ContractStatus;
        version: number;
        shortLink: string;
        clientId: string;
    }>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
    findBySlug(slug: string, ip: string): Promise<{
        client: {
            profile: {
                businessName: string | null;
                branding: import("@prisma/client/runtime/client").JsonValue;
            };
        } & {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyAddress: string | null;
            taxId: string | null;
            profileId: string;
        };
        signatures: {
            id: string;
            signerName: string;
            signerEmail: string;
            ipAddress: string;
            userAgent: string | null;
            signedAt: Date;
            contractId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import(".prisma/client").$Enums.ContractStatus;
        version: number;
        shortLink: string;
        clientId: string;
    }>;
    signContract(slug: string, signContractDto: SignContractDto, req: Request): Promise<{
        message: string;
        signature: {
            id: string;
            signerName: string;
            signedAt: Date;
        };
    }>;
}
export {};
