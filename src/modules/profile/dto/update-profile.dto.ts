import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Acme Development LLC' })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ example: 'acct_xxxxx' })
  @IsString()
  @IsOptional()
  stripeAccountId?: string;

  @ApiPropertyOptional({
    example: {
      logoUrl: 'https://example.com/logo.png',
      primaryColor: '#6366f1',
      font: 'Inter',
    },
  })
  @IsObject()
  @IsOptional()
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    font?: string;
  };
}
