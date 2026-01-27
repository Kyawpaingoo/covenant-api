import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignContractDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  signerName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  signerEmail: string;

  @ApiProperty({ example: 'data:image/png;base64,...', required: false })
  @IsString()
  @IsOptional()
  signatureData?: string;
}
