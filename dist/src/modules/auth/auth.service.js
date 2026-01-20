"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const prisma_1 = require("../../prisma");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto, userAgent, ipAddress) {
        const { email, password, businessName } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                profile: {
                    create: {
                        businessName,
                    },
                },
            },
            include: {
                profile: true,
            },
        });
        const tokens = await this.createSession(user.id, userAgent, ipAddress);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile,
            },
        };
    }
    async login(loginDto, userAgent, ipAddress) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
            },
        });
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.createSession(user.id, userAgent, ipAddress);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image,
                profile: user.profile,
            },
        };
    }
    async refresh(refreshToken, userAgent, ipAddress) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        const session = await this.prisma.session.findUnique({
            where: { sessionToken: refreshToken },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        if (!session || session.expires < new Date()) {
            throw new common_1.UnauthorizedException('Session expired or invalid');
        }
        await this.prisma.session.delete({
            where: { id: session.id },
        });
        const tokens = await this.createSession(session.userId, userAgent, ipAddress);
        return {
            ...tokens,
            user: {
                id: session.user.id,
                email: session.user.email,
                emailVerified: session.user.emailVerified,
                image: session.user.image,
                profile: session.user.profile,
            },
        };
    }
    async logout(refreshToken) {
        await this.prisma.session.deleteMany({
            where: { sessionToken: refreshToken },
        });
        return { message: 'Logged out successfully' };
    }
    async logoutAll(userId) {
        await this.prisma.session.deleteMany({
            where: { userId },
        });
        return { message: 'Logged out from all devices' };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            profile: user.profile,
        };
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
        };
    }
    async createSession(userId, userAgent, ipAddress) {
        const accessToken = this.generateAccessToken(userId);
        const refreshToken = this.generateRefreshToken(userId);
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        await this.prisma.session.create({
            data: {
                sessionToken: refreshToken,
                userId,
                expires,
                userAgent,
                ipAddress,
            },
        });
        return { accessToken, refreshToken };
    }
    generateAccessToken(userId) {
        const user = { sub: userId, type: 'access' };
        return this.jwtService.sign(user, { expiresIn: '15m' });
    }
    generateRefreshToken(userId) {
        const payload = { sub: userId, type: 'refresh', jti: (0, uuid_1.v4)() };
        return this.jwtService.sign(payload, { expiresIn: '7d' });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map