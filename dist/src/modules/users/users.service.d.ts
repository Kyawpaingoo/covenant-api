import { PrismaService } from '../../prisma';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        email: string;
        emailVerified: Date | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessName: string | null;
            stripeAccountId: string | null;
            signatureUrl: string | null;
            branding: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
        } | null;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        emailVerified: Date | null;
        image: string | null;
        createdAt: Date;
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessName: string | null;
            stripeAccountId: string | null;
            signatureUrl: string | null;
            branding: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
        } | null;
    } | null>;
    getSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        expires: Date;
    }[]>;
    deleteSession(userId: string, sessionId: string): Promise<{
        message: string;
    }>;
}
