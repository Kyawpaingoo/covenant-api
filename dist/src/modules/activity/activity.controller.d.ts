import { ActivityService } from './activity.service';
import { EntityType } from '@prisma/client';
interface UserPayload {
    id: string;
    email: string;
}
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    findAll(user: UserPayload, limit?: string): Promise<{
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
export {};
