import { PrismaService } from '../../prisma';
import { EntityType } from '@prisma/client';
export interface LogActivityDto {
    entityType: EntityType;
    entityId: string;
    event: string;
    metadata?: Record<string, unknown>;
}
export declare class ActivityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(dto: LogActivityDto): Promise<{
        id: string;
        createdAt: Date;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        event: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(profileId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        event: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findByEntity(entityType: EntityType, entityId: string): Promise<{
        id: string;
        createdAt: Date;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        event: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
}
