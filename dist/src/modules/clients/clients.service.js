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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../../prisma");
let ClientsService = class ClientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfileId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user?.profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return user.profile.id;
    }
    async create(userId, createClientDto) {
        const profileId = await this.getProfileId(userId);
        return this.prisma.client.create({
            data: {
                ...createClientDto,
                profileId,
            },
        });
    }
    async findAll(userId) {
        const profileId = await this.getProfileId(userId);
        return this.prisma.client.findMany({
            where: { profileId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const profileId = await this.getProfileId(userId);
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                contracts: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        createdAt: true,
                    },
                },
                invoices: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        status: true,
                        total: true,
                        dueDate: true,
                    },
                },
            },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        if (client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return client;
    }
    async update(userId, id, updateClientDto) {
        const profileId = await this.getProfileId(userId);
        const client = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        if (client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }
    async remove(userId, id) {
        const profileId = await this.getProfileId(userId);
        const client = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        if (client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.prisma.client.delete({
            where: { id },
        });
        return { message: 'Client deleted successfully' };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map