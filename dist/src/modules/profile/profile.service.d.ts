import { PrismaService } from '../../prisma';
import { UpdateProfileDto } from './dto';
export declare class ProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        userId: string;
        email: string;
        businessName: string | null;
        stripeAccountId: string | null;
        branding: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        id: string;
        userId: string;
        email: string;
        businessName: string | null;
        stripeAccountId: string | null;
        branding: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfileByProfileId(profileId: string): Promise<{
        id: string;
        userId: string;
        email: string;
        businessName: string | null;
        stripeAccountId: string | null;
        branding: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
