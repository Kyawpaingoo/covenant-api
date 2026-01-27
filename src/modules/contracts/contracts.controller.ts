import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto, SignContractDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';

interface UserPayload {
  id: string;
  email: string;
}

@ApiTags('contracts')
@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  // Protected routes
  @Post('contracts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() createContractDto: CreateContractDto,
  ) {
    return this.contractsService.create(user.id, createContractDto);
  }

  @Get('contracts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contracts for authenticated developer' })
  @ApiResponse({ status: 200, description: 'Contracts retrieved successfully' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.contractsService.findAll(user.id);
  }

  @Get('contracts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific contract by ID' })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.contractsService.findOne(user.id, id);
  }

  @Put('contracts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a contract (increments version if content changes)' })
  @ApiResponse({ status: 200, description: 'Contract updated successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(user.id, id, updateContractDto);
  }

  @Delete('contracts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a contract' })
  @ApiResponse({ status: 200, description: 'Contract deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.contractsService.remove(user.id, id);
  }

  // Public portal routes (no auth required)
  @Get('portal/contract/:slug')
  @ApiOperation({ summary: 'Get contract by public slug (no auth required)' })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  findBySlug(@Param('slug') slug: string, @Ip() ip: string) {
    return this.contractsService.findBySlug(slug, ip);
  }

  @Post('portal/contract/:slug/sign')
  @ApiOperation({ summary: 'Sign a contract (captures IP and timestamp)' })
  @ApiResponse({ status: 200, description: 'Contract signed successfully' })
  @ApiResponse({ status: 400, description: 'Contract already signed or voided' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  signContract(
    @Param('slug') slug: string,
    @Body() signContractDto: SignContractDto,
    @Req() req: Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    return this.contractsService.signContract(slug, signContractDto, ipAddress);
  }

  @Get('portal/contract/:slug/download')
  @ApiOperation({ summary: 'Download contract PDF (Public)' })
  async downloadContract(
    @Param('slug') slug: string,
    @Res() res: Response,
  ) {
    const result = await this.contractsService.downloadContractPdf(slug);

    if (typeof result === 'string') {
      return res.redirect(result);
    } else {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${slug}.pdf"`,
      });
      return res.send(result);
    }
  }
}
