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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const stripe_service_1 = require("./stripe.service");
const invoices_service_1 = require("../invoices/invoices.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../../common/decorators");
const prisma_1 = require("../../prisma");
let StripeController = class StripeController {
    constructor(stripeService, invoicesService, configService, prisma) {
        this.stripeService = stripeService;
        this.invoicesService = invoicesService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async createPaymentIntent(user, invoiceId) {
        const invoice = await this.invoicesService.findOne(user.id, invoiceId);
        const paymentIntent = await this.stripeService.createPaymentIntent(Number(invoice.total), invoice.currency, {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            clientId: invoice.clientId,
        });
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { stripePaymentIntentId: paymentIntent.id },
        });
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    }
    async handleWebhook(req, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        if (!req.rawBody) {
            throw new common_1.BadRequestException('Missing request body');
        }
        let event;
        try {
            event = this.stripeService.constructWebhookEvent(req.rawBody, signature, webhookSecret);
        }
        catch {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const invoiceId = paymentIntent.metadata?.invoiceId;
                if (invoiceId) {
                    await this.invoicesService.markAsPaid(invoiceId, paymentIntent.id);
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                console.log(`Payment failed for invoice: ${paymentIntent.metadata?.invoiceId}`);
                break;
            }
            default:
                console.log(`Unhandled Stripe event type: ${event.type}`);
        }
        return { received: true };
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, common_1.Post)('invoices/:id/payment-intent'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Stripe PaymentIntent for an invoice' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'PaymentIntent created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invoice not found' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('webhooks/stripe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe webhook events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "handleWebhook", null);
exports.StripeController = StripeController = __decorate([
    (0, swagger_1.ApiTags)('stripe'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        invoices_service_1.InvoicesService,
        config_1.ConfigService,
        prisma_1.PrismaService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map