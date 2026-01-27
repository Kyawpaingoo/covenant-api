import { PrismaService } from '../../prisma';
import { ActivityService } from '../activity/activity.service';
import { CreateContractDto, UpdateContractDto, SignContractDto } from './dto';
import { S3Service } from '../../aws/s3.service';
import { PdfService } from '../../pdf/pdf.service';
export declare class ContractsService {
    private readonly prisma;
    private readonly activityService;
    private readonly s3Service;
    private readonly pdfService;
    constructor(prisma: PrismaService, activityService: ActivityService, s3Service: S3Service, pdfService: PdfService);
    private generateShortLink;
    private parseContractContent;
    private getProfileId;
    create(userId: string, createContractDto: CreateContractDto): Promise<{
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
        pdfUrl: string | null;
        clientId: string;
    }>;
    findAll(userId: string): Promise<({
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
        pdfUrl: string | null;
        clientId: string;
    })[]>;
    findOne(userId: string, id: string): Promise<{
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
            signatureData: string | null;
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
        pdfUrl: string | null;
        clientId: string;
    }>;
    update(userId: string, id: string, updateContractDto: UpdateContractDto): Promise<{
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
        pdfUrl: string | null;
        clientId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    findBySlug(slug: string, ipAddress?: string): Promise<{
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
            signatureData: string | null;
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
        pdfUrl: string | null;
        clientId: string;
    }>;
    signContract(slug: string, signDto: SignContractDto, ipAddress: string, userAgent?: string): Promise<{
        message: string;
        signature: {
            id: string;
            signerName: string;
            signedAt: Date;
            pdfUrl: string | null;
        };
    }>;
    downloadContractPdf(slug: string): Promise<string | Buffer>;
}
