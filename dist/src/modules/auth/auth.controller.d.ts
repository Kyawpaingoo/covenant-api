import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
interface UserPayload {
    id: string;
    email: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, req: Request, userAgent?: string): Promise<{
        user: {
            id: string;
            email: string;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                businessName: string | null;
                stripeAccountId: string | null;
                branding: import("@prisma/client/runtime/client").JsonValue | null;
                userId: string;
            } | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: LoginDto, req: Request, userAgent?: string): Promise<{
        user: {
            id: string;
            email: string;
            emailVerified: Date | null;
            image: string | null;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                businessName: string | null;
                stripeAccountId: string | null;
                branding: import("@prisma/client/runtime/client").JsonValue | null;
                userId: string;
            } | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshDto: RefreshTokenDto, req: Request, userAgent?: string): Promise<{
        user: {
            id: string;
            email: string;
            emailVerified: Date | null;
            image: string | null;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                businessName: string | null;
                stripeAccountId: string | null;
                branding: import("@prisma/client/runtime/client").JsonValue | null;
                userId: string;
            } | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshDto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    logoutAll(user: UserPayload): Promise<{
        message: string;
    }>;
    getMe(user: UserPayload): Promise<{
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
            branding: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
        } | null;
    }>;
    private getIpAddress;
}
export {};
