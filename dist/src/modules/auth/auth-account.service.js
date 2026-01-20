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
exports.AuthAccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../../prisma");
let AuthAccountService = class AuthAccountService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async linkOrCreateAccount(profile, accountInput) {
        const { email, name, image, emailVerified } = profile;
        const existingAccount = await this.prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: accountInput.provider,
                    providerAccountId: accountInput.providerAccountId,
                },
            },
            include: {
                user: {
                    include: { profile: true },
                },
            },
        });
        if (existingAccount) {
            await this.prisma.account.update({
                where: { id: existingAccount.id },
                data: {
                    refresh_token: accountInput.refresh_token,
                    access_token: accountInput.access_token,
                    expires_at: accountInput.expires_at,
                },
            });
            return existingAccount.user;
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
        if (existingUser) {
            await this.prisma.account.create({
                data: {
                    ...accountInput,
                    userId: existingUser.id,
                },
            });
            if (!existingUser.image && image) {
                await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { image },
                });
            }
            return existingUser;
        }
        const newUser = await this.prisma.user.create({
            data: {
                email,
                image,
                emailVerified: emailVerified ? new Date() : null,
                accounts: {
                    create: accountInput,
                },
                profile: {
                    create: {
                        businessName: name,
                    },
                },
            },
            include: {
                profile: true,
                accounts: true,
            },
        });
        return newUser;
    }
    async getUserAccounts(userId) {
        return this.prisma.account.findMany({
            where: { userId },
            select: {
                id: true,
                provider: true,
                type: true,
            },
        });
    }
    async unlinkAccount(userId, provider) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { accounts: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const hasPassword = !!user.password;
        const otherAccounts = user.accounts.filter((a) => a.provider !== provider);
        if (!hasPassword && otherAccounts.length === 0) {
            throw new Error('Cannot unlink the only authentication method. Set a password first.');
        }
        await this.prisma.account.deleteMany({
            where: {
                userId,
                provider,
            },
        });
        return { message: `${provider} account unlinked successfully` };
    }
};
exports.AuthAccountService = AuthAccountService;
exports.AuthAccountService = AuthAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], AuthAccountService);
//# sourceMappingURL=auth-account.service.js.map