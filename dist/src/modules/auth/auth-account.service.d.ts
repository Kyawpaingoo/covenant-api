import { PrismaService } from '../../prisma';
export interface OAuthAccountInput {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
}
export interface OAuthUserProfile {
    email: string;
    name?: string;
    image?: string;
    emailVerified?: boolean;
}
export declare class AuthAccountService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    linkOrCreateAccount(profile: OAuthUserProfile, accountInput: Omit<OAuthAccountInput, 'userId'>): Promise<{
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
    } & {
        id: string;
        email: string;
        password: string | null;
        emailVerified: Date | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserAccounts(userId: string): Promise<{
        id: string;
        type: string;
        provider: string;
    }[]>;
    unlinkAccount(userId: string, provider: string): Promise<{
        message: string;
    }>;
}
