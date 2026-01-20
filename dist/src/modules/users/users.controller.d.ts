import { UsersService } from './users.service';
interface UserPayload {
    id: string;
    email: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getSessions(user: UserPayload): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        expires: Date;
    }[]>;
    deleteSession(user: UserPayload, sessionId: string): Promise<{
        message: string;
    }>;
}
export {};
