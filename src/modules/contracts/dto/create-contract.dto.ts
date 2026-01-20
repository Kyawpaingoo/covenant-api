import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractStatus } from '@prisma/client';

export class CreateContractDto {
  @ApiProperty({ example: 'uuid-of-client' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: 'Website Development Agreement' })
  @IsString()
  title: string;

  @ApiProperty({
    example: '# Contract Terms\n\nThis agreement is between...',
    description: 'Markdown content of the contract',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    enum: ContractStatus,
    default: 'DRAFT',
  })
  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;
}
