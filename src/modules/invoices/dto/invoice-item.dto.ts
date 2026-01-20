import { IsNumber, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @ApiProperty({ example: 'Website Development' })
  @IsString()
  description: string;

  @ApiProperty({ example: 10, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 150.0, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;
}
