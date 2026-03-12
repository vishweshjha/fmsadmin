import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdminUserRole } from '@prisma/client';

export class SignupDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@fms.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: AdminUserRole, example: AdminUserRole.SUPPORT_AGENT })
  @IsEnum(AdminUserRole)
  role: AdminUserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
