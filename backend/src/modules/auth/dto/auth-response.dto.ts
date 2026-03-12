import { ApiProperty } from '@nestjs/swagger';
import { AdminUserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: AdminUserRole })
  role: AdminUserRole;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  lastLogin?: Date;
}

export class LoginResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty()
  token: string;

  @ApiProperty({ required: false })
  refreshToken?: string;

  @ApiProperty()
  expiresIn: number;
}
