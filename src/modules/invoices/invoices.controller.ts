import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';

interface UserPayload {
  id: string;
  email: string;
}

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice with line items' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(user.id, createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices for authenticated developer' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.invoicesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.invoicesService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an invoice (recalculates totals if items change)' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Cannot update paid invoice' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(user.id, id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete paid invoice' })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.invoicesService.remove(user.id, id);
  }
}
