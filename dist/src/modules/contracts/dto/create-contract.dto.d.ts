import { ContractStatus } from '@prisma/client';
export declare class CreateContractDto {
    clientId: string;
    title: string;
    content: string;
    status?: ContractStatus;
}
