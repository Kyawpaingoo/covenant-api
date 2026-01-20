import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma';
import { RegisterDto, LoginDto } from './dto';
export interface JwtPayload {
    sub: string;
    email: string;
    type: 'access' | 'refresh';
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto, userAgent?: string, ipAddress?: string): Promise<{
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
    login(loginDto: LoginDto, userAgent?: string, ipAddress?: string): Promise<{
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
    refresh(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<{
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
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
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
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
    } | null>;
    private createSession;
    private generateAccessToken;
    private generateRefreshToken;
}
