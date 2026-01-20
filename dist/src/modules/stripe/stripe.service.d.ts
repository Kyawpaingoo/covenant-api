import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class StripeService {
    private readonly configService;
    private stripe;
    constructor(configService: ConfigService);
    createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>): Promise<Stripe.PaymentIntent>;
    retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    constructWebhookEvent(payload: Buffer, signature: string, webhookSecret: string): Stripe.Event;
}
