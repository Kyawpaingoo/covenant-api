import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { InvoicesService } from '../invoices/invoices.service';
import { PrismaService } from '../../prisma';
interface UserPayload {
    id: string;
    email: string;
}
export declare class StripeController {
    private readonly stripeService;
    private readonly invoicesService;
    private readonly configService;
    private readonly prisma;
    constructor(stripeService: StripeService, invoicesService: InvoicesService, configService: ConfigService, prisma: PrismaService);
    createPaymentIntent(user: UserPayload, invoiceId: string): Promise<{
        clientSecret: string | null;
        paymentIntentId: string;
    }>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
export {};
