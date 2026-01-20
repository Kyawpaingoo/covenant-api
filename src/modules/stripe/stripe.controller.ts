import {
  Controller,
  Post,
  Param,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  RawBodyRequest,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { InvoicesService } from '../invoices/invoices.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { PrismaService } from '../../prisma';
import Stripe from 'stripe';

interface UserPayload {
  id: string;
  email: string;
}

@ApiTags('stripe')
@Controller()
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly invoicesService: InvoicesService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('invoices/:id/payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent for an invoice' })
  @ApiResponse({ status: 201, description: 'PaymentIntent created successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async createPaymentIntent(
    @CurrentUser() user: UserPayload,
    @Param('id') invoiceId: string,
  ) {
    // Get and validate the invoice
    const invoice = await this.invoicesService.findOne(user.id, invoiceId);

    const paymentIntent = await this.stripeService.createPaymentIntent(
      Number(invoice.total),
      invoice.currency,
      {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientId: invoice.clientId,
      },
    );

    // Store the payment intent ID on the invoice
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Missing request body');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructWebhookEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata?.invoiceId;
        
        if (invoiceId) {
          await this.invoicesService.markAsPaid(invoiceId, paymentIntent.id);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `Payment failed for invoice: ${paymentIntent.metadata?.invoiceId}`,
        );
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }
}
