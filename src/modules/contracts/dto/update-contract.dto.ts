import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContractStatus } from '@prisma/client';

export class UpdateContractDto {
  @ApiPropertyOptional({ example: 'Updated Website Development Agreement' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: '# Updated Contract Terms\n\nThis agreement is between...',
    description: 'Updated Markdown content of the contract',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    enum: ContractStatus,
  })
  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;
}
