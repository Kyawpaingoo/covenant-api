import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { EntityType } from '@prisma/client';

export interface LogActivityDto {
  entityType: EntityType;
  entityId: string;
  event: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: LogActivityDto) {
    return this.prisma.activityLog.create({
      data: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        event: dto.event,
        metadata: (dto.metadata || {}) as object,
      },
    });
  }

  async findAll(profileId: string, limit: number = 50) {
    // Get all contracts and invoices for the profile
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

  async findByEntity(entityType: EntityType, entityId: string) {
    return this.prisma.activityLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
