import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '@prisma/client';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-of-client' })
  @IsString()
  clientId: string;

  @ApiPropertyOptional({ example: 'uuid-of-contract' })
  @IsString()
  @IsOptional()
  contractId?: string;

  @ApiProperty({ example: '2026-02-15T00:00:00.000Z' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 10, description: 'Tax rate percentage (0-100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ enum: InvoiceStatus, default: 'DRAFT' })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiProperty({
    type: [InvoiceItemDto],
    example: [
      { description: 'Website Development', quantity: 10, unitPrice: 150 },
      { description: 'UI/UX Design', quantity: 5, unitPrice: 100 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
