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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../../prisma");
let ActivityService = class ActivityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(dto) {
        return this.prisma.activityLog.create({
            data: {
                entityType: dto.entityType,
                entityId: dto.entityId,
                event: dto.event,
                metadata: (dto.metadata || {}),
            },
        });
    }
    async findAll(profileId, limit = 50) {
        const contracts = await this.prisma.contract.findMany({
            where: {
                client: { profileId },
            },
            select: { id: true },
        });
        const invoices = await this.prisma.invoice.findMany({
            where: {
                client: { profileId },
            },
            select: { id: true },
        });
        const entityIds = [
            ...contracts.map((c) => c.id),
            ...invoices.map((i) => i.id),
        ];
        return this.prisma.activityLog.findMany({
            where: {
                entityId: { in: entityIds },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async findByEntity(entityType, entityId) {
        return this.prisma.activityLog.findMany({
            where: {
                entityType,
                entityId,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map