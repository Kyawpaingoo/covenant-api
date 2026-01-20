import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country' })
  @IsString()
  @IsOptional()
  companyAddress?: string;

  @ApiPropertyOptional({ example: 'VAT123456' })
  @IsString()
  @IsOptional()
  taxId?: string;
}
