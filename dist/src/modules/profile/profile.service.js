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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../../prisma");
let ProfileService = class ProfileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });
        if (!user || !user.profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return {
            id: user.profile.id,
            userId: user.id,
            email: user.email,
            businessName: user.profile.businessName,
            stripeAccountId: user.profile.stripeAccountId,
            branding: user.profile.branding,
            createdAt: user.profile.createdAt,
            updatedAt: user.profile.updatedAt,
        };
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user || !user.profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        const updatedProfile = await this.prisma.profile.update({
            where: { id: user.profile.id },
            data: updateProfileDto,
        });
        return {
            id: updatedProfile.id,
            userId: user.id,
            email: user.email,
            businessName: updatedProfile.businessName,
            stripeAccountId: updatedProfile.stripeAccountId,
            branding: updatedProfile.branding,
            createdAt: updatedProfile.createdAt,
            updatedAt: updatedProfile.updatedAt,
        };
    }
    async getProfileByProfileId(profileId) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return {
            id: profile.id,
            userId: profile.userId,
            email: profile.user.email,
            businessName: profile.businessName,
            stripeAccountId: profile.stripeAccountId,
            branding: profile.branding,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map