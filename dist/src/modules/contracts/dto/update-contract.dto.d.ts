import { ContractStatus } from '@prisma/client';
export declare class UpdateContractDto {
    title?: string;
    content?: string;
    status?: ContractStatus;
}
