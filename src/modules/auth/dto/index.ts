import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'developer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'Acme Development LLC' })
  @IsString()
  @IsOptional()
  businessName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'developer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token from login response' })
  @IsString()
  refreshToken: string;
}

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  emailVerified: Date | null;

  @Expose()
  image: string | null;

  @Expose()
  createdAt: Date;

  // Password field excluded by default via @Exclude() on class
}

@Exclude()
export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  user: UserResponseDto;
}
