import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto';
interface UserPayload {
    id: string;
    email: string;
    businessName: string | null;
}
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(user: UserPayload): Promise<{
        id: string;
        userId: string;
        email: string;
        businessName: string | null;
        stripeAccountId: string | null;
        branding: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(user: UserPayload, updateProfileDto: UpdateProfileDto): Promise<{
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
export {};
