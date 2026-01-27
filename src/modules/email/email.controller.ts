import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('contract/:id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send contract to client via email with PDF attachment' })
  async sendContractEmail(
    @Req() req: AuthenticatedRequest,
    @Param('id') contractId: string,
    @Body() dto: SendEmailDto,
  ) {
    return this.emailService.sendContractEmail(req.user.id, contractId, dto);
  }

  @Post('invoice/:id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send invoice to client via email with PDF attachment' })
  async sendInvoiceEmail(
    @Req() req: AuthenticatedRequest,
    @Param('id') invoiceId: string,
    @Body() dto: SendEmailDto,
  ) {
    return this.emailService.sendInvoiceEmail(req.user.id, invoiceId, dto);
  }
}
