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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../../prisma");
const activity_service_1 = require("../activity/activity.service");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
let ContractsService = class ContractsService {
    constructor(prisma, activityService) {
        this.prisma = prisma;
        this.activityService = activityService;
    }
    generateShortLink() {
        return (0, uuid_1.v4)().split('-')[0] + (0, uuid_1.v4)().split('-')[1];
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
    async create(userId, createContractDto) {
        const profileId = await this.getProfileId(userId);
        const client = await this.prisma.client.findFirst({
            where: {
                id: createContractDto.clientId,
                profileId,
            },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        const contract = await this.prisma.contract.create({
            data: {
                ...createContractDto,
                shortLink: this.generateShortLink(),
            },
            include: {
                client: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return contract;
    }
    async findAll(userId) {
        const profileId = await this.getProfileId(userId);
        return this.prisma.contract.findMany({
            where: {
                client: {
                    profileId,
                },
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        signatures: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const profileId = await this.getProfileId(userId);
        const contract = await this.prisma.contract.findUnique({
            where: { id },
            include: {
                client: true,
                signatures: true,
                invoices: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        status: true,
                        total: true,
                    },
                },
            },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found');
        }
        if (contract.client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return contract;
    }
    async update(userId, id, updateContractDto) {
        const profileId = await this.getProfileId(userId);
        const contract = await this.prisma.contract.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found');
        }
        if (contract.client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const shouldIncrementVersion = updateContractDto.content &&
            updateContractDto.content !== contract.content;
        const updated = await this.prisma.contract.update({
            where: { id },
            data: {
                ...updateContractDto,
                version: shouldIncrementVersion
                    ? { increment: 1 }
                    : contract.version,
            },
            include: {
                client: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (updateContractDto.status &&
            updateContractDto.status !== contract.status) {
            await this.activityService.log({
                entityType: client_1.EntityType.CONTRACT,
                entityId: id,
                event: updateContractDto.status,
                metadata: { previousStatus: contract.status },
            });
        }
        return updated;
    }
    async remove(userId, id) {
        const profileId = await this.getProfileId(userId);
        const contract = await this.prisma.contract.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found');
        }
        if (contract.client.profileId !== profileId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.prisma.contract.delete({ where: { id } });
        return { message: 'Contract deleted successfully' };
    }
    async findBySlug(slug, ipAddress) {
        const contract = await this.prisma.contract.findUnique({
            where: { shortLink: slug },
            include: {
                client: {
                    include: {
                        profile: {
                            select: {
                                businessName: true,
                                branding: true,
                            },
                        },
                    },
                },
                signatures: true,
            },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found');
        }
        if (contract.status !== client_1.ContractStatus.SIGNED) {
            if (contract.status === client_1.ContractStatus.SENT) {
                await this.prisma.contract.update({
                    where: { id: contract.id },
                    data: { status: client_1.ContractStatus.VIEWED },
                });
            }
            await this.activityService.log({
                entityType: client_1.EntityType.CONTRACT,
                entityId: contract.id,
                event: 'VIEWED',
                metadata: { ipAddress },
            });
        }
        return contract;
    }
    async signContract(slug, signDto, ipAddress, userAgent) {
        const contract = await this.prisma.contract.findUnique({
            where: { shortLink: slug },
            include: { signatures: true },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found');
        }
        if (contract.status === client_1.ContractStatus.VOID) {
            throw new common_1.BadRequestException('This contract has been voided');
        }
        if (contract.status === client_1.ContractStatus.SIGNED) {
            throw new common_1.BadRequestException('This contract has already been signed');
        }
        const [signature] = await this.prisma.$transaction([
            this.prisma.signature.create({
                data: {
                    contractId: contract.id,
                    signerName: signDto.signerName,
                    signerEmail: signDto.signerEmail,
                    ipAddress,
                    userAgent,
                },
            }),
            this.prisma.contract.update({
                where: { id: contract.id },
                data: { status: client_1.ContractStatus.SIGNED },
            }),
        ]);
        await this.activityService.log({
            entityType: client_1.EntityType.CONTRACT,
            entityId: contract.id,
            event: 'SIGNED',
            metadata: {
                signerName: signDto.signerName,
                signerEmail: signDto.signerEmail,
                ipAddress,
                userAgent,
                signedAt: new Date().toISOString(),
            },
        });
        return {
            message: 'Contract signed successfully',
            signature: {
                id: signature.id,
                signerName: signature.signerName,
                signedAt: signature.signedAt,
            },
        };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        activity_service_1.ActivityService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map